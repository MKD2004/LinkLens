import Redis from "ioredis";

const url = process.env.REDIS_URL;
const connectionString = /^rediss?:\/\//.test(url) ? url : `redis://${url}`;

// The cache is an optimisation, never a dependency. These options make a Redis
// outage fail fast — commands reject in ~1s instead of being queued forever or
// retried 20 times — so callers can fall through to MongoDB on their own.
const redis = new Redis(connectionString, {
  connectTimeout: 3000,
  commandTimeout: 1000,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  // Keep reconnecting in the background so the cache heals on its own, but back
  // off to 10s so a long outage doesn't spin.
  retryStrategy: (times) => Math.min(times * 500, 10000),
});

redis.on("connect", () => {
  console.log("Redis connected");
});

// Each reconnect attempt emits an error — log the first, then at most one per
// minute, so an outage doesn't flood the logs.
let lastErrorLog = 0;
redis.on("error", (err) => {
  const now = Date.now();
  if (now - lastErrorLog > 60000) {
    lastErrorLog = now;
    console.error("Redis error:", err.message);
  }
});

export default redis;
