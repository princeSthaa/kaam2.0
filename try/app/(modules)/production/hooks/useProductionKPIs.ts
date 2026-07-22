"use client";

import { useMemo } from "react";
import { ProductionPlanDto } from "../dto";

export function useProductionKPIs(plans: ProductionPlanDto[]) {
  return useMemo(() => {
    let activeCount = 0;
    let totalUnits = 0;
    let urgentCount = 0;
    let holdCount = 0;
    let sumProgress = 0;

    plans.forEach((plan) => {
      const st = String(plan.status || "").toLowerCase();
      if (st === "active" || st === "1" || st === "in progress" || st === "2") {
        activeCount++;
      }
      if (st === "on hold" || st === "onhold" || st === "3") {
        holdCount++;
      }
      const pr = String(plan.priority || "").toLowerCase();
      if (pr === "urgent" || pr === "critical" || pr === "high") {
        urgentCount++;
      }

      const planQty = Number(plan.quantity || plan.totalQuantity || 0);
      totalUnits += planQty;
      sumProgress += plan.progress || 0;
    });

    const avgProgress = plans.length > 0 ? Math.round(sumProgress / plans.length) : 0;

    return {
      activeCount,
      totalUnits,
      urgentCount,
      holdCount,
      avgProgress,
    };
  }, [plans]);
}
