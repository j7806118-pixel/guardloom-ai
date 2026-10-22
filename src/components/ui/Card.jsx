export default function Card({ children, className = "", padded = false }) {
  const classes = ["card", padded ? "card--padded" : "", className].filter(Boolean).join(" ");

  return <div className={classes}>{children}</div>;
}
