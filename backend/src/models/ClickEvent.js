import mongoose from "mongoose";

const clickEventSchema = new mongoose.Schema({
  shortId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  ip: { type: String },
  country: { type: String, default: "Unknown" },
  city: { type: String, default: null },
  device: { type: String, enum: ["Mobile", "Desktop", "Tablet"], default: "Desktop" },
  browser: { type: String, default: "Other" },
  referer: { type: String, default: "Direct" },
});

clickEventSchema.index({ shortId: 1, timestamp: -1 });
clickEventSchema.index({ shortId: 1, country: 1 });
clickEventSchema.index({ shortId: 1, device: 1 });

export default mongoose.model("ClickEvent", clickEventSchema);
