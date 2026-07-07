import type { ReactNode } from "react";

import { cx } from "../../legacy/classNames";

type BootstrapCardProps = {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  bodyClassName?: string;
};

export function BootstrapCard({ children, className, header, bodyClassName = "card-body" }: BootstrapCardProps) {
  return (
    <div className={cx("card shadow-sm border-0", className)}>
      {header}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function BootstrapCardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
      <div>
        <h5 className="mb-1">{title}</h5>
        {subtitle ? <p className="text-muted small mb-0">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
