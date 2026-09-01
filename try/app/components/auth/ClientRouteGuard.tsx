"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRbac } from "@/app/lib/useRbac";

/**
 * Universal Client Route Guard for (modules).
 * Intercepts all client-side SPA navigation and redirects unauthorized users to /access-denied.
 */
export function ClientRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isAdmin, canAccessRoute } = useRbac();

  useEffect(() => {
    if (!isLoaded || !pathname) return;

    // Super Admin / System Admin bypass
    if (isAdmin) return;

    // Skip public or login paths
    if (
      pathname === "/login" ||
      pathname.startsWith("/login") ||
      pathname === "/access-denied"
    ) {
      return;
    }

    // Verify user has GET access to the route
    if (!canAccessRoute(pathname)) {
      router.replace("/access-denied");
    }
  }, [pathname, isLoaded, isAdmin, canAccessRoute, router]);

  // While loading user profile and grants, show spinner to prevent content flashing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono">Verifying access...</span>
        </div>
      </div>
    );
  }

  // If unauthorized, hide children while the router redirects to /access-denied
  if (
    !isAdmin &&
    pathname &&
    pathname !== "/login" &&
    !pathname.startsWith("/login") &&
    pathname !== "/access-denied" &&
    !canAccessRoute(pathname)
  ) {
    return null;
  }

  return <>{children}</>;
}

export default ClientRouteGuard;
