"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProductionPlans } from "../api/production.api";
import { ProductionPlanDto } from "../dto";
import { StatusBadge } from "../components/StatusBadge";
import "../styles/production-plans.css";

function getPlanIcon(plan: ProductionPlanDto) {
  const status = String(plan.status || "").toLowerCase();
  const demandType = String(plan.demandSource || "").toLowerCase();

  if (status === "draft") return "edit_note";
  if (status === "completed") return "task_alt";
  if (demandType.includes("customer")) return "person";
  if (demandType.includes("outlet")) return "storefront";
  if (demandType.includes("house") || demandType.includes("stock")) return "inventory_2";

  return "precision_manufacturing";
}

export default function CompletedPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductionPlans()
      .then((data) => {
        const filtered = data.filter((p) => {
          const st = String(p.status || "").toLowerCase();
          return st === "completed" || st === "5";
        });

        filtered.sort((a, b) => {
          const dateA = new Date(a.startDate || 0).getTime();
          const dateB = new Date(b.startDate || 0).getTime();
          return dateB - dateA;
        });

        setPlans(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching completed production plans:", err);
        setLoading(false);
      });
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter(
      (p) =>
        !search ||
        [p.planNumber, p.title, p.demandSource, p.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [plans, search]);

  const totalQty = useMemo(
    () => filteredPlans.reduce((acc, p) => acc + (p.totalQuantity || 0), 0),
    [filteredPlans]
  );
  const demandCount = useMemo(
    () => new Set(filteredPlans.map((p) => p.demandSource)).size,
    [filteredPlans]
  );

  return (
    <div className="pp-page">
      <div className="pp-page-header">
        <div>
          <h1>Completed Production</h1>
          <p>Finished plans ready for the next business step.</p>
        </div>
        <div className="pp-header-actions">
          <Link href="/production/plans" className="btn btn-light">
            View All Plans
          </Link>
          <Link href="/production" className="btn btn-light">
            Overview
          </Link>
        </div>
      </div>

      <div className="pp-card">
        <div
          className="pp-card-header inner"
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "16px 20px",
            borderBottom: "1px solid var(--pp-border)",
          }}
        >
          <div style={{ flex: "1", minWidth: "240px", position: "relative" }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                left: "12px",
                top: "10px",
                color: "var(--pp-muted)",
              }}
            >
              search
            </span>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: "40px" }}
              placeholder="Search completed"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="pp-detail-summary-grid border-b border-[var(--pp-border)]">
          <div className="summary-box">
            <span>Completed Plans</span>
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

        <div id="folderPlanList" style={{ background: "#f8fafc", padding: "0", minHeight: "300px" }}>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div
              className="draft-empty-state"
              style={{ textAlign: "center", padding: "60px 20px", color: "var(--pp-muted)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "48px", color: "var(--pp-border-strong)", marginBottom: "16px" }}
              >
                task_alt
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: "18px",
                  color: "var(--pp-text)",
                  marginBottom: "8px",
                }}
              >
                No completed plans
              </strong>
              <p>Completed production plans will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="folder-plan-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--pp-border)",
                    background: "#fff",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    className="material-symbols-outlined folder-plan-icon"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--pp-surface-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--pp-muted)",
                      border: "1px solid var(--pp-border)",
                    }}
                  >
                    {getPlanIcon(plan)}
                  </span>

                  <div className="folder-plan-main" style={{ flex: "1", minWidth: "0" }}>
                    <div
                      className="folder-plan-subject"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <strong style={{ fontSize: "15px", color: "var(--pp-text)" }}>
                        {plan.planNumber}
                      </strong>
                      <StatusBadge status={plan.status} size="sm" />
                      <em
                        style={{
                          fontStyle: "normal",
                          fontSize: "12px",
                          color: "var(--pp-muted)",
                          fontWeight: "bold",
                          marginLeft: "auto",
                        }}
                      >
                        {plan.demandSource}
                      </em>
                    </div>

                    <p
                      style={{
                        margin: "0",
                        fontSize: "13px",
                        color: "var(--pp-text)",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--pp-muted)", fontWeight: "bold" }}>
                        {plan.demandSource}
                      </span>
                      {plan.title} - {(plan.totalQuantity || 0).toLocaleString()} pcs
                    </p>
                  </div>

                  <time
                    className="folder-plan-date"
                    style={{
                      color: "var(--pp-muted)",
                      fontSize: "13px",
                      fontWeight: "bold",
                      width: "100px",
                      textAlign: "right",
                    }}
                  >
                    {plan.endDate
                      ? new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(plan.endDate))
                      : new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date())}
                  </time>

                  <div
                    className="folder-plan-actions"
                    style={{ display: "flex", gap: "8px", marginLeft: "16px" }}
                  >
                    <Link
                      className="btn btn-light btn-sm"
                      href={`/production/plans/${plan.id}`}
                    >
                      Details
                    </Link>
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
