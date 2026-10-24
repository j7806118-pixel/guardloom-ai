import { RULE_CATEGORIES, RULE_SEVERITIES } from "../../src/data/rules.js";

const ID_PATTERN = /^[A-Z]{2,6}-\d{3}$/;

export function parseRule(input) {
  const errors = {};
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const id = typeof source.id === "string" ? source.id.trim().toUpperCase() : "";
  const title = typeof source.title === "string" ? source.title.trim() : "";
  const guidance = typeof source.guidance === "string" ? source.guidance.trim() : "";

  if (!id) {
    errors.id = "Enter a rule ID.";
  } else if (!ID_PATTERN.test(id)) {
    errors.id = "Use a format like AW-007.";
  }

  if (!title) {
    errors.title = "Enter the rule title.";
  } else if (title.length < 3) {
    errors.title = "Use at least 3 characters for the title.";
  }

  if (!guidance) {
    errors.guidance = "Enter the approved guidance.";
  } else if (guidance.length < 8) {
    errors.guidance = "Add a little more guidance so a reviewer knows what to check.";
  }

  if (!RULE_CATEGORIES.includes(source.category)) {
    errors.category = "Choose a category.";
  }

  if (!RULE_SEVERITIES.includes(source.severity)) {
    errors.severity = "Choose a severity.";
  }

  if (typeof source.active !== "boolean") {
    errors.active = "Choose whether the rule is active.";
  }

  return {
    errors,
    value: {
      id,
      title,
      guidance,
      category: source.category,
      severity: source.severity,
      active: source.active,
    },
  };
}

export function isDuplicateKeyError(error) {
  if (error?.code === 11000) {
    return true;
  }

  return Array.isArray(error?.writeErrors) && error.writeErrors.some((item) => item.code === 11000);
}
