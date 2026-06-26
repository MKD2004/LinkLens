import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.startsWith("mongodb")) {
    console.warn("MongoDB URI not configured — skipping connection. Set MONGODB_URI in .env to connect.");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
