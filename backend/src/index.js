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
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sseRoutes from "./routes/sseRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
const isDev = process.env.NODE_ENV !== "production";

function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser requests (curl, server-to-server, same-origin)
  if (allowedOrigins.includes(origin)) return true;
  // In development, accept any localhost / 127.0.0.1 port — Vite shifts 5173 → 5174 when a port is taken.
  if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/", linkRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", sseRoutes);

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

app.use((req, res) => {
  res.status(404).json({ error: "not_found", message: `Cannot ${req.method} ${req.path}` });
});

app.use(errorHandler);

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
