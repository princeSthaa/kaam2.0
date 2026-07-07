import type { ReactNode } from "react";

import { cx } from "../../legacy/classNames";

type NavLinkProps = {
  href: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

export function NavLink({ href, active = false, className, children }: NavLinkProps) {
  return (
    <a href={href} className={cx(className, active && "active")} aria-current={active ? "page" : undefined}>
      {children}
    </a>
  );
}
