import { Router } from "express";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import Link from "../models/Link.js";
import ClickEvent from "../models/ClickEvent.js";
import redis from "../services/redis.js";
import recordClick from "../services/clickTracker.js";
import { shortenLimiter, redirectLimiter } from "../middleware/rateLimiter.js";
import validate, { createLinkSchema } from "../middleware/validate.js";
import auth from "../middleware/auth.js";

const router = Router();
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 6);
const CACHE_TTL_SECS = 86400;

router.post("/api/links", shortenLimiter, validate(createLinkSchema), async (req, res, next) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        // anonymous — ignore invalid token
      }
    }

    const { url, customAlias, expiresAt } = req.body;

    let shortId;

    if (customAlias) {
      const existing = await Link.findOne({ shortId: customAlias });
      if (existing) {
        return res.status(409).json({ error: "conflict", message: "Custom alias already taken" });
      }
      shortId = customAlias;
    } else {
      let collision = true;
      while (collision) {
        shortId = nanoid();
        collision = await Link.findOne({ shortId });
      }
    }

    const linkData = { shortId, originalUrl: url, userId, expiresAt: expiresAt || null };
    if (customAlias) linkData.customAlias = customAlias;
    const link = await Link.create(linkData);

    res.status(201).json({
      shortId: link.shortId,
      shortUrl: `${process.env.BASE_URL}/r/${link.shortId}`,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
    });
  } catch (error) {
    // Hand off to the centralized errorHandler, which gates internal messages
    // behind NODE_ENV. Responding here would leak err.message in production.
    next(error);
  }
});

router.get("/r/:shortId", redirectLimiter, async (req, res, next) => {
  try {
    const { shortId } = req.params;

    // 302 + no-store: the destination can change and every click must reach us
    // to be counted. A 301 is cached by the browser indefinitely, which both
    // undercounts analytics and makes the mapping permanent.
    res.set("Cache-Control", "no-store");

    // Cache read is best effort — if Redis is unreachable we pay one extra
    // MongoDB query, not the request. Never let the cache take down redirects.
    let cached = null;
    try {
      cached = await redis.get(`link:${shortId}`);
    } catch (err) {
      console.error(`Cache read failed for ${shortId}, falling back to MongoDB: ${err.message}`);
    }

    if (cached) {
      console.log(`Cache HIT: ${shortId}`);
      res.redirect(302, cached);
      recordClick(shortId, req);
      return;
    }

    const link = await Link.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "not_found", message: "Short link not found" });
    }

    if (!link.isActive) {
      return res.status(403).json({ error: "inactive", message: "This link is inactive" });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ error: "expired", message: "This link has expired" });
    }

    // The cache hit path never re-checks expiresAt, so a cache entry must not
    // outlive the link: cap the TTL at the time remaining until expiry and let
    // Redis evict the key at the exact moment the link expires.
    let ttl = CACHE_TTL_SECS;
    if (link.expiresAt) {
      ttl = Math.min(ttl, Math.floor((link.expiresAt.getTime() - Date.now()) / 1000));
    }

    try {
      if (ttl > 0) {
        await redis.setex(`link:${shortId}`, ttl, link.originalUrl);
        console.log(`Cache MISS — cached: ${shortId} (ttl ${ttl}s)`);
      }
    } catch (err) {
      console.error(`Cache write failed for ${shortId}: ${err.message}`);
    }

    res.redirect(302, link.originalUrl);
    recordClick(shortId, req);
  } catch (error) {
    // Hand off to the centralized errorHandler, which gates internal messages
    // behind NODE_ENV. Responding here would leak err.message in production.
    next(error);
  }
});

router.get("/api/links", auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      Link.find({ userId: req.user.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Link.countDocuments({ userId: req.user.userId }),
    ]);

    const linkIds = links.map((l) => l.shortId);
    const counts = await ClickEvent.aggregate([
      { $match: { shortId: { $in: linkIds } } },
      { $group: { _id: "$shortId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    const result = links.map((l) => ({ ...l, clickCount: countMap[l.shortId] ?? 0 }));

    res.json({ links: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    // Hand off to the centralized errorHandler, which gates internal messages
    // behind NODE_ENV. Responding here would leak err.message in production.
    next(error);
  }
});

router.patch("/api/links/:shortId/toggle", auth, async (req, res, next) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOne({ shortId, userId: req.user.userId });
    if (!link) {
      return res.status(403).json({ error: "forbidden", message: "Link not found or not yours" });
    }

    link.isActive = !link.isActive;
    await link.save();
    await clearLinkCache(shortId);

    res.json({ shortId, isActive: link.isActive });
  } catch (error) {
    // Hand off to the centralized errorHandler, which gates internal messages
    // behind NODE_ENV. Responding here would leak err.message in production.
    next(error);
  }
});

router.delete("/api/links/:shortId", auth, async (req, res, next) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOne({ shortId, userId: req.user.userId });
    if (!link) {
      return res.status(403).json({ error: "forbidden", message: "Link not found or not yours" });
    }

    await Promise.all([
      Link.deleteOne({ shortId, userId: req.user.userId }),
      ClickEvent.deleteMany({ shortId }),
      clearLinkCache(shortId),
    ]);

    res.json({ message: "Link deleted" });
  } catch (error) {
    // Hand off to the centralized errorHandler, which gates internal messages
    // behind NODE_ENV. Responding here would leak err.message in production.
    next(error);
  }
});

// Invalidation is best effort for the same reason reads are: MongoDB is the
// source of truth, so a cache outage must not fail the write. Logged loudly
// because the stale entry can outlive the change by up to the 24h TTL.
export async function clearLinkCache(shortId) {
  try {
    await redis.del(`link:${shortId}`);
  } catch (err) {
    console.error(`Cache invalidation failed for ${shortId} — entry may serve stale for up to 24h: ${err.message}`);
  }
}

export default router;
