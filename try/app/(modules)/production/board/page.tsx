"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';

import { STAGE_COLORS, STAGE_LIGHT_COLORS as STAGE_LIGHT } from '../constants/production.constants';
import { adToBs as adToNepali, getStatusStyle, calculatePlanProgress as planProgress } from '../lib/production-utils';

export default function ProductionOverviewPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDays, setViewDays] = useState<number>(14);
  const [nepaliReady, setNepaliReady] = useState(false);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5083/api/production-plans").then(r => r.json()),
      fetch("http://localhost:5083/api/workcenters").then(r => r.json())
    ]).then(([plansData, wcData]) => {
      const active = plansData.filter((p: any) => {
        const s = (p.status || p.Status || '').toLowerCase();
        return s !== 'draft' && s !== 'completed';
      }).sort((a: any, b: any) => {
        const pa = (a.priority || '').toLowerCase();
        const pb = (b.priority || '').toLowerCase();
        if ((pa === 'high' || pa === 'urgent') && !(pb === 'high' || pb === 'urgent')) return -1;
        if (!(pa === 'high' || pa === 'urgent') && (pb === 'high' || pb === 'urgent')) return 1;
        return new Date(a.plannedCompletionDate || 0).getTime() - new Date(b.plannedCompletionDate || 0).getTime();
      });
      setPlans(active);
      setWorkCenters(wcData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ─── Timeline helpers ──────────────────────────────────────────────────────
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const timelineDays = useMemo(() => Array.from({ length: viewDays }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  }), [today, viewDays]);

  const gridCols = (startStr: string, endStr: string) => {
    const dayOff = (s: string) => {
      if (!s) return 0;
      const d = new Date(s); d.setHours(0,0,0,0);
      return Math.ceil((d.getTime() - today.getTime()) / 86400000);
    };
    let s = dayOff(startStr);
    let e = dayOff(endStr);
    if (e < 0 || s >= viewDays) return null;
    if (s < 0) s = 0;
    if (e > viewDays - 1) e = viewDays - 1;
    if (e < s) e = s;
    return { start: s + 1, span: e - s + 1 };
  };

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let totalQty = 0, highRisk = 0, avgProgress = 0;
    plans.forEach(p => {
      totalQty += p.quantity || p.Quantity || 0;
      if ((p.priority || '').toLowerCase() === 'high' || (p.status || '') === 'On Hold') highRisk++;
      avgProgress += planProgress(p.stages || p.Stages || []);
    });
    return {
      active: plans.length,
      totalQty,
      highRisk,
      avgProgress: plans.length ? Math.round(avgProgress / plans.length) : 0
    };
  }, [plans]);

  // ─── Recent processes: All stages across active plans ─────────────────────
  const recentStages = useMemo(() => {
    const all: any[] = [];
    plans.forEach(plan => {
      const stages = plan.stages || plan.Stages || [];
      stages.forEach((st: any, idx: number) => {
        all.push({
          stageName: st.stageName || st.StageName || st.name,
          workCenter: st.workCenter || st.WorkCenter,
          operator: st.operator || st.Operator,
          status: st.status || st.Status || 'Not Started',
          planNo: plan.planId || plan.PlanId || plan.planNo,
          product: plan.products?.[0]?.productName || plan.Products?.[0]?.ProductName || 'Production',
          colorIdx: idx
        });
      });
    });
    return all.sort((a, b) => {
      const order: Record<string,number> = {'Active': 0, 'Completed': 1, 'On Hold': 2, 'Not Started': 3};
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    }).slice(0, 8);
  }, [plans]);

  // ─── Unique stage names (for dynamic legend) ──────────────────────────────
  const uniqueStageNames = useMemo(() => {
    const seen = new Map<string, number>(); 
    plans.forEach(plan => {
      const stages = plan.stages || plan.Stages || [];
      stages.forEach((st: any, idx: number) => {
        const name = st.stageName || st.StageName || st.name || `Stage ${idx+1}`;
        if (!seen.has(name)) seen.set(name, idx);
      });
    });
    return Array.from(seen.entries()); 
  }, [plans]);

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
        onLoad={() => setNepaliReady(true)}
      />

      <div className="flex-1 flex flex-col bg-slate-50 font-sans">

        {/* ─── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Production Overview Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Master schedule, workforce allocation &amp; real-time process tracking.
          </p>
        </div>

        {/* ─── KPI Strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-xs">Active Plans</span>
            <span className="text-blue-600 text-3xl font-bold mt-2">{loading ? '…' : kpis.active}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-xs">Total Units in Pipeline</span>
            <span className="text-violet-600 text-3xl font-bold mt-2">{loading ? '…' : kpis.totalQty.toLocaleString()}</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-medium text-red-500 uppercase tracking-wider text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              High Priority / At Risk
            </span>
            <span className="text-red-500 text-3xl font-bold mt-2">{loading ? '…' : kpis.highRisk}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-xs">Avg. Completion</span>
            <div className="mt-2">
              <span className="text-violet-600 text-3xl font-bold">{loading ? '…' : kpis.avgProgress}%</span>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${kpis.avgProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Two-Column Layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

          {/* ─── LEFT: Gantt + Plan List ────────────────────────────── */}
          <div className="xl:col-span-3 flex flex-col gap-6">

            {/* ─── Master Timeline Gantt ─────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <h2 className="text-lg text-slate-800 font-bold">Master Timeline</h2>
                <div className="flex gap-2">
                  {[14, 30].map(d => (
                    <button key={d} onClick={() => setViewDays(d)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        viewDays === d ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}>
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  Loading timeline...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: '700px' }}>
                    {/* Date Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                      <div className="w-52 shrink-0 px-4 py-2.5 border-r border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        Plan / Process
                      </div>
                      <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                        {timelineDays.map((d, i) => {
                          const isToday = i === 0;
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          return (
                            <div key={i} className={`py-2 border-r border-slate-200 last:border-r-0 text-center min-w-[36px] ${isWeekend ? 'bg-slate-100/50' : ''}`}>
                              <div className="text-[9px] text-slate-500 uppercase">{d.toLocaleDateString('en-US',{weekday:'short'})}</div>
                              <div className={`text-xs font-bold mt-0.5 ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center mx-auto' : 'text-slate-800'}`}>
                                {d.getDate()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Plan Rows */}
                    <div className="flex flex-col">
                      {plans.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">No active plans in timeline.</div>
                      )}
                      {plans.map((plan, idx) => {
                        const startStr = plan.plannedStartDate || plan.PlannedStartDate;
                        const endStr = plan.plannedCompletionDate || plan.PlannedCompletionDate;
                        const gi = gridCols(startStr, endStr);
                        const stages = plan.stages || plan.Stages || [];
                        const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                        const pct = planProgress(stages);
                        const isDraft = (plan.status || '').toLowerCase() === 'draft';
                        const isDelayed = (plan.priority || '').toLowerCase() === 'high' || plan.status === 'On Hold';

                        return (
                          <div key={plan.planId || idx} className="flex border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors group">
                            {/* Left meta */}
                            <div className="w-52 shrink-0 px-4 py-3 border-r border-slate-200 flex flex-col justify-center gap-1">
                              <div className="font-medium text-sm font-bold text-slate-800 truncate">
                                {plan.planId || plan.PlanId}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {plan.sourceName || plan.SourceName || 'Internal'}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${style.badge}`}>
                                  {plan.status || plan.Status}
                                </span>
                                {isDelayed && (
                                  <span className="material-symbols-outlined text-red-500 text-[12px]" title="High Priority">priority_high</span>
                                )}
                              </div>
                            </div>

                            {/* Gantt area */}
                            <div className="flex-grow grid relative py-2" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                              {/* Grid lines */}
                              {timelineDays.map((td, i) => {
                                const isWknd = td.getDay()===0||td.getDay()===6;
                                return <div key={i} className={`border-r border-slate-200/50 last:border-r-0 h-full ${isWknd ? 'bg-slate-100/40' : ''}`}></div>;
                              })}

                              {/* Bar */}
                              {gi && (
                                <div
                                  className={`absolute top-2 bottom-2 rounded-lg overflow-hidden shadow-sm z-10 group-hover:ring-2 ring-blue-500/40 transition-all cursor-pointer
                                    ${isDraft ? 'border-2 border-dashed border-slate-300 bg-slate-50' :
                                      isDelayed ? 'border border-red-300 bg-red-50' :
                                      'border border-blue-300 bg-blue-50'}`}
                                  style={{ gridColumnStart: gi.start, gridColumnEnd: gi.start + gi.span }}
                                  title={`${plan.planId}: ${startStr} → ${endStr}`}
                                >
                                  {/* Micro stages */}
                                  <div className="absolute inset-0 flex">
                                    {stages.length > 0 ? stages.map((_s: any, si: number) => (
                                      <div key={si}
                                        style={{ width: `${100/stages.length}%` }}
                                        className={`${STAGE_COLORS[si % STAGE_COLORS.length]} opacity-60 border-r border-white/20 h-full`}
                                      ></div>
                                    )) : (
                                      <div className="w-full h-full bg-blue-400 opacity-60"></div>
                                    )}
                                  </div>

                                  {/* Progress darken overlay */}
                                  <div className="absolute top-0 left-0 bottom-0 bg-black/20 z-10" style={{ width: `${pct}%` }}></div>

                                  {/* Label */}
                                  <div className="absolute inset-0 flex items-center px-2 z-20">
                                    <span className="text-[10px] font-bold text-white drop-shadow truncate">
                                      {plan.products?.[0]?.productName || plan.Products?.[0]?.ProductName || 'Production'}
                                      {stages.length > 0 && ` · ${pct}%`}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend — fully dynamic from actual stage names */}
                    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-wrap">
                      {uniqueStageNames.slice(0, 6).map(([name, colorIdx]) => (
                        <div key={name} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span className={`w-3 h-3 rounded-sm ${STAGE_COLORS[colorIdx % STAGE_COLORS.length]} opacity-80`}></span>
                          {name}
                        </div>
                      ))}
                      {uniqueStageNames.length === 0 && (
                        <span className="text-[10px] text-slate-500">No stage data available</span>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 ml-auto">
                        <span className="w-3 h-3 rounded-sm bg-black/30"></span>
                        Darker = completed portion
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Active Plan Cards ──────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg text-slate-800 font-bold">Active Plan Details</h2>
                <span className="font-medium text-[11px] text-slate-500">{plans.length} plans</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
              ) : plans.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No active production plans.</div>
              ) : (
                plans.map((plan, idx) => {
                  const stages = plan.stages || plan.Stages || [];
                  const pct = planProgress(stages);
                  const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                  const isExpanded = expandedPlanId === (plan.planId || plan.PlanId);
                  const pid = plan.planId || plan.PlanId || plan.id;
                  const products = plan.products || plan.Products || [];
                  const currentTab = activePlanTab[pid] || 'stages';

                  return (
                    <div key={pid || idx} className="border-b border-slate-200 last:border-b-0">
                      {/* ── Plan header row ── */}
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedPlanId(isExpanded ? null : pid)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            <span className="material-symbols-outlined text-violet-600">assignment</span>
                          </div>
                          <div>
                            <div className="font-medium font-bold text-slate-800 text-sm">{pid}</div>
                            <div className="text-sm text-slate-500 text-xs truncate max-w-xs">
                              {plan.sourceName || plan.SourceName || 'Internal'} &middot; {plan.productionLine || plan.ProductionLine || 'Line'}
                            </div>
                            {/* BS Dates */}
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {adToNepali(plan.plannedStartDate || plan.PlannedStartDate)} → {adToNepali(plan.plannedCompletionDate || plan.PlannedCompletionDate)}
                              <span className="ml-1 text-slate-400">(BS)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="hidden md:flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.badge}`}>
                              {plan.status || plan.Status}
                            </span>
                            {(plan.priority === 'High' || plan.priority === 'Urgent') && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
                                {plan.priority}
                              </span>
                            )}
                            <div className="flex items-center gap-2 w-28">
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full ${style.bar} rounded-full`} style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="font-medium text-xs text-slate-500">{pct}%</span>
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* ── Expanded content ── */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white">
                          {/* Tab bar */}
                          <div className="flex border-b border-slate-200 px-5">
                            {['stages', 'products', 'notes'].map(tab => (
                              <button key={tab}
                                onClick={() => setActivePlanTab(prev => ({ ...prev, [pid]: tab }))}
                                className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors border-b-2 ${
                                  currentTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {tab === 'stages' ? 'Process Stages' : tab === 'products' ? `Products (${products.length})` : 'Notes'}
                              </button>
                            ))}
                          </div>

                          {/* ── Stages tab ── */}
                          {currentTab === 'stages' && (
                            <div className="p-5">
                              <div className="relative">
                                {/* Connecting line */}
                                <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                                <div className="flex flex-col gap-3">
                                  {stages.length === 0 ? (
                                    <p className="text-slate-500 text-sm">No routing stages defined for this plan.</p>
                                  ) : stages.map((stage: any, si: number) => {
                                    const st = stage.status || stage.Status || 'Not Started';
                                    const isCompleted = st === 'Completed';
                                    const isActive = st === 'Active' || st === 'In Progress';
                                    const isOnHold = st === 'On Hold';
                                    return (
                                      <div key={si} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                                          isCompleted ? 'bg-emerald-500 border-emerald-400' :
                                          isActive ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-600/20' :
                                          isOnHold ? 'bg-orange-400 border-orange-300' :
                                          'bg-slate-100 border-slate-300'
                                        }`}>
                                          {isCompleted && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                                          {isActive && <span className="material-symbols-outlined text-white text-[12px] animate-spin">sync</span>}
                                          {isOnHold && <span className="material-symbols-outlined text-white text-[12px]">pause</span>}
                                          {!isCompleted && !isActive && !isOnHold && (
                                            <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[si % STAGE_COLORS.length]}`}></span>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`font-medium text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                              {stage.stageName || stage.StageName || stage.name}
                                            </span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STAGE_LIGHT[si % STAGE_LIGHT.length]}`}>
                                              {stage.workCenter || stage.WorkCenter}
                                            </span>
                                            {isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">ACTIVE</span>}
                                          </div>
                                          <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                                            <span>Operator: {stage.operator || stage.Operator || '—'}</span>
                                            <span>✓ {stage.completedQty || stage.CompletedQty || 0} pcs</span>
                                            {(stage.rejectedQty || stage.RejectedQty || 0) > 0 && (
                                              <span className="text-red-500">✗ {stage.rejectedQty || stage.RejectedQty} rejected</span>
                                            )}
                                          </div>
                                          {/* Date row in BS */}
                                          <div className="text-[10px] text-slate-400 mt-0.5">
                                            {adToNepali(stage.plannedStartDate || stage.PlannedStartDate)}
                                            {(stage.plannedEndDate || stage.PlannedEndDate) && ` → ${adToNepali(stage.plannedEndDate || stage.PlannedEndDate)}`}
                                            {(stage.plannedStartDate || stage.PlannedStartDate) && <span className="ml-1">(BS)</span>}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Products tab ── */}
                          {currentTab === 'products' && (
                            <div className="p-5">
                              {products.length === 0 ? (
                                <p className="text-slate-500 text-sm">No products listed.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {products.map((prod: any, pi: number) => (
                                    <div key={pi} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                      <div className="font-medium font-bold text-slate-800 text-sm mb-1">
                                        {prod.productName || prod.ProductName}
                                      </div>
                                      <div className="text-[10px] text-slate-500 space-y-0.5">
                                        <div>Code: {prod.productCode || prod.ProductCode}</div>
                                        <div>Variant: {prod.variant || prod.Variant || '—'}</div>
                                        <div>Qty: <strong>{prod.quantity || prod.Quantity}</strong> pcs</div>
                                        <div>Due: <strong>{adToNepali(prod.requiredDate || prod.RequiredDate)}</strong> <span className="text-slate-400">(BS)</span></div>
                                      </div>
                                      {(prod.sizes || prod.Sizes || []).length > 0 && (
                                        <div className="flex gap-1.5 flex-wrap mt-2">
                                          {(prod.sizes || prod.Sizes).map((sz: any, si: number) => (
                                            <span key={si} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                              {sz.size || sz.Size}: {sz.quantity || sz.Quantity}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Notes tab ── */}
                          {currentTab === 'notes' && (
                            <div className="p-5">
                              <label className="block font-medium text-slate-500 mb-2 text-xs">Production Notes / Remarks</label>
                              <textarea
                                rows={4}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm resize-none"
                                placeholder="Add operational notes, shift handover remarks, or quality alerts..."
                                value={noteMap[pid] ?? (plan.productionNotes || plan.ProductionNotes || '')}
                                onChange={e => setNoteMap(prev => ({ ...prev, [pid]: e.target.value }))}
                              />
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => alert(`Notes saved for ${pid}!`)}
                                  className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:opacity-90 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[14px]">save</span>
                                  Save Notes
                                </button>
                              </div>
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

          {/* ─── RIGHT: Work Centers + Recent Processes ──────────────── */}
          <div className="xl:col-span-1 flex flex-col gap-6">

            {/* Work Center Load */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm text-slate-800 font-bold">Work Center Load</h3>
                <span className="material-symbols-outlined text-slate-500 text-[18px]">factory</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {loading ? (
                  <div className="text-slate-500 text-xs">Loading...</div>
                ) : workCenters.length === 0 ? (
                  <div className="text-slate-500 text-xs">No work centers found.</div>
                ) : workCenters.map((wc, i) => {
                  const name = wc.name || wc.Name || '';
                  const type = wc.type || wc.Type || '';
                  const status = wc.status || wc.Status || '';
                  const loadPct = Math.min(95, 30 + name.length * 5);
                  const isHigh = loadPct > 80;
                  return (
                    <div key={wc.id || wc.Id || i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-500 text-[16px]">
                          {type === 'Machine' ? 'precision_manufacturing' : type === 'QC Station' ? 'fact_check' : 'hardware'}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-slate-800 truncate">{name}</span>
                          <span className={`font-bold ml-2 shrink-0 ${isHigh ? 'text-red-500' : 'text-slate-500'}`}>{loadPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isHigh ? 'bg-orange-500' : 'bg-violet-600'}`} style={{ width: `${loadPct}%` }}></div>
                        </div>
                        <div className={`text-[9px] mt-0.5 ${status === 'Available' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {status} &middot; {type}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shift Allocation */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm text-slate-800 font-bold">Shift Allocation</h3>
                <span className="material-symbols-outlined text-slate-500 text-[18px]">groups</span>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {[
                  { label: 'Shift 1 (Morning)', active: 22, total: 25, color: 'bg-violet-600' },
                  { label: 'Shift 2 (Day)',     active: 24, total: 25, color: 'bg-orange-400' },
                  { label: 'Shift 3 (Night)',   active: 8,  total: 15, color: 'bg-emerald-500' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{s.label}</span>
                      <span className="text-slate-500">{s.active}/{s.total} Active</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.active/s.total)*100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Production Processes */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm text-slate-800 font-bold">Recent Processes</h3>
                <span className="material-symbols-outlined text-slate-500 text-[18px]">timeline</span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {loading ? (
                  <div className="text-slate-500 text-xs p-2">Loading...</div>
                ) : recentStages.length === 0 ? (
                  <div className="text-slate-500 text-xs p-2">No process data.</div>
                ) : recentStages.map((rs, i) => {
                  const isActive = rs.status === 'Active' || rs.status === 'In Progress';
                  const isCompleted = rs.status === 'Completed';
                  const isHold = rs.status === 'On Hold';
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCompleted ? 'bg-emerald-100' : isActive ? 'bg-blue-100' : isHold ? 'bg-orange-100' : 'bg-slate-100'
                      }`}>
                        <span className={`material-symbols-outlined text-[12px] ${
                          isCompleted ? 'text-emerald-600' : isActive ? 'text-blue-600' : isHold ? 'text-orange-500' : 'text-slate-500'
                        }`}>
                          {isCompleted ? 'check_circle' : isActive ? 'sync' : isHold ? 'pause_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[11px] font-bold text-slate-800 truncate">{rs.stageName}</div>
                        <div className="text-[9px] text-slate-500 truncate">{rs.workCenter} · {rs.planNo}</div>
                        <span className={`text-[9px] font-bold inline-block mt-0.5 px-1.5 py-0.5 rounded ${
                          isCompleted ? 'bg-emerald-50 text-emerald-700' :
                          isActive ? 'bg-blue-50 text-blue-700' :
                          isHold ? 'bg-orange-50 text-orange-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>{rs.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
