export function verifyAiFinding(finding, content, validRuleIds) {
  if (!finding || typeof finding !== "object") {
    return false;
  }

  const { ruleId, severity, evidence, explanation, suggestedFix } = finding;

  // 1. Check rule ID validity and membership in selected active rules
  if (typeof ruleId !== "string" || !validRuleIds || !validRuleIds.has(ruleId)) {
    return false;
  }

  // 2. Check severity
  const validSeverities = new Set(["Low", "Medium", "High", "Critical"]);
  if (typeof severity !== "string" || !validSeverities.has(severity)) {
    return false;
  }

  // 3. Check evidence is present and non-empty
  if (typeof evidence !== "string" || !evidence.trim()) {
    return false;
  }

  // 4. Verify evidence exists in content with case-insensitive and whitespace-normalized matching
  if (typeof content !== "string" || !content.trim()) {
    return false;
  }

  const normalizedContent = content.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedEvidence = evidence.replace(/\s+/g, " ").trim().toLowerCase();

  if (!normalizedEvidence || !normalizedContent.includes(normalizedEvidence)) {
    return false;
  }

  // 5. Check explanation and suggestedFix
  if (typeof explanation !== "string" || !explanation.trim()) {
    return false;
  }
  if (typeof suggestedFix !== "string" || !suggestedFix.trim()) {
    return false;
  }

  return true;
}
