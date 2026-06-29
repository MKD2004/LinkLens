import redis from "../services/redis.js";

export default function createRateLimiter({ limit, windowSecs, keyPrefix }) {
  return async (req, res, next) => {
    try {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
      const key = `${keyPrefix}:${ip}`;

      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();
      const count = results[0][1];
      const ttl = results[1][1];

      if (ttl === -1) {
        await redis.expire(key, windowSecs);
      }

      if (count === 1) {
        await redis.expire(key, windowSecs);
      }

      const resetTs = Math.floor(Date.now() / 1000 + (ttl > 0 ? ttl : windowSecs));
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));
      res.setHeader("X-RateLimit-Reset", resetTs);

      if (count > limit) {
        return res.status(429).json({
          error: "rate_limit_exceeded",
          message: `Max ${limit} requests per ${windowSecs / 60} minute(s)`,
          retryAfter: ttl > 0 ? ttl : windowSecs,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err.message);
      next();
    }
  };
}

export const shortenLimiter = createRateLimiter({
  limit: 30,
  windowSecs: 900,
  keyPrefix: "ratelimit:shorten",
});

export const redirectLimiter = createRateLimiter({
  limit: 100,
  windowSecs: 3600,
  keyPrefix: "ratelimit:redirect",
});
