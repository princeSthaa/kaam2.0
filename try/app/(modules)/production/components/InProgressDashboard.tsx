"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PlanRow from './PlanRow';

export default function InProgressDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const fetchPlans = () => {
    setLoading(true);
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (!Array.isArray(data)) {
          setPlans([]);
          return;
        }

        const inProgress = data.filter(p => {
           const s = (p.status || p.Status || "").toLowerCase();
           return s !== "draft" && s !== "completed" && s !== "cancelled";
        });

        const formatted = inProgress.map((plan: any) => {
          const rawProducts = plan.productionPlanProducts || plan.products || [];
          const rawStages = plan.productionPlanStages || plan.stages || [];

          const productsList = (rawProducts.length > 0 ? rawProducts : [
            {
              id: plan.productId || "PRD-001",
              productName: plan.planName || "Garment Production Run",
              productCode: plan.productCode || "PRD-001",
              quantity: plan.quantity || 500,
              productImage: "/images/products/school-uniform.jpg"
            }
          ]).map((prod: any) => {
            // Find product-specific stages or use overall stages
            const prodStages = rawStages.filter((st: any) => {
              if (st.productionPlanProductId && prod.id) {
                return st.productionPlanProductId === prod.id;
              }
              if (st.stageName && prod.productName) {
                return st.stageName.toLowerCase().includes(prod.productName.toLowerCase());
              }
              return true;
            });

            const defaultStages = [
              { id: "01", name: "Fabric Cutting", workCenter: "Cutting Work Center", status: "Completed", completedQty: prod.quantity || 0, rejectedQty: 0 },
              { id: "02", name: "Sewing & Stitching", workCenter: "Main Assembly Line 1", status: "Active", completedQty: Math.floor((prod.quantity || 500) * 0.4), rejectedQty: 2 },
              { id: "03", name: "QC Inspection", workCenter: "QC Station A", status: "Not Started", completedQty: 0, rejectedQty: 0 },
              { id: "04", name: "Finishing & Packaging", workCenter: "Packaging Hub", status: "Not Started", completedQty: 0, rejectedQty: 0 }
            ];

            const mappedStages = (prodStages.length > 0 ? prodStages : (rawStages.length > 0 ? rawStages : defaultStages)).map((st: any, idx: number) => ({
              id: st.id || String(idx + 1).padStart(2, "0"),
              name: st.stageName || st.name || `Stage ${idx + 1}`,
              workCenter: st.workCenterName || st.workCenter || st.workCenterId || "Workstation",
              status: st.status || "Not Started",
              completedQty: st.completedQty || 0,
              rejectedQty: st.rejectedQty || 0,
              remarks: st.remarks || ""
            }));

            const activeStage = mappedStages.find((s: any) => {
              const st = String(s.status).toLowerCase();
              return st === "active" || st === "in progress" || st === "2";
            })?.name || mappedStages[0]?.name || "Assembly";

            const completedCount = mappedStages.filter((s: any) => {
              const st = String(s.status).toLowerCase();
              return st === "completed" || st === "5";
            }).length;

            const activeCount = mappedStages.filter((s: any) => {
              const st = String(s.status).toLowerCase();
              return st === "active" || st === "in progress" || st === "2";
            }).length;

            const calculatedProgress = mappedStages.length > 0 
              ? Math.min(100, Math.round(((completedCount + (activeCount * 0.5)) / mappedStages.length) * 100))
              : 0;

            return {
              id: prod.id || `${plan.planId || plan.id}-${prod.productId || 'PRD'}`,
              productId: prod.productId || prod.id,
              name: prod.productName || prod.name || "Garment Run",
              image: prod.productImage || prod.image || "/images/products/place-holder.png",
              source: plan.demandType || "Customer Order",
              qty: Number(prod.quantity || prod.qty || 0),
              requiredDate: prod.requiredDate || plan.plannedCompletionDate || new Date().toISOString(),
              progress: calculatedProgress,
              stage: activeStage,
              stages: mappedStages
            };
          });

          // Overall Plan Progress calculation based on stages
          const allStages = productsList.flatMap((p: any) => p.stages);
          const totalPlanStages = allStages.length;
          const completedPlanStages = allStages.filter((s: any) => {
            const st = String(s.status).toLowerCase();
            return st === "completed" || st === "5";
          }).length;
          const activePlanStages = allStages.filter((s: any) => {
            const st = String(s.status).toLowerCase();
            return st === "active" || st === "in progress" || st === "2";
          }).length;

          const planCalculatedProgress = totalPlanStages > 0
            ? Math.min(100, Math.round(((completedPlanStages + (activePlanStages * 0.5)) / totalPlanStages) * 100))
            : 0;

          return {
            id: plan.planId || plan.planNo || plan.id,
            planDbId: plan.id,
            planId: plan.planId || plan.planNo || plan.id,
            client: plan.sourceName || plan.planName || "Internal Factory Run",
            priority: plan.priority || "Normal",
            status: plan.status || "Active",
            progress: planCalculatedProgress,
            dueDate: plan.plannedCompletionDate || plan.requiredDate || new Date().toISOString(),
            products: productsList,
            _originalPlan: plan
          };
        });

        setPlans(formatted);
      })
      .catch((err) => console.error("Failed to fetch plans:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdatePlan = (updatedPlan: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );

    if (updatedPlan.planDbId) {
      const payload = {
        ...updatedPlan._originalPlan,
        status: updatedPlan.status,
        progress: updatedPlan.progress,
        updatedAt: new Date().toISOString()
      };

      fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(updatedPlan.planDbId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((err) => console.error("Failed to update plan status in backend:", err));
    }
  };

  // KPIs Calculations
  const kpis = useMemo(() => {
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
      if (String(plan.priority).toLowerCase() === "urgent" || String(plan.priority).toLowerCase() === "critical" || String(plan.priority).toLowerCase() === "high") {
        urgentCount++;
      }
      
      const planQty = plan.products.reduce((s: number, p: any) => s + (Number(p.qty) || 0), 0);
      totalUnits += planQty;
      sumProgress += plan.progress || 0;
    });

    const avgProgress = plans.length > 0 ? Math.round(sumProgress / plans.length) : 0;

    return {
      activeCount,
      totalUnits,
      urgentCount,
      holdCount,
      avgProgress
    };
  }, [plans]);

  // Filtering & Sorting
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = 
        plan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.products.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === "all" || plan.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesPriority;
    }).sort((a, b) => {
      if (sortBy === "priority") {
        const priorityScore: any = { Urgent: 3, Critical: 3, High: 2, Normal: 1, Medium: 1, Low: 0 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      } else {
        // Date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });
  }, [plans, searchQuery, priorityFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-kaam-body text-kaam-on-surface">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-kaam-display-sm text-2xl font-black tracking-tight text-kaam-on-surface">
            In-Progress Production Runs
          </h1>
          <p className="font-kaam-body-sm text-xs text-kaam-on-surface-variant mt-1">
            Real-time tracking of active garment production plans and stage routing operations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col justify-between">
          <span className="font-kaam-label-md text-xs text-kaam-on-surface-variant uppercase font-mono">Active Runs</span>
          <strong className="font-kaam-display-sm text-2xl font-black text-kaam-primary mt-2">{kpis.activeCount} Plans</strong>
        </div>

        <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col justify-between">
          <span className="font-kaam-label-md text-xs text-kaam-on-surface-variant uppercase font-mono">In-Production Units</span>
          <strong className="font-kaam-display-sm text-2xl font-black text-kaam-secondary mt-2">{kpis.totalUnits.toLocaleString()} pcs</strong>
        </div>

        <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col justify-between">
          <span className="font-kaam-label-md text-xs text-kaam-on-surface-variant uppercase font-mono">Urgent Priorities</span>
          <strong className="font-kaam-display-sm text-2xl font-black text-kaam-error mt-2">{kpis.urgentCount} High Priority</strong>
        </div>

        <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col justify-between">
          <span className="font-kaam-label-md text-xs text-kaam-on-surface-variant uppercase font-mono">Avg Pipeline Progress</span>
          <strong className="font-kaam-display-sm text-2xl font-black text-kaam-tertiary mt-2">{kpis.avgProgress}%</strong>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-kaam-on-surface-variant text-sm">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search plan ID, client, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-sm focus:outline-none focus:border-kaam-secondary"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-xs font-bold text-kaam-on-surface focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent / Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal / Medium</option>
            <option value="low">Low</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-xs font-bold text-kaam-on-surface focus:outline-none"
          >
            <option value="date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
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
