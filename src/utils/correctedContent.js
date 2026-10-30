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
      const replacement = decision === "edited"
        ? (finding.revisedText !== undefined ? finding.revisedText : finding.suggestedFix)
        : finding.suggestedFix;

      const evidence = finding.evidence;
      if (evidence && typeof evidence === "string" && evidence.trim()) {
        activeReplacements.push({
          evidence: evidence.trim(),
          replacement: replacement !== undefined ? replacement : "",
          ruleId: finding.ruleId,
          offset: finding.offset,
        });
      }
    }
  }

  if (activeReplacements.length === 0) {
    return { correctedText: originalContent, warning: null };
  }

  let text = originalContent;
  let warning = null;

  const resolvedReplacements = activeReplacements.map(r => {
    let offset = r.offset;
    if (typeof offset !== "number") {
      const escaped = r.evidence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      const matches = [...text.matchAll(regex)];
      if (matches.length === 1) {
        offset = matches[0].index;
      } else if (matches.length > 1) {
        warning = `Ambiguous evidence span "${r.evidence}" matches multiple times; replacement skipped for rule ${r.ruleId}.`;
        return null;
      } else {
        return null;
      }
    }
    return { ...r, offset };
  }).filter(Boolean);

  resolvedReplacements.sort((a, b) => b.offset - a.offset);

  for (const r of resolvedReplacements) {
    const trimmedRepl = r.replacement.trim();
    const isFullSentenceFix =
      /[.!?]\s*$/.test(trimmedRepl) ||
      (trimmedRepl.split(/\s+/).length > 3 && trimmedRepl.length > r.evidence.length * 2);

    if (isFullSentenceFix) {
      const sentence = findContainingSentence(text, r.offset, r.evidence.length);
      text = text.slice(0, sentence.start) + r.replacement + text.slice(sentence.end);
    } else {
      const actualText = text.slice(r.offset, r.offset + r.evidence.length);
      if (actualText.toLowerCase() === r.evidence.toLowerCase()) {
        text = text.slice(0, r.offset) + r.replacement + text.slice(r.offset + r.evidence.length);
      } else {
        const escaped = r.evidence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "gi");
        const matches = [...text.matchAll(regex)];
        const match = matches.find(m => Math.abs(m.index - r.offset) < 20) || matches[0];
        if (match) {
          text = text.slice(0, match.index) + r.replacement + text.slice(match.index + match[0].length);
        }
      }
    }
  }

  return { correctedText: text, warning };
}

function findContainingSentence(content, offset, evidenceLength) {
  const start = Math.max(0, offset);
  const end = Math.min(content.length, offset + evidenceLength);

  let sentenceStart = 0;
  for (let i = start - 1; i >= 0; i--) {
    const char = content[i];
    if (char === "." || char === "!" || char === "?" || char === "\n") {
      sentenceStart = i + 1;
      break;
    }
  }
  while (sentenceStart < start && /\s/.test(content[sentenceStart])) {
    sentenceStart++;
  }

  let sentenceEnd = content.length;
  for (let i = end; i < content.length; i++) {
    const char = content[i];
    if (char === "." || char === "!" || char === "?" || char === "\n") {
      sentenceEnd = i + (char === "\n" ? 0 : 1);
      break;
    }
  }

  return {
    start: sentenceStart,
    end: sentenceEnd,
    text: content.slice(sentenceStart, sentenceEnd),
  };
}
