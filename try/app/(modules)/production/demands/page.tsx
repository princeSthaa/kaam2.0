"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { fetchProductionPlans } from "../api/production.api";
import { ProductionPlan } from "../dto/production.dto";

export default function ProductionCreatePage() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductionPlans()
      .then((data) => setPlans(data || []))
      .catch((err) => console.error("Error fetching production plans:", err))
      .finally(() => setLoading(false));
  }, []);

  // Compute metric stats
  const activePlansCount = plans.filter(
    (p) => p.status === "Active" || p.status === "In Progress" || p.status === "Cutting" || p.status === "Stitching"
  ).length;

  const demandChoices = [
    {
      id: "customer",
      icon: "person",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      accentColor: "#2563eb",
      badge: "External Demands",
      badgeStyle: { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
      title: "Customer Order Demand",
      subtitle: "B2B, Retailer & Direct Customer Orders",
      text: "Plan production for school uniforms, bulk retail orders, or customized client purchases.",
      points: [
        "Select verified customer & delivery destination",
        "View customer payment & order timelines",
        "Configure product sizes, BOM fabrics, & stages",
      ],
      href: "/production/demands/customer",
      cta: "Start Customer Order Plan",
    },
    {
      id: "outlet",
      icon: "storefront",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentColor: "#059669",
      badge: "Retail Stores",
      badgeStyle: { backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" },
      title: "Outlet Replenishment Demand",
      subtitle: "Internal Brand Outlets & Store Stocking",
      text: "Plan garment production to fulfill outlet store inventory requests and seasonal restocks.",
      points: [
        "Select target outlet & location manager",
        "View outlet store stock depletion levels",
        "Configure replenishment quantities & transfer dispatch",
      ],
      href: "/production/demands/outlet",
      cta: "Start Outlet Plan",
    },
    {
      id: "in-house",
      icon: "inventory_2",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      accentColor: "#7c3aed",
      badge: "Warehouse Buffer",
      badgeStyle: { backgroundColor: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
      title: "In-House Stock Buffer Demand",
      subtitle: "Central Warehouse Stocking & Production Planning",
      text: "Plan production to build internal buffer stock, stock fast-moving SKUs, or prepare seasonal reserves.",
      points: [
        "Specify production reason & storage warehouse",
        "Set buffer safety stock thresholds",
        "Configure products, size ratios, & production routing",
      ],
      href: "/production/demands/in-house",
      cta: "Start In-house Plan",
    },
  ];

  return (
    <div className="pp-page">
      <PageHeader
        title="Production Demands Hub"
        subtitle="Select a demand stream to launch material checking, size allocation, and production planning."
        actions={
          <ActionButton href="/production/plans" variant="outline-secondary" className="bg-white border-slate-200 text-slate-700 font-bold d-inline-flex align-items-center gap-1.5">
            <MaterialIcon name="format_list_bulleted" style={{ fontSize: "18px" }} />
            <span>View All Active Plans</span>
          </ActionButton>
        }
      />

      {/* ================= TOP LIVE KPI METRICS BAR ================= */}
      <div className="row g-3 mt-1 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="bg-white border border-slate-200 rounded-3 p-3 shadow-2xs d-flex align-items-center justify-content-between">
            <div>
              <span className="text-slate-500 text-xs font-mono fw-bold uppercase tracking-wider d-block mb-1">Customer Demands</span>
              <div className="d-flex align-items-baseline gap-2">
                <h3 className="fw-bold text-slate-900 mb-0">Customer</h3>
              </div>
            </div>
            <div className="p-2.5 rounded-3 bg-blue-50 text-blue-600 border border-blue-100 d-flex align-items-center justify-content-center">
              <MaterialIcon name="person" style={{ fontSize: "24px" }} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="bg-white border border-slate-200 rounded-3 p-3 shadow-2xs d-flex align-items-center justify-content-between">
            <div>
              <span className="text-slate-500 text-xs font-mono fw-bold uppercase tracking-wider d-block mb-1">Outlet Requests</span>
              <div className="d-flex align-items-baseline gap-2">
                <h3 className="fw-bold text-slate-900 mb-0">Outlet</h3>
              </div>
            </div>
            <div className="p-2.5 rounded-3 bg-emerald-50 text-emerald-600 border border-emerald-100 d-flex align-items-center justify-content-center">
              <MaterialIcon name="storefront" style={{ fontSize: "24px" }} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="bg-white border border-slate-200 rounded-3 p-3 shadow-2xs d-flex align-items-center justify-content-between">
            <div>
              <span className="text-slate-500 text-xs font-mono fw-bold uppercase tracking-wider d-block mb-1">In-House Stock Buffer</span>
              <div className="d-flex align-items-baseline gap-2">
                <h3 className="fw-bold text-slate-900 mb-0">Stock</h3>
              </div>
            </div>
            <div className="p-2.5 rounded-3 bg-purple-50 text-purple-600 border border-purple-100 d-flex align-items-center justify-content-center">
              <MaterialIcon name="inventory_2" style={{ fontSize: "24px" }} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="bg-white border border-slate-200 rounded-3 p-3 shadow-2xs d-flex align-items-center justify-content-between">
            <div>
              <span className="text-slate-500 text-xs font-mono fw-bold uppercase tracking-wider d-block mb-1">Total System Plans</span>
              <div className="d-flex align-items-baseline gap-2">
                <h3 className="fw-bold text-slate-900 mb-0">{loading ? "..." : plans.length}</h3>
                <span
                  className="rounded-pill text-xs px-2.5 py-0.5 font-bold"
                  style={{ backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", fontSize: "11px", fontWeight: "700" }}
                >
                  {activePlansCount} Active
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-3 bg-amber-50 text-amber-600 border border-amber-100 d-flex align-items-center justify-content-center">
              <MaterialIcon name="precision_manufacturing" style={{ fontSize: "24px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= DEMAND CHANNEL SELECTION CARDS ================= */}
      <h5 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
        <MaterialIcon name="apps" style={{ fontSize: "20px", color: "#2563eb" }} />
        <span>Select Production Demand Channel</span>
      </h5>

      <div className="row g-4 mb-5">
        {demandChoices.map((choice) => (
          <div className="col-lg-4 col-md-6" key={choice.id}>
            <div className="bg-white border border-slate-200 rounded-4 p-4 shadow-2xs hover-shadow transition-all d-flex flex-column justify-between h-100 position-relative overflow-hidden" style={{ borderTop: `4px solid ${choice.accentColor}` }}>
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className={`p-3 rounded-3 border d-inline-flex align-items-center justify-content-center ${choice.iconBg}`}>
                    <MaterialIcon name={choice.icon} style={{ fontSize: "28px" }} />
                  </span>
                  <span
                    className="rounded-pill px-3 py-1 text-xs font-bold"
                    style={{ ...choice.badgeStyle, fontSize: "12px", fontWeight: "700" }}
                  >
                    {choice.badge}
                  </span>
                </div>

                <h4 className="fw-bold text-slate-900 mb-1">{choice.title}</h4>
                <p className="text-xs text-slate-500 font-mono mb-3">{choice.subtitle}</p>
                <p className="text-slate-600 small mb-4">{choice.text}</p>

                <div className="border-top border-slate-100 pt-3 mb-4">
                  <span className="text-xs text-slate-400 font-mono fw-bold uppercase tracking-wider block mb-2.5">Key Capabilities</span>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    {choice.points.map((pt, j) => (
                      <li key={j} className="d-flex align-items-start gap-2 text-xs text-slate-700">
                        <MaterialIcon name="check_circle" style={{ fontSize: "16px", color: choice.accentColor, flexShrink: 0, marginTop: "1px" }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={choice.href}
                className="btn w-100 py-2.5 fw-bold text-white rounded-3 shadow-2xs d-inline-flex align-items-center justify-center gap-2 cursor-pointer transition-all"
                style={{ backgroundColor: choice.accentColor, border: "none" }}
              >
                <span>{choice.cta}</span>
                <MaterialIcon name="arrow_forward" style={{ fontSize: "18px" }} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RECENT PRODUCTION PLANS TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-4 p-4 shadow-2xs">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-slate-900 mb-0 d-flex align-items-center gap-2">
              <MaterialIcon name="history" style={{ fontSize: "20px", color: "#059669" }} />
              <span>Recent Production Plans</span>
            </h5>
            <small className="text-slate-500 font-mono">Overview of recent production demands generated in the system</small>
          </div>
          <Link
            href="/production/plans"
            className="btn btn-sm btn-outline-secondary bg-white text-slate-700 border-slate-300 rounded-2.5 fw-bold d-inline-flex align-items-center gap-1.5"
          >
            <span>View All Plans</span>
            <MaterialIcon name="open_in_new" style={{ fontSize: "14px" }} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4 text-slate-500">
            <MaterialIcon name="sync" className="spin me-2" style={{ fontSize: "20px" }} />
            <span>Loading recent production activity...</span>
          </div>
        ) : plans.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b" }}>Plan Code</th>
                  <th style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b" }}>Target Date</th>
                  <th style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b" }}>Status</th>
                  <th style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b" }} className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.slice(0, 5).map((plan) => {
                  const isPlanActive = plan.status === "Active" || plan.status === "In Progress" || plan.status === "Cutting" || plan.status === "Stitching";
                  const isPlanDone = plan.status === "Completed";
                  return (
                    <tr key={plan.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="p-1.5 rounded-2 bg-blue-50 text-blue-600 border border-blue-100 d-inline-flex">
                            <MaterialIcon name="precision_manufacturing" style={{ fontSize: "16px" }} />
                          </span>
                          <div>
                            <strong className="text-slate-900 d-block">{plan.planCode || `PLAN-${plan.id}`}</strong>
                            {plan.demandType && <span className="text-xs text-slate-400 font-mono">{plan.demandType}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-600 text-sm font-mono">
                        {plan.targetDate ? new Date(plan.targetDate).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <span
                          className="rounded-pill px-2.5 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: isPlanActive ? "#ecfdf5" : isPlanDone ? "#eff6ff" : "#f8fafc",
                            color: isPlanActive ? "#047857" : isPlanDone ? "#1d4ed8" : "#334155",
                            border: isPlanActive ? "1px solid #a7f3d0" : isPlanDone ? "1px solid #bfdbfe" : "1px solid #cbd5e1",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {plan.status || "Draft"}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/production/plans/${plan.id}`}
                          className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2.5 font-bold text-xs d-inline-flex align-items-center gap-1"
                        >
                          <span>Details</span>
                          <MaterialIcon name="chevron_right" style={{ fontSize: "14px" }} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-3 border border-dashed border-slate-200">
            <MaterialIcon name="history_toggle_off" style={{ fontSize: "32px", color: "#cbd5e1" }} />
            <p className="mb-0 mt-2 text-xs">No recent production plans created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
