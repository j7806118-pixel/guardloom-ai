export function computeCorrectedContent(originalContent, findings) {
  if (!originalContent || typeof originalContent !== "string") {
    return { correctedText: originalContent || "", warning: null };
  }

  if (!Array.isArray(findings) || findings.length === 0) {
    return { correctedText: originalContent, warning: null };
  }

  const activeReplacements = [];
  for (const finding of findings) {
    const decision = finding.decision || "pending";
    if (decision === "accepted" || decision === "edited") {
      const replacement = decision ==="edited"
        ? (finding.revisedText !== undefined ? finding.revisedText : finding.suggestedFix)
        : finding.suggestedFix;
      const evidence = finding.evidence;
      if (evidence && typeof evidence === "string" && evidence.trim()) {
        activeReplacements.push({
          evidence: evidence.trim(),
          replacement: replacement !== undefined ? replacement : "",
          ruleId: finding.ruleId,
        });
      }
    }
  }

  if (activeReplacements.length === 0) {
    return { correctedText: originalContent, warning: null };
  }

  let text = originalContent;
  let warning = null;
  const sorted = [...activeReplacements].sort((a, b) => b.evidence.length - a.evidence.length);

  for (const item of sorted) {
    const escaped = item.evidence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const matches = [...text.matchAll(regex)];
    if (matches.length === 0) continue;
    if (matches.length > 1) {
      warning = `Ambiguous evidence span "${item.evidence}" matches multiple times; replacement skipped for rule ${item.ruleId}.`;
      continue;
    }
    const match = matches[0];
    text = text.slice(0, match.index) + item.replacement + text.slice(match.index + match[0].length);
  }

  return { correctedText: text, warning };
}
