import { useMemo, useState } from "react";
import { sampleDraft } from "../data/draft";
import DraftContext from "./draft-context";

const initialDraft = {
  title: sampleDraft.title,
  contentType: sampleDraft.contentType,
  body: sampleDraft.body,
  selectedRuleIds: sampleDraft.selectedRuleIds,
  source: "sample",
  saved: null,
  analysis: null,
  reviewId: null,
  persistenceError: null,
  notice: null,
};

export function DraftProvider({ children }) {
  const [draft, setDraft] = useState(initialDraft);

  const value = useMemo(
    () => ({
      draft,
      updateDraft(partial) {
        setDraft((current) => {
          const next = { ...current, ...partial, notice: null };
          const stillSample = next.title === sampleDraft.title && next.body === sampleDraft.body;
          next.source = stillSample ? "sample" : "custom";
          return next;
        });
      },
      setSelectedRuleIds(selectedRuleIds) {
        setDraft((current) => ({ ...current, selectedRuleIds, notice: null }));
      },
      loadSample() {
        setDraft((current) => ({
          ...current,
          title: sampleDraft.title,
          contentType: sampleDraft.contentType,
          body: sampleDraft.body,
          selectedRuleIds: [...sampleDraft.selectedRuleIds],
          source: "sample",
          notice: {
            kind: "sample",
            message: "Loaded the fictional Autumn launch email. Nothing was sent to a server.",
          },
        }));
      },
      saveDraft(selectedRuleIds) {
        setDraft((current) => ({
          ...current,
          selectedRuleIds,
          saved: {
            title: current.title.trim(),
            contentType: current.contentType,
            body: current.body,
            selectedRuleIds,
          },
          notice: {
            kind: "saved",
            message: "Draft saved in this browser session. Nothing was sent to a server.",
          },
        }));
      },

      async updateFindingDecision(reviewId, findingId, decision, revisedText) {
        if (!reviewId || !findingId) {
          throw new Error("Review ID and Finding ID are required.");
        }

        const res = await fetch(
          `/api/reviews/${encodeURIComponent(reviewId)}/findings/${encodeURIComponent(findingId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decision, revisedText }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to save finding decision.");
        }

        const updatedReview = await res.json();
        setDraft((current) => {
          if (!current.analysis) return current;
          return {
            ...current,
            reviewId: updatedReview._id || current.reviewId,
            analysis: {
              ...current.analysis,
              findings: updatedReview.findings,
              status: updatedReview.status,
            },
          };
        });
        return updatedReview;
      },

      async updateReviewStatus(reviewId, status) {
        if (!reviewId) {
          throw new Error("Review ID is required.");
        }

        const res = await fetch(
          `/api/reviews/${encodeURIComponent(reviewId)}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to save review status.");
        }

        const updatedReview = await res.json();
        setDraft((current) => {
          if (!current.analysis) return current;
          return {
            ...current,
            reviewId: updatedReview._id || current.reviewId,
            analysis: {
              ...current.analysis,
              status: updatedReview.status,
            },
          };
        });
        return updatedReview;
      },

      async requestAnalysis(selectedRuleIds) {
        setDraft((current) => ({
          ...current,
          selectedRuleIds,
          notice: {
            kind: "loading",
            message: "Reviewing your draft against the selected brand rules...",
          },
        }));

        try {
          const response = await fetch("/api/review", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: draft.title,
              contentType: draft.contentType,
              content: draft.body,
              ruleIds: selectedRuleIds,
            }),
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              result.message || "The AI review could not be completed.",
            );
          }

          setDraft((current) => ({
            ...current,
            selectedRuleIds,
            analysis: result,
            notice: {
              kind: "analysis-success",
              message: "AI review completed. Please verify the findings before acting on them.",
            },
          }));

          // Persist the review to MongoDB
          try {
            const persistRes = await fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: draft.title,
                contentType: draft.contentType,
                content: draft.body,
                ruleIds: selectedRuleIds,
                findings: result.findings,
                summary: result.summary,
                reviewedAt: result.reviewedAt || new Date().toISOString(),
                reviewMode: result.reviewMode,
              }),
            });

            let persistData = {};
            const contentTypeHeader = persistRes.headers.get("content-type");
            if (contentTypeHeader && contentTypeHeader.includes("application/json")) {
              persistData = await persistRes.json().catch(() => ({}));
            } else {
              const text = await persistRes.text().catch(() => "");
              persistData = { message: text || persistRes.statusText };
            }
            if (persistRes.ok && (persistData._id || persistData.id)) {
              const savedReviewId = persistData._id || persistData.id;
              sessionStorage.setItem("currentReviewId", savedReviewId);
              setDraft((current) => ({
                ...current,
                reviewId: savedReviewId,
                analysis: persistData,
                persistenceError: null,
              }));
            } else {
              let rawText = "";
              try {
                rawText = await persistRes.text();
              } catch {}
              console.error("Failed to persist review record:", persistRes.status, persistRes.statusText, rawText);
              setDraft((current) => ({
                ...current,
                persistenceError: "Could not save the review. Check that the backend is running and try again.",
                notice: {
                  kind: "analysis-success",
                  message: "AI review completed, but saving the persistent record failed. You can still view and retry saving.",
                },
              }));
            }
          } catch (persistErr) {
            console.error("Persistence network error:", persistErr);
            setDraft((current) => ({
              ...current,
              persistenceError: "Could not save the review. Check that the backend is running and try again.",
              notice: {
                kind: "analysis-success",
                message: "AI review completed, but database persistence failed. You can still view results.",
              },
            }));
          }

          return result;

        } catch (error) {
          setDraft((current) => ({
            ...current,
            selectedRuleIds,
            notice: {
              kind: "analysis-error",
              message:
                error.message ||
                "Could not connect to the AI review service. Please try again.",
            },
          }));
          return null;
        }
      },

      clearNotice() {
        setDraft((current) => ({ ...current, notice: null }));
      },

      async retrySave() {
        if (!draft.analysis) return;
        try {
          const persistRes = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: draft.title,
              contentType: draft.contentType,
              content: draft.body,
              ruleIds: draft.selectedRuleIds,
              findings: draft.analysis.findings,
              summary: draft.analysis.summary,
              reviewedAt: draft.analysis.reviewedAt || new Date().toISOString(),
              reviewMode: draft.analysis.reviewMode,
            }),
          });

          let persistData = {};
          const contentTypeHeader = persistRes.headers.get("content-type");
          if (contentTypeHeader && contentTypeHeader.includes("application/json")) {
            persistData = await persistRes.json().catch(() => ({}));
          } else {
            const text = await persistRes.text().catch(() => "");
            persistData = { message: text || persistRes.statusText };
          }

          if (persistRes.ok && (persistData._id || persistData.id)) {
            const savedReviewId = persistData._id || persistData.id;
            sessionStorage.setItem("currentReviewId", savedReviewId);
            setDraft((current) => ({
              ...current,
              reviewId: savedReviewId,
              analysis: persistData,
              persistenceError: null,
              notice: {
                kind: "saved",
                message: "Review successfully persisted to database.",
              },
            }));
          }else {
            let rawText = "";
            try {
              rawText = await persistRes.text();
            } catch {}
            console.error("Persistence retry failed:", persistRes.status, persistRes.statusText, rawText);
            setDraft((current) => ({
              ...current,
              persistenceError: "Could not save the review. Check that the backend is running and try again.",
            }));
          }
        } catch (err) {
          console.error("Persistence retry network error:", err);
          setDraft((current) => ({
            ...current,
            persistenceError: "Could not save the review. Check that the backend is running and try again.",
            notice: {
              kind: "analysis-error",
              message: "Network error while trying to save review.",
            },
          }));
        }
      },
    }),
    [draft],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
