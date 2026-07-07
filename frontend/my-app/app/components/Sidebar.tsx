import { sidebarMap } from "../legacy/navigation";
import { pageKeyFromPath } from "../legacy/routing";
import { NavList } from "./ui/NavList";

type SidebarProps = {
  pathname: string;
  section: string;
};

export function Sidebar({ section, pathname }: SidebarProps) {
  const sidebar = sidebarMap[section];
  if (!sidebar) return null;

  return (
    <aside className="sidebar">
      <div className="px-4 mb-3">
        <span className="text-uppercase fw-bold text-secondary sidebar-title">
          {sidebar.title}
        </span>
      </div>
      <nav className="sidebar-nav">
        <NavList
          items={sidebar.links.map((link) => ({
            href: link.url,
            label: link.name,
            icon: link.icon,
          }))}
          isActive={(href) => pageKeyFromPath(pathname) === href}
        />
      </nav>
    </aside>
  );
}
