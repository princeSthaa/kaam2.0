"use client";

import React, { useState, useMemo } from "react";
import PlanRow from "../components/PlanRow";
import { useProductionPlans, useProductionKPIs } from "../hooks";
import { MetricGrid, MetricCard } from "../components/ProductionMetricCards";
import { ProductionFilterBar } from "../components/ProductionFilterBar";

export default function InProgressPage() {
  const { plans, setPlans, loading } = useProductionPlans("in-progress");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const kpis = useProductionKPIs(plans);

  const handleUpdatePlan = (updatedPlan: any) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));

    if (updatedPlan.planDbId) {
      const payload = {
        ...updatedPlan._originalPlan,
        status: updatedPlan.status,
        progress: updatedPlan.progress,
        updatedAt: new Date().toISOString(),
      };

      fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(updatedPlan.planDbId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Failed to update plan status in backend:", err));
    }
  };

  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan: any) => {
        const idStr = String(plan.id || plan.planId || "").toLowerCase();
        const clientStr = String(plan.client || plan.sourceName || "").toLowerCase();
        const matchesSearch = idStr.includes(searchQuery.toLowerCase()) || clientStr.includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === "all" || String(plan.priority).toLowerCase() === priorityFilter.toLowerCase();
        return matchesSearch && matchesPriority;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "priority") {
          const priorityScore: Record<string, number> = { Urgent: 3, Critical: 3, High: 2, Normal: 1, Medium: 1, Low: 0 };
          return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        } else if (sortBy === "progress") {
          return (b.progress || 0) - (a.progress || 0);
        } else {
          return new Date(a.dueDate || a.plannedCompletionDate || 0).getTime() - new Date(b.dueDate || b.plannedCompletionDate || 0).getTime();
        }
      });
  }, [plans, searchQuery, priorityFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-kaam-body text-kaam-on-surface">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-kaam-display-sm text-2xl font-black tracking-tight text-kaam-on-surface">In-Progress Production Runs</h1>
          <p className="font-kaam-body-sm text-xs text-kaam-on-surface-variant mt-1">Real-time tracking of active garment production plans and stage routing operations.</p>
        </div>
      </div>

      <MetricGrid>
        <MetricCard label="Active Runs" value={`${kpis.activeCount} Plans`} icon="sync" color="#2563eb" />
        <MetricCard label="In-Production Units" value={`${kpis.totalUnits.toLocaleString()} pcs`} icon="inventory_2" color="#7c3aed" />
        <MetricCard label="Urgent Priorities" value={`${kpis.urgentCount} High Priority`} icon="priority_high" color="#dc2626" />
        <MetricCard label="Avg Pipeline Progress" value={`${kpis.avgProgress}%`} icon="trending_up" color="#059669" />
      </MetricGrid>

      <ProductionFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search plan ID, client, or product..."
        statusFilter={priorityFilter}
        onStatusChange={setPriorityFilter}
        statusOptions={["all", "urgent", "high", "normal"]}
      />

      <div className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT overflow-hidden flex flex-col shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-kaam-on-surface-variant font-kaam-body-sm bg-kaam-surface-bright">
            <div className="inline-block animate-spin text-kaam-primary mb-2">
              <span className="material-symbols-outlined">sync</span>
            </div>
            <p>Loading real-time production runs...</p>
          </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan, idx) => (
            <PlanRow
              key={plan.id ? `${plan.id}-${idx}` : `plan-${idx}`}
              plan={plan}
              isExpanded={expandedPlanId === plan.id}
              onToggle={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
              onUpdatePlan={handleUpdatePlan}
            />
          ))
        ) : (
          <div className="p-12 text-center text-kaam-on-surface-variant font-kaam-body-sm bg-kaam-surface-bright">
            <span className="material-symbols-outlined text-3xl text-kaam-outline mb-2">inventory_2</span>
            <p className="font-bold">No active in-progress production plans found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
