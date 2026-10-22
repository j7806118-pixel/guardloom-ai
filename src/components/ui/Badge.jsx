const tones = {
  neutral: "badge--neutral",
  brand: "badge--brand",
  success: "badge--success",
  warning: "badge--warning",
  high: "badge--high",
  medium: "badge--medium",
  low: "badge--low",
};

export default function Badge({ tone = "neutral", dot = false, children }) {
  return (
    <span className={`badge ${tones[tone] ?? tones.neutral}`}>
      {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
