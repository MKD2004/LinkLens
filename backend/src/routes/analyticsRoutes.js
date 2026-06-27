import { Router } from "express";
import ClickEvent from "../models/ClickEvent.js";
import Link from "../models/Link.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/links/:shortId/analytics", auth, async (req, res) => {
  try {
    const { shortId } = req.params;

    const link = await Link.findOne({ shortId, userId: req.user.userId });
    if (!link) {
      return res.status(404).json({ error: "not_found", message: "Link not found" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    console.time("analytics");
    const [byDay, byCountry, byDevice, byReferer, uniqueVisitors] = await Promise.all([
      ClickEvent.aggregate([
        { $match: { shortId, timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ClickEvent.aggregate([
        { $match: { shortId } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ClickEvent.aggregate([
        { $match: { shortId } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ClickEvent.aggregate([
        { $match: { shortId } },
        { $group: { _id: "$referer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ClickEvent.distinct("ip", { shortId }),
    ]);
    console.timeEnd("analytics");

    const totalClicks = await ClickEvent.countDocuments({ shortId });

    res.json({
      shortId,
      originalUrl: link.originalUrl,
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      byDay: byDay.map((d) => ({ date: d._id, count: d.count })),
      byCountry: byCountry.map((c) => ({ country: c._id || "Unknown", count: c.count })),
      byDevice: byDevice.map((d) => ({ device: d._id, count: d.count })),
      byReferer: byReferer.map((r) => ({ referer: r._id || "Direct", count: r.count })),
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: error.message });
  }
});

export default router;
