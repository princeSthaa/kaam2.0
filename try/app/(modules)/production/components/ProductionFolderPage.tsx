"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SummaryCard } from "@/app/components/ui/SummaryCard";
import { fetchProductionPlans } from "../api/production.api";
import { ProductionPlan } from "../dto/production.dto";

type ProductionFolderConfig = {
  folder: "drafts" | "in-progress" | "completed";
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  primarySummaryLabel: string;
  selectable?: boolean;
  actions: Array<{ href: string; label: string; variant: "primary" | "light" }>;
};

const folderConfigs: Record<string, ProductionFolderConfig> = {
  drafts: {
    folder: "drafts",
    title: "Production Drafts",
    subtitle: "Unconfirmed production plans waiting for review.",
    searchPlaceholder: "Search drafts",
    primarySummaryLabel: "Draft Plans",
    selectable: true,
    actions: [
      { href: "/production/demands", label: "Create Production Plan", variant: "primary" },
      { href: "/production", label: "Overview", variant: "light" },
    ],
  },
  "in-progress": {
    folder: "in-progress",
    title: "Production In Progress",
    subtitle: "Plans currently moving through production stages.",
    searchPlaceholder: "Search in progress",
    primarySummaryLabel: "In Progress",
    actions: [
      { href: "/production/plans", label: "View All Plans", variant: "light" },
      { href: "/production", label: "Overview", variant: "light" },
    ],
  },
  completed: {
    folder: "completed",
    title: "Completed Production",
    subtitle: "Finished plans ready for the next business step.",
    searchPlaceholder: "Search completed",
    primarySummaryLabel: "Completed Plans",
    actions: [
      { href: "/production/plans", label: "View All Plans", variant: "light" },
      { href: "/production", label: "Overview", variant: "light" },
    ],
  },
};

function getPlanIcon(plan: ProductionPlan) {
  const status = String(plan.status || "").toLowerCase();
  const demandType = String(plan.demandSource || "").toLowerCase();

  if (status === "draft") return "edit_note";
  if (status === "completed") return "task_alt";
  if (demandType.includes("customer")) return "person";
  if (demandType.includes("outlet")) return "storefront";
  if (demandType.includes("house") || demandType.includes("stock")) return "inventory_2";

  return "precision_manufacturing";
}

function getEmptyIcon(folder: string) {
  if (folder === "completed") return "task_alt";
  if (folder === "in-progress") return "precision_manufacturing";
  return "edit_note";
}

function getEmptyTitle(folder: string) {
  if (folder === "completed") return "No completed plans";
  if (folder === "in-progress") return "No in-progress plans";
  return "No drafts found";
}

function getEmptyText(folder: string) {
  if (folder === "completed") return "Completed production plans will appear here.";
  if (folder === "in-progress") return "Plans that have left Draft status will appear here.";
  return "Plans added from Customer, Outlet, or In-house create screens will appear here.";
}

