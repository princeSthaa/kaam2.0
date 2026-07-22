import React from "react";
import { PlanStatus } from "../dto";

interface StatusBadgeProps {
  status: PlanStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function getStatusBadgeClass(status: string): string {
  const norm = (status || "").toLowerCase().trim();
  if (norm === "completed" || norm === "ready") return "status-badge status-completed";
  if (norm === "in progress" || norm === "in-progress" || norm === "active" || norm === "running") return "status-badge status-in-progress";
  if (norm === "on hold" || norm === "on-hold" || norm === "warning") return "status-badge status-on-hold";
  if (norm === "draft" || norm === "not started" || norm === "not-started") return "status-badge status-draft";
  if (norm === "rejected" || norm === "shortage") return "status-badge status-rejected";
  return "status-badge status-draft";
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-3.5 py-1.5" : "";

  return (
    <span className={`${badgeClass} ${sizeClass} ${className}`.trim()}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status || "Draft"}
    </span>
  );
}
