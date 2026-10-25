
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import useDraft from "../state/useDraft";
import "../styles/analysis-results.css";

export default function AnalysisResultsPage() {
  const { draft, retrySave } = useDraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoredAnalysis, setRestoredAnalysis] = useState(null);
  const [restoredDraft, setRestoredDraft] = useState(null);

  useEffect(() => {
    if (draft.analysis) return;

    const savedReviewId = sessionStorage.getItem("currentReviewId");
    if (!savedReviewId) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/reviews/${encodeURIComponent(savedReviewId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve review.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRestoredDraft(data);
        setRestoredAnalysis({
          ...data,
          findings: data.findings || [],
          summary: data.summary || "",
          reviewedAt: data.reviewedAt || null,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draft.analysis]);

  const analysis = draft.analysis || restoredAnalysis;
  const displayDraft = draft.analysis ? draft : restoredDraft || {};

  if (loading) {
    return (
      <>
        <PageHeader
          title="Analysis Results"
          description="Restoring your analysis results..."
        />
        <Card padded>
          <p>Loading analysis results...</p>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Analysis Results"
          description="An error occurred while restoring results."
        />
        <Card padded>
          <h2 style={{ color: "#991b1b" }}>Error</h2>
          <p>{error}</p>
          <Button to="/content-review" icon="arrow-left">
            Return to Content Review
          </Button>
        </Card>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <PageHeader
          title="Analysis Results"
          description="Review findings from your brand-governance analysis."
        />
        <Card className="analysis-empty" padded>
          <h2>No analysis results yet</h2>
          <p>
            Submit a draft for review to see its findings here. Analysis
            results can be restored during the current browser session
            when a saved review ID is available.
          </p>
          <Button to="/content-review" icon="arrow-left">
            Go to Content Review
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`${displayDraft.title || "Untitled draft"}`}
        description="AI-assisted brand review"
        actions={
          <Button to="/content-review" variant="secondary" icon="arrow-left">
            Back to Content Review
          </Button>
        }
      />

      <Card className="analysis-summary" padded>
        <div className="analysis-summary__top">
          <h2>Review summary</h2>
          <Badge tone="warning">Human review required</Badge>
        </div>

        {draft.persistenceError && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#991b1b",
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>
              Persistence warning: {draft.persistenceError}
            </p>
            <button
              onClick={retrySave}
              style={{
                marginTop: "0.5rem",
                padding: "0.25rem 0.75rem",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Retry Saving Review
            </button>
          </div>
        )}

        <p>
          {analysis.summary ||
            "Saved findings have been restored. A summary is not available in the saved review record."}
        </p>

        <p className="analysis-summary__note">
          AI-generated findings may be inaccurate or incomplete. Verify each
          finding against the selected brand rule before taking action.
        </p>

        <p className="analysis-summary__meta">
          {analysis.findings?.length || 0} finding
          {(analysis.findings?.length || 0) === 1 ? "" : "s"}
          {analysis.reviewedAt
            ? ` · Reviewed ${new Date(analysis.reviewedAt).toLocaleString()}`
            : ""}
        </p>
      </Card>

      <section
        className="analysis-findings"
        aria-labelledby="findings-heading"
      >
        <div className="analysis-findings__header">
          <h2 id="findings-heading">Findings</h2>
          <span>{analysis.findings?.length || 0} total</span>
        </div>

        {!analysis.findings || analysis.findings.length === 0 ? (
          <Card className="analysis-empty" padded>
            <h3>No potential violations were identified</h3>
            <p>
              This does not guarantee that the draft follows every brand rule.
              Review the content manually before approving it.
            </p>
          </Card>
        ) : (
          analysis.findings.map((finding, index) => (
            <Card
              className="analysis-finding"
              padded
              key={`${finding.ruleId}-${index}`}
            >
              <div className="analysis-finding__top">
                <div>
                  <span className="analysis-finding__rule">
                    Rule ID: {finding.ruleId}
                  </span>
                  <h3>{finding.explanation}</h3>
                </div>

                <Badge
                  tone={
                    ["High", "Critical"].includes(finding.severity)
                      ? "high"
                      : finding.severity === "Medium"
                        ? "medium"
                        : "low"
                  }
                >
                  {finding.severity} severity
                </Badge>
              </div>

              <div className="analysis-finding__section">
                <h4>Evidence from your draft</h4>
                <blockquote>{finding.evidence}</blockquote>
              </div>

              <div className="analysis-finding__section">
                <h4>Suggested fix</h4>
                <p>{finding.suggestedFix}</p>
              </div>
            </Card>
          ))
        )}
      </section>

      <Card className="analysis-disclaimer" padded>
        <h3>Before you approve the content</h3>
        <p>
          Treat these results as decision support, not a final compliance
          determination. A human reviewer must verify the evidence and decide
          whether any changes are needed.
        </p>
        <Link className="text-link" to="/content-review">
          Return to the draft
        </Link>
      </Card>
    </>
  );
}
