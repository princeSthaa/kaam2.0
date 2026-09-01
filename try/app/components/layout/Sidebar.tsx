"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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

const STORAGE_KEY = "kaam_sidebar_collapsed";

export function Sidebar({ section }: SidebarProps) {
  const pathname = usePathname() || "/";
  const { canAccessRoute, isLoaded } = useRbac();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize collapse state from localStorage or tablet screen size
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      } else if (typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth <= 1024) {
        // Auto-collapse on tablet screens
        setIsCollapsed(true);
      }
    } catch {
      // Fallback in case localStorage is unavailable
    }
  }, []);

  // Synchronize CSS variable --sidebar-width with collapsed state
  useEffect(() => {
    if (!isMounted) return;
    const width = isCollapsed ? "72px" : "250px";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [isCollapsed, isMounted]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  // Filter accessible sidebar links based on user permissions
  const authorizedLinks = section.links.filter((link) => {
    if (!isLoaded) return true;
    return canAccessRoute(link.url);
  });

  // Calculate active link (longest matching url)
  let activeHref = "";
  let maxLen = 0;
  for (const link of authorizedLinks) {
    if (pathname.startsWith(link.url) && link.url.length > maxLen) {
      maxLen = link.url.length;
      activeHref = link.url;
    }
  }

  return (
    <>
      {/* Mobile Drawer Backdrop (Screens < 768px) */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-[104] animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Floating Mobile Toggle Button (Screens < 768px) */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label={isMobileOpen ? "Close section sidebar" : "Open section sidebar"}
        className="md:hidden fixed bottom-5 left-5 z-[103] bg-slate-900 text-white p-3 rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
      >
        <span className="material-symbols-outlined text-xl">
          {isMobileOpen ? "close" : "side_navigation"}
        </span>
      </button>

      {/* Sidebar Component */}
      <aside
        className={`sidebar ${isMobileOpen ? "mobile-open" : ""} ${
          isCollapsed ? "is-collapsed" : "is-expanded"
        }`}
        style={{
          width: isCollapsed ? "72px" : "250px",
        }}
      >
        {/* Header / Section Title & Collapse Toggle */}
        <div className="px-3 mb-2 flex items-center justify-between min-h-[36px]">
          {isCollapsed ? (
            <div className="relative group flex justify-center w-full">
              <button
                type="button"
                onClick={toggleCollapse}
                title={`Expand ${section.title} Navigation`}
                aria-label={`Expand ${section.title} Navigation`}
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>

              {/* Floating Tooltip for Header */}
              <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-[150]">
                <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-fadeIn flex items-center gap-1.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{section.title}</span>
                  <span className="text-slate-400">•</span>
                  <span>Expand</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate pl-1">
                {section.title}
              </span>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse Sidebar (Icon Only)"
                aria-label="Collapse Sidebar"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            </>
          )}
        </div>

        {/* Navigation Link List */}
        <nav className="sidebar-nav flex flex-col gap-1 px-2 flex-1">
          {authorizedLinks.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 font-mono italic text-center">
              {isCollapsed ? "—" : "No authorized pages."}
            </div>
          ) : (
            authorizedLinks.map((link) => {
              const active = link.url === activeHref;

              if (isCollapsed) {
                // Collapsed: Icon-Only Mode with Interactive Floating Tooltip
                return (
                  <div key={link.url} className="relative group flex justify-center">
                    <Link
                      href={link.url}
                      title={link.name}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        active
                          ? "bg-blue-50 text-blue-600 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      aria-label={link.name}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="material-symbols-outlined text-[21px]">
                        {link.icon}
                      </span>
                    </Link>

                    {/* Floating Hover Tooltip */}
                    <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-[150]">
                      <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap animate-fadeIn flex items-center gap-2 border border-slate-800">
                        <span>{link.name}</span>
                        {active && (
                          <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Expanded: Full Item View with Text & Icon
              return (
                <Link
                  key={link.url}
                  href={link.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      active ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="truncate flex-1">{link.name}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                </Link>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
