
import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { computeCorrectedContent } from "../utils/correctedContent";

export default function CorrectedContentPreview({
  originalContent,
  findings,
}) {
  const [copied, setCopied] = useState(false);

  const { correctedText, warning } = computeCorrectedContent(
    originalContent,
    findings
  );

  const hasFindings =
    Array.isArray(findings) && findings.length > 0;

  const pendingCount = hasFindings
    ? findings.filter(
        (finding) =>
          !finding.decision || finding.decision === "pending"
      ).length
    : 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Failed to copy text.");
    }
  }

  return (
    <Card padded style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>
            Corrected Content Preview
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--ink-muted)",
            }}
          >
            {!hasFindings
              ? "No issues detected. Showing original draft."
              : pendingCount > 0
                ? `Reflects accepted/edited findings (${pendingCount} pending).`
                : "Reflects all accepted and edited findings."}
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy Content"}
        </Button>
      </div>

      {warning && (
        <div
          style={{
            padding: "8px",
            marginBottom: "12px",
            background: "var(--amber-light)",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          ⚠️ <strong>Notice:</strong> {warning}
        </div>
      )}

      <div
        style={{
          background: "var(--surface-sunken)",
          padding: "16px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          fontSize: "14px",
          fontFamily: "monospace",
        }}
      >
        {correctedText}
      </div>
    </Card>
  );
}
