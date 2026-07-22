import React from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  color?: string;
  trend?: { value: string; positive?: boolean };
}

export function MetricCard({ label, value, subtext, icon, color = "#2563eb", trend }: MetricCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{label}</span>
        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${color}15`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{value}</div>
        {subtext && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{subtext}</div>}
        {trend && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: trend.positive ? "#16a34a" : "#dc2626",
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {trend.positive ? "trending_up" : "trending_down"}
            </span>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
      {children}
    </div>
  );
}
