import redis from "../services/redis.js";

export default function createRateLimiter({ limit, windowSecs, keyPrefix }) {
  return async (req, res, next) => {
    try {
      // req.ip, not the raw x-forwarded-for header: the client controls the
      // leftmost XFF entry, so keying on it lets anyone mint a fresh rate-limit
      // bucket per request. With `trust proxy` set to 1 (index.js), Express
      // takes the address our own proxy appended, which can't be spoofed.
      const key = `${keyPrefix}:${req.ip}`;

      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();
      const count = results?.[0]?.[1];
      const ttl = results?.[1]?.[1];

      // Redis unreachable: exec resolves with error entries rather than
      // throwing. Without a count there is nothing to limit on, so allow the
      // request through rather than advertising a bogus NaN budget.
      if (typeof count !== "number") {
        console.error(`Rate limiter unavailable for ${keyPrefix} — allowing request`);
        return next();
      }

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
