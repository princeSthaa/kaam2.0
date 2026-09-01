"use client";

import { usePathname } from "next/navigation";
import { NavList } from "../ui/NavList";
import { useRbac } from "@/app/lib/useRbac";

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
  const { canAccessRoute, isLoaded } = useRbac();

  // Filter accessible sidebar links based on user role permissions
  const authorizedLinks = section.links.filter((link) => {
    if (!isLoaded) return false;
    return canAccessRoute(link.url);
  });

  return (
    <aside className="sidebar">
      <div className="px-4 mb-3">
        <span className="text-uppercase fw-bold text-secondary sidebar-title">
          {section.title}
        </span>
      </div>
      <nav className="sidebar-nav">
        {authorizedLinks.length === 0 ? (
          <div className="px-4 py-3 text-xs text-slate-400 font-mono italic">
            No authorized pages in this section.
          </div>
        ) : (
          <NavList
            items={authorizedLinks.map((link) => ({
              href: link.url,
              label: link.name,
              icon: link.icon,
            }))}
            isActive={(href) => {
              let activeHref = "";
              let maxLen = 0;
              for (const link of authorizedLinks) {
                if (pathname.startsWith(link.url) && link.url.length > maxLen) {
                  maxLen = link.url.length;
                  activeHref = link.url;
                }
              }
              return href === activeHref;
            }}
          />
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
