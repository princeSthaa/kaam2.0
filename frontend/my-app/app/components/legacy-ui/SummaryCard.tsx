type SummaryCardProps = {
  label: string;
  valueId: string;
  hint: string;
};

export function SummaryCard({ label, valueId, hint }: SummaryCardProps) {
  return (
    <div className="pp-summary-card">
      <span className="summary-label">{label}</span>
      <strong id={valueId}>0</strong>
      <small>{hint}</small>
    </div>
  );
}
