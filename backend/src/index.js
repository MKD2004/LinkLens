import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import redis from "./services/redis.js";
import authRoutes from "./routes/authRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/", linkRoutes);

app.get("/api/health", async (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  let redisOk = false;
  try { redisOk = await redis.ping() === "PONG"; } catch {}

  res.json({
    status: "ok",
    services: { mongodb: mongoOk, redis: redisOk },
    uptime: Math.round(process.uptime() * 10) / 10,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.use(errorHandler);

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
