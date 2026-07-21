"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconButton } from "../ui/IconButton";
import { NavList } from "../ui/NavList";

export const topLinks = [
  { label: "Dashboard", href: "/" },
  { label: "CRM", href: "/crm" },
  { label: "Production", href: "/production" },
  { label: "Warehouse", href: "/warehouse" },
  { label: "Inventory", href: "/inventory" },
  { label: "Privacy", href: "/privacy" },
];

export function AppHeader() {
  const pathname = usePathname() || "/";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="brand">kaam</Link>
        <nav className="top-nav">
          <NavList
            items={topLinks}
            isActive={isActive}
          />
        </nav>
      </div>
      <div className="topbar-right">
        <IconButton icon="notifications" label="Notifications" />
      </div>
    </header>
  );
}


