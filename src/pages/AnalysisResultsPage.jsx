
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import useDraft from "../state/useDraft";
import "../styles/analysis-results.css";

import CorrectedContentPreview from "../components/CorrectedContentPreview";
export default function AnalysisResultsPage() {
  const {
    draft,
    updateFindingDecision,
    updateReviewStatus,
    retrySave,
  } = useDraft();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoredAnalysis, setRestoredAnalysis] = useState(null);
  const [updating, setUpdating] = useState({});
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");

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
  const reviewId =
    draft.reviewId ||
    analysis?._id ||
    analysis?.id ||
    sessionStorage.getItem("currentReviewId");

  async function handleDecision(findingId, decision, revisedText = undefined) {
    if (!reviewId || !findingId) {
      setEditError(
        decision === "edited"
          ? "Review ID or finding ID is missing."
          : ""
      );

      if (decision !== "edited") {
        alert("Review ID or finding ID is missing.");
      }

      return;
    }

    setUpdating((prev) => ({ ...prev, [findingId]: true }));

    try {
      const updatedReview = await updateFindingDecision(
        reviewId,
        findingId,
        decision,
        revisedText
      );

      const normalizedReview = {
        ...updatedReview,
        findings: updatedReview.findings || [],
        summary: updatedReview.summary || "",
        reviewedAt: updatedReview.reviewedAt || null,
      };

      // Keep the restored view synchronized when the analysis was loaded
      // from the saved review record.
      if (restoredAnalysis || !draft.analysis) {
        setRestoredAnalysis(normalizedReview);
      }

      if (decision === "edited") {
        setEditingFindingId(null);
        setEditText("");
        setEditError("");
      }
    } catch (err) {
      if (decision === "edited") {
        setEditError(err.message || "Failed to save revised text.");
      } else {
        alert(err.message || "Failed to update finding.");
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [findingId]: false }));
    }
  }

  async function handleStatusChange(status) {
    if (!reviewId) {
      alert("Review ID is missing.");
      return;
    }

    setUpdating((prev) => ({ ...prev, status: true }));

    try {
      const updatedReview = await updateReviewStatus(reviewId, status);

      const normalizedReview = {
        ...updatedReview,
        findings: updatedReview.findings || [],
        summary: updatedReview.summary || "",
        reviewedAt: updatedReview.reviewedAt || null,
      };

      if (restoredAnalysis || !draft.analysis) {
        setRestoredAnalysis(normalizedReview);
      }
    } catch (err) {
      alert(err.message || "Failed to update review status.");
    } finally {
      setUpdating((prev) => ({ ...prev, status: false }));
    }
  }

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
        title={analysis.title || "Untitled draft"}
        description="AI-assisted brand review"
        actions={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Review Status:
              <select
                value={analysis.status || "pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating.status}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                }}
              >
                <option value="pending">Pending</option>
                <option value="changes-requested">Changes Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <Button
              to="/content-review"
              variant="secondary"
              icon="arrow-left"
            >
              Back to Content Review
            </Button>
          </div>
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

            {typeof retrySave === "function" && (
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
            )}
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

      <CorrectedContentPreview
        originalContent={draft.body || analysis.content || ""}
        findings={analysis.findings || []}
      />

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
          analysis.findings.map((finding) => {
            // Define these inside the map callback so each card uses
            // its own ID and editing state.
            const findingId =
              finding._id || finding.id || finding.ruleId;

            const isEditing =
              String(editingFindingId) === String(findingId);

            return (
              <Card
                className="analysis-finding"
                padded
                key={finding._id || finding.id || finding.ruleId}
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

                {isEditing && (
                  <div
                    className="analysis-finding__section"
                    style={{
                      background: "var(--surface)",
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "6px",
                      }}
                    >
                      Edit revised text:
                    </label>

                    <textarea
                      value={editText}
                      onChange={(e) => {
                        setEditText(e.target.value);
                        if (editError) setEditError("");
                      }}
                      rows={3}
                      disabled={Boolean(updating[findingId])}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid var(--border)",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />

                    {editError && (
                      <p
                        role="alert"
                        style={{
                          color: "#991b1b",
                          fontSize: "13px",
                          marginTop: "4px",
                        }}
                      >
                        {editError}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (!editText.trim()) {
                            setEditError("Revised text cannot be blank.");
                            return;
                          }

                          handleDecision(
                            findingId,
                            "edited",
                            editText.trim()
                          );
                        }}
                        disabled={Boolean(updating[findingId])}
                      >
                        {updating[findingId] ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingFindingId(null);
                          setEditText("");
                          setEditError("");
                        }}
                        disabled={Boolean(updating[findingId])}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  className="analysis-finding__section"
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "14px",
                    marginTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--ink-muted)",
                      }}
                    >
                      Decision:{" "}
                      <span
                        style={{
                          textTransform: "capitalize",
                          color: "var(--ink)",
                        }}
                      >
                        {finding.decision || "pending"}
                      </span>
                    </span>

                    {finding.revisedText && (
                      <div style={{ marginTop: "8px" }}>
                        <strong>Revised text:</strong>
                        <p>{finding.revisedText}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      size="sm"
                      variant={
                        finding.decision === "accepted"
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() =>
                        handleDecision(findingId, "accepted")
                      }
                      disabled={Boolean(updating[findingId])}
                    >
                      Accept
                    </Button>

                    <Button
                      size="sm"
                      variant={
                        finding.decision === "edited"
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() => {
                        setEditingFindingId(findingId);
                        setEditText(
                          finding.revisedText || finding.suggestedFix || ""
                        );
                        setEditError("");
                      }}
                      disabled={Boolean(updating[findingId])}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant={
                        finding.decision === "dismissed"
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() =>
                        handleDecision(findingId, "dismissed")
                      }
                      disabled={Boolean(updating[findingId])}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
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
