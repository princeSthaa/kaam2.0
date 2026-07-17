"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";
import Script from 'next/script';
import styles from './page.module.css';
import { ProductionDashboard } from './Component/ProductionDashboard';

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
  const [visibleCount, setVisibleCount] = useState(5);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState<any>({
    kind: 'confirm',
    title: 'Action',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => setIsActionModalOpen(false),
  });

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
      const productName = p.products?.[0]?.productName || p.Products?.[0]?.ProductName || '';
      const matchSearch = (p.planId || p.PlanId || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sourceName || p.SourceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || (p.status || p.Status) === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  const displayedPlans = useMemo(() => filteredPlans.slice(0, visibleCount), [filteredPlans, visibleCount]);

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

  const openActionModal = (config: any) => {
    setActionModalContent({
      kind: 'confirm',
      title: 'Action',
      message: '',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      onConfirm: () => setIsActionModalOpen(false),
      ...config,
    });
    setIsActionModalOpen(true);
  };

  const actionModalFooter = actionModalContent.kind === 'details' ? (
    <button
      onClick={() => setIsActionModalOpen(false)}
      className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
    >
      Close
    </button>
  ) : (
    <>
      <button
        onClick={() => setIsActionModalOpen(false)}
        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
      >
        {actionModalContent.cancelLabel || 'Cancel'}
      </button>
      <button
        onClick={() => {
          actionModalContent.onConfirm?.();
          setIsActionModalOpen(false);
        }}
        className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${actionModalContent.kind === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {actionModalContent.confirmLabel || 'Confirm'}
      </button>
    </>
  );

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
        onLoad={() => setNepaliReady(true)}
      />

      <AppHeader pathname={pathname} />
      <PageShell sidebar={<Sidebar section="production" pathname={pathname} />} contentClassName="bg-slate-50/50 min-h-screen">
        <div className="flex-1 flex flex-col gap-6 max-w-[1600px] mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500">

          {/* ─── New Embedded Production Dashboard ───────────────────────────────────────── */}
          <div>
            <ProductionDashboard />
          </div>

          {/* ─── Main Content ──────────────────────────────────── */}
          <div className="flex flex-col gap-6 md:gap-8 items-stretch pb-12 w-full">

              {/* ─── Active Plan Cards ──────────────────────────────────── */}
              <div className={`${styles.overviewCard} w-full`}>
                <div className="px-7 md:px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg text-slate-800 font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-500">list_alt</span>
                      Active Plan Details
                    </h2>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{filteredPlans.length} active plans</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Search plans..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                    </div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
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
                          className="flex items-center justify-between px-7 md:px-8 py-5 cursor-pointer hover:bg-slate-50 transition-colors group"
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
                                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors pointer-events-auto">
                                    <span className="material-symbols-outlined">more_vert</span>
                                  </button>
                                }
                                items={[
                                  { label: 'Edit Plan', icon: 'edit', onClick: () => openActionModal({
                                    kind: 'edit',
                                    title: `Edit ${plan.planId || plan.PlanId}`,
                                    plan,
                                    confirmLabel: 'Save Changes',
                                    message: 'Update the production plan details below.'
                                  }) },
                                  { label: 'Put On Hold', icon: 'pause', onClick: () => openActionModal({
                                    kind: 'confirm',
                                    title: 'Put Plan On Hold',
                                    message: `Are you sure you want to pause plan ${plan.planId || plan.PlanId}?`,
                                    confirmLabel: 'Confirm Hold',
                                    onConfirm: () => console.log('Plan put on hold', plan.planId || plan.PlanId)
                                  }) },
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
                                      onClick={() => openActionModal({
                                        kind: 'confirm',
                                        title: 'Save Notes',
                                        message: 'Notes saved successfully.',
                                        confirmLabel: 'Done',
                                        onConfirm: () => setIsActionModalOpen(false)
                                      })}
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
                {filteredPlans.length > visibleCount && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 5)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      Load More Plans
                    </button>
                  </div>
                )}
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

      {/* Action Modal */}
      <Modal 
        isOpen={isActionModalOpen} 
        onClose={() => setIsActionModalOpen(false)}
        title={actionModalContent.title}
        footer={actionModalFooter}
      >
        {actionModalContent.kind === 'details' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Plan Reference</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{actionModalContent.plan?.planId || actionModalContent.plan?.PlanId || 'Unknown Plan'}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {actionModalContent.plan?.status || actionModalContent.plan?.Status || 'Active'}
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source</p>
                <p className="mt-1 font-semibold text-slate-800">{actionModalContent.plan?.sourceName || actionModalContent.plan?.SourceName || 'Internal'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Line</p>
                <p className="mt-1 font-semibold text-slate-800">{actionModalContent.plan?.productionLine || actionModalContent.plan?.ProductionLine || 'Main Line'}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Planning Window</p>
              <p className="mt-1 font-semibold text-slate-800">
                {actionModalContent.plan?.plannedStartDate || actionModalContent.plan?.PlannedStartDate || '—'} → {actionModalContent.plan?.plannedCompletionDate || actionModalContent.plan?.PlannedCompletionDate || '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {actionModalContent.plan?.notes || actionModalContent.plan?.Notes || 'No additional notes were provided for this plan.'}
              </p>
            </div>
          </div>
        ) : actionModalContent.kind === 'edit' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{actionModalContent.message}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>Active</option>
                  <option>In Progress</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Priority</label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
              <textarea rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" defaultValue={actionModalContent.plan?.notes || actionModalContent.plan?.Notes || ''} />
            </div>
          </div>
        ) : (
          <p className="text-slate-600 font-medium">{actionModalContent.message}</p>
        )}
      </Modal>

    </>
  );
}
