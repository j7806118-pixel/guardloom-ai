import { initialRules } from "../../src/data/rules.js";
import BrandRule from "./models/BrandRule.js";
import { isDuplicateKeyError } from "./validateRule.js";

export async function seedBrandRules() {
  const count = await BrandRule.countDocuments();
  if (count > 0) {
    return;
  }

  try {
    await BrandRule.insertMany(initialRules, { ordered: true });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return;
    }

    throw error;
  }
}
