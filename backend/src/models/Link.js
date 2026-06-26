import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    shortId: { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true },
    customAlias: { type: String, sparse: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Link", linkSchema);
