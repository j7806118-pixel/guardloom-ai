import Icon from "./Icon";

export default function Notice() {
  return (
    <div className="notice" role="note">
      <Icon name="info" size={16} />
      <p>
        <strong>Demonstration data.</strong> All content, statistics, analyses and findings are
        fictional examples. No live analysis is performed.
      </p>
    </div>
  );
}
