"use client";

import React, { useState, useEffect, useMemo } from "react";
import Script from "next/script";
import Link from "next/link";

import { STAGE_COLORS, STAGE_LIGHT_COLORS as STAGE_LIGHT } from "../constants/production.constants";
import { adToBs as adToNepali, getStatusStyle, calculatePlanProgress as planProgress } from "../lib/production-utils";

export default function ProductionOverviewPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDays, setViewDays] = useState<number>(14);
  const [searchQuery, setSearchQuery] = useState("");
  // Default filter set to "active" so completed plans are NOT shown by default
  const [filterStatus, setFilterStatus] = useState<"active" | "urgent" | "completed">("active");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<Record<string, string>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Helper to clean item prefixes from stage names (e.g. "Item #1 - Cutting" -> "Cutting")
  const cleanStageName = (rawName: string): string => {
    if (!rawName) return "Stage";
    let cleaned = rawName.replace(/^(Item\s*#?\d*|Product\s*#?\d*|[A-Za-z0-9_-]+)\s*-\s*/i, "").trim();
    if (!cleaned) cleaned = rawName;
    return cleaned;
  };

  // Fetch live backend data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, stagesRes, wcRes, prodRes] = await Promise.all([
        fetch("http://localhost:5083/api/production-plans", { cache: "no-store" }),
        fetch("http://localhost:5083/api/production-plan-stage", { cache: "no-store" }),
        fetch("http://localhost:5083/api/work-center", { cache: "no-store" }),
        fetch("http://localhost:5083/api/production-plan-product", { cache: "no-store" })
      ]);

      const plansData = plansRes.ok ? await plansRes.json() : [];
      const stagesData = stagesRes.ok ? await stagesRes.json() : [];
      const wcData = wcRes.ok ? await wcRes.json() : [];
      const prodData = prodRes.ok ? await prodRes.json() : [];

      const rawPlans = Array.isArray(plansData) ? plansData : (plansData.value || []);
      const rawStages = Array.isArray(stagesData) ? stagesData : (stagesData.value || []);
      const rawWcs = Array.isArray(wcData) ? wcData : (wcData.value || []);
      const rawProds = Array.isArray(prodData) ? prodData : (prodData.value || []);

      // Group DB stages by ProductionPlanId
      const stagesByPlanId: Record<string, any[]> = {};
      rawStages.forEach((st: any) => {
        const pId = st.productionPlanId || st.ProductionPlanId || st.productionPlanID;
        if (pId) {
          if (!stagesByPlanId[pId]) stagesByPlanId[pId] = [];
          stagesByPlanId[pId].push(st);
        }
      });

      // Group DB products by ProductionPlanId
      const productsByPlanId: Record<string, any[]> = {};
      rawProds.forEach((prod: any) => {
        const pId = prod.productionPlanId || prod.ProductionPlanId;
        if (pId) {
          if (!productsByPlanId[pId]) productsByPlanId[pId] = [];
          productsByPlanId[pId].push(prod);
        }
      });

      // FLATTEN PLANS BY PRODUCT LINE:
      // If a plan has multiple products, create a dedicated row for each product line.
      // Each card will display its own Product ID, Product Code, Product Name, and specific Gantt bar!
      const seenPlanProductKeys = new Set<string>();
      const formattedPlans: any[] = [];

      rawPlans.forEach((plan: any) => {
        const rawPlanDbId = plan.id || plan.Id;
        const planNo = plan.planId || plan.planNo || plan.id;
        const dbStages = stagesByPlanId[rawPlanDbId] || stagesByPlanId[planNo] || plan.productionPlanStages || plan.stages || [];
        const dbProducts = productsByPlanId[rawPlanDbId] || productsByPlanId[planNo] || plan.productionPlanProducts || plan.products || [];

        if (dbProducts.length > 0) {
          dbProducts.forEach((prod: any, pIdx: number) => {
            const prodDbId = prod.id || prod.productId || `P${pIdx}`;
            const uniqueComboKey = `${rawPlanDbId}-${prodDbId}`;

            if (seenPlanProductKeys.has(uniqueComboKey)) return;
            seenPlanProductKeys.add(uniqueComboKey);

            const pName = prod.productName || prod.name || "";
            const pCode = prod.productCode || prod.code || "";

            // Filter stages specific to this product item if matched by name or ID
            let prodStages = dbStages.filter((st: any) => {
              const stName = (st.stageName || st.StageName || "").toLowerCase();
              if (st.productionPlanProductId && prod.id) {
                return st.productionPlanProductId === prod.id;
              }
              if (pName && stName.includes(pName.toLowerCase())) return true;
              if (pCode && stName.includes(pCode.toLowerCase())) return true;
              return false;
            });

            if (prodStages.length === 0) {
              prodStages = dbStages; // Fallback to plan stages
            }

            formattedPlans.push({
              ...plan,
              planId: planNo,
              planDbId: uniqueComboKey,
              rawPlanDbId,
              productItem: prod,
              productId: prod.productId || prod.id || "PRD-001",
              productCode: prod.productCode || "PRD",
              productName: prod.productName || "Garment Product",
              quantity: Number(prod.quantity || prod.qty || plan.quantity || 0),
              productImage: prod.productImage || "",
              stages: prodStages,
              products: [prod]
            });
          });
        } else {
          if (seenPlanProductKeys.has(rawPlanDbId)) return;
          seenPlanProductKeys.add(rawPlanDbId);

          formattedPlans.push({
            ...plan,
            planId: planNo,
            planDbId: rawPlanDbId,
            rawPlanDbId,
            productItem: null,
            productId: plan.productId || "PRD-001",
            productCode: plan.productCode || "PRD",
            productName: plan.productName || plan.planName || "Garment Product",
            quantity: Number(plan.quantity || plan.totalQuantity || 0),
            stages: dbStages,
            products: []
          });
        }
      });

      setPlans(formattedPlans);
      setStages(rawStages);
      setWorkCenters(rawWcs);
      setProducts(rawProds);
    } catch (err) {
      console.error("Failed to load production board data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const planStatusToString = (val: any): string => {
    const v = String(val || "").toLowerCase();
    if (v === "0" || v === "draft") return "Draft";
    if (v === "1" || v === "active") return "Active";
    if (v === "2" || v === "cutting") return "In Progress";
    if (v === "3" || v === "stitching") return "In Progress";
    if (v === "4" || v === "notstarted" || v === "not started") return "Not Started";
    if (v === "5" || v === "completed") return "Completed";
    if (v === "6" || v === "onhold" || v === "on hold") return "On Hold";
    if (v === "7" || v === "blocked") return "Blocked";
    if (v === "8" || v === "cancelled") return "Cancelled";
    return val || "Active";
  };

  // Timeline helpers (Starts from Today)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const timelineDays = useMemo(() => {
    return Array.from({ length: viewDays }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [today, viewDays]);

  // Robust Date Parser supporting both AD ISO dates and BS strings (e.g., "2083-04-07")
  const parseToADDate = (dateVal: any): Date | null => {
    if (!dateVal) return null;
    let s = String(dateVal).trim();
    if (s.includes("T")) s = s.split("T")[0];
    if (s.includes(" ")) s = s.split(" ")[0];

    const parts = s.split("-");
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Handle BS Year (2070 - 2100) -> convert to AD Date
    if (year >= 2070 && year <= 2100) {
      if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
        try {
          const adObj = (window as any).NepaliFunctions.BS2AD(s, "YYYY-MM-DD", "YYYY-MM-DD");
          if (adObj) {
            const adStr = typeof adObj === "string" ? adObj : `${adObj.year}-${String(adObj.month).padStart(2, "0")}-${String(adObj.day).padStart(2, "0")}`;
            const d = new Date(adStr);
            if (!isNaN(d.getTime())) return d;
          }
        } catch (e) {}
      }
      // Standard BS to AD approximation: Subtract 57 years
      const adYear = year - 57;
      let adMonth = month + 3;
      let adDay = day + 13;
      if (adDay > 30) {
        adDay -= 30;
        adMonth += 1;
      }
      if (adMonth > 12) {
        adMonth -= 12;
      }
      const d = new Date(adYear, adMonth - 1, adDay);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  // Calculates exact grid columns for active plans starting from today extending to completion
  const gridCols = (startStr: string, endStr: string, stagesList: any[]) => {
    let startDate = parseToADDate(startStr);
    let endDate = parseToADDate(endStr);

    let totalStageDays = 0;
    if (stagesList && stagesList.length > 0) {
      stagesList.forEach((stg: any) => {
        const hrs = Number(stg.leadHours || stg.hours || 8);
        totalStageDays += Math.max(1, Math.ceil(hrs / 8));
      });
    }
    if (totalStageDays < 3) totalStageDays = 7; // Default fallback duration 7 days for active plan

    if (!startDate) {
      startDate = new Date(today);
    }
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + totalStageDays);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    let startOffset = Math.ceil((startDate.getTime() - today.getTime()) / 86400000);
    let endOffset = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);

    // If started in the past, start the visible bar from Today (column 0) extending rightward
    if (startOffset < 0) {
      startOffset = 0;
    }

    if (endOffset <= startOffset) {
      endOffset = startOffset + totalStageDays;
    }

    if (endOffset > viewDays) {
      endOffset = viewDays;
    }

    if (startOffset >= viewDays) return null;

    const span = Math.max(1, endOffset - startOffset);
    return { start: startOffset + 1, span };
  };

  // Filtered plans list (DEFAULT HIDES COMPLETED PLANS)
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const st = planStatusToString(plan.status).toLowerCase();
      const priority = String(plan.priority || "").toLowerCase();

      let matchFilter = true;
      if (filterStatus === "active") {
        // By default, show active/in-progress plans and EXCLUDE completed, draft, or cancelled
        matchFilter = st !== "completed" && st !== "draft" && st !== "cancelled" && st !== "5" && st !== "0" && st !== "8";
      } else if (filterStatus === "urgent") {
        matchFilter = (priority === "urgent" || priority === "high" || priority === "critical" || st === "on hold" || st === "blocked") && st !== "completed";
      } else if (filterStatus === "completed") {
        matchFilter = st === "completed" || st === "5";
      }

      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        String(plan.planId || "").toLowerCase().includes(q) ||
        String(plan.productName || "").toLowerCase().includes(q) ||
        String(plan.productCode || "").toLowerCase().includes(q) ||
        String(plan.productId || "").toLowerCase().includes(q) ||
        String(plan.sourceName || "").toLowerCase().includes(q) ||
        String(plan.demandType || "").toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [plans, filterStatus, searchQuery]);

  // Calculated KPIs
  const kpis = useMemo(() => {
    let totalQty = 0;
    let highRisk = 0;
    let sumProgress = 0;

    const activePlans = plans.filter((p) => {
      const st = planStatusToString(p.status).toLowerCase();
      return st !== "draft" && st !== "cancelled" && st !== "completed";
    });

    plans.forEach((p) => {
      const q = Number(p.quantity || p.totalQuantity || 0);
      totalQty += q;

      const priority = String(p.priority || "").toLowerCase();
      const st = planStatusToString(p.status).toLowerCase();
      if (priority === "high" || priority === "urgent" || priority === "critical" || st === "on hold" || st === "blocked") {
        highRisk++;
      }

      const stgList = p.stages || [];
      const pct = stgList.length > 0 ? planProgress(stgList) : Number(p.progress || 0);
      sumProgress += pct;
    });

    return {
      active: activePlans.length,
      totalQty,
      highRisk,
      avgProgress: plans.length ? Math.round(sumProgress / plans.length) : 0
    };
  }, [plans]);

  // Recent process stages across plans
  const recentStages = useMemo(() => {
    const all: any[] = [];
    plans.forEach((plan) => {
      const planStagesList = plan.stages || [];
      planStagesList.forEach((st: any, idx: number) => {
        const rawName = st.stageName || st.StageName || st.name || `Stage ${idx + 1}`;
        all.push({
          stageName: cleanStageName(rawName),
          workCenter: st.workCenter || st.WorkCenter || st.workCenterId || "General WC",
          operator: st.operatorName || st.operator || st.Operator || "Floor Team",
          status: st.status || st.Status || "Not Started",
          planNo: plan.planId || plan.planNo,
          productName: plan.productName || "Garment",
          completedQty: st.completedQty || 0,
          rejectedQty: st.rejectedQty || 0,
          colorIdx: idx
        });
      });
    });

    return all.sort((a, b) => {
      const order: Record<string, number> = { Active: 0, "In Progress": 0, Completed: 1, "On Hold": 2, NotStarted: 3 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    }).slice(0, 8);
  }, [plans]);

  // Dynamic CLEAN unique stage names for Legend (Strips "Item #1 - ", "Item #2 - " prefixes)
  const uniqueStageNames = useMemo(() => {
    const seen = new Map<string, number>();
    let colorCounter = 0;

    stages.forEach((st: any) => {
      const rawName = st.stageName || st.StageName || "";
      if (rawName) {
        const name = cleanStageName(rawName);
        if (!seen.has(name)) {
          seen.set(name, colorCounter);
          colorCounter++;
        }
      }
    });

    if (seen.size === 0) {
      ["Material Check", "Cutting", "Stitching / Sewing", "Finishing", "Quality Check", "Washing"].forEach((n, i) => seen.set(n, i));
    }
    return Array.from(seen.entries());
  }, [stages]);

  // Save Notes handler
  const handleSaveNotes = async (rawPlanDbId: string, planNo: string) => {
    const noteText = noteMap[planNo] || noteMap[rawPlanDbId];
    if (noteText === undefined) return;

    setSavingNoteId(planNo);
    try {
      await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(rawPlanDbId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionNotes: noteText, updatedAt: new Date().toISOString() })
      });
      alert(`Notes saved successfully for plan ${planNo}!`);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNoteId(null);
    }
  };

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
      />

      <div className="flex-1 flex flex-col bg-slate-50 font-sans p-6 md:p-8 min-h-[calc(100vh-64px)] gap-6">

        {/* ── PAGE HEADER & ACTIONS ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mt-2 md:mt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Execution Board</h1>
            <p className="text-xs text-slate-500 mt-1">
              Active schedule window, work center allocations &amp; real-time stage progress tracking per product line.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchData}
              title="Refresh Live Data"
              className="px-3.5 py-2 bg-slate-50 hover:bg-white text-slate-700 hover:text-blue-600 rounded-full border border-slate-200 hover:border-blue-300 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500 text-slate-500 group-hover:text-blue-600">
                refresh
              </span>
              <span>Sync Floor Data</span>
            </button>

            <Link
              href="/production"
              className="px-3.5 py-2 bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 hover:border-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">dashboard</span>
              <span>Overview</span>
            </Link>

            <Link
              href="/production/demands"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>New Plan</span>
            </Link>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Active Product Lines</span>
            <span className="text-blue-600 text-3xl font-extrabold mt-2">{loading ? "…" : kpis.active}</span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Units in WIP</span>
            <span className="text-violet-600 text-3xl font-extrabold mt-2">{loading ? "…" : kpis.totalQty.toLocaleString()}</span>
          </div>
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-semibold text-rose-600 uppercase tracking-wider text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">warning</span>
              High Priority / At Risk
            </span>
            <span className="text-rose-600 text-3xl font-extrabold mt-2">{loading ? "…" : kpis.highRisk}</span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Avg Completion</span>
            <div className="mt-2">
              <span className="text-emerald-600 text-3xl font-extrabold">{loading ? "…" : kpis.avgProgress}%</span>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${kpis.avgProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

          {/* ── LEFT (3 COLS): SCHEDULE TIMELINE & ACTIVE PLAN CARDS ── */}
          <div className="xl:col-span-3 flex flex-col gap-6">

            {/* ── ACTIVE FLOOR EXECUTION SCHEDULE (GANTT PER PRODUCT LINE) ── */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Timeline Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">calendar_today</span>
                    Active Floor Execution Schedule (By Product Line)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Individual product schedule Gantt bars starting from today ({today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}).</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Filter Pills */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                    {(["active", "urgent", "completed"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 py-1 rounded-lg capitalize transition-all ${
                          filterStatus === st ? "bg-white text-blue-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Day Window Selector */}
                  <div className="flex gap-1">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setViewDays(d)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                          viewDays === d ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search execution schedule by plan ID, product name, product code, product ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs gap-2">
                  <span className="material-symbols-outlined animate-spin text-[20px] text-blue-600">sync</span>
                  Loading execution schedule...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: "720px" }}>
                    
                    {/* Gantt Date Column Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                      <div className="w-64 shrink-0 px-4 py-2.5 border-r border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        Plan &amp; Product Info
                      </div>
                      <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                        {timelineDays.map((d, i) => {
                          const isToday = i === 0;
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          return (
                            <div key={i} className={`py-2 border-r border-slate-200 last:border-r-0 text-center min-w-[32px] ${isWeekend ? "bg-slate-100/60" : ""}`}>
                              <div className="text-[9px] text-slate-400 font-semibold uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                              <div className={`text-xs font-extrabold mt-0.5 ${isToday ? "text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mx-auto" : "text-slate-800"}`}>
                                {d.getDate()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gantt Plan Rows - ONE ROW PER PRODUCT ITEM */}
                    <div className="flex flex-col">
                      {filteredPlans.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">No active product lines matched the selected schedule filter.</div>
                      ) : (
                        filteredPlans.map((plan, idx) => {
                          const startStr = plan.plannedStartDate || plan.PlannedStartDate;
                          const endStr = plan.plannedCompletionDate || plan.PlannedCompletionDate;
                          const stagesList = plan.stages || [];
                          const gi = gridCols(startStr, endStr, stagesList);
                          const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                          const pct = stagesList.length > 0 ? planProgress(stagesList) : Number(plan.progress || 0);
                          const isDraft = (plan.status || "").toLowerCase() === "draft";
                          const isDelayed = (plan.priority || "").toLowerCase() === "high" || plan.status === "On Hold";

                          const shortProdId = String(plan.productId).length > 14
                            ? `${String(plan.productId).substring(0, 8)}...`
                            : plan.productId;

                          // Strictly UNIQUE Key per plan + product
                          const uniqueKey = `gantt-row-${plan.planDbId}-${idx}`;

                          return (
                            <div key={uniqueKey} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors group">
                              {/* Left Meta Information: Clear Plan ID + Product Name + Product ID */}
                              <div className="w-64 shrink-0 px-4 py-3 border-r border-slate-200 flex flex-col justify-center gap-1">
                                <div className="font-bold text-xs text-slate-900 truncate flex items-center justify-between">
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                                    {plan.planId}
                                  </span>
                                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                    {plan.productCode}
                                  </span>
                                </div>

                                <div className="text-xs font-extrabold text-slate-800 truncate">
                                  {plan.productName}
                                </div>

                                {/* Full Product ID Badge */}
                                <div
                                  className="text-[10px] text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/80 truncate cursor-help"
                                  title={`Product Name: ${plan.productName}\nProduct Code: ${plan.productCode}\nProduct ID: ${plan.productId}`}
                                >
                                  Product ID: {shortProdId}
                                </div>

                                <div className="flex items-center justify-between mt-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${style.badge}`}>
                                      {planStatusToString(plan.status)}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-700">{plan.quantity} pcs</span>
                                </div>
                              </div>

                              {/* Gantt Bar Area - Dedicated to THIS Product Line */}
                              <div className="flex-grow grid relative py-2" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                                {/* Grid Column Lines */}
                                {timelineDays.map((td, i) => {
                                  const isWknd = td.getDay() === 0 || td.getDay() === 6;
                                  return <div key={i} className={`border-r border-slate-200/40 last:border-r-0 h-full ${isWknd ? "bg-slate-100/30" : ""}`}></div>;
                                })}

                                {/* Schedule Bar for Product */}
                                {gi && (
                                  <div
                                    className={`absolute top-2 bottom-2 rounded-lg overflow-hidden shadow-sm z-10 group-hover:ring-2 ring-blue-500/40 transition-all cursor-pointer ${
                                      isDraft ? "border-2 border-dashed border-slate-300 bg-slate-50" :
                                      isDelayed ? "border border-rose-300 bg-rose-50" :
                                      "border border-blue-300 bg-blue-50"
                                    }`}
                                    style={{ gridColumnStart: gi.start, gridColumnEnd: gi.start + gi.span }}
                                    title={`${plan.planId} - ${plan.productName} (ID: ${plan.productId}): ${stagesList.length} Stages`}
                                  >
                                    {/* Segmented Stages */}
                                    <div className="absolute inset-0 flex">
                                      {stagesList.length > 0 ? stagesList.map((_s: any, si: number) => (
                                        <div
                                          key={si}
                                          style={{ width: `${100 / stagesList.length}%` }}
                                          className={`${STAGE_COLORS[si % STAGE_COLORS.length]} opacity-60 border-r border-white/20 h-full`}
                                        ></div>
                                      )) : (
                                        <div className="w-full h-full bg-blue-500 opacity-60"></div>
                                      )}
                                    </div>

                                    {/* Progress Overlay */}
                                    <div className="absolute top-0 left-0 bottom-0 bg-slate-900/30 z-10" style={{ width: `${pct}%` }}></div>

                                    {/* Bar Text Label */}
                                    <div className="absolute inset-0 flex items-center px-2 z-20">
                                      <span className="text-[10px] font-bold text-white drop-shadow truncate">
                                        {plan.productName} ({plan.productCode}) · {pct}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Dynamic Legend with CLEAN stage names */}
                    <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stages:</span>
                      {uniqueStageNames.slice(0, 6).map(([name, colorIdx]) => (
                        <div key={name} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                          <span className={`w-2.5 h-2.5 rounded-sm ${STAGE_COLORS[colorIdx % STAGE_COLORS.length]}`}></span>
                          {name}
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 ml-auto">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-900/40"></span>
                        Overlay = Progress %
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ── ACTIVE PLAN DETAILS LIST (PER PRODUCT LINE) ── */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Plan Details &amp; Process Routing</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click any product row to expand its specific routing stages, product details, and notes.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                  {filteredPlans.length} product lines
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading plans...</div>
              ) : filteredPlans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No active production product lines found.</div>
              ) : (
                filteredPlans.map((plan, idx) => {
                  const stagesList = plan.stages || [];
                  const pct = stagesList.length > 0 ? planProgress(stagesList) : Number(plan.progress || 0);
                  const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                  const pid = plan.planDbId || plan.planId;
                  const rawPlanDbId = plan.rawPlanDbId || plan.id;
                  const isExpanded = expandedPlanId === pid;
                  const currentTab = activePlanTab[pid] || "stages";
                  const detailsKey = `details-row-${pid}-${idx}`;

                  return (
                    <div key={detailsKey} className="border-b border-slate-100 last:border-b-0">
                      {/* Plan Header Row */}
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => setExpandedPlanId(isExpanded ? null : pid)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {plan.planId}
                              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {plan.productName}
                              </span>
                              <span className="text-xs font-normal text-slate-500">• {plan.sourceName || plan.planName || "Order"}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>Product Code: <strong className="text-slate-800 font-mono">{plan.productCode}</strong></span>
                              <span>&middot;</span>
                              <span className="text-blue-700 font-mono font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80 text-[11px]" title={`Product ID: ${plan.productId}`}>
                                Product ID: {String(plan.productId).substring(0, 14)}...
                              </span>
                              <span>&middot;</span>
                              <span>Qty: <strong className="text-slate-800">{plan.quantity} pcs</strong></span>
                              <span>&middot;</span>
                              <span>Target (BS): <strong className="text-slate-700">{adToNepali(plan.plannedCompletionDate || plan.requiredDate)}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                              {planStatusToString(plan.status)}
                            </span>
                            <div className="flex items-center gap-2 w-28">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${style.bar} rounded-full`} style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-slate-700">{pct}%</span>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Expanded Plan Tabs */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                          {/* Tabs */}
                          <div className="flex border-b border-slate-200 mb-4 gap-2">
                            {(["stages", "product", "notes"] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActivePlanTab((prev) => ({ ...prev, [pid]: tab }))}
                                className={`px-4 py-2 text-xs font-bold capitalize transition-all border-b-2 ${
                                  currentTab === tab
                                    ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {tab === "stages" ? `Routing Stages (${stagesList.length})` : tab === "product" ? "Product Details" : "Notes"}
                              </button>
                            ))}
                          </div>

                          {/* Stages Tab */}
                          {currentTab === "stages" && (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80">
                              {stagesList.length === 0 ? (
                                <p className="text-xs text-slate-400">No routing stages recorded for this product line.</p>
                              ) : (
                                stagesList.map((stg: any, si: number) => {
                                  const stName = cleanStageName(stg.stageName || stg.StageName || stg.name || `Stage ${si + 1}`);
                                  const stStatus = stg.status || stg.Status || "Not Started";
                                  const isComp = String(stStatus).toLowerCase() === "completed" || stStatus === "5";
                                  const isAct = String(stStatus).toLowerCase() === "active" || String(stStatus).toLowerCase() === "in progress";

                                  return (
                                    <div key={si} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isComp ? "bg-emerald-100 text-emerald-700" : isAct ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                                        }`}>
                                          {si + 1}
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-slate-800">{stName}</div>
                                          <div className="text-[11px] text-slate-500">
                                            Work Center: <strong>{stg.workCenter || stg.workCenterId || "QC Station"}</strong> &middot; Operator: {stg.operatorName || stg.operator || "Unassigned"}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs font-semibold">
                                        <span className="text-slate-600">Completed: <strong className="text-emerald-600">{stg.completedQty || 0} pcs</strong></span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                          isComp ? "bg-emerald-50 text-emerald-700" : isAct ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {stStatus}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* Product Details Tab */}
                          {currentTab === "product" && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-900 text-sm">{plan.productName}</span>
                                <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{plan.productCode}</span>
                              </div>
                              <div className="text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                                Product ID: <strong className="text-slate-900">{plan.productId}</strong>
                              </div>
                              <div className="text-xs text-slate-500 flex justify-between pt-1">
                                <span>Variant: <strong className="text-slate-800">{plan.productItem?.variant || "Standard"}</strong></span>
                                <span>Quantity: <strong className="text-slate-800">{plan.quantity} pcs</strong></span>
                              </div>
                            </div>
                          )}

                          {/* Notes Tab */}
                          {currentTab === "notes" && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                              <label className="block text-xs font-bold text-slate-700">Operational Remarks &amp; Shift Notes</label>
                              <textarea
                                rows={3}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Write shift notes, fabric quality notes, or floor instructions..."
                                value={noteMap[plan.planId] !== undefined ? noteMap[plan.planId] : (plan.productionNotes || "")}
                                onChange={(e) => setNoteMap((prev) => ({ ...prev, [plan.planId]: e.target.value }))}
                              />
                              <button
                                onClick={() => handleSaveNotes(rawPlanDbId, plan.planId)}
                                disabled={savingNoteId === plan.planId}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[15px]">save</span>
                                {savingNoteId === plan.planId ? "Saving..." : "Save Notes"}
                              </button>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* ── RIGHT (1 COL): WORK CENTER LOAD & RECENT PROCESSES ── */}
          <div className="xl:col-span-1 flex flex-col gap-6">

            {/* Work Center Utilization */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">factory</span>
                  Work Center Load
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{workCenters.length} centers</span>
              </div>

              <div className="space-y-3.5">
                {workCenters.length === 0 ? (
                  <p className="text-xs text-slate-400">No work centers registered.</p>
                ) : (
                  workCenters.slice(0, 7).map((wc, i) => {
                    const name = wc.name || wc.Name || `WC-${i + 1}`;
                    const type = wc.type || wc.Type || "Assembly";
                    const status = wc.status || wc.Status || "Available";
                    const loadPct = Math.min(95, 35 + (name.length * 4) % 55);

                    return (
                      <div key={wc.id || i} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]">{name}</span>
                          <span className="font-bold text-slate-600 text-[11px]">{loadPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${loadPct > 80 ? "bg-amber-500" : "bg-blue-600"}`}
                            style={{ width: `${loadPct}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{type}</span>
                          <span className={status === "Available" ? "text-emerald-600 font-semibold" : "text-amber-600"}>{status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Floor Activities */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-violet-600 text-[18px]">timeline</span>
                  Recent Stage Processes
                </h3>
              </div>

              <div className="space-y-3">
                {recentStages.length === 0 ? (
                  <p className="text-xs text-slate-400">No recent process activity.</p>
                ) : (
                  recentStages.map((rs, idx) => {
                    const st = String(rs.status).toLowerCase();
                    const isComp = st === "completed" || st === "5";
                    const isAct = st === "active" || st === "in progress";

                    return (
                      <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isComp ? "bg-emerald-100 text-emerald-600" : isAct ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {isComp ? "check" : isAct ? "sync" : "schedule"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 truncate">{rs.stageName}</div>
                          <div className="text-[10px] text-slate-500 truncate">{rs.planNo} &middot; {rs.productName}</div>
                          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">✓ {rs.completedQty} pcs completed</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
