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

router.post("/api/links", shortenLimiter, validate(createLinkSchema), async (req, res) => {
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
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

router.get("/r/:shortId", redirectLimiter, async (req, res) => {
  try {
    const { shortId } = req.params;

    const cached = await redis.get(`link:${shortId}`);
    if (cached) {
      console.log(`Cache HIT: ${shortId}`);
      res.redirect(301, cached);
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

    await redis.setex(`link:${shortId}`, 86400, link.originalUrl);
    console.log(`Cache MISS — cached: ${shortId}`);

    res.redirect(301, link.originalUrl);
    recordClick(shortId, req);
  } catch (error) {
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

router.get("/api/links", auth, async (req, res) => {
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
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

router.patch("/api/links/:shortId/toggle", auth, async (req, res) => {
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
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

router.delete("/api/links/:shortId", auth, async (req, res) => {
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
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

export async function clearLinkCache(shortId) {
  await redis.del(`link:${shortId}`);
}

export default router;
