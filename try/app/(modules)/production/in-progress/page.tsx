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
    const allStages = (updatedPlan.products || []).flatMap((p: any) => p.stages || []);
    const allCompleted = allStages.length > 0 && allStages.every((s: any) => {
      const st = String(s.status || "").toLowerCase();
      return st === "completed" || st === "5";
    });

    if (allCompleted || updatedPlan.progress >= 100) {
      updatedPlan.status = "Completed";
      updatedPlan.progress = 100;
    }

    if (updatedPlan.status === "Completed") {
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

  const exportSummaryCsv = () => {
    const csvRows = [
      ["Plan ID", "Client / Source", "Priority", "Status", "Progress", "Due Date", "Total Items"],
      ...filteredPlans.map(p => [
        p.id,
        `"${p.client}"`,
        p.priority,
        p.status,
        `${p.progress}%`,
        p.dueDate,
        p.products.length
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `production_in_progress_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              In-Progress Production Runs
            </h1>
            {/* <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200"> */}
              {/* <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE DB SYNC
            </span> */}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Real-time shop floor execution, garment stage tracking, and workstation routing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50"
            title="Refresh Production Data"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportSummaryCsv}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Runs */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-slate-900 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Active Runs
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">assignment</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{kpis.activeCount} <span className="text-xs font-semibold text-slate-400 font-mono">Plans</span></div>
          </div>
        </div>

        {/* In-Production Units */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-600 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              In-Production Units
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.totalUnits.toLocaleString()} <span className="text-xs font-semibold text-emerald-600 font-mono">pcs</span>
            </div>
          </div>
        </div>

        {/* Urgent Priorities */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Urgent Priorities
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">priority_high</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.urgentCount} <span className="text-xs font-semibold text-red-600 font-mono">High Priority Plans</span>
            </div>
          </div>
        </div>

        {/* Avg Completion Rate */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-blue-600 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Avg Completion Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">donut_large</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{kpis.avgProgress}%</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${kpis.avgProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar (Search & Filter Bar) */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search by Plan ID, Client, or Garment Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="active">Active Plans (Default)</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed Plans</option>
              <option value="all">All Statuses</option>
            </select>

            {/* Demand Source */}
            <select 
              value={demandFilter}
              onChange={(e) => setDemandFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="Customer">Customer Order</option>
              <option value="Outlet">Outlet Replenishment</option>
              <option value="In-house">In-house Stock</option>
            </select>

            {/* Priority */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent / Critical</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal / Medium</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer font-mono"
            >
              <option value="date">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="progress">Sort: Progress %</option>
              <option value="quantity">Sort: Quantity</option>
            </select>
          </div>
        </div>

        {/* Counter indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
          <span>SHOWING {filteredPlans.length} OF {plans.length} PRODUCTION RUNS</span>
          {statusFilter !== "all" && (
            <button 
              onClick={() => { setStatusFilter("all"); setDemandFilter("all"); setPriorityFilter("all"); setSearchQuery(""); }}
              className="text-slate-700 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Production Runs Accordion & Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <div className="inline-block animate-spin text-slate-900 mb-3">
              <span className="material-symbols-outlined text-3xl">sync</span>
            </div>
            <p className="font-semibold text-xs">Loading active production runs from DB...</p>
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
          <div className="p-12 text-center text-slate-400 bg-slate-50 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-400 block">inventory_2</span>
            <p className="font-bold text-slate-700 text-sm">No active in-progress production runs found.</p>
            <p className="text-xs text-slate-400">Try clearing filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
