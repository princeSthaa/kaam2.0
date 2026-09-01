"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "../../lib/classNames";
import { useRbac } from "@/app/lib/useRbac";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  id?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "light" | "danger-light" | "outline" | "outline-primary" | "outline-secondary" | "outline-light";
  size?: "sm";
  className?: string;
  hidden?: boolean;
  /**
   * Optional HTTP action verb to check (defaults to "GET")
   */
  permissionAction?: string;
  /**
   * Bypass RBAC route checking for this button
   */
  ignorePermission?: boolean;
};

function variantClass(variant: ActionButtonProps["variant"]) {
  if (!variant) return "btn";
  return `btn btn-${variant}`;
}

export function ActionButton({
  children,
  href,
  id,
  type = "button",
  variant = "light",
  size,
  className,
  hidden = false,
  permissionAction = "GET",
  ignorePermission = false,
}: ActionButtonProps) {
  const { isLoaded, isAdmin, canAccessRoute, canPerform } = useRbac();

  // If href is specified and not bypassed, check permission
  if (href && !ignorePermission && isLoaded && !isAdmin) {
    // Only check relative internal module routes
    if (href.startsWith("/") && !href.startsWith("/login") && href !== "/access-denied") {
      const allowed =
        permissionAction.toUpperCase() !== "GET"
          ? canPerform(href, permissionAction)
          : canAccessRoute(href);

      if (!allowed) {
        return null;
      }
    }
  }

  const classes = cx(variantClass(variant), size && `btn-${size}`, hidden && "hidden", className);

  if (href) {
    return (
      <Link href={href} id={id} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} id={id} className={classes}>
      {children}
    </button>
  );
}
