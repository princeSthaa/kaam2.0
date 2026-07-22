"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/app/components/AppHeader";
import { PageShell } from "@/app/components/ui/PageShell";
import { Sidebar } from "@/app/components/Sidebar";
import "./responsive.css";

export default function ProductionDraftsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPlans(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const drafts = useMemo(() => {
    return plans.filter((p) => String(p.status || "").toLowerCase() === "draft");
  }, [plans]);

  const filteredDrafts = useMemo(() => {
    if (!searchQuery) return drafts;
    const lowerQ = searchQuery.toLowerCase();
    return drafts.filter((p) => {
      const id = String(p.planNo || p.planId || p.id);
      return id.toLowerCase().includes(lowerQ) || String(p.demandType || "").toLowerCase().includes(lowerQ);
    });
  }, [drafts, searchQuery]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedPlanIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlanIds(next);
  };

  const toggleAll = () => {
    if (selectedPlanIds.size === filteredDrafts.length && filteredDrafts.length > 0) {
      setSelectedPlanIds(new Set());
    } else {
      setSelectedPlanIds(new Set(filteredDrafts.map((d) => String(d.planNo || d.planId || d.id))));
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedPlanIds.size} selected plan(s)?`)) return;
    
    // Simulate deleting from backend
    for (const id of Array.from(selectedPlanIds)) {
        try {
            await fetch(`http://localhost:5083/api/production-plans/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error(e);
        }
    }
    
    setPlans(prev => prev.filter(p => !selectedPlanIds.has(String(p.planNo || p.planId || p.id))));
    setSelectedPlanIds(new Set());
  };
  
  const activatePlan = (planId: string) => {
    window.confirm(`Activate plan ${planId}?`);
  }

  const totalQty = useMemo(() => {
    return filteredDrafts.reduce((sum, plan) => {
      const products = plan.products || plan.Products || [];
      return sum + products.reduce((ps: number, p: any) => ps + (p.quantity || p.Quantity || 0), 0);
    }, 0);
  }, [filteredDrafts]);

  const uniqueDemands = new Set(filteredDrafts.map((d) => d.demandType || d.DemandType || "Unassigned")).size;

  return (
    <>
      <AppHeader pathname="/Production/Drafts" />
      <PageShell sidebar={<Sidebar section="production" pathname="/Production/Drafts" />}>
        <div className="pp-page production-folder-page" data-production-folder="drafts" style={{ flex: 1 }}>
          <div className="pp-page-header">
          <div>
            <h1>Production Drafts</h1>
            <p>Unconfirmed production plans waiting for review.</p>
          </div>
          <div className="pp-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <Link href="/Production/Create" className="btn btn-primary">
              Create Production Plan
            </Link>
            <Link href="/Production/Index" className="btn btn-light">
              Overview
            </Link>
          </div>
        </div>

        <div className="pp-card production-folder-card">
          <div className="folder-page-toolbar">
            <div className="folder-search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search drafts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search drafts"
              />
            </div>
            <div className="folder-actions">
              {selectedPlanIds.size > 0 && (
                <button
                  type="button"
                  id="deleteSelectedBtn"
                  className="btn"
                  style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' }}
                  onClick={deleteSelected}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete Selected
                </button>
              )}
            </div>
          </div>

          <div className="folder-summary-strip">
            <div>
              <span>Draft Plans</span>
              <strong>{filteredDrafts.length}</strong>
            </div>
            <div>
              <span>Total Qty</span>
              <strong>{totalQty.toLocaleString()}</strong>
            </div>
            <div>
              <span>Demand Sources</span>
              <strong>{uniqueDemands}</strong>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <div className="folder-list-header">
              <div className="header-checkbox">
                <input
                  type="checkbox"
                  aria-label="Select all drafts"
                  checked={selectedPlanIds.size === filteredDrafts.length && filteredDrafts.length > 0}
                  onChange={toggleAll}
                />
              </div>
              <div className="header-icon"></div>
              <div className="header-info">Plan Details</div>
              <div className="header-date">Last Edited</div>
              <div className="header-actions">Actions</div>
            </div>

            <div id="folderPlanList" className="folder-plan-list">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                   Loading drafts...
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>draft</span>
                    <strong style={{ display: 'block', fontSize: '18px', color: '#111827' }}>No drafts found</strong>
                    <p>There are no draft plans matching your search criteria.</p>
                </div>
              ) : (
                filteredDrafts.map((plan) => {
                  const planNo = plan.planNo || plan.planId || plan.id;
                  const status = plan.status || "Draft";
                  const isSelected = selectedPlanIds.has(String(planNo));
                  const rowDate = plan.lastEditedAt || plan.plannedStartDate || Date.now();
                  const encodedPlanNo = encodeURIComponent(planNo);
                  const detailsUrl = `/Production/Plan/Details?planNo=${encodedPlanNo}`;
                  const editUrl = `/Production/Plan/Edit?planNo=${encodedPlanNo}`;

                  // Calculate product summary text
                  const products = plan.products || plan.Products || [];
                  const productSummary = products.length > 0 ? products[0].productName || "Various Products" : "No products";

                  return (
                    <article key={planNo} className={`folder-plan-row ${isSelected ? 'selected' : ''}`}>
                      <div className="folder-plan-checkbox">
                        <input
                          type="checkbox"
                          className="plan-row-checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(String(planNo))}
                        />
                      </div>

                      <span className="material-symbols-outlined folder-plan-icon">draft</span>

                      <div className="folder-plan-main">
                        <div className="folder-plan-subject">
                          <strong>{planNo}</strong>
                          <span className="status-badge status-draft">{status}</span>
                          <em>{plan.demandType || "Production"}</em>
                        </div>

                        <p>
                          <span style={{fontWeight: 600, marginRight: '4px'}}>{plan.sourceName || "Production Source"}</span>
                          {productSummary} - {products.reduce((acc: number, p: any) => acc + (p.quantity || p.Quantity || 0), 0)} pcs
                        </p>
                      </div>

                      <time className="folder-plan-date">
                        {new Date(rowDate).toLocaleDateString()}
                      </time>

                      <div className="folder-plan-actions">
                        <Link href={detailsUrl} className="btn btn-primary btn-sm">Details</Link>
                        <Link href={editUrl} className="btn btn-light btn-sm">Edit</Link>
                        <button type="button" className="btn btn-success btn-sm font-bold" onClick={() => activatePlan(planNo)}>Activate</button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  </>
);
}
