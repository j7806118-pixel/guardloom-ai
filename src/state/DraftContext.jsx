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
    }),
    [draft],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
