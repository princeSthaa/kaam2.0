"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PlanRow from './PlanRow';

// Default Mock Data
const DEFAULT_MOCK_PLANS = [
  {
    id: "PLN-202605-A1",
    planId: "PLN-202605-A1",
    client: "Apex Industries",
    priority: "Urgent",
    status: "Active",
    progress: 45,
    dueDate: "2026-05-30",
    isLocalStorage: false,
    products: [
      {
        id: "PP-20260529-002",
        name: "Men Casual Shirt",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg",
        source: "Customer Order",
        qty: 250,
        requiredDate: "2026-05-30",
        progress: 45,
        stage: "Cutting",
        stages: [
          { id: "01", name: "Material Check", workCenter: "QC Station 1", status: "Completed", completedQty: 250, rejectedQty: 0 },
          { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", status: "Active", completedQty: 112, rejectedQty: 3 },
          { id: "03", name: "Stitching", workCenter: "Line 4A", status: "Not Started", completedQty: 0, rejectedQty: 0 },
          { id: "04", name: "Finishing", workCenter: "Sewing Floor", status: "Not Started", completedQty: 0, rejectedQty: 0 },
          { id: "05", name: "Quality Check", workCenter: "QC Table", status: "Not Started", completedQty: 0, rejectedQty: 0 }
        ]
      },
      {
        id: "PP-20260529-003",
        name: "Denim Jeans",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg",
        source: "Outlet Replenishment",
        qty: 120,
        requiredDate: "2026-06-10",
        progress: 10,
        stage: "Material Check",
        stages: [
          { id: "01", name: "Material Check", workCenter: "QC Station 1", status: "Active", completedQty: 12, rejectedQty: 0 },
          { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", status: "Not Started", completedQty: 0, rejectedQty: 0 },
          { id: "03", name: "Stitching", workCenter: "Line 4A", status: "Not Started", completedQty: 0, rejectedQty: 0 },
          { id: "04", name: "Finishing", workCenter: "Sewing Floor", status: "Not Started", completedQty: 0, rejectedQty: 0 },
          { id: "05", name: "Quality Check", workCenter: "QC Table", status: "Not Started", completedQty: 0, rejectedQty: 0 }
        ]
      }
    ]
  },
  {
    id: "PLN-202605-B2",
    planId: "PLN-202605-B2",
    client: "Global Retailers",
    priority: "Normal",
    status: "On Hold",
    progress: 80,
    dueDate: "2026-06-05",
    isLocalStorage: false,
    products: [
      {
        id: "PP-20260601-044",
        name: "Polo Shirt",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg",
        source: "Customer Order",
        qty: 500,
        requiredDate: "2026-06-05",
        progress: 80,
        stage: "Quality Check",
        stages: [
          { id: "01", name: "Material Check", workCenter: "QC Station 1", status: "Completed", completedQty: 500, rejectedQty: 0 },
          { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", status: "Completed", completedQty: 500, rejectedQty: 1 },
          { id: "03", name: "Stitching", workCenter: "Line 4A", status: "Completed", completedQty: 500, rejectedQty: 4 },
          { id: "04", name: "Finishing", workCenter: "Sewing Floor", status: "Completed", completedQty: 500, rejectedQty: 0 },
          { id: "05", name: "Quality Check", workCenter: "QC Table", status: "Active", completedQty: 400, rejectedQty: 2 }
        ]
      }
    ]
  }
];

export default function InProgressDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => res.json())
      .then((data: any[]) => {
        const inProgress = data.filter(p => {
           const s = (p.status || p.Status || "").toLowerCase();
           return s !== "draft" && s !== "completed" && s !== "cancelled";
        });

        const formatted = inProgress.map((plan: any) => {
          const productsList = (plan.products || plan.Products || []).map((prod: any) => {
            const defaultStages = [
              { id: "01", name: "Material Check", workCenter: "QC Station 1", status: "Completed", completedQty: prod.quantity || prod.Quantity || 0, rejectedQty: 0 },
              { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", status: "Active", completedQty: 0, rejectedQty: 0 },
              { id: "03", name: "Stitching", workCenter: "Line 4A", status: "Not Started", completedQty: 0, rejectedQty: 0 },
              { id: "04", name: "Finishing", workCenter: "Sewing Floor", status: "Not Started", completedQty: 0, rejectedQty: 0 },
              { id: "05", name: "Quality Check", workCenter: "QC Table", status: "Not Started", completedQty: 0, rejectedQty: 0 }
            ];

            const mappedStages = (plan.stages && plan.stages.length)
              ? plan.stages.map((st: any, idx: number) => ({
                  id: String(idx + 1).padStart(2, "0"),
                  name: st.stageName || st.name,
                  workCenter: st.workCenter || "Workstation",
                  status: st.status || "Not Started",
                  completedQty: st.completedQty || 0,
                  rejectedQty: st.rejectedQty || 0,
                  remarks: st.remarks || ""
                }))
              : defaultStages;

            const activeStage = mappedStages.find((s: any) => s.status === "Active")?.name || mappedStages[0]?.name || "Material Check";
            const completedCount = mappedStages.filter((s: any) => s.status === "Completed").length;
            const calculatedProgress = mappedStages.length ? Math.round((completedCount / mappedStages.length) * 100) : 0;

            return {
              id: prod.lineId || `${plan.planId || plan.PlanId || plan.planNo || plan.id}-${prod.productId}`,
              productId: prod.productId || prod.ProductId,
              name: prod.productName || prod.ProductName || "Product Run",
              image: prod.productImage || prod.ProductImage || "/images/products/place-holder.png",
              source: plan.demandType || plan.DemandType || "Customer Order",
              qty: prod.quantity || prod.Quantity || 0,
              requiredDate: prod.requiredDate || prod.RequiredDate || plan.plannedCompletionDate || plan.PlannedCompletionDate,
              progress: calculatedProgress,
              stage: activeStage,
              stages: mappedStages
            };
          });

          const activeProdStages = productsList[0]?.stages || [];
          const planCompletedCount = activeProdStages.filter((s: any) => s.status === "Completed").length;
          const planCalculatedProgress = activeProdStages.length ? Math.round((planCompletedCount / activeProdStages.length) * 100) : 0;

          return {
            id: plan.planId || plan.PlanId || plan.planNo || plan.id,
            planId: plan.planId || plan.PlanId || plan.planNo || plan.id,
            client: plan.sourceName || plan.SourceName || "Internal Run",
            priority: plan.priority || plan.Priority || "Normal",
            status: plan.status || plan.Status || "Active",
            progress: planCalculatedProgress,
            dueDate: plan.plannedCompletionDate || plan.PlannedCompletionDate || new Date().toISOString(),
            products: productsList,
            isLocalStorage: false,
            _originalPlan: plan // keep a reference to the original API plan
          };
        });

        setPlans(formatted);
      })
      .catch((err) => console.error("Failed to fetch plans", err));
  }, []);

  const handleUpdatePlan = (updatedPlan: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );

    // If we want to persist updates back to the API, we can PUT it here.
    // For now, we update local React state.
    if (updatedPlan._originalPlan) {
        const payload = { ...updatedPlan._originalPlan };
        // Map back stages if needed
        if (updatedPlan.products && updatedPlan.products[0]) {
           payload.stages = updatedPlan.products[0].stages.map((st: any) => ({
              stageName: st.name,
              workCenter: st.workCenter,
              status: st.status,
              completedQty: st.completedQty,
              rejectedQty: st.rejectedQty,
              remarks: st.remarks
           }));
           // Update status if fully complete
           if (updatedPlan.progress === 100) {
              payload.status = "Completed";
           }
        }
        
        fetch(`http://localhost:5083/api/production-plans/${updatedPlan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Failed to update plan via API", err));
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
      if (plan.status === "Active" || plan.status === "Draft") {
        activeCount++;
      }
      if (plan.status === "On Hold") {
        holdCount++;
      }
      if (plan.priority === "Urgent" || plan.priority === "High") {
        urgentCount++;
      }
      
      const planQty = plan.products.reduce((s: number, p: any) => s + (p.qty || 0), 0);
      totalUnits += planQty;
      sumProgress += plan.progress || 0;
    });

    const averageProgress = plans.length ? Math.round(sumProgress / plans.length) : 0;

    return {
      activeCount,
      totalUnits,
      urgentCount,
      holdCount,
      overallCompletion: averageProgress
    };
  }, [plans]);

  // Filtered & Sorted Plans
  const filteredPlans = useMemo(() => {
    let result = plans.slice();

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.products.some((prod: any) => prod.name.toLowerCase().includes(q))
      );
    }

    // 2. Priority Filter
    if (priorityFilter !== "all") {
      result = result.filter((p) => p.priority.toLowerCase() === priorityFilter.toLowerCase() || (priorityFilter === "urgent" && p.priority === "High"));
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "progress") {
        return b.progress - a.progress;
      }
      // default Sort by Required Date (dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return result;
  }, [plans, searchQuery, priorityFilter, sortBy]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-kaam-row-gap">
        <h1 className="font-kaam-headline-lg text-kaam-headline-lg text-kaam-on-surface mb-6">In Progress Production</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-kaam-column-gap">
          <div className="bg-kaam-surface-container-lowest p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant flex flex-col justify-between">
            <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider">Active Plans</span>
            <span className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-primary mt-2">{kpis.activeCount}</span>
          </div>
          <div className="bg-kaam-surface-container-lowest p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant flex flex-col justify-between">
            <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider">Total Units</span>
            <span className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-primary mt-2">{kpis.totalUnits.toLocaleString()}</span>
          </div>
          <div className="bg-kaam-surface-container-lowest p-5 rounded-kaam-DEFAULT border border-kaam-error bg-kaam-error-container/20 flex flex-col justify-between">
            <span className="font-kaam-label-md text-kaam-label-md text-kaam-error uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Urgent/Critical
            </span>
            <span className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-error mt-2">{kpis.urgentCount}</span>
          </div>
          <div className="bg-kaam-surface-container-lowest p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant flex flex-col justify-between">
            <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider">On Hold/Blocked</span>
            <span className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-on-surface-variant mt-2">{kpis.holdCount}</span>
          </div>
          <div className="bg-kaam-surface-container-lowest p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant flex flex-col justify-between">
            <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider">Overall Completion</span>
            <span className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-secondary mt-2">{kpis.overallCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-kaam-surface-container-lowest p-4 rounded-kaam-DEFAULT border border-kaam-outline-variant mb-kaam-row-gap flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
        <div className="flex-1 w-full lg:max-w-xs relative">
          <input 
            type="text" 
            placeholder="Search Plan ID or Product..." 
            className="w-full px-3 py-1.5 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container focus:outline-none focus:border-kaam-secondary focus:ring-1 focus:ring-kaam-secondary text-kaam-body-sm font-kaam-body-sm text-kaam-on-surface transition-all placeholder:text-kaam-on-surface-variant/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant shrink-0">Priority:</label>
            <div className="relative">
              <select 
                className="py-1.5 pl-3 pr-8 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container text-kaam-body-sm font-kaam-body-sm text-kaam-on-surface focus:outline-none focus:border-kaam-secondary appearance-none min-w-[100px] cursor-pointer relative z-10"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-kaam-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant shrink-0">Sort By:</label>
            <div className="relative">
              <select 
                className="py-1.5 pl-3 pr-8 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container text-kaam-body-sm font-kaam-body-sm text-kaam-on-surface focus:outline-none focus:border-kaam-secondary appearance-none min-w-[130px] cursor-pointer relative z-10"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Required Date</option>
                <option value="progress">Progress</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-kaam-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT overflow-hidden flex flex-col">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <PlanRow 
              key={plan.id}
              plan={plan}
              isExpanded={expandedPlanId === plan.id}
              onToggle={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
              onUpdatePlan={handleUpdatePlan}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted font-kaam-body-sm bg-kaam-surface-bright">
            No active production plans found.
          </div>
        )}
      </div>
    </div>
  );
}
