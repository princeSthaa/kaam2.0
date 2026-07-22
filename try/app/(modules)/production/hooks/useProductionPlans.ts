"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProductionPlans } from "../api/production.api";

export function useProductionPlans(filterFolder?: "drafts" | "in-progress" | "completed") {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductionPlans();
      let filtered: any[] = data;
      if (filterFolder === "drafts") {
        filtered = data.filter((p) => String(p.status).toLowerCase() === "draft");
      } else if (filterFolder === "completed") {
        filtered = data.filter((p) => String(p.status).toLowerCase() === "completed");
      } else if (filterFolder === "in-progress") {
        filtered = data.filter((p) => {
          const st = String(p.status).toLowerCase();
          return st !== "draft" && st !== "completed" && st !== "cancelled";
        });
      }
      setPlans(filtered);
    } catch (err: any) {
      setError(err?.message || "Failed to load production plans");
    } finally {
      setLoading(false);
    }
  }, [filterFolder]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, setPlans, loading, error, refetch: loadPlans };
}
