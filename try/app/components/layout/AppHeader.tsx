"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IconButton } from "../ui/IconButton";
import { useRbac } from "@/app/lib/useRbac";

export const topLinks = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "CRM", href: "/crm", icon: "group" },
  { label: "Production", href: "/production", icon: "precision_manufacturing" },
  { label: "Warehouse", href: "/warehouse", icon: "warehouse" },
  { label: "Factory", href: "/factory", icon: "factory" },
  { label: "Inventory", href: "/inventory", icon: "inventory_2" },
  { label: "Admin", href: "/admin", icon: "admin_panel_settings" },
];

function getInitials(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { currentUser, isAdmin, canAccessModule, isLoaded } = useRbac();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close profile dropdown or mobile menu on Escape / click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMobileNavOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Hide the global top navigation bar on login / auth pages
  if (pathname === "/login" || pathname === "/admin/login" || pathname.startsWith("/login")) {
    return null;
  }

  // Filter accessible top navigation links based on user role (show all if admin or guest/not logged in)
  const visibleTopLinks = topLinks.filter((link) => {
    if (isAdmin || !currentUser) return true;
    if (!isLoaded) return true;
    return canAccessModule(link.href);
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
    setIsProfileOpen(false);
    setIsMobileNavOpen(false);
    router.push("/login");
  };

  const displayName = currentUser?.fullName || currentUser?.email || "User Profile";
  const userInitials = getInitials(currentUser?.fullName, currentUser?.email);

  return (
    <header className="topbar relative" ref={headerRef}>
      <div className="topbar-left flex items-center gap-4 md:gap-6">
        {/* Hamburger button: ONLY shown on mobile (< 768px) */}
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          className="mobile-hamburger-btn items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileNavOpen ? "close" : "menu"}
          </span>
        </button>

        <Link href="/" className="brand flex items-center gap-2">
          <span>kaam</span>
        </Link>

        {/* Desktop Navbar: ALWAYS visible on laptop/PC screens (>= 768px), hidden on mobile (< 768px) */}
        <nav className="desktop-navbar">
          {visibleTopLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
                  active
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="topbar-right flex items-center gap-2">
        <IconButton icon="notifications" label="Notifications" />

        {currentUser ? (
          <div className="relative" ref={profileRef}>
            {/* Profile Avatar Trigger Button */}
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="User Profile"
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="text-left hidden sm:block max-w-[120px]">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.roleName || "Staff"}
                </div>
              </div>
              <span className="material-symbols-outlined text-base text-slate-400">
                {isProfileOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden text-slate-900 animate-fadeIn">
                {/* Profile Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {displayName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px]">
                          {currentUser.roleName || "Staff"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details List */}
                <div className="p-4 space-y-2.5 text-xs font-sans">
                  {currentUser.email && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                        mail
                      </span>
                      <span className="font-mono text-[11px] truncate">{currentUser.email}</span>
                    </div>
                  )}

                  {currentUser.departmentName && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                        apartment
                      </span>
                      <span className="font-medium text-[11px] truncate">
                        {currentUser.departmentName} Department
                      </span>
                    </div>
                  )}

                  {currentUser.phoneNumber && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                        call
                      </span>
                      <span className="font-mono text-[11px] truncate">
                        {currentUser.phoneNumber}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Privilege Level:</span>
                    <span className="font-bold text-slate-800">
                      {isAdmin ? "Super Admin (Full Access)" : "Role-Based Access"}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-2 bg-slate-50/60 border-t border-slate-200 space-y-1">
                  {isAdmin && (
                    <Link
                      href="/admin/usersandrbac"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-slate-600">
                        admin_panel_settings
                      </span>
                      <span>Users &amp; RBAC Control</span>
                    </Link>
                  )}

                  <Link
                    href="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-slate-600">
                      swap_horiz
                    </span>
                    <span>Switch Account</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-base text-rose-500">
                      logout
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors font-mono"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            <span>Login</span>
          </Link>
        )}
      </div>

      {/* Mobile / Minimized Collapsible Dropdown Navigation (Expands Below Topbar on < 768px) */}
      {isMobileNavOpen && (
        <div className="mobile-dropdown-nav absolute top-full left-0 right-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {visibleTopLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl shrink-0 ${
                        active ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {link.icon || "link"}
                    </span>
                    <span className="flex-1 truncate">{link.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
