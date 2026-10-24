import mongoose from "mongoose";
import { RULE_CATEGORIES, RULE_SEVERITIES } from "../../../src/data/rules.js";

const brandRuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    guidance: { type: String, required: true },
    category: { type: String, required: true, enum: RULE_CATEGORIES },
    severity: { type: String, required: true, enum: RULE_SEVERITIES },
    active: { type: Boolean, required: true },
  },
  { versionKey: false },
);

export function presentRule(document) {
  return {
    id: document.id,
    title: document.title,
    guidance: document.guidance,
    category: document.category,
    severity: document.severity,
    active: document.active,
  };
}

export default mongoose.model("BrandRule", brandRuleSchema);
