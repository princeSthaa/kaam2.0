import type { ReactNode } from "react";

type WarehousePageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function WarehousePageHeader({ title, subtitle, actions }: WarehousePageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}
