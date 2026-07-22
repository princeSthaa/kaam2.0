"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import "../plans/production-plans.css";

export default function ProductionDraftsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [demandFilter, setDemandFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDrafts = () => {
    setLoading(true);
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data);
        }
      })
      .catch((err) => {
        console.error("Error loading production plans:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const showNotify = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const drafts = useMemo(() => {
    return plans.filter((p) => {
      const st = String(p.status ?? "").toLowerCase();
      return st === "draft" || st === "0";
    });
  }, [plans]);

  const filteredDrafts = useMemo(() => {
    let result = [...drafts];

    if (demandFilter) {
      const dLower = demandFilter.toLowerCase();
      result = result.filter((p) => {
        const dt = String(p.demandType || "").toLowerCase();
        return dt.includes(dLower) || dLower.includes(dt);
      });
    }

    if (priorityFilter) {
      const pLower = priorityFilter.toLowerCase();
      result = result.filter((p) => {
        const prio = String(p.priority || "").toLowerCase();
        return prio === pLower;
      });
    }

    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const id = String(p.planNo || p.planId || p.id || "").toLowerCase();
        const name = String(p.planName || "").toLowerCase();
        const src = String(p.sourceName || "").toLowerCase();
        const prod = String(p.productName || "").toLowerCase();
        return id.includes(lowerQ) || name.includes(lowerQ) || src.includes(lowerQ) || prod.includes(lowerQ);
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.planDate || a.plannedStartDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.planDate || b.plannedStartDate || 0).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [drafts, searchQuery, demandFilter, priorityFilter, sortOrder]);

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
    if (!selectedPlanIds.size) return;
    if (!window.confirm(`Delete ${selectedPlanIds.size} selected draft plan(s)?`)) return;

    const idsToDelete = Array.from(selectedPlanIds);
    let successCount = 0;

    for (const id of idsToDelete) {
      try {
        const res = await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (res.ok) successCount++;
      } catch (e) {
        console.error("Delete failed for plan:", id, e);
      }
    }

    setPlans((prev) => prev.filter((p) => !selectedPlanIds.has(String(p.planNo || p.planId || p.id))));
    setSelectedPlanIds(new Set());
    showNotify(`Successfully deleted ${successCount} draft plan(s).`);
  };

  const deleteSinglePlan = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete draft plan ${id}?`)) return;

    try {
      const res = await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => String(p.planNo || p.planId || p.id) !== String(id)));
        showNotify(`Draft plan ${id} deleted successfully.`);
      } else {
        showNotify(`Failed to delete plan ${id}.`, "error");
      }
    } catch (e) {
      console.error(e);
      showNotify(`Error connecting to server.`, "error");
    }
  };

  const activatePlan = async (id: string) => {
    if (!window.confirm(`Activate draft plan ${id} into active production workflow?`)) return;

    try {
      const res = await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(id)}/activate`, {
        method: "POST",
      });

      if (res.ok) {
        setPlans((prev) => prev.filter((p) => String(p.planNo || p.planId || p.id) !== String(id)));
        showNotify(`Draft plan ${id} has been activated successfully!`);
      } else {
        // Fallback update call if endpoint not present
        const updateRes = await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 1 }),
        });
        if (updateRes.ok) {
          setPlans((prev) => prev.filter((p) => String(p.planNo || p.planId || p.id) !== String(id)));
          showNotify(`Draft plan ${id} activated.`);
        } else {
          showNotify(`Failed to activate plan ${id}.`, "error");
        }
      }
    } catch (e) {
      console.error(e);
      showNotify("Failed to communicate with server.", "error");
    }
  };

  const totalQty = useMemo(() => {
    return filteredDrafts.reduce((sum, plan) => {
      const products = plan.productionPlanProducts || plan.products || [];
      const pcs = products.reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0), 0);
      return sum + (pcs || Number(plan.quantity) || Number(plan.totalQuantity) || 0);
    }, 0);
  }, [filteredDrafts]);

  const uniqueDemands = new Set(filteredDrafts.map((d) => d.demandType || "Unassigned")).size;

  return (
    <div className="pp-page production-folder-page" data-production-folder="drafts" style={{ flex: 1 }}>
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: notification.type === "success" ? "#dcfce7" : "#fef2f2",
            color: notification.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${notification.type === "success" ? "#86efac" : "#fca5a5"}`,
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span className="material-symbols-outlined">{notification.type === "success" ? "check_circle" : "error"}</span>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="pp-page-header">
        <div>
          <h1>Production Drafts</h1>
          <p>Unconfirmed production plans waiting for review and approval.</p>
        </div>
        <div className="pp-header-actions" style={{ display: "flex", gap: "10px" }}>
          <Link href="/production/demands" className="btn btn-primary font-bold">
            + Create Production Plan
          </Link>
          <Link href="/production/plans" className="btn btn-light font-bold">
            Overview
          </Link>
        </div>
      </div>

      <div className="pp-card production-folder-card">
        {/* Toolbar & Filter Bar */}
        <div className="folder-page-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", flex: 1, minWidth: "280px" }}>
            <div className="folder-search" style={{ position: "relative", display: "flex", alignItems: "center", minWidth: "220px", flex: 1 }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", color: "#64748b", fontSize: "20px" }}>search</span>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: "38px", height: "38px", fontSize: "13px" }}
                placeholder="Search plan ID, name, or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search drafts"
              />
            </div>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "150px", height: "38px", fontSize: "13px" }}
              value={demandFilter}
              onChange={(e) => setDemandFilter(e.target.value)}
            >
              <option value="">All Demand Types</option>
              <option value="Customer Order">Customer Order</option>
              <option value="Outlet Replenishment">Outlet Replenishment</option>
              <option value="In-house Stock">In-house Stock</option>
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "140px", height: "38px", fontSize: "13px" }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="Critical">Critical Priority</option>
            </select>

            <select
              className="form-control"
              style={{ width: "auto", minWidth: "130px", height: "38px", fontSize: "13px" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="folder-actions">
            {selectedPlanIds.size > 0 && (
              <button
                type="button"
                className="btn font-bold"
                style={{ backgroundColor: "#fef2f2", color: "#b91c1c", borderColor: "#fca5a5", height: "38px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={deleteSelected}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                Delete Selected ({selectedPlanIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats Strip */}
        <div className="folder-summary-strip">
          <div>
            <span>Draft Plans</span>
            <strong>{filteredDrafts.length}</strong>
          </div>
          <div>
            <span>Total Qty</span>
            <strong>{totalQty.toLocaleString()} pcs</strong>
          </div>
          <div>
            <span>Demand Sources</span>
            <strong>{uniqueDemands}</strong>
          </div>
        </div>

        {/* Folder Plan Table / List */}
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
              <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                <div className="spinner-border text-primary mb-12" role="status" style={{ width: "2rem", height: "2rem" }}></div>
                <p className="m-0 fs-14 font-medium">Loading draft production plans...</p>
              </div>
            ) : filteredDrafts.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "12px" }}>
                  draft
                </span>
                <strong style={{ display: "block", fontSize: "18px", color: "#1e293b", marginBottom: "4px" }}>
                  No draft plans found
                </strong>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                  There are no draft production plans matching your current filter criteria.
                </p>
              </div>
            ) : (
              filteredDrafts.map((plan, idx) => {
                const planNo = plan.planNo || plan.planId || plan.id;
                const uniqueKey = `${plan.id || planNo}-${idx}`;
                const isSelected = selectedPlanIds.has(String(planNo));
                const rowDate = plan.createdAt || plan.planDate || plan.plannedStartDate || Date.now();
                const detailsUrl = `/production/plans/${encodeURIComponent(planNo)}`;

                const products = plan.productionPlanProducts || plan.products || [];
                const productSummary = products.length > 0 ? (products[0].productName || "Garment Item") : (plan.productName || "Garment Item");
                const pcs = products.reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0), 0);
                const totalPcs = pcs || Number(plan.quantity) || Number(plan.totalQuantity) || 0;

                return (
                  <article key={uniqueKey} className={`folder-plan-row ${isSelected ? "selected" : ""}`}>
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
                        <span className="status-badge status-draft">Draft</span>
                        <em>{plan.demandType || "Production"}</em>
                        {plan.priority && (
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                            {plan.priority}
                          </span>
                        )}
                      </div>

                      <p style={{ margin: 0, marginTop: "4px" }}>
                        <span style={{ fontWeight: 600, color: "#1e293b", marginRight: "6px" }}>{plan.sourceName || "Internal Demand"}</span>
                        {productSummary} &bull; {totalPcs.toLocaleString()} pcs
                      </p>
                    </div>

                    <time className="folder-plan-date">
                      {new Date(rowDate).toLocaleDateString()}
                    </time>

                    <div className="folder-plan-actions" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Link href={detailsUrl} className="btn btn-primary btn-sm font-bold">
                        Details
                      </Link>
                      <button
                        type="button"
                        className="btn btn-success btn-sm font-bold"
                        onClick={() => activatePlan(planNo)}
                        title="Activate plan into production workflow"
                      >
                        Activate
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        style={{ padding: "4px 8px", borderColor: "#fca5a5", color: "#dc2626" }}
                        onClick={() => deleteSinglePlan(planNo)}
                        title="Delete draft plan"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
