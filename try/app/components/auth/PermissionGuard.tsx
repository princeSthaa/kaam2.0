"use client";

import React from "react";
import { useRbac } from "@/app/lib/useRbac";

export interface PermissionGuardProps {
  /**
   * The route to check permission for (e.g. "/crm/customers/new" or "/crm/orders")
   */
  route?: string;
  /**
   * Optional HTTP action verb to check ("GET", "POST", "PUT", "DELETE").
   * Defaults to "GET".
   */
  action?: "GET" | "POST" | "PUT" | "DELETE" | string;
  /**
   * Optional module prefix to check (e.g. "/crm", "/production")
   */
  module?: string;
  /**
   * Fallback element to render when permission is denied. Defaults to null (hidden).
   */
  fallback?: React.ReactNode;
  /**
   * Content to render when permission is granted.
   */
  children: React.ReactNode;
}

/**
 * Reusable RBAC Permission Guard component.
 * Conditionally renders elements (buttons, links, action cards) based on the user's role grants.
 */
export function PermissionGuard({
  route,
  action = "GET",
  module,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { canAccessRoute, canPerform, canAccessModule, isLoaded, isAdmin } = useRbac();

  // While RBAC profile is loading, do not render to prevent unauthorized flash
  if (!isLoaded) return null;

  // Admin bypass
  if (isAdmin) return <>{children}</>;

  // Module check
  if (module && !canAccessModule(module)) {
    return <>{fallback}</>;
  }

  // Route & action check
  if (route) {
    const isActionCheck = action && action.toUpperCase() !== "GET";
    const hasPermission = isActionCheck
      ? canPerform(route, action)
      : canAccessRoute(route);

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

export default PermissionGuard;
