"use client";

import { usePathname } from "next/navigation";
import { NavList } from "../ui/NavList";

export type SidebarLink = {
  name: string;
  url: string;
  icon: string;
};

export type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

type SidebarProps = {
  section: SidebarSection;
};

export function Sidebar({ section }: SidebarProps) {
  const pathname = usePathname() || "/";

  return (
    <aside className="sidebar">
      <div className="px-4 mb-3">
        <span className="text-uppercase fw-bold text-secondary sidebar-title">
          {section.title}
        </span>
      </div>
      <nav className="sidebar-nav">
        <NavList
          items={section.links.map((link) => ({
            href: link.url,
            label: link.name,
            icon: link.icon,
          }))}
          isActive={(href) => {
            let activeHref = "";
            let maxLen = 0;
            for (const link of section.links) {
              if (pathname.startsWith(link.url) && link.url.length > maxLen) {
                maxLen = link.url.length;
                activeHref = link.url;
              }
            }
            return href === activeHref;
          }}
        />
      </nav>
    </aside>
  );
}
