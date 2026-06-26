import Redis from "ioredis";

const url = process.env.REDIS_URL;
const redis = new Redis(url.startsWith("redis://") ? url : `redis://${url}`);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redis;
