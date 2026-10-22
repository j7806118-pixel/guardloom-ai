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
      requestAnalysis(selectedRuleIds) {
        setDraft((current) => ({
          ...current,
          selectedRuleIds,
          notice: {
            kind: "analysis",
            message:
              "Analysis integration is not connected yet. No AI service was called, and no findings were created.",
          },
        }));
      },
      clearNotice() {
        setDraft((current) => ({ ...current, notice: null }));
      },
    }),
    [draft],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
