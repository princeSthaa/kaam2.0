import type { ReactNode } from "react";

import { cx } from "../../lib/classNames";

type LegacyCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
};

type LegacyCardHeaderProps = {
  title: string;
  subtitle?: string;
};

export function LegacyCard({ children, className, as: Element = "section" }: LegacyCardProps) {
  return <Element className={cx("pp-card", className)}>{children}</Element>;
}

export function LegacyCardHeader({ title, subtitle }: LegacyCardHeaderProps) {
  return (
    <div className="pp-card-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}
