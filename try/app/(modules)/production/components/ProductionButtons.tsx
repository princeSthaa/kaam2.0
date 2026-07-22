import React from "react";

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  icon?: string;
  isLoading?: boolean;
}

export function ProductionActionButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonBaseProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    fontWeight: 600,
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    border: "none",
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "8px 16px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
    opacity: disabled || isLoading ? 0.65 : 1,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: "#2563eb", color: "#ffffff" },
    secondary: { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" },
    outline: { background: "#ffffff", color: "#2563eb", border: "1px solid #2563eb" },
    danger: { background: "#ef4444", color: "#ffffff" },
    success: { background: "#16a34a", color: "#ffffff" },
    ghost: { background: "transparent", color: "#475569" },
  };

  return (
    <button
      style={{ ...baseStyle, ...variantStyles[variant] }}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>
          sync
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

export function SaveDraftButton({ onClick, isLoading, disabled }: { onClick?: () => void; isLoading?: boolean; disabled?: boolean }) {
  return (
    <ProductionActionButton
      variant="secondary"
      icon="save"
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
    >
      Save as Draft
    </ProductionActionButton>
  );
}

export function SubmitPlanButton({ onClick, isLoading, disabled, label = "Create Production Plan" }: { onClick?: () => void; isLoading?: boolean; disabled?: boolean; label?: string }) {
  return (
    <ProductionActionButton
      variant="primary"
      icon="check_circle"
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
    >
      {label}
    </ProductionActionButton>
  );
}

export function CancelButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <ProductionActionButton
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
    >
      Cancel
    </ProductionActionButton>
  );
}

export function FilterTabButton({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: active ? "#2563eb" : "#f1f5f9",
        color: active ? "#ffffff" : "#475569",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            background: active ? "rgba(255,255,255,0.2)" : "#e2e8f0",
            color: active ? "#ffffff" : "#64748b",
            borderRadius: 99,
            padding: "2px 8px",
            fontSize: 11,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
