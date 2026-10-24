import Icon from "./Icon";

export default function Notice() {
  return (
    <div className="notice" role="note">
      <Icon name="info" size={16} />
      <p>
        <strong>AI-assisted analysis.</strong> Findings are generated
        using AI and may be inaccurate or incomplete. Verify each
        finding against the selected brand rule before taking action.
      </p>
    </div>
  );
}
