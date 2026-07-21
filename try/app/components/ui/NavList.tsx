import type { ReactNode } from "react";

import { MaterialIcon } from "./MaterialIcon";
import { NavLink } from "./NavLink";

export type NavListItem = {
  href: string;
  label: ReactNode;
  icon?: string;
};

type NavListProps = {
  items: NavListItem[];
  isActive: (href: string) => boolean;
};

export function NavList({ items, isActive }: NavListProps) {
  return (
    <>
      {items.map((item) => (
        <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
          {item.icon ? <MaterialIcon name={item.icon} /> : null}
          {item.label}
        </NavLink>
      ))}
    </>
  );
}
