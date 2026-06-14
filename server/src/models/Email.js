import mongoose from "mongoose";
import { emailIntentCategories } from "../config/specRules.js";

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sender: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
    intent: { type: String, enum: emailIntentCategories, default: "general_inquiry" },
    urgency: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
    confidence: { type: Number, default: 0.5 },
    autoResponse: { type: String },
    recommendations: [{ type: String }],
    processed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Email = mongoose.model("Email", emailSchema);
