"use client";

import { useState, useEffect } from "react";
import { AuthUser } from "@/app/(modules)/admin/api/constant";

export interface RolePageAccessRule {
  id: string;
  roleId: string;
  pageId: string;
  roleName?: string;
  pageName?: string;
  pageRoute?: string;
}

const DEFAULT_ACCESS_RULES: RolePageAccessRule[] = [
  {
    id: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    pageId: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    roleName: "Administrator",
    pageName: "CustomerFilter",
    pageRoute: "/crm/customers",
  },
  {
    id: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    roleName: "Administrator",
    pageId: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    pageName: "Product Directory",
    pageRoute: "/admin/product",
  },
  {
    id: "e4e3fe00-36f5-6ff6-cf3e-f3feed9009f2",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b4",
    roleName: "Floor Manager",
    pageId: "e4e3fe00-36f5-6ff6-cf3e-f3feed9009f2",
    pageName: "Material Directory",
    pageRoute: "/admin/material",
  },
];

export function useRbac() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accessRules, setAccessRules] = useState<RolePageAccessRule[]>(DEFAULT_ACCESS_RULES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Read logged-in user
      const storedUser = sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      // 2. Read role-page access rules
      const storedRules = sessionStorage.getItem("rbac_role_page_accesses");
      if (storedRules) {
        setAccessRules(JSON.parse(storedRules));
      }
    } catch (e) {
      console.warn("Could not parse RBAC session:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const isAdmin =
    !currentUser ||
    currentUser.roleName?.toLowerCase().includes("admin") ||
    currentUser.roleName?.toLowerCase() === "system administrator";

  /**
   * Check if a specific route/URL is accessible by the current user's role.
   */
  const canAccessRoute = (routeUrl: string): boolean => {
    // Admins have access to everything
    if (isAdmin) return true;

    // Root dashboard is accessible to all logged-in users
    if (routeUrl === "/" || routeUrl === "/dashboard") return true;

    const userRole = currentUser?.roleName?.toLowerCase();
    const userRoleId = currentUser?.id?.toLowerCase();

    // Check if any rule assigned to this role matches the route
    const hasMatch = accessRules.some((rule) => {
      const ruleRoleName = (rule.roleName || "").toLowerCase();
      const ruleRoleId = (rule.roleId || "").toLowerCase();
      const roleMatches =
        (userRole && ruleRoleName === userRole) ||
        (userRoleId && ruleRoleId === userRoleId);

      if (!roleMatches) return false;

      const ruleRoute = (rule.pageRoute || "").toLowerCase();
      const targetRoute = routeUrl.toLowerCase();

      return (
        ruleRoute === targetRoute ||
        targetRoute.startsWith(ruleRoute) ||
        ruleRoute.startsWith(targetRoute)
      );
    });

    return hasMatch;
  };

  /**
   * Check if a top-level module (e.g. "/crm", "/production", "/warehouse", "/admin") is accessible.
   */
  const canAccessModule = (modulePrefix: string): boolean => {
    if (isAdmin) return true;
    if (modulePrefix === "/") return true;

    const userRole = currentUser?.roleName?.toLowerCase();
    const userRoleId = currentUser?.id?.toLowerCase();

    // Check if the user's role has ANY page assigned starting with this module prefix
    return accessRules.some((rule) => {
      const ruleRoleName = (rule.roleName || "").toLowerCase();
      const ruleRoleId = (rule.roleId || "").toLowerCase();
      const roleMatches =
        (userRole && ruleRoleName === userRole) ||
        (userRoleId && ruleRoleId === userRoleId);

      if (!roleMatches) return false;

      const ruleRoute = (rule.pageRoute || "").toLowerCase();
      return ruleRoute.startsWith(modulePrefix.toLowerCase());
    });
  };

  return {
    currentUser,
    isAdmin,
    isLoaded,
    canAccessRoute,
    canAccessModule,
  };
}
