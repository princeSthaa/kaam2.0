import { pages, type LegacyPageDefinition } from "../generated/pages";
import { sidebarMap } from "./navigation";

const fallbackPage: LegacyPageDefinition = {
  title: "Page not found",
  html: '<div class="alert alert-warning">Page not found.</div>',
  scripts: [],
  styles: [],
  section: "default",
};

export function normalizePath(pathname: string) {
  if (!pathname || pathname === "/Index") return "/";
  return pathname.replace(/\/$/, "") || "/";
}

export function pageKeyFromPath(pathname: string) {
  const normalized = normalizePath(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) return "/";
  if (segments[0] === "Production" && segments[1] === "Plan" && segments.length > 3) {
    return `/${segments.slice(0, 3).join("/")}`;
  }

  return `/${segments.join("/")}`;
}

export function findPage(pathname: string): LegacyPageDefinition {
  const key = pageKeyFromPath(pathname);
  return pages[key] || pages["/Error"] || fallbackPage;
}

export function hasSidebar(section: string) {
  return Boolean(sidebarMap[section]);
}

export function activeTopLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "/Index";
  const section = `/${href.split("/")[1]}`.toLowerCase();
  return pathname.toLowerCase().startsWith(section);
}
