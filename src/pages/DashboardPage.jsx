import { Link } from "react-router-dom";
import { analyses, nextReview } from "../data/demo";
import { RULE_CATEGORIES } from "../data/rules";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";
import useRules from "../state/useRules";

function findingLabel(count) {
  return count === 1 ? "1 finding" : `${count} findings`;
}

export default function DashboardPage() {
  const { rules, rulesStatus, rulesError } = useRules();

  const totalRules = rules.length;
  const activeRules = rules.filter((rule) => rule.active).length;
  const inactiveRules = totalRules - activeRules;

  const categoryBreakdown = RULE_CATEGORIES.map((catName) => {
    const catRules = rules.filter((rule) => rule.category === catName);
    const catActive = catRules.filter((rule) => rule.active).length;
    return {
      name: catName,
      active: catActive,
      total: catRules.length,
    };
  });

  return (
    <>
      <PageHeader
        title="A little clarity before you publish."
        description="An overview of your team’s content reviews and brand guidance."
        actions={
          <Button to="/content-review" icon="plus">
            Review Content
          </Button>
        }
      />

      <section className="metric-grid" aria-label="Workspace metrics">
        <article className="metric">
          <div className="metric__head">
            <p>Content analyses</p>
            <Icon name="files" size={17} />
          </div>
          <p className="metric__value">
            <strong>0</strong>
            <span>session-only</span>
          </p>
          <p className="metric__note">SESSION-ONLY DATA</p>
        </article>

        <article className="metric">
          <div className="metric__head">
            <p>Awaiting human review</p>
            <Icon name="clipboard-list" size={17} />
          </div>
          <p className="metric__value">
            <strong className="is-emphasis">0</strong>
            <span>need a decision</span>
          </p>
          <p className="metric__note">SESSION-ONLY DATA</p>
        </article>

        <article className="metric">
          <div className="metric__head">
            <p>Reviewed by your team</p>
            <Icon name="user-check" size={17} />
          </div>
          <p className="metric__value">
            <strong>0</strong>
            <span>recorded human decisions</span>
          </p>
          <p className="metric__note">SESSION-ONLY DATA</p>
        </article>

        <article className="metric">
          <div className="metric__head">
            <p>Active brand rules</p>
            <Icon name="book-open" size={17} />
          </div>
          <p className="metric__value">
            <strong>{rulesStatus === "loading" ? "..." : activeRules}</strong>
            <span>
              {rulesStatus === "loading"
                ? "loading rules..."
                : `of ${totalRules} total ${totalRules === 1 ? "rule" : "rules"}`}
            </span>
          </p>
          {rulesStatus === "error" ? (
            <p className="metric__note">{rulesError}</p>
          ) : null}
        </article>
      </section>

      <Card>
        <div className="section-head">
          <h2>Recent content analyses</h2>
          <Badge>Demo analyses</Badge>
          <Link className="text-link" to="/analysis-results">
            View all analyses →
          </Link>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Channel</th>
                <th>Findings</th>
                <th>Review status</th>
                <th>Created</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((row) => (
                <tr key={row.id} className={row.highlighted ? "is-highlight" : undefined}>
                  <td>
                    <div className="doc">
                      <span className={`doc__icon${row.highlighted ? " is-tint" : ""}`}>
                        <Icon name="file-text" size={16} />
                      </span>
                      <span className="doc__copy">
                        <Link className="doc__title" to="/analysis-results">
                          {row.title}
                        </Link>
                        <span className="doc__meta">
                          {row.id} · {row.owner}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td>{row.channel}</td>
                  <td>
                    <span className={`findings${row.findings > 0 ? " is-alert" : ""}`}>
                      {findingLabel(row.findings)}
                    </span>
                  </td>
                  <td>
                    <Badge tone={row.status === "Reviewed" ? "success" : "warning"} dot>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="created">{row.created}</td>
                  <td>
                    <Link className="row-link" to="/analysis-results" aria-label={`Open ${row.title}`}>
                      <Icon name="chevron-right" size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <span>Showing 5 of 24 demonstration analyses</span>
          <span>Reviewed ≠ approved for publication</span>
        </div>
      </Card>

      <section className="foundation">
        <Card className="panel">
          <div className="panel__head">
            <h2>Your brand foundation</h2>
            <Link className="text-link" to="/brand-rules">
              Manage rules →
            </Link>
          </div>
          <p className="panel__summary">
            {rulesStatus === "loading"
              ? "Loading rules..."
              : `${activeRules} active ${activeRules === 1 ? "rule" : "rules"}` +
                (inactiveRules > 0 ? ` (${inactiveRules} inactive)` : "") +
                ` across ${RULE_CATEGORIES.length} categories`}
          </p>
          <div className="category-grid">
            {categoryBreakdown.map((category) => (
              <div className="category" key={category.name}>
                <p className="category__name">{category.name}</p>
                <div className="track" aria-hidden="true">
                  <span
                    className="track__fill"
                    style={{
                      width: `${category.total > 0 ? (category.active / category.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="category__count">
                  {category.active} of {category.total} active
                </p>
              </div>
            ))}
          </div>
        </Card>

        <aside className="callout">
          <p className="callout__eyebrow">
            <Icon name="arrow-up-right" size={16} />
            {nextReview.eyebrow.toUpperCase()}
          </p>
          <h2>{nextReview.title}</h2>
          <p>{nextReview.body}</p>
          <Link className="text-link" to="/analysis-results">
            {nextReview.action}
          </Link>
        </aside>
      </section>

      <p className="footnote">
        Aster Works is a fictional brand. All workspace activity shown is demonstration data.
      </p>
    </>
  );
}
