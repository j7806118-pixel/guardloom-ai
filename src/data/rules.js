export const RULE_CATEGORIES = ["Brand facts", "Terminology", "Writing style"];

export const RULE_SEVERITIES = ["High", "Medium", "Low"];

export const brandProfile = {
  name: "Aster Works",
  monogram: "a.",
  tagline: "Project planning for thoughtful teams",
  label: "Fictional brand · Demo rule set",
  positioning: "A shared workspace for projects, tasks, and team updates.",
  voice: "Clear, calm, and specific. Helpful over hype. Never overpromise.",
  version: "Sample rule set · v1.2",
};

export const initialRules = [
  {
    id: "AW-001",
    title: "Use the approved trial duration",
    guidance: "14-day free trial. No credit card required.",
    category: "Brand facts",
    severity: "High",
    active: true,
  },
  {
    id: "AW-002",
    title: "Call the product a workspace",
    guidance: "Use “workspace”, not “command center”.",
    category: "Terminology",
    severity: "Medium",
    active: true,
  },
  {
    id: "AW-003",
    title: "Avoid guaranteed performance claims",
    guidance: "Describe capabilities; never promise productivity outcomes.",
    category: "Brand facts",
    severity: "High",
    active: true,
  },
  {
    id: "AW-004",
    title: "Write headings in sentence case",
    guidance: "Capitalize the first word and proper nouns only.",
    category: "Writing style",
    severity: "Low",
    active: true,
  },
  {
    id: "AW-005",
    title: "Make link text descriptive",
    guidance: "Name the destination. Avoid “click here”.",
    category: "Writing style",
    severity: "Low",
    active: true,
  },
  {
    id: "AW-006",
    title: "Use the legacy product name",
    guidance: "Archived: “Aster Projects” was retired in July 2026.",
    category: "Terminology",
    severity: "Medium",
    active: false,
  },
];

const ID_PATTERN = /^[A-Z]{2,6}-\d{3}$/;

export function validateRule(values, rules, originalId) {
  const errors = {};
  const id = values.id.trim().toUpperCase();
  const title = values.title.trim();
  const guidance = values.guidance.trim();

  if (!id) {
    errors.id = "Enter a rule ID.";
  } else if (!ID_PATTERN.test(id)) {
    errors.id = "Use a format like AW-007.";
  } else if (rules.some((rule) => rule.id.toUpperCase() === id && rule.id !== originalId)) {
    errors.id = "That rule ID is already in this demonstration set.";
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

  if (!RULE_CATEGORIES.includes(values.category)) {
    errors.category = "Choose a category.";
  }

  if (!RULE_SEVERITIES.includes(values.severity)) {
    errors.severity = "Choose a severity.";
  }

  return {
    errors,
    value: {
      id,
      title,
      guidance,
      category: values.category,
      severity: values.severity,
      active: Boolean(values.active),
    },
  };
}
