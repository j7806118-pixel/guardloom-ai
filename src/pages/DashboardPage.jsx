import { Link } from "react-router-dom";
import { analyses, categories, metrics, nextReview } from "../data/demo";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";

function findingLabel(count) {
  return count === 1 ? "1 finding" : `${count} findings`;
}

export default function DashboardPage() {
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

      <section className="metric-grid" aria-label="Demonstration statistics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.id}>
            <div className="metric__head">
              <p>{metric.label}</p>
              <Icon name={metric.icon} size={17} />
            </div>
            <p className="metric__value">
              <strong className={metric.emphasis ? "is-emphasis" : undefined}>{metric.value}</strong>
              <span>{metric.caption}</span>
            </p>
            <p className="metric__note">DEMONSTRATION DATA</p>
          </article>
        ))}
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
          <p className="panel__summary">5 active rules across 3 categories · Demonstration statistics</p>
          <div className="category-grid">
            {categories.map((category) => (
              <div className="category" key={category.name}>
                <p className="category__name">{category.name}</p>
                <div className="track" aria-hidden="true">
                  <span
                    className="track__fill"
                    style={{ width: `${(category.active / category.total) * 100}%` }}
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
