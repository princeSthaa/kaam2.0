import React from "react";

export interface ProductionFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: string[];
  demandFilter?: string;
  onDemandChange?: (demand: string) => void;
  demandOptions?: string[];
  placeholder?: string;
  children?: React.ReactNode;
}

export function ProductionFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions = ["All Statuses", "Draft", "Material Check", "In Progress", "Completed", "On Hold"],
  demandFilter,
  onDemandChange,
  demandOptions = ["All Demands", "Customer Order", "Outlet Replenishment", "In-house Stock"],
  placeholder = "Search by plan ID, product name or batch...",
  children,
}: ProductionFilterBarProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 300px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 18,
            }}
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              height: 38,
              paddingLeft: 38,
              paddingRight: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              outline: "none",
              background: "#ffffff",
              color: "#1e293b",
            }}
          />
        </div>

        {statusFilter !== undefined && onStatusChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {demandFilter !== undefined && onDemandChange && (
          <select
            value={demandFilter}
            onChange={(e) => onDemandChange(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
            }}
          >
            {demandOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>

      {children && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>}
    </div>
  );
}
