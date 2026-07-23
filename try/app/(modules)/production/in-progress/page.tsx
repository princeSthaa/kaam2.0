"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PlanRow from '../components/PlanRow';

export default function InProgressPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [demandFilter, setDemandFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [plansRes, stagesRes] = await Promise.all([
        fetch("http://localhost:5083/api/production-plans", { cache: 'no-store' }),
        fetch("http://localhost:5083/api/production-plan-stage", { cache: 'no-store' })
      ]);

      const data = plansRes.ok ? await plansRes.json() : [];
      const allStages = stagesRes.ok ? await stagesRes.json() : [];

      if (!Array.isArray(data)) {
        setPlans([]);
        return;
      }

      // Group saved DB stages by ProductionPlanId
      const stagesByPlanId: Record<string, any[]> = {};
      if (Array.isArray(allStages)) {
        allStages.forEach((st: any) => {
          const pId = st.productionPlanId || st.ProductionPlanId || st.productionPlanID;
          if (pId) {
            if (!stagesByPlanId[pId]) stagesByPlanId[pId] = [];
            stagesByPlanId[pId].push(st);
          }
        });
      }

      // PlanStatus enum: Draft=0, Active=1, Cutting=2, Stitching=3, NotStarted=4, Completed=5, OnHold=6, Blocked=7, Cancelled=8
      const planStatusToString = (val: any): string => {
        const v = String(val).toLowerCase();
        if (v === "0" || v === "draft") return "Draft";
        if (v === "1" || v === "active") return "Active";
        if (v === "2" || v === "cutting") return "In Progress";
        if (v === "3" || v === "stitching") return "In Progress";
        if (v === "4" || v === "notstarted" || v === "not started") return "Not Started";
        if (v === "5" || v === "completed") return "Completed";
        if (v === "6" || v === "onhold" || v === "on hold") return "On Hold";
        if (v === "7" || v === "blocked") return "Blocked";
        if (v === "8" || v === "cancelled") return "Cancelled";
        return v || "Active";
      };

      const filteredList = data.filter(p => {
         const s = planStatusToString(p.status || p.Status || "").toLowerCase();
         return s !== "draft" && s !== "cancelled";
      });

      const formatted = filteredList.map((plan: any) => {
        const rawProducts = plan.productionPlanProducts || plan.products || [];
        const planDbId = plan.id || plan.Id;
        const planNo = plan.planId || plan.planNo || plan.id;
        
        // Use real saved stages from SQL Server if available
        const dbStages = stagesByPlanId[planDbId] || stagesByPlanId[planNo] || plan.productionPlanStages || plan.stages || [];

        const productsList = (rawProducts.length > 0 ? rawProducts : [
          {
            id: plan.productId || plan.planId || plan.id || "PRD-001",
            productName: plan.productName || plan.planName || plan.title || `Production Run (${plan.planId || plan.id})`,
            productCode: plan.productCode || plan.planId || "PRD",
            quantity: plan.quantity || plan.totalQuantity || 0,
            productImage: plan.productImage || plan.image || "/images/products/place-holder.png"
          }
        ]).map((prod: any) => {
          // Find product-specific stages or use overall plan stages
          const prodStages = dbStages.filter((st: any) => {
            if (st.productionPlanProductId && prod.id) {
              return st.productionPlanProductId === prod.id;
            }
            if (st.stageName && prod.productName) {
              return st.stageName.toLowerCase().includes(prod.productName.toLowerCase());
            }
            return true;
          });

          const defaultStages = [
            { id: "01", stageId: "STG-01", name: "Fabric Cutting", workCenter: "Cutting Work Center", status: "Completed", completedQty: Number(prod.quantity || plan.quantity || 0), rejectedQty: 0 },
            { id: "02", stageId: "STG-02", name: "Sewing & Stitching", workCenter: "Assembly Line 1", status: "Active", completedQty: Math.floor(Number(prod.quantity || plan.quantity || 0) * 0.5), rejectedQty: 0 },
            { id: "03", stageId: "STG-03", name: "QC Inspection", workCenter: "QC Station A", status: "Not Started", completedQty: 0, rejectedQty: 0 },
            { id: "04", stageId: "STG-04", name: "Finishing & Packaging", workCenter: "Packaging Hub", status: "Not Started", completedQty: 0, rejectedQty: 0 }
          ];

          const actualStages = prodStages.length > 0 ? prodStages : (dbStages.length > 0 ? dbStages : defaultStages);

          // PlanStatus enum: Draft=0, Active=1, Cutting=2, Stitching=3, NotStarted=4, Completed=5, OnHold=6, Blocked=7, Cancelled=8
          const enumToStatus = (val: any): string => {
            const v = String(val).toLowerCase();
            if (v === "0" || v === "draft") return "Draft";
            if (v === "1" || v === "active") return "Active";
            if (v === "2" || v === "cutting") return "In Progress";
            if (v === "3" || v === "stitching") return "In Progress";
            if (v === "4" || v === "notstarted" || v === "not started") return "Not Started";
            if (v === "5" || v === "completed") return "Completed";
            if (v === "6" || v === "onhold" || v === "on hold") return "On Hold";
            if (v === "7" || v === "blocked") return "Blocked";
            if (v === "8" || v === "cancelled") return "Cancelled";
            return v || "Not Started";
          };

          const mappedStages = actualStages.map((st: any, idx: number) => ({
            id: st.id || st.Id || String(idx + 1).padStart(2, "0"),
            stageId: st.stageId || st.StageId || `STG-${String(idx + 1).padStart(2, "0")}`,
            name: st.stageName || st.StageName || st.name || `Stage ${idx + 1}`,
            workCenter: st.workCenterName || st.workCenter || st.workCenterId || "Workstation",
            workCenterId: st.workCenterId || st.WorkCenterId || null,
            status: enumToStatus(st.status ?? st.Status),
            completedQty: st.completedQty ?? st.CompletedQty ?? 0,
            rejectedQty: st.rejectedQty ?? st.RejectedQty ?? 0,
            remarks: st.remarks || st.Remarks || "",
            operatorName: st.operatorName || st.OperatorName || "",
            plannedStartDate: st.plannedStartDate || st.PlannedStartDate || null,
            plannedEndDate: st.plannedEndDate || st.PlannedEndDate || null,
            actualStartDate: st.actualStartDate || st.ActualStartDate || null,
            actualEndDate: st.actualEndDate || st.ActualEndDate || null,
            createdAt: st.createdAt || st.CreatedAt || null,
            createdBy: st.createdBy || st.CreatedBy || "",
            productionPlanId: st.productionPlanId || st.ProductionPlanId || null
          }));

          const activeStage = mappedStages.find((s: any) => {
            const st = String(s.status).toLowerCase();
            return st === "active" || st === "in progress" || st === "2";
          })?.name || mappedStages[0]?.name || "N/A";

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
            : (plan.progress || 0);

          return {
            id: prod.id || `${plan.planId || plan.id}-${prod.productId || 'PRD'}`,
            productId: prod.productId || prod.id,
            name: prod.productName || prod.name || "Item",
            image: prod.productImage || prod.image || "/images/products/place-holder.png",
            source: plan.demandType || plan.sourceName || "Production",
            qty: Number(prod.quantity || prod.qty || 0),
            requiredDate: prod.requiredDate || plan.plannedCompletionDate || new Date().toISOString(),
            progress: calculatedProgress,
            stage: activeStage,
            stages: mappedStages,
            planDbId: planDbId,
            planId: planNo
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
          : (plan.progress || 0);

        // Auto-detect: if all stages are completed, auto-mark plan as Completed
        const allStagesCompleted = totalPlanStages > 0 && completedPlanStages === totalPlanStages;
        let resolvedStatus = planStatusToString(plan.status ?? plan.Status);
        let resolvedProgress = planCalculatedProgress;

        if (allStagesCompleted && resolvedStatus !== "Completed") {
          resolvedStatus = "Completed";
          resolvedProgress = 100;
          // Persist the auto-completion to backend
          fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(planDbId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...plan, status: 5, progress: 100, updatedAt: new Date().toISOString() })
          }).catch((err) => console.error("Failed to auto-complete plan in backend:", err));
        }

        return {
          id: plan.planId || plan.planNo || plan.id,
          planDbId: planDbId,
          planId: planNo,
          client: plan.sourceName || plan.planName || plan.demandType || plan.planNo || plan.id || "Production Plan",
          priority: plan.priority || "Normal",
          status: resolvedStatus,
          progress: resolvedProgress,
          dueDate: plan.plannedCompletionDate || plan.requiredDate || new Date().toISOString(),
          products: productsList,
          _originalPlan: plan
        };
      });

      setPlans(formatted);
    } catch (err) {
      console.error("Failed to fetch plans & stages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdatePlan = (updatedPlan: any) => {
    // Auto-mark plan as Completed when all stages are done (100%)
    const allStages = (updatedPlan.products || []).flatMap((p: any) => p.stages || []);
    const allCompleted = allStages.length > 0 && allStages.every((s: any) => {
      const st = String(s.status || "").toLowerCase();
      return st === "completed" || st === "5";
    });

    if (allCompleted || updatedPlan.progress >= 100) {
      updatedPlan.status = "Completed";
      updatedPlan.progress = 100;
    }

    // Update UI state
    if (updatedPlan.status === "Completed") {
      // Remove from the in-progress list after a brief delay so user sees the change
      setPlans((prev) =>
        prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
      );
      setTimeout(() => {
        setPlans((prev) => prev.filter((p) => p.id !== updatedPlan.id));
      }, 1500);
    } else {
      setPlans((prev) =>
        prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
      );
    }

    // Persist to backend
    if (updatedPlan.planDbId) {
      const payload = {
        ...updatedPlan._originalPlan,
        status: updatedPlan.status === "Completed" ? 5 : updatedPlan._originalPlan?.status,
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
      const st = String(plan.status || "").toLowerCase();
      const isCompleted = st === "completed" || st === "5";
      const isOnHold = st === "on hold" || st === "onhold" || st === "3";
      const isActive = st === "active" || st === "in progress" || st === "2" || st === "1" || st === "pending";

      // Status filter
      if (statusFilter === "active") {
        if (isCompleted) return false;
      } else if (statusFilter === "in-progress") {
        if (!isActive) return false;
      } else if (statusFilter === "on-hold") {
        if (!isOnHold) return false;
      } else if (statusFilter === "completed") {
        if (!isCompleted) return false;
      }

      // Demand Source filter
      if (demandFilter !== "all") {
        const src = String(plan.source || plan.client || plan._originalPlan?.demandType || "").toLowerCase();
        if (!src.includes(demandFilter.toLowerCase())) return false;
      }

      // Priority filter
      if (priorityFilter !== "all") {
        const prio = String(plan.priority || "").toLowerCase();
        if (priorityFilter === "urgent") {
          if (prio !== "urgent" && prio !== "critical") return false;
        } else if (prio !== priorityFilter.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        const matchesSearch = 
          plan.id.toLowerCase().includes(lowerQ) ||
          plan.client.toLowerCase().includes(lowerQ) ||
          plan.products.some((p: any) => p.name.toLowerCase().includes(lowerQ));
        if (!matchesSearch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "priority") {
        const priorityScore: any = { Urgent: 3, Critical: 3, High: 2, Normal: 1, Medium: 1, Low: 0 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      } else if (sortBy === "quantity") {
        const qtyA = a.products.reduce((sum: number, p: any) => sum + (Number(p.qty) || 0), 0);
        const qtyB = b.products.reduce((sum: number, p: any) => sum + (Number(p.qty) || 0), 0);
        return qtyB - qtyA;
      } else {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });
  }, [plans, searchQuery, statusFilter, demandFilter, priorityFilter, sortBy]);

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
          <span className="font-kaam-label-md text-xs text-kaam-on-surface-variant uppercase font-mono">Completion Rate</span>
          <strong className="font-kaam-display-sm text-2xl font-black text-kaam-tertiary mt-2">{kpis.avgProgress}%</strong>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-kaam-surface-bright border border-kaam-outline-variant p-4 rounded-kaam-DEFAULT shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <span 
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-kaam-on-surface-variant pointer-events-none z-10"
            style={{ fontSize: '18px', color: '#64748b' }}
          >
            search
          </span>
          <input 
            type="text" 
            placeholder="Search plan ID, client, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-sm focus:outline-none focus:border-kaam-secondary py-2 pr-4"
            style={{ paddingLeft: '42px' }}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-xs font-bold text-kaam-on-surface focus:outline-none"
          >
            <option value="active">Active Plans (Default)</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed Plans Only</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Demand Source Filter */}
          <select 
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
            className="px-3 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-xs font-bold text-kaam-on-surface focus:outline-none"
          >
            <option value="all">All Demand Sources</option>
            <option value="Customer">Customer Order</option>
            <option value="Outlet">Outlet Replenishment</option>
            <option value="In-house">In-house Stock</option>
          </select>

          {/* Priority Filter */}
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

          {/* Sort By */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-xs font-bold text-kaam-on-surface focus:outline-none"
          >
            <option value="date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
            <option value="quantity">Sort by Quantity</option>
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
