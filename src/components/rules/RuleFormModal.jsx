import { cloneElement, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { RULE_CATEGORIES, RULE_SEVERITIES, validateRule } from "../../data/rules";
import Button from "../ui/Button";

const emptyRule = {
  id: "",
  title: "",
  guidance: "",
  category: "",
  severity: "",
  active: true,
};

export default function RuleFormModal({ rule, rules, onClose, onSave }) {
  const titleId = useId();
  const [values, setValues] = useState(rule ?? emptyRule);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = Boolean(rule);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, saving]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateRule(values, rules, rule?.id);
    setErrors(result.errors);

    if (Object.keys(result.errors).length > 0 || saving) {
      return;
    }

    setSaving(true);

    try {
      await onSave(result.value);
    } catch (error) {
      setErrors({
        ...(error.details && typeof error.details === "object" ? error.details : {}),
        form: error.message || "The rule could not be saved.",
      });
      setSaving(false);
    }
  }

  return createPortal(
    <div className="rules-modal">
      <button className="rules-modal__backdrop" type="button" aria-label="Close rule form" onClick={saving ? undefined : onClose} />
      <div className="rules-modal__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <form className="rules-form" onSubmit={handleSubmit} noValidate>
          <div className="rules-form__intro">
            <h2 id={titleId}>{editing ? "Edit rule" : "Add rule"}</h2>
            <p>{editing ? "Changes are saved to the brand rule set." : "New rules are saved to the brand rule set."}</p>
          </div>

          <div className="rules-form__grid">
            <Field label="Rule ID" error={errors.id} htmlFor="rule-id">
              <input
                id="rule-id"
                value={values.id}
                placeholder="AW-007"
                autoFocus
                aria-invalid={Boolean(errors.id)}
                onChange={(event) => update("id", event.target.value)}
              />
            </Field>
            <Field label="Status" htmlFor="rule-active">
              <label className="rules-check" htmlFor="rule-active">
                <input
                  id="rule-active"
                  type="checkbox"
                  checked={values.active}
                  onChange={(event) => update("active", event.target.checked)}
                />
                <span>{values.active ? "Active" : "Inactive"}</span>
              </label>
            </Field>
          </div>

          <Field label="Title" error={errors.title} htmlFor="rule-title">
            <input
              id="rule-title"
              value={values.title}
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>

          <Field label="Approved guidance" error={errors.guidance} htmlFor="rule-guidance">
            <textarea
              id="rule-guidance"
              value={values.guidance}
              aria-invalid={Boolean(errors.guidance)}
              onChange={(event) => update("guidance", event.target.value)}
            />
          </Field>

          <div className="rules-form__grid">
            <Field label="Category" error={errors.category} htmlFor="rule-category">
              <select
                id="rule-category"
                value={values.category}
                aria-invalid={Boolean(errors.category)}
                onChange={(event) => update("category", event.target.value)}
              >
                <option value="">Choose a category</option>
                {RULE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Severity" error={errors.severity} htmlFor="rule-severity">
              <select
                id="rule-severity"
                value={values.severity}
                aria-invalid={Boolean(errors.severity)}
                onChange={(event) => update("severity", event.target.value)}
              >
                <option value="">Choose a severity</option>
                {RULE_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {errors.form ? <p className="field__error">{errors.form}</p> : null}

          <div className="rules-form__actions">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add rule"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, error, htmlFor, children }) {
  const errorId = `${htmlFor}-error`;
  const control = error
    ? cloneElement(children, { "aria-describedby": errorId, "aria-invalid": true })
    : children;

  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {control}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
