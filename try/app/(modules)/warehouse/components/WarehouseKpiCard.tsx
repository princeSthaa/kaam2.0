import React from "react";

export interface WarehouseKpiCardProps {
  icon: string;
  label: string;
  value: string | number;
  helper?: string;
  tone?: string;
}

/** Renders a single warehouse KPI card with icon, value, and helper text. */
export function WarehouseKpiCard({ icon, label, value, helper, tone = "" }: WarehouseKpiCardProps) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-icon">
        <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
      </div>
      <div className="kpi-data">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
        {helper && <span className="kpi-helper">{helper}</span>}
      </div>
    </div>
  );
}
