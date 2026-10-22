export const CONTENT_TYPES = ["Email campaign", "Website", "Help center", "Social post"];

export const sampleDraft = {
  id: "DR-024",
  title: "Autumn launch email",
  contentType: "Email campaign",
  body: [
    "Meet a calmer way to plan work.",
    "Aster Works brings projects, tasks, and team updates into one command center. Keep priorities visible and give every project a clear next step.",
    "Start your 30-day free trial today. No credit card required. Aster Works is guaranteed to double your team's productivity, so you can spend less time coordinating and more time doing.",
    "Explore Aster Works and find your team's rhythm.",
  ].join("\n\n"),
  selectedRuleIds: ["AW-001", "AW-002", "AW-003"],
};

export function countWords(text) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

export function validateDraft(draft) {
  const errors = {};
  const title = draft.title.trim();

  if (!title) {
    errors.title = "Enter a content title.";
  } else if (title.length < 3) {
    errors.title = "Use at least 3 characters for the title.";
  }

  if (!draft.body.trim()) {
    errors.body = "Enter the draft content.";
  }

  return errors;
}
