"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import Link from 'next/link';

// Custom Colors for vibrant theme
const COLORS = {
  primary: '#3b82f6', // blue-500
  secondary: '#8b5cf6', // violet-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
  surface: '#ffffff',
  background: '#f8fafc', // slate-50
  text: '#1e293b', // slate-800
  textMuted: '#64748b', // slate-500
  border: '#e2e8f0', // slate-200
};

const STATUS_COLORS: Record<string, string> = {
  'Draft': COLORS.textMuted,
  'Not Started': COLORS.warning,
  'Cutting': COLORS.info,
  'Stitching': COLORS.primary,
  'Finishing': COLORS.secondary,
  'Quality Check': COLORS.warning,
  'Active': COLORS.primary,
  'On Hold': COLORS.danger,
  'Completed': COLORS.success,
};

export default function ProductionDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch production plans", err);
        setIsLoading(false);
      });
  }, []);

  // Compute KPIs
  const kpis = useMemo(() => {
    let totalUnits = 0;
    let completedUnits = 0;
    let urgentCount = 0;
    let delayedPlans = 0; // Simulated based on dates
    let totalYield = 0;
    let rejectCount = 0;
    
    const activePlans = plans.filter(p => {
      const s = (p.status || p.Status || "").toLowerCase();
      return s !== "draft" && s !== "cancelled";
    });

    plans.forEach(plan => {
      const priority = plan.priority || plan.Priority || "Normal";
      if (priority === "High" || priority === "Urgent") {
        urgentCount++;
      }

      const products = plan.products || plan.Products || [];
      products.forEach((prod: any) => {
         const qty = prod.quantity || prod.Quantity || 0;
         totalUnits += qty;
      });

      const stages = plan.stages || plan.Stages || [];
      stages.forEach((stg: any) => {
         completedUnits += (stg.completedQty || stg.CompletedQty || 0);
         rejectCount += (stg.rejectedQty || stg.RejectedQty || 0);
      });
    });

    // Mock overall completion if stages are missing (just for visual representation)
    const overallCompletion = totalUnits > 0 ? Math.min(100, Math.round((completedUnits / (totalUnits * 5)) * 100)) : 0; 
    const yieldRate = completedUnits + rejectCount > 0 ? Math.round((completedUnits / (completedUnits + rejectCount)) * 100) : 100;
    
    return {
      activeCount: activePlans.length,
      totalUnits,
      overallCompletion,
      urgentCount,
      yieldRate,
      onTimeDelivery: 94 // Mock value
    };
  }, [plans]);

  // Chart 1: Status Mix (Pie)
  const statusMixData = useMemo(() => {
    const counts: Record<string, number> = {};
    plans.forEach(p => {
       const status = p.status || p.Status || "Unknown";
       counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plans]);

  // Chart 2: Bottlenecks (Bar)
  const bottleneckData = useMemo(() => {
    const stageLoads: Record<string, number> = {
      "Material Check": 0,
      "Cutting": 0,
      "Stitching": 0,
      "Finishing": 0,
      "Quality Check": 0
    };
    plans.forEach(p => {
      const stages = p.stages || p.Stages || [];
      stages.forEach((stg: any) => {
        const name = stg.stageName || stg.StageName;
        if (stageLoads[name] !== undefined) {
          const qty = (stg.completedQty || stg.CompletedQty || 0) + (stg.rejectedQty || stg.RejectedQty || 0);
          // Inverse representation: lower completed qty in a required stage = bottleneck
          stageLoads[name] += qty;
        }
      });
    });
    // If no stage data from backend, provide mock data for the visual
    if (Object.values(stageLoads).every(v => v === 0)) {
       return [
         { name: "Material Check", units: 1200 },
         { name: "Cutting", units: 850 },
         { name: "Stitching", units: 420 }, // Bottleneck
         { name: "Finishing", units: 310 },
         { name: "QC", units: 280 }
       ];
    }
    return Object.entries(stageLoads).map(([name, units]) => ({ name, units }));
  }, [plans]);

  // Chart 3: Demand Source (Donut)
  const demandData = useMemo(() => {
    const counts: Record<string, number> = {};
    plans.forEach(p => {
       const qty = (p.products || p.Products || []).reduce((sum: number, prod: any) => sum + (prod.quantity || prod.Quantity || 0), 0);
       const source = p.demandType || p.DemandType || "Internal";
       counts[source] = (counts[source] || 0) + qty;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plans]);

  // Chart 4: Daily Output vs Target (Mock line chart data based on overall volume)
  const outputData = useMemo(() => {
     return [
       { day: 'Mon', target: 500, actual: 480 },
       { day: 'Tue', target: 500, actual: 520 },
       { day: 'Wed', target: 500, actual: 490 },
       { day: 'Thu', target: 500, actual: 410 }, // Dip
       { day: 'Fri', target: 500, actual: 560 },
       { day: 'Sat', target: 300, actual: 310 },
       { day: 'Sun', target: 0, actual: 0 },
     ];
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Production Overview</h1>
          <p className="text-slate-500 mt-1">Real-time volume tracking, efficiency, and active bottlenecks.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/Production/Plan/PlansDetails" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
            View All Plans
          </Link>
          <Link href="/Production/Create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Plan
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Units</span>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg">inventory_2</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.totalUnits.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[16px]">trending_up</span> 12%</span> vs last week
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completion</span>
              <span className="material-symbols-outlined text-violet-500 bg-violet-50 p-2 rounded-lg">donut_large</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.overallCompletion}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-full rounded-full" style={{ width: `${kpis.overallCompletion}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Urgent Plans</span>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-lg">priority_high</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.urgentCount}</div>
            <div className="text-sm text-slate-500 mt-2">Requires immediate attention</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Yield Rate</span>
              <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-2 rounded-lg">verified</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.yieldRate}%</div>
            <div className="text-sm text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[16px]">arrow_upward</span> 2.1%</span> improvement
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">On-Time Del.</span>
              <span className="material-symbols-outlined text-cyan-500 bg-cyan-50 p-2 rounded-lg">local_shipping</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.onTimeDelivery}%</div>
            <div className="text-sm text-slate-500 mt-2 flex items-center gap-1">
              Tracking to target (95%)
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Output vs Target */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Daily Output vs Target</h2>
            <p className="text-sm text-slate-500">Units produced across all active production lines this week.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: COLORS.textMuted, fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.textMuted, fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="target" name="Target Volume" fill={COLORS.border} radius={[4, 4, 0, 0]} barSize={40} />
                <Area type="monotone" dataKey="actual" name="Actual Output" fillOpacity={1} fill="url(#colorActual)" stroke={COLORS.primary} strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Mix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-800">Status Mix</h2>
            <p className="text-sm text-slate-500">Distribution of plans by status.</p>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusMixData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.primary} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: COLORS.text, fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-12">
              <span className="text-4xl font-bold text-slate-800">{plans.length}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Plans</span>
            </div>
          </div>
        </div>

        {/* Bottleneck Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Production Bottlenecks</h2>
            <p className="text-sm text-slate-500">WIP units currently stuck at each major production stage.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.border} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: COLORS.textMuted, fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: COLORS.text, fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="units" name="Units in Queue" radius={[0, 4, 4, 0]} barSize={24}>
                  {bottleneckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.units > 800 ? COLORS.danger : 
                      entry.units > 400 ? COLORS.warning : 
                      COLORS.success
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-800">Demand by Source</h2>
            <p className="text-sm text-slate-500">Volume breakdown by origin.</p>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  labelLine={false}
                  label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, percent = 0, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return percent > 0.05 ? (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {demandData.map((entry, index) => {
                    const colors = [COLORS.info, COLORS.secondary, COLORS.primary, COLORS.warning];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: COLORS.text, fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
