"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IconButton } from "../ui/IconButton";
import { NavList } from "../ui/NavList";
import { useRbac } from "@/app/lib/useRbac";

export const topLinks = [
  { label: "Dashboard", href: "/" },
  { label: "CRM", href: "/crm" },
  { label: "Production", href: "/production" },
  { label: "Warehouse", href: "/warehouse" },
  { label: "Factory", href: "/factory" },
  { label: "Inventory", href: "/inventory" },
  { label: "Admin", href: "/admin" },
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileOpen(false);
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

  // Filter accessible top navigation links based on user role
  const visibleTopLinks = topLinks.filter((link) => {
    if (!isLoaded) return false;
    return canAccessModule(link.href);
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("auth_user");
    }
    setIsProfileOpen(false);
    window.location.href = "/login";
  };

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    const response = await fetch("/api/bff/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const body = await response.text();
      setPasswordMessage(body || "Password change failed.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setShowPasswordForm(false);
    setPasswordMessage("Password changed successfully.");
  };

  const displayName = currentUser?.fullName || currentUser?.email || "User Profile";
  const userInitials = getInitials(currentUser?.fullName, currentUser?.email);

  return (
    <header className="topbar relative">
      <div className="topbar-left">
        <Link href="/" className="brand">kaam</Link>
        <nav className="top-nav">
          <NavList
            items={visibleTopLinks}
            isActive={isActive}
          />
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
                  {/* Email */}
                  {currentUser.email && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                        mail
                      </span>
                      <span className="font-mono text-[11px] truncate">{currentUser.email}</span>
                    </div>
                  )}

                  {/* Department */}
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

                  {/* Phone */}
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

                  {/* Role Privileges */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Privilege Level:</span>
                    <span className="font-bold text-slate-800">
                      {isAdmin ? "Super Admin (Full Access)" : "Role-Based Access"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordForm((value) => !value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Change my password
                  </button>
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" autoComplete="current-password" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
                      <input type="password" required minLength={4} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" autoComplete="new-password" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
                      <button type="submit" className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Update password</button>
                    </form>
                  )}
                  {passwordMessage && <p className="text-[10px] text-slate-600">{passwordMessage}</p>}
                </div>

                {/* Quick Actions */}
                <div className="p-2 bg-slate-50/60 border-t border-slate-200 space-y-1">
                  {isAdmin && (
                    <Link
                      href="/admin/usersandrbac/employees"
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
    </header>
  );
}

export default AppHeader;
