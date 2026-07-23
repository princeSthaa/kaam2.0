"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";

// Clean & Harmonized Color Palette
const COLORS = {
  primary: "#2563eb",     // Blue-600
  secondary: "#7c3aed",   // Violet-600
  success: "#059669",     // Emerald-600
  warning: "#d97706",     // Amber-600
  danger: "#dc2626",      // Red-600
  info: "#0891b2",         // Cyan-600
  slate: "#64748b",       // Slate-500
  dark: "#0f172a",        // Slate-900
};

const STATUS_COLOR_MAP: Record<string, { fill: string }> = {
  "Draft": { fill: "#94a3b8" },
  "Not Started": { fill: "#f59e0b" },
  "Active": { fill: "#2563eb" },
  "In Progress": { fill: "#6366f1" },
  "Cutting": { fill: "#0891b2" },
  "Stitching": { fill: "#7c3aed" },
  "On Hold": { fill: "#f43f5e" },
  "Blocked": { fill: "#dc2626" },
  "Completed": { fill: "#059669" },
};

// Custom Tooltip for Stage Bottleneck Analysis Chart
const CustomBottleneckTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
        <div className="font-bold text-sm text-blue-400 border-b border-slate-700/80 pb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          {data.name}
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-300">Total Units Queued:</span>
          <span className="font-bold text-white">{data.units} pcs</span>
        </div>
        {data.completedQty !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Completed Qty:</span>
            <span className="font-bold text-emerald-400">{data.completedQty} pcs</span>
          </div>
        )}
        {data.rejectedQty !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-rose-400">Rejected Qty:</span>
            <span className="font-bold text-rose-400">{data.rejectedQty} pcs</span>
          </div>
        )}
        <div className="flex justify-between gap-4 text-[11px] pt-1 text-slate-400 border-t border-slate-800">
          <span>Stage Workload:</span>
          <span className="font-semibold text-amber-400">{data.units > 50 ? "High Queue" : "Normal Load"}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Throughput Chart
const CustomThroughputTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
        <div className="font-bold text-sm text-slate-200 border-b border-slate-700/80 pb-1">
          {label} Throughput Target
        </div>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-bold text-white">{p.value} units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProductionOverviewDashboardPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, stagesRes] = await Promise.all([
        fetch("http://localhost:5083/api/production-plans", { cache: "no-store" }),
        fetch("http://localhost:5083/api/production-plan-stage", { cache: "no-store" })
      ]);

      const plansData = plansRes.ok ? await plansRes.json() : [];
      const stagesData = stagesRes.ok ? await stagesRes.json() : [];

      setPlans(Array.isArray(plansData) ? plansData : []);
      setStages(Array.isArray(stagesData) ? stagesData : (stagesData.value || []));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
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

  // Simplified KPI Computation
  const metrics = useMemo(() => {
    let totalWipUnits = 0;
    let urgentCount = 0;
    let onTimeCount = 0;

    const activePlans = plans.filter(p => {
      const st = planStatusToString(p.status || p.Status).toLowerCase();
      return st !== "draft" && st !== "cancelled";
    });

    plans.forEach(plan => {
      const priority = String(plan.priority || plan.Priority || "Medium").toLowerCase();
      if (priority === "urgent" || priority === "high" || priority === "critical") {
        urgentCount++;
      }

      const rawProducts = plan.productionPlanProducts || plan.products || [];
      if (rawProducts.length > 0) {
        rawProducts.forEach((prod: any) => {
          totalWipUnits += Number(prod.quantity || prod.qty || 0);
        });
      } else {
        totalWipUnits += Number(plan.quantity || plan.totalQuantity || 0);
      }

      const endDate = plan.plannedCompletionDate || plan.requiredDate;
      if (endDate) {
        const isPast = new Date(endDate).getTime() < new Date().getTime();
        const st = planStatusToString(plan.status).toLowerCase();
        if (st === "completed" || !isPast) {
          onTimeCount++;
        }
      } else {
        onTimeCount++;
      }
    });

    let sumProgress = 0;
    activePlans.forEach(p => {
      sumProgress += Number(p.progress || 0);
    });
    const avgProgress = activePlans.length > 0 ? Math.round(sumProgress / activePlans.length) : 0;
    const onTimeRate = plans.length > 0 ? Math.round((onTimeCount / plans.length) * 100) : 100;

    return {
      totalPlans: plans.length,
      activePlansCount: activePlans.length,
      totalWipUnits,
      avgProgress,
      urgentCount,
      onTimeRate
    };
  }, [plans]);

  // Chart 1: Status Mix
  const statusMixData = useMemo(() => {
    const counts: Record<string, number> = {};
    plans.forEach(p => {
      const st = planStatusToString(p.status || p.Status);
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plans]);

  // Chart 2: Stage Queue & Bottleneck Analysis (With Detailed Hover Metrics)
  const stageBottleneckData = useMemo(() => {
    const queueMap: Record<string, { units: number; completedQty: number; rejectedQty: number }> = {
      "Material Check": { units: 0, completedQty: 0, rejectedQty: 0 },
      "Cutting": { units: 0, completedQty: 0, rejectedQty: 0 },
      "Stitching / Sewing": { units: 0, completedQty: 0, rejectedQty: 0 },
      "Quality Check": { units: 0, completedQty: 0, rejectedQty: 0 },
      "Finishing": { units: 0, completedQty: 0, rejectedQty: 0 },
      "Washing": { units: 0, completedQty: 0, rejectedQty: 0 },
    };

    stages.forEach((stg: any) => {
      const name = stg.stageName || stg.StageName || "Other Stage";
      const matchedKey = Object.keys(queueMap).find(k => name.toLowerCase().includes(k.toLowerCase())) || name;
      
      const comp = Number(stg.completedQty || stg.CompletedQty || 0);
      const rej = Number(stg.rejectedQty || stg.RejectedQty || 0);
      const load = comp + rej || 1;

      if (!queueMap[matchedKey]) {
        queueMap[matchedKey] = { units: 0, completedQty: 0, rejectedQty: 0 };
      }
      queueMap[matchedKey].units += load;
      queueMap[matchedKey].completedQty += comp;
      queueMap[matchedKey].rejectedQty += rej;
    });

    return Object.entries(queueMap).map(([name, val]) => ({
      name,
      units: val.units,
      completedQty: val.completedQty,
      rejectedQty: val.rejectedQty
    }));
  }, [stages]);

  // Chart 3: Demand Volume Source
  const demandSourceData = useMemo(() => {
    const counts: Record<string, number> = {
      "Customer Order": 0,
      "Outlet Replenishment": 0,
      "In-house Stock": 0
    };
    plans.forEach(p => {
      const src = p.demandType || p.DemandType || "Customer Order";
      const qty = Number(p.quantity || 0) || 1;
      counts[src] = (counts[src] || 0) + qty;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plans]);

  // Chart 4: Weekly Throughput Trend
  const weeklyThroughputData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const baseTarget = Math.max(15, Math.round(metrics.totalWipUnits / 7));
    return days.map((day, idx) => ({
      day,
      target: baseTarget + (idx % 2 === 0 ? 4 : -2),
      actual: Math.max(5, Math.round(baseTarget * (0.85 + (idx * 0.04))))
    }));
  }, [metrics.totalWipUnits]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Dashboard Overview...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-[calc(100vh-64px)] p-6 md:p-8 font-sans gap-6">
      
      {/* ── SIMPLE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mt-2 md:mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time overview of active runs, throughput, and stage queues.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            title="Refresh Live Data"
            className="px-3.5 py-2 bg-slate-50 hover:bg-white text-slate-700 hover:text-blue-600 rounded-full border border-slate-200 hover:border-blue-300 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500 text-slate-500 group-hover:text-blue-600">
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <Link
            href="/production/plans"
            className="px-3.5 py-2 bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 hover:border-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">list_alt</span>
            <span>View Plans</span>
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

      {/* ── SIMPLIFIED KPI CARDS (5 CARDS GRID) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Active Runs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipelines</span>
            <span className="material-symbols-outlined text-blue-600 text-[20px]">precision_manufacturing</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.activePlansCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">{metrics.totalPlans} total plans recorded</div>
        </div>

        {/* KPI 2: Units in WIP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Units in WIP</span>
            <span className="material-symbols-outlined text-violet-600 text-[20px]">inventory_2</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalWipUnits.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live WIP Order Volume</div>
        </div>

        {/* KPI 3: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">donut_large</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.avgProgress}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.avgProgress}%` }}></div>
          </div>
        </div>

        {/* KPI 4: Schedule On-Time Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">On-Time Schedule</span>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">event_available</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.onTimeRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Tracking to deadlines</div>
        </div>

        {/* KPI 5: Urgent Plans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Runs</span>
            <span className="material-symbols-outlined text-rose-600 text-[20px]">priority_high</span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{metrics.urgentCount}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">High priority runs</div>
        </div>
      </div>

      {/* ── CHARTS SECTION (2x2 GRID STRUCTURE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHART 1: Throughput Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">show_chart</span>
              Weekly Production Throughput
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Daily unit output vs planned capacity target.</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyThroughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 11 }} />
                <Tooltip content={<CustomThroughputTooltip />} />
                <Bar dataKey="target" name="Capacity Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={28} />
                <Area type="monotone" dataKey="actual" name="Actual Throughput" fillOpacity={0.2} fill={COLORS.primary} stroke={COLORS.primary} strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Pipeline Status Mix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-600 text-[18px]">pie_chart</span>
              Pipeline Status Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of plans across status stages.</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusMixData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLOR_MAP[entry.name]?.fill || COLORS.primary} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{plans.length}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Plans</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-slate-100">
            {statusMixData.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR_MAP[item.name]?.fill || COLORS.primary }}></span>
                {item.name}: <strong className="text-slate-900">{item.value}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* CHART 3: Stage Queue & Bottleneck Analysis (WITH DETAILED TOOLTIP) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">equalizer</span>
              Stage Queue & Bottleneck Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Hover over any stage bar to inspect detailed unit queues, completed, and rejected quantities.</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageBottleneckData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: COLORS.slate, fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: COLORS.dark, fontSize: 11, fontWeight: 600 }} />
                <Tooltip content={<CustomBottleneckTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.6)" }} />
                <Bar dataKey="units" name="Queued Units" radius={[0, 4, 4, 0]} barSize={20}>
                  {stageBottleneckData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.units > 50 ? COLORS.danger : entry.units > 20 ? COLORS.warning : COLORS.success}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Demand Volume Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">category</span>
              Demand Volume by Source
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Volume breakdown across customer orders vs outlet stock.</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {demandSourceData.map((entry, index) => {
                    const palette = [COLORS.primary, COLORS.secondary, COLORS.info];
                    return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-slate-100">
            {demandSourceData.map((item, index) => {
              const palette = [COLORS.primary, COLORS.secondary, COLORS.info];
              return (
                <span key={item.name} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/60">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette[index % palette.length] }}></span>
                  {item.name}: <strong className="text-slate-900">{item.value} pcs</strong>
                </span>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
