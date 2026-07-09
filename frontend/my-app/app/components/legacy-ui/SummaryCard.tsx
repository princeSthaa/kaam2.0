type SummaryCardProps = {
  label: string;
  valueId?: string;
  value?: string | number;
  hint: string;
};

export function SummaryCard({ label, valueId, value, hint }: SummaryCardProps) {
  return (
    <div className="pp-summary-card">
      <span className="summary-label">{label}</span>
      <strong id={valueId}>{value !== undefined ? value : "0"}</strong>
      <small>{hint}</small>
    </div>
  );
}
