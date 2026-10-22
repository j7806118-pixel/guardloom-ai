import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Button({
  variant = "primary",
  to,
  icon,
  children,
  className = "",
  type,
  ...props
}) {
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  const content = (
    <>
      {icon ? <Icon name={icon} size={16} /> : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type ?? "button"} {...props}>
      {content}
    </button>
  );
}
