import { NavLink } from "react-router-dom";
import { account, navItems, workspace } from "../../data/demo";
import Icon from "../ui/Icon";

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar${open ? " is-open" : ""}`} aria-label="Workspace sidebar">
      <div className="sidebar__top">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="shield-check" size={21} />
          </span>
          <span className="brand__name">GuardLoom</span>
          <span className="brand__ai">AI</span>
        </div>

        <button className="switcher" type="button" aria-label="Demonstration workspace">
          <span className="switcher__mark">{workspace.monogram}</span>
          <span className="switcher__meta">
            <span className="switcher__name">{workspace.name}</span>
            <span className="switcher__type">{workspace.type}</span>
          </span>
          <span className="switcher__icon">
            <Icon name="chevrons-up-down" size={13} />
          </span>
        </button>

        <nav className="nav" aria-label="Workspace">
          <p className="nav-label">WORKSPACE</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
              onClick={onClose}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar__bottom">
        <div className="reminder">
          <Icon name="user-check" size={20} />
          <strong>Your brand. Your judgment.</strong>
          <p>Suggestions support review. Your team owns every final decision.</p>
        </div>

        <button className="help-button" type="button">
          <Icon name="circle-help" size={17} />
          Help & documentation
        </button>

        <button className="account" type="button" aria-label="Demonstration account">
          <span className="avatar">{account.initials}</span>
          <span className="account__meta">
            <span className="account__name">{account.name}</span>
            <span className="account__role">{account.role}</span>
          </span>
          <span className="account__icon">
            <Icon name="settings-2" size={16} />
          </span>
        </button>
      </div>
    </aside>
  );
}
