import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";
import { CONTENT_TYPES, countWords, validateDraft } from "../data/draft";
import useDraft from "../state/useDraft";
import useRules from "../state/useRules";

export default function ContentReviewPage() {
  const navigate = useNavigate();
  const { rules, rulesStatus, rulesError } = useRules();
  const { draft, updateDraft, setSelectedRuleIds, loadSample, saveDraft, requestAnalysis, clearNotice } = useDraft();
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);
  const activeRules = rules.filter((rule) => rule.active);
  const inactiveCount = rules.length - activeRules.length;
  const selectedIds = draft.selectedRuleIds.filter((id) => activeRules.some((rule) => rule.id === id));
  const words = countWords(draft.body);
  const readiness =
    draft.source === "sample"
      ? `Sample draft ready · ${selectedIds.length} ${selectedIds.length === 1 ? "rule" : "rules"} selected`
      : `${selectedIds.length} ${selectedIds.length === 1 ? "rule" : "rules"} selected`;

  function changeField(field, value) {
    updateDraft({ [field]: value });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function changeSelection(nextIds) {
    setSelectedRuleIds(nextIds);
    clearNotice();
  }

  function toggleRule(id) {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id];
    changeSelection(next);
  }


async function submit(action) {
  const nextErrors = validateDraft(draft);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    clearNotice();
    return;
  }

  const result = await action(selectedIds);

  if (action === requestAnalysis && result) {
    navigate("/analysis-results");
  }
}

  function applyWrap(before, after = before) {
    const field = editorRef.current;

    if (!field) {
      return;
    }

    const start = field.selectionStart ?? draft.body.length;
    const end = field.selectionEnd ?? draft.body.length;
    const selected = draft.body.slice(start, end) || "text";
    const next = `${draft.body.slice(0, start)}${before}${selected}${after}${draft.body.slice(end)}`;
    changeField("body", next);

    const cursorStart = start + before.length;
    const cursorEnd = cursorStart + selected.length;
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function applyList() {
    const field = editorRef.current;

    if (!field) {
      return;
    }

    const start = field.selectionStart ?? 0;
    const end = field.selectionEnd ?? 0;
    const blockStart = draft.body.lastIndexOf("\n", start - 1) + 1;
    const blockEndIndex = draft.body.indexOf("\n", end);
    const blockEnd = blockEndIndex === -1 ? draft.body.length : blockEndIndex;
    const block = draft.body.slice(blockStart, blockEnd);
    const listed = block
      .split("\n")
      .map((line) => (line.startsWith("- ") ? line : `- ${line || "List item"}`))
      .join("\n");
    changeField("body", `${draft.body.slice(0, blockStart)}${listed}${draft.body.slice(blockEnd)}`);
    requestAnimationFrame(() => field.focus());
  }

  return (
    <>
      <PageHeader
        title="Content Review"
        description="Bring a draft and choose the brand guidance you want to check it against."
        actions={
          <Button variant="secondary" icon="file-text" onClick={() => { loadSample(); setErrors({}); }}>
            Load sample
          </Button>
        }
      />

      <Card className="review-steps">
        <ol>
          <li className="is-current">
            <span>1</span>
            Prepare content
          </li>
          <li>
            <span>2</span>
            Review findings
          </li>
          <li>
            <span>3</span>
            Human sign-off
          </li>
        </ol>
        <p>Illustrative review flow</p>
      </Card>

      <div className="review-layout">
        <div className="review-draft">
          <Card>
            <div className="review-card__head">
              <h2>Your draft</h2>
              <Badge tone="brand">Demo content</Badge>
            </div>
            <div className="review-meta">
              <div className="field">
                <label htmlFor="draft-title">Content title</label>
                <input
                  id="draft-title"
                  value={draft.title}
                  aria-invalid={errors.title ? "true" : undefined}
                  aria-describedby={errors.title ? "draft-title-error" : undefined}
                  onChange={(event) => changeField("title", event.target.value)}
                />
                {errors.title ? (
                  <p className="field__error" id="draft-title-error">
                    {errors.title}
                  </p>
                ) : null}
              </div>
              <div className="field review-type">
                <label htmlFor="draft-type">Content type</label>
                <select
                  id="draft-type"
                  value={draft.contentType}
                  onChange={(event) => changeField("contentType", event.target.value)}
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="review-toolbar" aria-label="Draft formatting">
              <span className="review-toolbar__style">
                Paragraph
                <Icon name="chevron-down" size={12} />
              </span>
              <span className="review-toolbar__divider" />
              <button type="button" aria-label="Bold" onClick={() => applyWrap("**")}>
                <Icon name="bold" size={15} />
              </button>
              <button type="button" aria-label="Italic" onClick={() => applyWrap("*")}>
                <Icon name="italic" size={15} />
              </button>
              <button type="button" aria-label="Bulleted list" onClick={applyList}>
                <Icon name="list" size={15} />
              </button>
              <button type="button" aria-label="Link" onClick={() => applyWrap("[", "](https://)")}>
                <Icon name="link" size={15} />
              </button>
              <span>Draft text</span>
            </div>
            <textarea
              ref={editorRef}
              className="review-editor"
              aria-label="Draft content"
              aria-invalid={errors.body ? "true" : undefined}
              aria-describedby={errors.body ? "draft-body-error" : undefined}
              value={draft.body}
              placeholder="Write the draft you want to check against the selected rules."
              onChange={(event) => changeField("body", event.target.value)}
            />
            {errors.body ? (
              <p className="field__error review-editor__error" id="draft-body-error">
                {errors.body}
              </p>
            ) : null}
            <div className="review-editor__foot">
              <span>
                {words} {words === 1 ? "word" : "words"} · English (US)
              </span>
              <span>{draft.source === "sample" ? "Fictional sample · DR-024" : "Edited demonstration draft"}</span>
            </div>
          </Card>
          <p className="review-note">
            <Icon name="info" size={17} />
            <span>Choose rules relevant to this draft. Suggestions are a starting point, not a substitute for factual, legal, or editorial review.</span>
          </p>
        </div>

        <Card className="review-rules">
          <div className="review-card__head">
            <h2>Relevant rules</h2>
            <Badge tone="brand">{selectedIds.length} selected</Badge>
          </div>
          <p className="review-rules__label">Aster Works · Demo rule set</p>
          <div className="review-rules__controls">
            <button type="button" onClick={() => changeSelection(activeRules.map((rule) => rule.id))} disabled={activeRules.length === 0}>
              Select all
            </button>
            <button type="button" onClick={() => changeSelection([])} disabled={selectedIds.length === 0}>
              Clear selection
            </button>
          </div>
          {rulesStatus === "loading" ? (
            <p className="review-rules__empty">Loading rules.</p>
          ) : rulesStatus === "error" ? (
            <p className="review-rules__empty">{rulesError}</p>
          ) : activeRules.length === 0 ? (
            <p className="review-rules__empty">No active rules. Activate a rule on Brand Rules to include it here.</p>
          ) : (
            <ul>
              {activeRules.map((rule) => (
                <li key={rule.id}>
                  <label className={`rule-option${selectedIds.includes(rule.id) ? " is-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(rule.id)}
                      onChange={() => toggleRule(rule.id)}
                    />
                    <span>
                      <span className="rule-option__meta">
                        <span className="rule-option__id">{rule.id}</span>
                        <span className={`rule-option__severity rule-option__severity--${rule.severity.toLowerCase()}`}>
                          {rule.severity}
                        </span>
                      </span>
                      <span className="rule-option__title">{rule.title}</span>
                      <span className="rule-option__category">{rule.category}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="review-rules__foot">
            <span>
              {inactiveCount} inactive {inactiveCount === 1 ? "rule" : "rules"} excluded
            </span>
            <Link className="text-link" to="/brand-rules">
              View all rules
              <Icon name="arrow-up-right" size={12} />
            </Link>
          </div>
        </Card>
      </div>


{draft.notice ? (
  <div
    className={`review-banner review-banner--${draft.notice.kind}`}
    role="status"
  >
    <Icon
      name={
        draft.notice.kind === "loading"
          ? "loader-circle"
          : draft.notice.kind === "analysis-error"
            ? "alert-circle"
            : draft.notice.kind === "analysis-success"
              ? "circle-check"
              : "info"
      }
      size={18}
    />
    <div>
      <strong>
        {draft.notice.kind === "loading"
          ? "Analysis in progress"
          : draft.notice.kind === "analysis-error"
            ? "Analysis failed"
            : draft.notice.kind === "analysis-success"
              ? "Analysis completed"
              : draft.notice.kind === "analysis"
                ? "Analysis integration is not connected yet"
                : "Notice"}
      </strong>
      <p>{draft.notice.message}</p>
    </div>
  </div>
) : null}


      <Card className="review-actions">
        <div>
          <Icon name="circle-check" size={20} />
          <div>
            <strong>{readiness}</strong>
            <p>
  AI-assisted review checks your draft against selected brand rules.
  Verify all findings manually before making decisions.
</p>
          </div>
        </div>
        <div className="review-actions__buttons">
          <Button variant="secondary" onClick={() => submit(saveDraft)}>
            Save draft
          </Button>
          <Button icon="scan-text" onClick={() => submit(requestAnalysis)}>
            Analyze Content
          </Button>
        </div>
      </Card>
    </>
  );
}
