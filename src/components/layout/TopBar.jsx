import Badge from "../ui/Badge";
import Icon from "../ui/Icon";

export default function TopBar({ title, navOpen, onMenu }) {
  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        type="button"
        aria-label={navOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={navOpen}
        onClick={onMenu}
      >
        <Icon name={navOpen ? "x" : "menu"} size={18} />
      </button>

      <div className="crumbs">
        <span className="crumbs__parent">Workspace</span>
        <span className="crumbs__sep">
          <Icon name="chevron-right" size={12} />
        </span>
        <span className="crumbs__current">{title}</span>
      </div>

      <div className="topbar__status">
        <Badge tone="success" dot>
          Demo workspace
        </Badge>
        <span className="topbar__divider" aria-hidden="true" />
        <button className="icon-button" type="button" aria-label="Notifications">
          <Icon name="bell" size={18} />
        </button>
      </div>
    </header>
  );
}
