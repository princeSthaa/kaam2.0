"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resolveMediaUrl } from "../../../crm/api/catalog.api";
import { StatusBadge } from "../../components/StatusBadge";
import { ProductionPlanDto } from "../../dto";
import { formatNepaliDate } from "../../lib/production-utils";

export function getProductImage(productId?: string, productName?: string, imagePath?: string): string {
  return resolveMediaUrl(imagePath, "product");
}

export function getFabricImage(fabricId?: string, fabricName?: string, imagePath?: string): string {
  return resolveMediaUrl(imagePath, "fabric");
}



function PlanDetailsContent() {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const router = useRouter();

  const planId =
    (routeParams?.id as string) ||
    searchParams.get("id") ||
    searchParams.get("planNo") ||
    searchParams.get("planId") ||
    "PP-0001";

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(planId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Plan not found");
        return res.json();
      })
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => {
        fetch("http://localhost:5083/api/production-plans")
          .then((res) => (res.ok ? res.json() : []))
          .then((plans: any[]) => {
            const found = plans.find(
              (p) => String(p.id) === String(planId) || String(p.planId) === String(planId) || String(p.planNo) === String(planId)
            );
            if (found) {
              setPlan(found);
            } else {
              setError("Production plan not found.");
            }
          })
          .catch(() => setError("Failed to fetch plan details from server."))
          .finally(() => setLoading(false));
      });
  }, [planId]);

  const products = useMemo(() => {
    if (!plan) return [];
    if (plan.productionPlanProducts && plan.productionPlanProducts.length > 0) {
      return plan.productionPlanProducts;
    }
    if (plan.products && plan.products.length > 0) {
      return plan.products;
    }
    return [
      {
        id: plan.productId || "PRD-001",
        productName: plan.planName || "Custom Production Garment",
        productCode: plan.productCode || "PRD-GARMENT-01",
        category: "Apparel",
        quantity: plan.quantity || 500,
        variant: "Standard Navy",
        productImage: "/images/products/school-uniform.jpg"
      },
    ];
  }, [plan]);

  const activeProduct = products[selectedProductIdx] || products[0];

  const stages = useMemo(() => {
    if (!plan) return [];
    if (plan.productionPlanStages && plan.productionPlanStages.length > 0) {
      return plan.productionPlanStages;
    }
    if (plan.stages && plan.stages.length > 0) {
      return plan.stages;
    }
    return [
      { stageName: "Fabric Cutting", workCenterName: "Cutting Work Center 1", status: "Completed", progress: 100, completedQty: plan?.quantity || 500, remarks: "Completed on schedule" },
      { stageName: "Stitching & Sewing", workCenterName: "Sewing Line 1", status: "In Progress", progress: 65, completedQty: Math.floor((plan?.quantity || 500) * 0.65), remarks: "Active on production line" },
      { stageName: "Quality Inspection (QC)", workCenterName: "QC Station A", status: "Pending", progress: 0, completedQty: 0, remarks: "Queued after sewing" },
      { stageName: "Finishing & Packaging", workCenterName: "Assembly Line 1", status: "Pending", progress: 0, completedQty: 0, remarks: "Final packing" },
    ];
  }, [plan]);

  const statusStr = String(plan?.status ?? "Draft");

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="spinner-border text-blue-600 mb-3" style={{ width: "2rem", height: "2rem" }}></div>
        <p className="font-semibold text-slate-700">Loading production plan details...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || "Plan Not Found"}</h2>
        <p className="text-slate-500 mb-6">The requested production plan ID "{planId}" could not be loaded.</p>
        <Link href="/production/plans" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
          Back to Production Plans
        </Link>
      </div>
    );
  }

  const displayPlanNo = plan.planId || plan.planNo || plan.id || planId;
  const totalQuantity = plan.quantity || products.reduce((sum: number, p: any) => sum + (Number(p.quantity) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5 pb-20 p-4 sm:p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Plan #{displayPlanNo}
            </span>
            <StatusBadge status={statusStr} size="sm" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{plan.planName || `Plan ${displayPlanNo}`}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demand: <strong className="text-slate-700">{plan.demandType || "In-House Stock"}</strong> &bull; Source: <strong className="text-slate-700">{plan.sourceName || "Main Factory"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/production/plans" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Plans
          </Link>
          <Link href={`/production/plans/${encodeURIComponent(displayPlanNo)}/edit`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[16px]">edit</span> Edit Plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Demand Type</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 truncate">{plan.demandType || "Production"}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Products</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 font-mono">{products.length} Items</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Active Product</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 truncate">{activeProduct?.productName || "Garment Item"}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Plan Qty</span>
          <strong className="text-blue-600 text-sm font-black mt-1 font-mono">{totalQuantity.toLocaleString()} pcs</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Planned Start (BS)</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 font-mono">{formatNepaliDate(plan.plannedStartDate)}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Completion (BS)</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 font-mono">{formatNepaliDate(plan.plannedCompletionDate)}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Required Date (BS)</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 font-mono">{formatNepaliDate(plan.requiredDate || plan.plannedCompletionDate)}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Priority</span>
          <strong className="text-amber-600 text-xs font-extrabold mt-1 uppercase">{String(plan.priority || "Medium")}</strong>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="flex border-b border-slate-200 pb-3 mb-6 gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: "overview", label: "Overview & Products", icon: "grid_view" },
            { id: "stages", label: `Stages & Routing (${stages.length})`, icon: "route" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">app_registration</span>
              Products in Plan ({products.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p: any, idx: number) => (
                <div key={p.id || idx} className="border rounded-xl p-3 flex gap-3 items-center bg-white border-slate-200">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900">{p.productName}</h4>
                    <p className="text-xs text-slate-500 font-mono">Code: {p.productCode}</p>
                    <p className="text-xs font-bold text-blue-600 mt-1">Quantity: {p.quantity} pcs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stages" && (
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">route</span>
              Production Routing Stages
            </h3>
            <div className="flex flex-col gap-2">
              {stages.map((st: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <strong className="text-sm font-bold text-slate-900">{idx + 1}. {st.stageName}</strong>
                    <p className="text-xs text-slate-500">{st.workCenterName || st.workCenter}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">{st.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading plan details...</div>}>
      <PlanDetailsContent />
    </Suspense>
  );
}
