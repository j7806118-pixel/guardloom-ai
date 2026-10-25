import mongoose from "mongoose";

const findingSchema = new mongoose.Schema({
  ruleId: { type: String, required: true },
  severity: { type: String, required: true },
  evidence: { type: String, required: true },
  explanation: { type: String, required: true },
  suggestedFix: { type: String, required: true },
  source: { type: String },
  decision: {
    type: String,
    enum: ["pending", "accepted", "edited", "dismissed"],
    default: "pending"
  },
  revisedText: String
});

const reviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentType: { type: String, required: true },
    content: { type: String, required: true },
    ruleIds: [{ type: String, required: true }],
    findings: [findingSchema],
    summary: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewMode: String,
    status: {
      type: String,
      enum: ["pending", "changes-requested", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Review", reviewSchema);