export function ProductionFolderPage({ folder }: { folder: keyof typeof folderConfigs }) {
  const config = folderConfigs[folder];
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProductionPlans().then(data => {
      let filtered = data.filter(p => {
        if (folder === "drafts") return p.status === "Draft";
        if (folder === "completed") return p.status === "Completed";
        return p.status !== "Draft" && p.status !== "Completed" && p.status !== "Cancelled";
      });
      
      filtered.sort((a, b) => {
        const dateA = new Date(a.startDate || 0).getTime();
        const dateB = new Date(b.startDate || 0).getTime();
        return dateB - dateA;
      });

      setPlans(filtered);
      setLoading(false);
    }).catch(console.error);
  }, [folder]);

  const filteredPlans = useMemo(() => {
    return plans.filter(p => 
      !search || 
      [p.planNumber, p.title, p.demandSource, p.status].join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [plans, search]);

  const totalQty = useMemo(() => filteredPlans.reduce((acc, p) => acc + p.totalQuantity, 0), [filteredPlans]);
  const demandCount = useMemo(() => new Set(filteredPlans.map(p => p.demandSource)).size, [filteredPlans]);
  
  const urgentCount = useMemo(() => filteredPlans.filter(p => p.priority === "Urgent" || p.priority === "High").length, [filteredPlans]);
  const holdCount = useMemo(() => filteredPlans.filter(p => p.status === "On Hold" || p.status === "Cancelled" || p.status === "Risk").length, [filteredPlans]);
  const overallCompletion = useMemo(() => {
    if (filteredPlans.length === 0) return 0;
    const sum = filteredPlans.reduce((acc, p) => acc + (p.progress || 0), 0);
    return Math.round(sum / filteredPlans.length);
  }, [filteredPlans]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredPlans.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const statusClass = (status: string) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="pp-page">
      <div className="pp-page-header">
        <div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <div className="pp-header-actions">
          {config.actions.map((action) => (
            <Link key={action.href} href={action.href} className={`btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-light'}`}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {folder === "in-progress" && (
        <div className="pp-summary-grid mb-4" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
          <SummaryCard label="Active Plans" value={filteredPlans.length} hint="Currently running" />
          <SummaryCard label="Total Units" value={totalQty.toLocaleString()} hint="Planned items" />
          <SummaryCard label="Urgent/Critical" value={urgentCount} hint="High priority plans" />
          <SummaryCard label="On Hold/Blocked" value={holdCount} hint="Needs attention" />
          <SummaryCard label="Overall Completion" value={`${overallCompletion}%`} hint="Average progress" />
        </div>
      )}

      <div className="pp-card">
        <div className="pp-card-header inner" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', padding: '16px 20px', borderBottom: '1px solid var(--pp-border)' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--pp-muted)' }}>search</span>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '40px' }} 
              placeholder={config.searchPlaceholder} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          {config.selectable && selectedIds.size > 0 && (
            <button className="btn btn-outline" style={{ color: 'var(--pp-red)', borderColor: 'var(--pp-red)' }}>
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Delete Selected
            </button>
          )}

          {config.selectable && (
             <button className="btn btn-light" disabled>
               Clear All Drafts
             </button>
          )}
        </div>

        <div className="pp-detail-summary-grid border-b border-[var(--pp-border)]">
          <div className="summary-box">
            <span>{config.primarySummaryLabel}</span>
            <strong id="folderPlanCount">{filteredPlans.length}</strong>
          </div>
          <div className="summary-box">
            <span>Total Qty</span>
            <strong id="folderTotalQty">{totalQty.toLocaleString()}</strong>
          </div>
          <div className="summary-box">
            <span>Demand Sources</span>
            <strong id="folderDemandCount">{demandCount}</strong>
          </div>
        </div>

        <div id="folderPlanList" style={{ background: '#f8fafc', padding: '0', minHeight: '300px' }}>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="draft-empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--pp-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--pp-border-strong)', marginBottom: '16px' }}>{getEmptyIcon(folder)}</span>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--pp-text)', marginBottom: '8px' }}>{getEmptyTitle(folder)}</strong>
                <p>{getEmptyText(folder)}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {config.selectable && (
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--pp-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="selectAllDrafts"
                    checked={selectedIds.size === filteredPlans.length && filteredPlans.length > 0} 
                    onChange={handleSelectAll} 
                  />
                  <label htmlFor="selectAllDrafts" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--pp-muted)', cursor: 'pointer' }}>Select All</label>
                </div>
              )}
              
              {filteredPlans.map(plan => (
                <article key={plan.id} className={`folder-plan-row ${selectedIds.has(plan.id) ? "selected" : ""}`} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--pp-border)',
                  background: selectedIds.has(plan.id) ? 'var(--pp-primary-soft)' : '#fff',
                  transition: 'background 0.2s'
                }}>
                  {config.selectable && (
                    <div className="folder-plan-checkbox">
                        <input 
                          type="checkbox" 
                          className="plan-row-checkbox" 
                          checked={selectedIds.has(plan.id)}
                          onChange={() => toggleSelect(plan.id)}
                        />
                    </div>
                  )}

                  <span className="material-symbols-outlined folder-plan-icon" style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--pp-surface-soft)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pp-muted)',
                    border: '1px solid var(--pp-border)'
                  }}>
                    {getPlanIcon(plan)}
                  </span>

                  <div className="folder-plan-main" style={{ flex: '1', minWidth: '0' }}>
                      <div className="folder-plan-subject" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--pp-text)' }}>{plan.planNumber}</strong>
                          <span className={`status-badge ${statusClass(plan.status)}`}>{plan.status}</span>
                          <em style={{ fontStyle: 'normal', fontSize: '12px', color: 'var(--pp-muted)', fontWeight: 'bold', marginLeft: 'auto' }}>{plan.demandSource}</em>
                      </div>

                      <p style={{ margin: '0', fontSize: '13px', color: 'var(--pp-text)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--pp-muted)', fontWeight: 'bold' }}>{plan.demandSource}</span>
                          {plan.title} - {plan.totalQuantity.toLocaleString()} pcs
                      </p>
                  </div>

                  <time className="folder-plan-date" style={{ color: 'var(--pp-muted)', fontSize: '13px', fontWeight: 'bold', width: '100px', textAlign: 'right' }}>
                    {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}
                  </time>

                  <div className="folder-plan-actions" style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      {folder === "drafts" ? (
                        <>
                          <Link className="btn btn-primary btn-sm" href={`/production/plans/${plan.id}`}>Details</Link>
                          <Link className="btn btn-light btn-sm" href={`/production/plans/${plan.id}/edit`}>Edit</Link>
                        </>
                      ) : (
                        <>
                          <Link className="btn btn-light btn-sm" href={`/production/plans/${plan.id}`}>Details</Link>
                        </>
                      )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
