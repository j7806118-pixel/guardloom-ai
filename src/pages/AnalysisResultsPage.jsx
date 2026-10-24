
import { Link } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import useDraft from "../state/useDraft";
import "../styles/analysis-results.css";

export default function AnalysisResultsPage() {
  const { draft } = useDraft();
  const analysis = draft.analysis;

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
            Submit a draft for review to see its findings here. Analysis results
            are available in the current browser session.
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
        title="Analysis Results"
        description={`${draft.title || "Untitled draft"} Â· AI-assisted brand review`}
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
        <p>{analysis.summary}</p>
        <p className="analysis-summary__note">
          AI-generated findings may be inaccurate or incomplete. Verify each
          finding against the selected brand rule before taking action.
        </p>
        <p className="analysis-summary__meta">
          {analysis.findings.length} finding
          {analysis.findings.length === 1 ? "" : "s"}
          {analysis.reviewedAt
            ? ` Â· Reviewed ${new Date(analysis.reviewedAt).toLocaleString()}`
            : ""}
        </p>
      </Card>

      <section className="analysis-findings" aria-labelledby="findings-heading">
        <div className="analysis-findings__header">
          <h2 id="findings-heading">Findings</h2>
          <span>{analysis.findings.length} total</span>
        </div>

        {analysis.findings.length === 0 ? (
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
