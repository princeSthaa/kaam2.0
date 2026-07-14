"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";
import Script from 'next/script';

// ─── Nepali Date Conversion Helper ───────────────────────────────────────────
function adToNepali(adDateStr: string): string {
  if (!adDateStr) return "";
  try {
    const d = new Date(adDateStr);
    if (isNaN(d.getTime())) return adDateStr;
    if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
      const nf = (window as any).NepaliFunctions;
      return nf.AD2BS(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  } catch {
    return adDateStr;
  }
}

const STAGE_COLORS = ['bg-blue-500','bg-purple-500','bg-orange-500','bg-teal-500','bg-pink-500','bg-indigo-500'];
const STAGE_LIGHT = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-orange-100 text-orange-700','bg-teal-100 text-teal-700','bg-pink-100 text-pink-700','bg-indigo-100 text-indigo-700'];

function getStatusStyle(status: string, priority: string) {
  if (status === 'Completed') return { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' };
  if (status === 'On Hold' || status === 'Delayed') return { dot: 'bg-red-600', badge: 'bg-red-600 text-white border-red-700 font-bold shadow-sm', bar: 'bg-red-600' };
  if (priority === 'High' || priority === 'Urgent') return { dot: 'bg-orange-600', badge: 'bg-orange-600 text-white border-orange-700 font-bold shadow-sm', bar: 'bg-orange-600' };
  return { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: 'bg-indigo-500' };
}

function planProgress(stages: any[]) {
  if (!stages || stages.length === 0) return 0;
  const done = stages.filter((s: any) => (s.status || s.Status) === 'Completed').length;
  return Math.round((done / stages.length) * 100);
}

// ─── Reusable Components ────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children, footer }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const DropdownMenu = ({ trigger, items }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 transform opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-100">
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.icon && <span className="material-symbols-outlined text-[16px]">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductionOverviewPage() {
  const pathname = usePathname();
  const [plans, setPlans] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDays, setViewDays] = useState<number>(14);
  const [nepaliReady, setNepaliReady] = useState(false);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<Record<string, string>>({});
  
  // Enterprise Features States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState<any>({});

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5083/api/production-plans").then(r => r.json()).catch(() => []),
      fetch("http://localhost:5083/api/workcenters").then(r => r.json()).catch(() => [])
    ]).then(([plansData, wcData]) => {
      if(Array.isArray(plansData)) {
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
      }
      if(Array.isArray(wcData)) setWorkCenters(wcData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchSearch = (p.planId || p.PlanId || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sourceName || p.SourceName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || (p.status || p.Status) === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  const displayedPlans = useMemo(() => filteredPlans.slice(0, 50), [filteredPlans]);

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
    filteredPlans.forEach(p => {
      totalQty += p.quantity || p.Quantity || 0;
      if ((p.priority || '').toLowerCase() === 'high' || (p.status || '') === 'On Hold') highRisk++;
      avgProgress += planProgress(p.stages || p.Stages || []);
    });
    return {
      active: filteredPlans.length,
      totalQty,
      highRisk,
      avgProgress: filteredPlans.length ? Math.round(avgProgress / filteredPlans.length) : 0
    };
  }, [filteredPlans]);

  // ─── Recent processes ─────────────────────
  const recentStages = useMemo(() => {
    const all: any[] = [];
    filteredPlans.forEach(plan => {
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
    }).slice(0, 50);
  }, [filteredPlans]);

  const uniqueStageNames = useMemo(() => {
    const seen = new Map<string, number>();
    filteredPlans.forEach(plan => {
      const stages = plan.stages || plan.Stages || [];
      stages.forEach((st: any, idx: number) => {
        const name = st.stageName || st.StageName || st.name || `Stage ${idx+1}`;
        if (!seen.has(name)) seen.set(name, idx);
      });
    });
    return Array.from(seen.entries());
  }, [filteredPlans]);

  const openActionModal = (title: string, message: string, onConfirm: () => void) => {
    setActionModalContent({ title, message, onConfirm });
    setIsActionModalOpen(true);
  };

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
        onLoad={() => setNepaliReady(true)}
      />

      <AppHeader pathname={pathname} />
      <PageShell sidebar={<Sidebar section="production" pathname={pathname} />} contentClassName="bg-slate-50/50 min-h-screen">
        <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500">

          {/* ─── Page Header & Top Actions ─────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">Production Overview</h1>
              <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                Master schedule, workforce allocation &amp; real-time tracking
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
              <button 
                onClick={() => setIsNewPlanModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Plan
              </button>
            </div>
          </div>

          {/* ─── Filters & Search ───────────────────────────────────────────────── */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div className="relative w-full xl:w-96 group">
              <input 
                type="text" 
                placeholder="Search plans by ID or source..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">search</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2">Filter By Status:</div>
              {["All", "Active", "In Progress", "On Hold"].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white shadow-md ring-2 ring-slate-800/20 ring-offset-1' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ─── KPI Strip ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-110"></div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs z-10">Active Plans</span>
              <div className="flex items-baseline gap-3 mt-5 z-10">
                <span className="text-4xl font-bold text-slate-800 leading-none">{loading ? '…' : kpis.active}</span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full transition-transform group-hover:scale-110"></div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs z-10">Total Pipeline Units</span>
              <div className="flex items-baseline gap-2 mt-5 z-10">
                <span className="text-4xl font-bold text-slate-800 leading-none">{loading ? '…' : kpis.totalQty.toLocaleString()}</span>
                <span className="text-sm font-bold text-slate-400">pcs</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-100/50 rounded-full transition-transform group-hover:scale-110"></div>
              <span className="font-semibold text-red-600 uppercase tracking-wider text-xs flex items-center gap-1.5 z-10">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                High Priority / At Risk
              </span>
              <div className="flex items-baseline gap-2 mt-5 z-10">
                <span className="text-4xl font-bold text-red-600 leading-none">{loading ? '…' : kpis.highRisk}</span>
                <span className="text-sm font-bold text-red-500">needs attention</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-110"></div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs z-10">Avg. Completion</span>
              <div className="mt-5 z-10 w-full">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-4xl font-bold text-slate-800 leading-none">{loading ? '…' : kpis.avgProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${kpis.avgProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Main Two-Column Layout ──────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8 items-start pb-12">

            {/* ─── LEFT: Gantt + Plan List ────────────────────────────── */}
            <div className="xl:col-span-3 flex flex-col gap-8">

              {/* ─── Master Timeline Gantt ─────────────────────────────── */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h2 className="text-lg text-slate-800 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">view_timeline</span>
                    Master Timeline
                  </h2>
                  <div className="flex p-1 bg-slate-100 rounded-lg">
                    {[14, 30].map(d => (
                      <button key={d} onClick={() => setViewDays(d)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                          viewDays === d ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 font-medium">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
                    Loading timeline...
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <div style={{ minWidth: '800px' }}>
                      {/* Date Header */}
                      <div className="flex border-b border-slate-100 bg-slate-50/80">
                        <div className="w-64 shrink-0 px-6 py-3 border-r border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                          Plan / Details
                        </div>
                        <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                          {timelineDays.map((d, i) => {
                            const isToday = i === 0;
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                              <div key={i} className={`py-3 border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center min-w-[48px] ${isWeekend ? 'bg-slate-100/50' : ''}`}>
                                <div className={`text-[10px] font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-400'} uppercase mb-1`}>{d.toLocaleDateString('en-US',{weekday:'short'})}</div>
                                <div className={`text-sm font-bold flex items-center justify-center shrink-0 w-8 h-8 rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
                                  {d.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Plan Rows */}
                      <div className="flex flex-col">
                        {filteredPlans.length === 0 && (
                          <div className="p-12 text-center text-slate-500 font-medium">No plans match your filters.</div>
                        )}
                        {displayedPlans.map((plan, idx) => {
                          const startStr = plan.plannedStartDate || plan.PlannedStartDate;
                          const endStr = plan.plannedCompletionDate || plan.PlannedCompletionDate;
                          const gi = gridCols(startStr, endStr);
                          const stages = plan.stages || plan.Stages || [];
                          const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                          const pct = planProgress(stages);
                          const isDraft = (plan.status || '').toLowerCase() === 'draft';
                          const isDelayed = (plan.priority || '').toLowerCase() === 'high' || plan.status === 'On Hold';

                          return (
                            <div key={plan.planId || idx} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group">
                              {/* Left meta */}
                              <div className="w-64 shrink-0 px-6 py-4 border-r border-slate-100 flex flex-col justify-center gap-1.5 relative">
                                <div className="text-sm font-bold text-slate-800 truncate w-full pr-8 block" title={plan.planId || plan.PlanId}>
                                  {plan.planId || plan.PlanId}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {plan.sourceName || plan.SourceName || 'Internal'}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${style.badge}`}>
                                    {plan.status || plan.Status}
                                  </span>
                                  {isDelayed && (
                                    <span className="material-symbols-outlined text-red-600 font-bold text-[16px]" title="High Priority">error</span>
                                  )}
                                </div>
                                
                                {/* Dropdown Menu for row actions */}
                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu 
                                    trigger={
                                      <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                      </button>
                                    }
                                    items={[
                                      { label: 'Edit Plan', icon: 'edit', onClick: () => console.log('edit') },
                                      { label: 'View Details', icon: 'visibility', onClick: () => setExpandedPlanId(plan.planId || plan.PlanId) },
                                      { label: 'Put On Hold', icon: 'pause', onClick: () => openActionModal('Put On Hold', `Are you sure you want to pause plan ${plan.planId}?`, () => setIsActionModalOpen(false)) },
                                      { label: 'Delete Plan', icon: 'delete', danger: true, onClick: () => openActionModal('Delete Plan', `Are you sure you want to delete plan ${plan.planId}? This action cannot be undone.`, () => setIsActionModalOpen(false)) }
                                    ]}
                                  />
                                </div>
                              </div>

                              {/* Gantt area */}
                              <div className="flex-grow grid relative py-3" style={{ gridTemplateColumns: `repeat(${viewDays}, minmax(0, 1fr))` }}>
                                {/* Grid lines */}
                                {timelineDays.map((td, i) => {
                                  const isWknd = td.getDay()===0||td.getDay()===6;
                                  return <div key={i} className={`border-r border-slate-200/40 last:border-r-0 h-full ${isWknd ? 'bg-slate-50/40' : ''}`}></div>;
                                })}

                                {/* Bar */}
                                {gi && (
                                  <div
                                    className={`absolute top-3 bottom-3 rounded-lg overflow-hidden shadow-sm z-10 group-hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer
                                      ${isDraft ? 'border-2 border-dashed border-slate-300 bg-slate-100' :
                                        isDelayed ? 'border border-red-300 bg-red-50' :
                                        'border border-indigo-200 bg-indigo-50'}`}
                                    style={{ gridColumnStart: gi.start, gridColumnEnd: gi.start + gi.span }}
                                    title={`${plan.planId}: ${startStr} → ${endStr}`}
                                  >
                                    {/* Micro stages */}
                                    <div className="absolute inset-0 flex">
                                      {stages.length > 0 ? stages.map((_s: any, si: number) => (
                                        <div key={si}
                                          style={{ width: `${100/stages.length}%` }}
                                          className={`${STAGE_COLORS[si % STAGE_COLORS.length]} opacity-70 border-r border-white/20 h-full hover:opacity-100 transition-opacity`}
                                        ></div>
                                      )) : (
                                        <div className="w-full h-full bg-indigo-400 opacity-60"></div>
                                      )}
                                    </div>

                                    {/* Progress darken overlay */}
                                    <div className="absolute top-0 left-0 bottom-0 bg-black/10 backdrop-contrast-75 z-10 border-r border-white/40" style={{ width: `${pct}%` }}></div>

                                    {/* Label */}
                                    <div className="absolute inset-0 flex items-center px-3 z-20">
                                      <span className="text-[11px] font-bold text-white drop-shadow-md truncate">
                                        {plan.products?.[0]?.productName || plan.Products?.[0]?.ProductName || 'Production'}
                                        {stages.length > 0 && <span className="ml-2 bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm">{pct}%</span>}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex-wrap">
                        {uniqueStageNames.slice(0, 6).map(([name, colorIdx]) => (
                          <div key={name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <span className={`w-3 h-3 rounded-full ${STAGE_COLORS[colorIdx % STAGE_COLORS.length]} shadow-sm`}></span>
                            {name}
                          </div>
                        ))}
                        {uniqueStageNames.length === 0 && (
                          <span className="text-xs text-slate-500">No stage data available</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Active Plan Cards ──────────────────────────────────── */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg text-slate-800 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">list_alt</span>
                    Active Plan Details
                  </h2>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{filteredPlans.length} active plans {filteredPlans.length > 50 && '(Showing top 50)'}</span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-500 font-medium">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                    Loading...
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">No active production plans match filters.</div>
                ) : (
                  displayedPlans.map((plan, idx) => {
                    const stages = plan.stages || plan.Stages || [];
                    const pct = planProgress(stages);
                    const style = getStatusStyle(plan.status || plan.Status, plan.priority || plan.Priority);
                    const isExpanded = expandedPlanId === (plan.planId || plan.PlanId);
                    const pid = plan.planId || plan.PlanId || plan.id;
                    const products = plan.products || plan.Products || [];
                    const currentTab = activePlanTab[pid] || 'stages';

                    return (
                      <div key={pid || idx} className="border-b border-slate-100 last:border-b-0">
                        {/* ── Plan header row ── */}
                        <div
                          className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => setExpandedPlanId(isExpanded ? null : pid)}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                              isExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-indigo-50/50'
                            }`}>
                              <span className="material-symbols-outlined">assignment</span>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-base truncate max-w-[150px] sm:max-w-xs xl:max-w-[200px]" title={pid}>{pid}</div>
                              <div className="font-medium text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">storefront</span> {plan.sourceName || plan.SourceName || 'Internal'}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">precision_manufacturing</span> {plan.productionLine || plan.ProductionLine || 'Line'}</span>
                              </div>
                              <div className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {adToNepali(plan.plannedStartDate || plan.PlannedStartDate)} → {adToNepali(plan.plannedCompletionDate || plan.PlannedCompletionDate)} (BS)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-4">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style.badge}`}>
                                {plan.status || plan.Status}
                              </span>
                              {(plan.priority === 'High' || plan.priority === 'Urgent') && (
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md border bg-red-600 text-white border-red-700 uppercase tracking-wider animate-pulse shadow-sm">
                                  {plan.priority}
                                </span>
                              )}
                              <div className="flex flex-col items-end gap-1 w-32">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs font-semibold text-slate-600">Progress</span>
                                  <span className="text-xs font-bold text-slate-800">{pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full ${style.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DropdownMenu 
                                trigger={
                                  <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                    <span className="material-symbols-outlined">more_vert</span>
                                  </button>
                                }
                                items={[
                                  { label: 'Edit Plan', icon: 'edit', onClick: () => console.log('edit') },
                                  { label: 'Put On Hold', icon: 'pause', onClick: () => openActionModal('Put On Hold', `Are you sure you want to pause plan ${plan.planId}?`, () => setIsActionModalOpen(false)) },
                                ]}
                              />
                              <button className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                  expand_more
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Expanded content ── */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                            {/* Tab bar */}
                            <div className="flex border-b border-slate-200 px-6 pt-2">
                              {['stages', 'products', 'notes'].map(tab => (
                                <button key={tab}
                                  onClick={() => setActivePlanTab(prev => ({ ...prev, [pid]: tab }))}
                                  className={`px-5 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px flex items-center gap-2 ${
                                    currentTab === tab
                                      ? 'border-indigo-600 text-indigo-600'
                                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  {tab === 'stages' && <span className="material-symbols-outlined text-[18px]">account_tree</span>}
                                  {tab === 'products' && <span className="material-symbols-outlined text-[18px]">inventory_2</span>}
                                  {tab === 'notes' && <span className="material-symbols-outlined text-[18px]">note_alt</span>}
                                  {tab === 'stages' ? 'Process Stages' : tab === 'products' ? `Products (${products.length})` : 'Notes'}
                                </button>
                              ))}
                            </div>

                            <div className="p-6">
                              {/* ── Stages tab ── */}
                              {currentTab === 'stages' && (
                                <div className="relative pl-2">
                                  {/* Connecting line */}
                                  <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200 rounded-full"></div>
                                  <div className="flex flex-col gap-4">
                                    {stages.length === 0 ? (
                                      <p className="text-slate-500 font-medium text-sm text-center py-4 bg-white rounded-xl border border-dashed border-slate-300">No routing stages defined for this plan.</p>
                                    ) : stages.map((stage: any, si: number) => {
                                      const st = stage.status || stage.Status || 'Not Started';
                                      const isCompleted = st === 'Completed';
                                      const isActive = st === 'Active' || st === 'In Progress';
                                      const isOnHold = st === 'On Hold';
                                      return (
                                        <div key={si} className="flex items-start gap-5 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative z-10 ml-6 group">
                                          <div className={`absolute -left-9 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 bg-white transition-all ${
                                            isCompleted ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' :
                                            isActive ? 'border-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.15)] animate-pulse' :
                                            isOnHold ? 'border-orange-500' :
                                            'border-slate-300'
                                          }`}>
                                            {isCompleted && <span className="material-symbols-outlined text-emerald-500 text-[14px]">check</span>}
                                            {isActive && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>}
                                            {isOnHold && <span className="material-symbols-outlined text-orange-500 text-[14px]">pause</span>}
                                            {!isCompleted && !isActive && !isOnHold && (
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            )}
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <span className={`text-base font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                  {stage.stageName || stage.StageName || stage.name}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${STAGE_LIGHT[si % STAGE_LIGHT.length]}`}>
                                                  {stage.workCenter || stage.WorkCenter}
                                                </span>
                                                {isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase tracking-wider animate-pulse">ACTIVE</span>}
                                              </div>
                                              
                                              <DropdownMenu 
                                                trigger={
                                                  <button className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                                  </button>
                                                }
                                                items={[
                                                  { label: 'Update Status', icon: 'update', onClick: () => console.log('update status') }
                                                ]}
                                              />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Operator</div>
                                                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                                  {stage.operator || stage.Operator || 'Unassigned'}
                                                </div>
                                              </div>
                                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Output</div>
                                                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                                                  {stage.completedQty || stage.CompletedQty || 0} pcs
                                                </div>
                                              </div>
                                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Rejected</div>
                                                <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                                                  {stage.rejectedQty || stage.RejectedQty || 0} pcs
                                                </div>
                                              </div>
                                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Timeline (BS)</div>
                                                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                                                  {adToNepali(stage.plannedStartDate || stage.PlannedStartDate)}
                                                  {(stage.plannedEndDate || stage.PlannedEndDate) && ` - ${adToNepali(stage.plannedEndDate || stage.PlannedEndDate)}`}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* ── Products tab ── */}
                              {currentTab === 'products' && (
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
                                  {products.length === 0 ? (
                                    <div className="col-span-full py-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 font-medium">No products listed.</div>
                                  ) : (
                                    products.map((prod: any, pi: number) => (
                                      <div key={pi} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100">
                                          <span className="material-symbols-outlined text-indigo-400 text-[28px]">checkroom</span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-bold text-slate-800 text-base mb-1">{prod.productName || prod.ProductName}</div>
                                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                              <span className="text-slate-500">Code:</span>
                                              <span className="font-semibold text-slate-700">{prod.productCode || prod.ProductCode}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                              <span className="text-slate-500">Variant:</span>
                                              <span className="font-semibold text-slate-700">{prod.variant || prod.Variant || '—'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                              <span className="text-slate-500">Total Qty:</span>
                                              <span className="font-semibold text-indigo-600">{prod.quantity || prod.Quantity} pcs</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                              <span className="text-slate-500">Due (BS):</span>
                                              <span className="font-semibold text-slate-700">{adToNepali(prod.requiredDate || prod.RequiredDate)}</span>
                                            </div>
                                          </div>
                                          
                                          {(prod.sizes || prod.Sizes || []).length > 0 && (
                                            <div className="mt-3">
                                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Size Breakdown</div>
                                              <div className="flex gap-2 flex-wrap">
                                                {(prod.sizes || prod.Sizes).map((sz: any, si: number) => (
                                                  <div key={si} className="text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 flex gap-2">
                                                    <span className="font-bold text-slate-700">{sz.size || sz.Size}</span>
                                                    <span className="text-slate-400">|</span>
                                                    <span className="font-medium text-slate-600">{sz.quantity || sz.Quantity}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}

                              {/* ── Notes tab ── */}
                              {currentTab === 'notes' && (
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <label className="block font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">edit_note</span>
                                    Production Notes & Remarks
                                  </label>
                                  <textarea
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-sm resize-none transition-all"
                                    placeholder="Add operational notes, shift handover remarks, or quality alerts..."
                                    value={noteMap[pid] ?? (plan.productionNotes || plan.ProductionNotes || '')}
                                    onChange={e => setNoteMap(prev => ({ ...prev, [pid]: e.target.value }))}
                                  />
                                  <div className="flex justify-end mt-4">
                                    <button
                                      onClick={() => openActionModal('Save Notes', 'Notes saved successfully.', () => setIsActionModalOpen(false))}
                                      className="px-5 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">save</span>
                                      Save Notes
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─── RIGHT: Work Centers + Recent Processes ──────────────── */}
            <div className="xl:col-span-1 flex flex-col gap-8">

              {/* Work Center Load */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">factory</span>
                    Work Center Load
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  {loading ? (
                    <div className="text-slate-400 text-sm text-center py-4 font-medium">Loading...</div>
                  ) : workCenters.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-4 font-medium">No work centers found.</div>
                  ) : workCenters.map((wc, i) => {
                    const name = wc.name || wc.Name || '';
                    const type = wc.type || wc.Type || '';
                    const status = wc.status || wc.Status || '';
                    const loadPct = Math.min(95, 30 + name.length * 5);
                    const isHigh = loadPct > 80;
                    return (
                      <div key={wc.id || wc.Id || i} className="flex items-center gap-4 group cursor-default">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          isHigh ? 'bg-orange-50 border border-orange-100 text-orange-500 group-hover:bg-orange-100' : 'bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-slate-100'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {type === 'Machine' ? 'precision_manufacturing' : type === 'QC Station' ? 'fact_check' : 'hardware'}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-bold text-slate-800 truncate pr-2">{name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isHigh ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{loadPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isHigh ? 'bg-orange-500' : 'bg-indigo-500'}`} style={{ width: `${loadPct}%` }}></div>
                          </div>
                          <div className={`text-[10px] font-medium mt-1.5 flex items-center gap-1 uppercase tracking-wide ${status === 'Available' ? 'text-emerald-600' : 'text-orange-500'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {status} <span className="text-slate-300 normal-case tracking-normal px-1">&bull;</span> <span className="text-slate-500">{type}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shift Allocation */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">groups</span>
                    Shift Allocation
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  {[
                    { label: 'Shift 1 (Morning)', active: 22, total: 25, color: 'bg-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Shift 2 (Day)',     active: 24, total: 25, color: 'bg-orange-400', bg: 'bg-orange-50' },
                    { label: 'Shift 3 (Night)',   active: 8,  total: 15, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                  ].map((s, i) => (
                    <div key={i} className="group cursor-default">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{s.label}</span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{s.active}/{s.total} Active</span>
                      </div>
                      <div className={`w-full h-2.5 ${s.bg} rounded-full overflow-hidden shadow-inner`}>
                        <div className={`h-full rounded-full ${s.color} transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${(s.active/s.total)*100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Production Processes */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">history</span>
                    Recent Activity
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="text-slate-400 text-sm text-center py-4 font-medium">Loading...</div>
                  ) : recentStages.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-4 font-medium">No process data.</div>
                  ) : recentStages.map((rs, i) => {
                    const isActive = rs.status === 'Active' || rs.status === 'In Progress';
                    const isCompleted = rs.status === 'Completed';
                    const isHold = rs.status === 'On Hold';
                    return (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-default group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isCompleted ? 'bg-emerald-100 group-hover:bg-emerald-200' : isActive ? 'bg-indigo-100 group-hover:bg-indigo-200' : isHold ? 'bg-orange-100 group-hover:bg-orange-200' : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}>
                          <span className={`material-symbols-outlined text-[16px] ${
                            isCompleted ? 'text-emerald-600' : isActive ? 'text-indigo-600' : isHold ? 'text-orange-600' : 'text-slate-400'
                          }`}>
                            {isCompleted ? 'check_circle' : isActive ? 'sync' : isHold ? 'pause_circle' : 'radio_button_unchecked'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate mb-0.5">{rs.stageName}</div>
                          <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 mb-1.5">
                            <span className="material-symbols-outlined text-[12px]">build</span> {rs.workCenter} 
                            <span className="text-slate-300">&bull;</span> {rs.planNo}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' :
                            isHold ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
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
      </PageShell>
      
      {/* ─── Modals ──────────────────────────────────────────────────────────── */}
      
      {/* New Plan Modal */}
      <Modal 
        isOpen={isNewPlanModalOpen} 
        onClose={() => setIsNewPlanModalOpen(false)}
        title="Create New Production Plan"
        footer={
          <>
            <button 
              onClick={() => setIsNewPlanModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { setIsNewPlanModalOpen(false); alert("Plan created!"); }}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
            >
              Create Plan
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plan Source / Reference</label>
            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Order #1002" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Production Line</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white">
              <option>Main Line 1</option>
              <option>Assembly Line A</option>
              <option>Packaging Station</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="priority" className="text-indigo-600 focus:ring-indigo-500" defaultChecked /> Normal</label>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="priority" className="text-orange-500 focus:ring-orange-500" /> High</label>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="priority" className="text-red-600 focus:ring-red-600" /> Urgent</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" placeholder="Any initial remarks..."></textarea>
          </div>
        </div>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal 
        isOpen={isActionModalOpen} 
        onClose={() => setIsActionModalOpen(false)}
        title={actionModalContent.title}
        footer={
          <>
            <button 
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={actionModalContent.onConfirm}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-slate-600 font-medium">{actionModalContent.message}</p>
      </Modal>

    </>
  );
}
