export function runPrechecker(rules, content) {
  const findings = [];
  if (!Array.isArray(rules) || typeof content !== "string" || !content.trim()) {
    return findings;
  }

  for (const rule of rules) {
    if (!rule || !rule.active || !rule.guidance) {
      continue;
    }

    const guidance = rule.guidance;

    // Match pattern: Use "...", not "..."
    const prohibitionMatch = guidance.match(/use\s+["“]([^"”]+)["”],\s+not\s+["“]([^"”]+)["”]/i);
    if (prohibitionMatch && prohibitionMatch[1] && prohibitionMatch[2]) {
      const replacementTerm = prohibitionMatch[1].trim();
      const prohibitedTerm = prohibitionMatch[2].trim();
      const escaped = prohibitedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");

      let match;
      while ((match = regex.exec(content)) !== null) {
        findings.push({
          ruleId: rule.id,
          severity: rule.severity || "Medium",
          evidence: match[0],
          offset: match.index,
          explanation: `Use "${replacementTerm}" instead of "${prohibitedTerm}" per rule ${rule.id}.`,
          suggestedFix: replacementTerm,
          source: "deterministic",
        });
      }
    }
  }

  // Deduplicate findings by ruleId + evidence
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.ruleId}:${f.evidence.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
