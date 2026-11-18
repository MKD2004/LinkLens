import { randomUUID } from "crypto";
import redis from "../services/redis.js";

// Sliding window log. Each client has a sorted set of request timestamps; a
// request is allowed only if fewer than `limit` timestamps fall inside the
// last `windowMs`. Unlike a fixed window, there is no boundary to burst
// across: at any moment, the last `windowMs` holds at most `limit` requests.
//
// It runs as one Lua script because the steps (trim, count, add) must be
// atomic — otherwise two concurrent requests could both count `limit - 1`
// and both be let in.
//
// Rejected requests are not recorded, so a client that keeps hammering after
// being limited regains access as soon as its oldest allowed request ages out.
redis.defineCommand("slidingWindow", {
  numberOfKeys: 1,
  lua: `
    local key    = KEYS[1]
    local now    = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit  = tonumber(ARGV[3])

    redis.call("ZREMRANGEBYSCORE", key, "-inf", now - window)
    local count = redis.call("ZCARD", key)

    local allowed = 0
    if count < limit then
      redis.call("ZADD", key, now, ARGV[4])
      count = count + 1
      allowed = 1
    end
    redis.call("PEXPIRE", key, window)

    -- A slot frees up when the oldest request in the window ages out.
    local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
    local resetAt = now + window
    if oldest[2] then resetAt = tonumber(oldest[2]) + window end

    return { allowed, count, resetAt }
  `,
});

export default function createRateLimiter({ limit, windowSecs, keyPrefix }) {
  const windowMs = windowSecs * 1000;

  return async (req, res, next) => {
    try {
      // req.ip, not the raw x-forwarded-for header: the client controls the
      // leftmost XFF entry, so keying on it lets anyone mint a fresh rate-limit
      // bucket per request. With `trust proxy` set to 1 (index.js), Express
      // takes the address our own proxy appended, which can't be spoofed.
      const key = `${keyPrefix}:${req.ip}`;
      const now = Date.now();

      // The member must be unique, or two requests in the same millisecond
      // would collapse into one sorted-set entry and only count once.
      const [allowed, count, resetAt] = await redis.slidingWindow(
        key, now, windowMs, limit, `${now}-${randomUUID()}`
      );

      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));
      res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000));

      if (!allowed) {
        res.setHeader("Retry-After", retryAfter);
        return res.status(429).json({
          error: "rate_limit_exceeded",
          message: `Max ${limit} requests per ${windowSecs / 60} minute(s)`,
          retryAfter,
        });
      }

      next();
    } catch (err) {
      // Fail open: Redis is a dependency of the limiter, not of the app. If
      // it's unreachable, serving traffic beats rejecting everyone.
      console.error(`Rate limiter unavailable for ${keyPrefix} — allowing request: ${err.message}`);
      next();
    }
  };
}

// "sw:" namespace: the old fixed-window limiter stored plain string counters
// under "ratelimit:*", and sorted-set commands on those fail with WRONGTYPE.
export const shortenLimiter = createRateLimiter({
  limit: 30,
  windowSecs: 900,
  keyPrefix: "ratelimit:sw:shorten",
});

export const redirectLimiter = createRateLimiter({
  limit: 100,
  windowSecs: 3600,
  keyPrefix: "ratelimit:sw:redirect",
});
