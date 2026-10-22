export default function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__intro">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
