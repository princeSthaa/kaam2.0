"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import PlanDetailsPage from "./[id]/page";
import { formatNepaliDate } from "../lib/production-utils";
import "../styles/production-plans-list.css";

const demandTypeOptions = [
  "All Demand Types",
  "Customer Order",
  "Outlet Replenishment",
  "In-house Stock",
];

const statusOptions = [
  "All Statuses",
  "Draft",
  "Active",
  "In Progress",
  "Completed",
  "Cancelled",
];

const sortOptions = ["Latest First", "Oldest First"];

export default function ProductionPlansListPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [demandTypeFilter, setDemandTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("Latest First");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");

  // Master-Detail selection
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const fetchPlans = () => {
    setLoading(true);
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching production plans:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleReset = () => {
    setDemandTypeFilter("");
    setStatusFilter("");
    setSortFilter("Latest First");
    setFromDate("");
    setToDate("");
    setSourceSearch("");
  };

  const filteredPlans = useMemo(() => {
    let result = [...plans];

    if (demandTypeFilter) {
      const dtLower = demandTypeFilter.toLowerCase();
      result = result.filter((p) => {
        const dt = String(p.demandType || "").toLowerCase();
        return dt.includes(dtLower) || dtLower.includes(dt);
      });
    }

    if (statusFilter) {
      const stLower = statusFilter.toLowerCase();
      result = result.filter((p) => {
        const st = String(p.status || "").toLowerCase();
        if (stLower === "active") return st === "active" || st === "1" || st === "pending";
        if (stLower === "in progress") return st === "inprogress" || st === "in progress" || st === "2";
        if (stLower === "draft") return st === "draft" || st === "0";
        if (stLower === "completed") return st === "completed" || st === "5";
        return st.includes(stLower);
      });
    } else {
      // By default exclude Drafts and Completed from active plans list
      result = result.filter((p) => {
        const st = String(p.status || "").toLowerCase();
        return st !== "draft" && st !== "0" && st !== "completed" && st !== "5";
      });
    }

    if (sourceSearch.trim()) {
      const lowerQ = sourceSearch.toLowerCase();
      result = result.filter((p) => {
        const id = String(p.planNo || p.planId || p.id || "").toLowerCase();
        const name = String(p.planName || "").toLowerCase();
        const src = String(p.sourceName || "").toLowerCase();
        return id.includes(lowerQ) || name.includes(lowerQ) || src.includes(lowerQ);
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.plannedStartDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.plannedStartDate || 0).getTime();
      return sortFilter === "Latest First" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [plans, demandTypeFilter, statusFilter, sourceSearch, sortFilter]);

  const getStatusBadgeClass = (status: any) => {
    const st = String(status || "").toLowerCase();
    if (st === "completed" || st === "5") return "ppl-badge ppl-badge-completed";
    if (st === "in progress" || st === "inprogress" || st === "2" || st === "active") return "ppl-badge ppl-badge-active";
    if (st === "draft" || st === "0") return "ppl-badge ppl-badge-draft";
    return "ppl-badge ppl-badge-material";
  };

  if (selectedPlanId) {
    return (
      <div className="ppl-container">
        <div style={{ marginBottom: "16px" }}>
          <button
            type="button"
            onClick={() => setSelectedPlanId(null)}
            className="ppl-btn ppl-btn-outline"
          >
            &larr; Back to Production Plans
          </button>
        </div>
        <PlanDetailsPage />
      </div>
    );
  }

  return (
    <div className="ppl-container">
      {/* Header */}
      <div className="ppl-header">
        <div>
          <h1>Production Plans</h1>
          <p>Filter, monitor, and view detailed garment production plans with Nepali BS dates.</p>
        </div>

        <div>
          <Link href="/production/demands" className="ppl-btn ppl-btn-primary">
            + Create Production Plan
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="ppl-card">
        <div className="ppl-card-header">
          <div>
            <h2>Filter Production Plans</h2>
            <p>Search by product, source, demand type, status, or date range.</p>
          </div>

          <button className="ppl-btn ppl-btn-outline" id="resetFiltersBtn" onClick={handleReset}>
            Reset Filters
          </button>
        </div>

        <div className="ppl-filter-grid">
          <div className="ppl-form-group">
            <label htmlFor="demandTypeFilter">Demand Type</label>
            <select
              id="demandTypeFilter"
              className="ppl-form-control"
              value={demandTypeFilter}
              onChange={(e) => setDemandTypeFilter(e.target.value)}
            >
              {demandTypeOptions.map((opt) => (
                <option key={opt} value={opt.startsWith("All") ? "" : opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="ppl-form-group">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              className="ppl-form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt.startsWith("All") ? "" : opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="ppl-form-group">
            <label htmlFor="sortFilter">Sort By</label>
            <select
              id="sortFilter"
              className="ppl-form-control"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="ppl-form-group">
            <label htmlFor="fromDateFilter">From Date (BS)</label>
            <NepaliDatePicker
              id="fromDateFilter"
              className="ppl-form-control"
              placeholder="DD-MM-YYYY"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="ppl-form-group">
            <label htmlFor="toDateFilter">To Date (BS)</label>
            <NepaliDatePicker
              id="toDateFilter"
              className="ppl-form-control"
              placeholder="DD-MM-YYYY"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="ppl-form-group">
            <label htmlFor="sourceSearch">Source Search</label>
            <input
              type="text"
              id="sourceSearch"
              className="ppl-form-control"
              placeholder="Search customer, outlet..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Plans Table Section */}
      <div className="ppl-card">
        <div className="ppl-card-header">
          <div>
            <h2>Plan Table ({filteredPlans.length})</h2>
            <p>Scan production plans quickly and open the full details when needed.</p>
          </div>
        </div>

        <div className="ppl-table-wrap">
          <table className="ppl-table">
            <thead>
              <tr>
                <th>Plan No</th>
                <th>Demand Type</th>
                <th>Title / Source</th>
                <th>Total Qty</th>
                <th>Start Date (BS)</th>
                <th>End Date (BS)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading plans...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No production plans found.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((p) => {
                  const planNo = p.planId || p.planNo || p.id;
                  const products = p.productionPlanProducts || p.products || [];
                  const titleStr = p.planName || (products.length > 0 ? products[0].productName : "Garment Item");
                  const totalPcs = p.quantity || p.totalQuantity || products.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0);

                  return (
                    <tr key={p.id || planNo}>
                      <td>
                        <strong style={{ color: "#2563eb", fontFamily: "JetBrains Mono, monospace" }}>{planNo}</strong>
                      </td>
                      <td>
                        <span className="ppl-chip">{p.demandType || "In-House"}</span>
                      </td>
                      <td>
                        <strong style={{ display: "block" }}>{titleStr}</strong>
                        {p.sourceName && <span style={{ fontSize: "11px", color: "#64748b" }}>{p.sourceName}</span>}
                      </td>
                      <td>
                        <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>{totalPcs.toLocaleString()} pcs</strong>
                      </td>
                      <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{formatNepaliDate(p.plannedStartDate)}</td>
                      <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{formatNepaliDate(p.plannedCompletionDate)}</td>
                      <td>
                        <span className={getStatusBadgeClass(p.status)}>
                          {String(p.status || "Draft")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link href={`/production/plans/${encodeURIComponent(planNo)}`} className="ppl-btn ppl-btn-sm ppl-btn-outline">
                            View
                          </Link>
                          {!(String(p.status || "").toLowerCase() === "completed" || String(p.status || "") === "5") && (
                            <Link href={`/production/plans/${encodeURIComponent(planNo)}/edit`} className="ppl-btn ppl-btn-sm ppl-btn-outline">
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
