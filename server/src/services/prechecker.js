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
    const prohibitionMatch = guidance.match(/use\s+["“][^"”]+["”],\s+not\s+["“]([^"”]+)["”]/i);
    if (prohibitionMatch && prohibitionMatch[1]) {
      const prohibitedTerm = prohibitionMatch[1].trim();
      if (prohibitedTerm) {
        const escaped = prohibitedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");
        const match = content.match(regex);
        if (match && match[0]) {
          const evidence = match[0];
          findings.push({
            ruleId: rule.id,
            severity: rule.severity || "Medium",
            evidence,
            explanation: `Prohibited term detected: "${prohibitedTerm}" violates rule ${rule.id} (${rule.title}).`,
            suggestedFix: `Remove or replace "${prohibitedTerm}" in accordance with rule ${rule.id}.`,
            source: "deterministic",
          });
        }
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