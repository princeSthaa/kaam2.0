import { topLinks } from "../legacy/navigation";
import { activeTopLink } from "../legacy/routing";
import { IconButton } from "./ui/IconButton";
import { NavList } from "./ui/NavList";

type AppHeaderProps = {
  pathname: string;
};

export function AppHeader({ pathname }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <a href="/" className="brand">kaam</a>
        <nav className="top-nav">
          <NavList
            items={topLinks.map((link) => ({ href: link.href, label: link.label }))}
            isActive={(href) => activeTopLink(pathname, href)}
          />
        </nav>
      </div>
      <div className="topbar-right">
        <IconButton icon="notifications" label="Notifications" />
        <IconButton icon="account_circle" label="Profile" href="/Account/Profile" className="profile-btn" />
      </div>
    </header>
  );
}
