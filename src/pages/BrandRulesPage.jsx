import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { brandProfile, RULE_CATEGORIES, RULE_SEVERITIES } from "../data/rules";
import useRules from "../state/useRules";
import RuleFormModal from "../components/rules/RuleFormModal";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";

const PAGE_SIZE = 6;

const severityTone = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

export default function BrandRulesPage() {
  const { rules, addRule, updateRule, setRuleActive } = useRules();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const [feedback, setFeedback] = useState("");
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesQuery =
        needle.length === 0 ||
        rule.id.toLowerCase().includes(needle) ||
        rule.title.toLowerCase().includes(needle) ||
        rule.guidance.toLowerCase().includes(needle);
      const matchesCategory = category === "all" || rule.category === category;
      const matchesSeverity = severity === "all" || rule.severity === severity;
      const matchesTab = tab === "all" || (tab === "active" ? rule.active : !rule.active);

      return matchesQuery && matchesCategory && matchesSeverity && matchesTab;
    });
  }, [rules, query, category, severity, tab]);

  const counts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const scoped = rules.filter((rule) => {
      const matchesQuery =
        needle.length === 0 ||
        rule.id.toLowerCase().includes(needle) ||
        rule.title.toLowerCase().includes(needle) ||
        rule.guidance.toLowerCase().includes(needle);
      const matchesCategory = category === "all" || rule.category === category;
      const matchesSeverity = severity === "all" || rule.severity === severity;
      return matchesQuery && matchesCategory && matchesSeverity;
    });

    return {
      all: scoped.length,
      active: scoped.filter((rule) => rule.active).length,
      inactive: scoped.filter((rule) => !rule.active).length,
    };
  }, [rules, query, category, severity]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : start + 1;
  const rangeEnd = start + pageRows.length;

  useEffect(() => {
    if (!openMenu) {
      return undefined;
    }

    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target) || menuButtonRef.current?.contains(event.target)) {
        return;
      }
      setOpenMenu(null);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setTab("all");
    setQuery("");
    setCategory("all");
    setSeverity("all");
    setPage(1);
  }

  function saveRule(next) {
    if (editing) {
      updateRule(editing.id, next);
      setFeedback(`${next.id} was updated in this demonstration session. It was not saved to a server.`);
      setEditing(null);
      return;
    }

    addRule(next);
    setFeedback(`${next.id} was added in this demonstration session. It was not saved to a server.`);
    setAdding(false);
    clearFilters();
  }

  function toggleActive(rule) {
    const active = !rule.active;
    setRuleActive(rule.id, active);
    setOpenMenu(null);
    setFeedback(
      `${rule.id} is now ${active ? "active" : "inactive"} in this demonstration session. It was not saved to a server.`,
    );
  }

  return (
    <>
      <PageHeader
        title="Brand Rules"
        description="One shared source of truth for what your brand says, and how it says it."
        actions={
          <Button icon="plus" onClick={() => setAdding(true)}>
            Add Rule
          </Button>
        }
      />

      {feedback ? (
        <div className="rules-feedback" role="status">
          <p>{feedback}</p>
          <button type="button" onClick={() => setFeedback("")}>
            Dismiss
          </button>
        </div>
      ) : null}

      <Card className="brand-profile">
        <div className="brand-profile__identity">
          <span className="brand-profile__mark">{brandProfile.monogram}</span>
          <div>
            <p className="brand-profile__name">{brandProfile.name}</p>
            <p className="brand-profile__tagline">{brandProfile.tagline}</p>
            <p className="brand-profile__label">{brandProfile.label}</p>
          </div>
        </div>
        <span className="brand-profile__divider" aria-hidden="true" />
        <div className="brand-profile__copy">
          <p>Approved positioning</p>
          <span>{brandProfile.positioning}</span>
        </div>
        <div className="brand-profile__copy">
          <p>Voice & tone</p>
          <span>{brandProfile.voice}</span>
        </div>
      </Card>

      <Card>
        <div className="rules-tabs" role="tablist" aria-label="Rule status">
          <StatusTab label="All rules" count={counts.all} selected={tab === "all"} onClick={() => { setTab("all"); resetPage(); }} />
          <StatusTab label="Active" count={counts.active} selected={tab === "active"} onClick={() => { setTab("active"); resetPage(); }} />
          <StatusTab label="Inactive" count={counts.inactive} selected={tab === "inactive"} onClick={() => { setTab("inactive"); resetPage(); }} />
          <p className="rules-tabs__meta">{brandProfile.version}</p>
        </div>

        <div className="rules-filters">
          <label className="rules-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              placeholder="Search by rule ID or title"
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
            />
          </label>
          <FilterSelect
            label="Category"
            value={category}
            onChange={(value) => {
              setCategory(value);
              resetPage();
            }}
            options={[{ value: "all", label: "All categories" }, ...RULE_CATEGORIES.map((item) => ({ value: item, label: item }))]}
          />
          <FilterSelect
            label="Severity"
            value={severity}
            onChange={(value) => {
              setSeverity(value);
              resetPage();
            }}
            options={[{ value: "all", label: "All severities" }, ...RULE_SEVERITIES.map((item) => ({ value: item, label: item }))]}
          />
          <p className="rules-filters__count">{rules.length} demonstration rules</p>
        </div>

        {pageRows.length === 0 ? (
          <div className="rules-empty">
            <h2>No demonstration rules match</h2>
            <p>Try another status, category, severity, or search. These filters only change what you see in this session.</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>Rule ID</th>
                    <th>Rule & approved guidance</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((rule) => (
                    <tr key={rule.id} className={rule.active ? undefined : "is-inactive"}>
                      <td className="rules-id">{rule.id}</td>
                      <td>
                        <p className="rules-title">{rule.title}</p>
                        <p className="rules-guidance">{rule.guidance}</p>
                      </td>
                      <td>{rule.category}</td>
                      <td>
                        <Badge tone={severityTone[rule.severity]}>{rule.severity}</Badge>
                      </td>
                      <td>
                        <Badge tone={rule.active ? "success" : "neutral"} dot>
                          {rule.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        <div className="rules-actions">
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Actions for ${rule.id}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenu === rule.id}
                            onClick={(event) => {
                              if (openMenu === rule.id) {
                                setOpenMenu(null);
                                return;
                              }

                              menuButtonRef.current = event.currentTarget;
                              setMenuStyle(menuPosition(event.currentTarget.getBoundingClientRect()));
                              setOpenMenu(rule.id);
                            }}
                          >
                            <Icon name="ellipsis" size={20} />
                          </button>
                          {openMenu === rule.id ? (
                            <RuleActionMenu
                              menuRef={menuRef}
                              style={menuStyle}
                              active={rule.active}
                              onEdit={() => {
                                setEditing(rule);
                                setOpenMenu(null);
                              }}
                              onToggle={() => toggleActive(rule)}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rules-foot">
              <p>
                Showing {rangeStart}–{rangeEnd} of {filtered.length} rules
              </p>
              <div className="rules-pager" aria-label="Rules pages">
                <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  <Icon name="chevron-left" size={14} />
                </button>
                <span aria-current="page">{currentPage}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <Icon name="chevron-right" size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="rules-policy">
        <Icon name="shield-check" size={20} />
        <div>
          <p>Rules guide the review. People make the call.</p>
          <span>
            High: factual or unsupported claims. Medium: terminology consistency. Low: writing guidance. Inactive rules are excluded from review.
          </span>
        </div>
        <Badge tone="brand">Demo rule set</Badge>
      </Card>

      {adding || editing ? (
        <RuleFormModal
          rule={editing}
          rules={rules}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={saveRule}
        />
      ) : null}
    </>
  );
}

function menuPosition(rect) {
  const width = 168;
  const height = 84;
  const gap = 4;
  const below = window.innerHeight - rect.bottom;
  const top = below >= height + gap ? rect.bottom + gap : Math.max(8, rect.top - height - gap);
  const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);

  return { top, left, width };
}

function RuleActionMenu({ menuRef, style, active, onEdit, onToggle }) {
  return createPortal(
    <div className="rules-menu" ref={menuRef} role="menu" style={style}>
      <button type="button" role="menuitem" onClick={onEdit}>
        Edit rule
      </button>
      <button type="button" role="menuitem" onClick={onToggle}>
        {active ? "Mark inactive" : "Mark active"}
      </button>
    </div>,
    document.body,
  );
}

function StatusTab({ label, count, selected, onClick }) {
  return (
    <button className={`rules-tab${selected ? " is-active" : ""}`} type="button" role="tab" aria-selected={selected} onClick={onClick}>
      {label}
      <Badge tone={selected ? "brand" : "neutral"}>{count}</Badge>
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="rules-select">
      <span className="sr-only">{label}</span>
      <select value={value} aria-label={label} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={14} />
    </label>
  );
}
