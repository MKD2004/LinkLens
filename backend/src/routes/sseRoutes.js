import { Router } from "express";
import Link from "../models/Link.js";
import auth from "../middleware/auth.js";
import { addClient, removeClient, getClientCount } from "../services/sse.js";

const router = Router();

router.get("/stream/:shortId", auth, async (req, res) => {
  const { shortId } = req.params;

  const link = await Link.findOne({ shortId, userId: req.user.userId });
  if (!link) {
    return res.status(404).json({ error: "not_found", message: "Link not found" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "connected", shortId })}\n\n`);

  addClient(shortId, res);
  console.log(`SSE client connected for ${shortId} — total: ${getClientCount(shortId)}`);

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(shortId, res);
    console.log(`SSE client disconnected for ${shortId} — remaining: ${getClientCount(shortId)}`);
  });
});

export default router;
