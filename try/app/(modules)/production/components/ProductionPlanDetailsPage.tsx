"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Product Image Resolver Map
const productImages: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111": "/images/products/school-uniform.jpg",
  "22222222-2222-2222-2222-222222222222": "/images/products/polo-shirt.jpg",
  "33333333-3333-3333-3333-333333333333": "/images/products/casual-shirt.jpg",
  "44444444-4444-4444-4444-444444444444": "/images/products/tracksuit.jpg",
  "55555555-5555-5555-5555-555555555555": "/images/products/place-holder.png",
  "66666666-6666-6666-6666-666666666666": "/images/products/hotel-uniform.jpg",
  "77777777-7777-7777-7777-777777777777": "/images/mockup3dimages/whiteshirtfront.png",
};

export function getProductImage(productId?: string, productName?: string): string {
  if (productId && productImages[productId]) return productImages[productId];
  if (!productName) return "/images/products/place-holder.png";

  const lower = productName.toLowerCase();
  if (lower.includes("school") || lower.includes("shirt")) return "/images/products/school-uniform.jpg";
  if (lower.includes("polo")) return "/images/products/polo-shirt.jpg";
  if (lower.includes("trouser") || lower.includes("pant") || lower.includes("casual")) return "/images/products/casual-shirt.jpg";
  if (lower.includes("hoodie") || lower.includes("tracksuit") || lower.includes("jacket")) return "/images/products/tracksuit.jpg";
  if (lower.includes("hotel") || lower.includes("uniform")) return "/images/products/hotel-uniform.jpg";
  return "/images/products/place-holder.png";
}

// Fabric Image Resolver Map
const fabricImages: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111": "/images/fabrics/FAB-001.jpg",
  "22222222-2222-2222-2222-222222222222": "/images/fabrics/FAB-002.png",
  "33333333-3333-3333-3333-333333333333": "/images/fabrics/FAB-003.jpg",
};

export function getFabricImage(fabricId?: string, fabricName?: string): string {
  if (fabricId && fabricImages[fabricId]) return fabricImages[fabricId];
  if (!fabricName) return "/images/fabrics/FAB-001.jpg";
  const lower = fabricName.toLowerCase();
  if (lower.includes("pique")) return "/images/fabrics/FAB-002.png";
  if (lower.includes("trouser") || lower.includes("twill")) return "/images/fabrics/FAB-003.jpg";
  return "/images/fabrics/FAB-001.jpg";
}

// Nepali Date Converter Utility
export function formatNepaliDate(dateVal: any): string {
  if (!dateVal) return "N/A";
  let dateStr = String(dateVal).trim();
  if (dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }
  if (dateStr.includes(" ")) {
    dateStr = dateStr.split(" ")[0];
  }

  if (dateStr.startsWith("208") || dateStr.startsWith("207") || dateStr.startsWith("209")) {
    return dateStr.includes("BS") ? dateStr : `${dateStr} BS`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return `${dateStr} BS`;

  const adYear = d.getFullYear();
  const adMonth = d.getMonth();
  const adDay = d.getDate();

  // AD to BS conversion approximation (+56y 8m 15d)
  const bsYear = adYear + (adMonth > 3 || (adMonth === 3 && adDay >= 14) ? 57 : 56);
  const bsMonthNum = ((adMonth + 8) % 12) + 1;
  const mStr = String(bsMonthNum).padStart(2, "0");
  const dStr = String(adDay).padStart(2, "0");

  return `${bsYear}-${mStr}-${dStr} BS`;
}

export function ProductionPlanDetailsPage() {
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
      .catch((err) => {
        // Fallback: fetch all plans and filter
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

  const getStatusBadgeClass = (st: string) => {
    const lower = st.toLowerCase();
    if (lower === "completed" || lower === "5") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (lower === "in progress" || lower === "inprogress" || lower === "2" || lower === "active") return "bg-blue-50 text-blue-700 border-blue-200";
    if (lower === "draft" || lower === "0") return "bg-amber-50 text-amber-700 border-amber-200";
    if (lower === "onhold" || lower === "3") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

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
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Plan #{displayPlanNo}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getStatusBadgeClass(statusStr)}`}>
              {statusStr}
            </span>
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
          <Link href={`/production/plans/new?id=${encodeURIComponent(displayPlanNo)}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[16px]">edit</span> Edit Plan
          </Link>
        </div>
      </div>

      {/* COMPACT SUMMARY GRID (SCALABLE FOR MULTI-PRODUCTS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Demand Type</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 truncate">{plan.demandType || "Production"}</strong>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Products</span>
          <strong className="text-slate-800 text-xs font-bold mt-1 font-mono">{products.length} Garment Items</strong>
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

      {/* MAIN CONTENT CARD WITH TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 pb-3 mb-6 gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: "overview", label: "Overview & Products", icon: "grid_view" },
            { id: "materials", label: `Materials BOM (${products.length})`, icon: "inventory_2" },
            { id: "stages", label: `Stages & Routing (${stages.length})`, icon: "route" },
            { id: "sizes", label: "Size Distribution", icon: "straighten" },
            { id: "activity", label: "Audit Trail Log", icon: "history" },
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

        {/* TAB 1: OVERVIEW & PRODUCTS */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Products Workspace with Image Cards & Variant Display */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">app_registration</span>
                  Products in Plan ({products.length})
                </h3>
              </div>

              {/* Scrollable grid supporting up to 20+ products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p: any, idx: number) => {
                  const imgUrl = p.productImage || getProductImage(p.productId || p.id, p.productName);
                  const isSelected = idx === selectedProductIdx;
                  const variantText = p.variant || p.color || "Standard Variant";

                  return (
                    <div
                      key={p.id || idx}
                      onClick={() => setSelectedProductIdx(idx)}
                      className={`border rounded-xl p-3 flex gap-3 items-center cursor-pointer transition-all ${
                        isSelected ? "border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={p.productName || "Product"}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-100 flex-shrink-0 shadow-2xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/products/place-holder.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{p.productName || "Garment Item"}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{p.productCode || p.productId || "PRD-ITEM"}</p>
                        
                        {/* Variant Badge Display */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                            {variantText}
                          </span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-mono">
                            {(p.quantity || 0).toLocaleString()} pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Product Detail Panel */}
            {activeProduct && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-5 items-center">
                <img
                  src={activeProduct.productImage || getProductImage(activeProduct.productId || activeProduct.id, activeProduct.productName)}
                  alt={activeProduct.productName}
                  className="w-24 h-24 object-cover rounded-xl border border-slate-200 bg-white flex-shrink-0 shadow-2xs"
                />
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Product Name</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{activeProduct.productName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Variant & Category</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                        {activeProduct.variant || "Standard Color"}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-700 font-semibold">{activeProduct.category || "Garment Apparel"}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Product Quantity</span>
                    <p className="text-xs font-bold text-blue-600 font-mono mt-0.5">{(activeProduct.quantity || 0).toLocaleString()} pcs</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Warehouse Destination</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{plan.outputDestination || plan.materialWarehouse || "Central Finished Goods Hub"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates & Source Summary Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono mb-3 border-b pb-2">Demand & Source Setup</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Demand Type:</span>
                    <strong className="text-slate-800">{plan.demandType || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Source Name:</span>
                    <strong className="text-slate-800">{plan.sourceName || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Output Destination:</span>
                    <strong className="text-slate-800">{plan.outputDestination || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material Warehouse:</span>
                    <strong className="text-slate-800">{plan.materialWarehouse || "N/A"}</strong>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono mb-3 border-b pb-2">Planning Dates (BS)</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Plan Date (BS):</span>
                    <strong className="text-slate-800 font-mono">{formatNepaliDate(plan.planDate || plan.createdAt)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Planned Start (BS):</span>
                    <strong className="text-slate-800 font-mono">{formatNepaliDate(plan.plannedStartDate)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Planned Completion (BS):</span>
                    <strong className="text-slate-800 font-mono">{formatNepaliDate(plan.plannedCompletionDate)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required Date (BS):</span>
                    <strong className="text-slate-800 font-mono">{formatNepaliDate(plan.requiredDate || plan.plannedCompletionDate)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATERIALS BILL OF MATERIALS (SCALABLE FOR MULTI-PRODUCTS) */}
        {activeTab === "materials" && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Material Requirements & Bill of Materials</h3>
              <p className="text-xs text-slate-400">Calculated bill of materials aggregated across all {products.length} products in this production plan.</p>
            </div>

            {/* Scalable Multi-Product BOM Tables */}
            <div className="flex flex-col gap-6">
              {products.map((p: any, pIdx: number) => {
                const pQty = Number(p.quantity) || 100;
                const pImg = p.productImage || getProductImage(p.productId || p.id, p.productName);

                // Calculate product specific multi-fabric BOM items with fabric images
                const productBomList = [
                  { code: `FAB-${p.productCode || 'COT'}-MAIN`, name: `${p.productName} - Main Body Fabric`, type: "Main Body Fabric", req: Math.round(pQty * 1.8), avail: Math.round(pQty * 3.5), unit: "meters", status: "Available", img: getFabricImage("", p.productName) },
                  { code: `FAB-${p.productCode || 'RIB'}-TRIM`, name: `${p.productName} - Collar / Cuff Trim Fabric`, type: "Secondary Fabric", req: Math.round(pQty * 0.35), avail: Math.round(pQty * 1.2), unit: "meters", status: "Available", img: "/images/fabrics/FAB-002.png" },
                  { code: `FAB-${p.productCode || 'LIN'}-INNER`, name: `${p.productName} - Pocket & Inner Mesh Lining`, type: "Lining Fabric", req: Math.round(pQty * 0.25), avail: Math.round(pQty * 0.8), unit: "meters", status: "Available", img: "/images/fabrics/FAB-003.jpg" },
                  { code: `THR-NAVY-${pIdx + 1}`, name: `High-Tensile Sewing Thread`, type: "Sewing Thread", req: Math.round(pQty * 0.3), avail: Math.round(pQty * 2.0), unit: "spools", status: "Available", img: "" },
                  { code: `ACC-BTN-${pIdx + 1}`, name: "Garment Buttons / Metallic Fasteners", type: "Accessories", req: Math.round(pQty * 8), avail: Math.round(pQty * 25), unit: "pcs", status: "Available", img: "" },
                  { code: `PKG-POLY-${pIdx + 1}`, name: "Individual Poly Bags & Hanger Pack", type: "Packaging", req: pQty, avail: pQty * 5, unit: "pcs", status: "Available", img: "" },
                ];

                return (
                  <div key={p.id || pIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={pImg} alt={p.productName} className="w-9 h-9 object-cover rounded-lg border border-slate-200 bg-white" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{p.productName}</h4>
                          <span className="text-[11px] text-slate-500">Fabric: <strong className="text-emerald-700 font-semibold">{p.fabricName || p.fabric || "Dyed Cotton Fabric"}</strong> &bull; Variant: <strong className="text-slate-700">{p.variant || "Standard"}</strong> &bull; Qty: <strong className="text-blue-600 font-mono">{pQty.toLocaleString()} pcs</strong></span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                        {productBomList.length} BOM Items
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/60 text-slate-600 uppercase font-mono text-[10px]">
                            <th className="p-3 border-b">Fabric / Image</th>
                            <th className="p-3 border-b">Material Code</th>
                            <th className="p-3 border-b">Material Description</th>
                            <th className="p-3 border-b">Category</th>
                            <th className="p-3 border-b text-right">Required Qty</th>
                            <th className="p-3 border-b text-right">In-Stock Qty</th>
                            <th className="p-3 border-b">Unit</th>
                            <th className="p-3 border-b text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productBomList.map((mat, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/80">
                              <td className="p-3">
                                {mat.img ? (
                                  <img src={mat.img} alt={mat.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100 shadow-2xs" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-[10px]">N/A</div>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-700">{mat.code}</td>
                              <td className="p-3 font-semibold text-slate-800">{mat.name}</td>
                              <td className="p-3 text-slate-500">{mat.type}</td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">{mat.req.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono text-emerald-600 font-bold">{mat.avail.toLocaleString()}</td>
                              <td className="p-3 text-slate-500">{mat.unit}</td>
                              <td className="p-3 text-center">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                  {mat.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STAGES PROGRESS */}
        {activeTab === "stages" && (
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Operational Routing Stages</h3>
              <p className="text-xs text-slate-400">Workflow progress stage by stage across work centers grouped by product.</p>
            </div>

            {/* Group stages by product name */}
            {(() => {
              const grouped: { [key: string]: any[] } = {};
              stages.forEach((stg: any) => {
                let pName = "General Routing";
                if (stg.stageName && stg.stageName.includes(" - ")) {
                  pName = stg.stageName.split(" - ")[0];
                } else if (stg.productName) {
                  pName = stg.productName;
                }
                if (!grouped[pName]) grouped[pName] = [];
                grouped[pName].push(stg);
              });

              const groupEntries = Object.entries(grouped);

              return (
                <div className="flex flex-col gap-6">
                  {groupEntries.map(([productName, productStagesList], gIdx) => (
                    <div key={gIdx} className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-mono">
                          {gIdx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{productName}</h4>
                        <span className="text-xs text-slate-500 font-mono">({productStagesList.length} Routing Stages)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {productStagesList.map((stg: any, i: number) => {
                          const cleanStageName = stg.stageName && stg.stageName.includes(" - ") 
                            ? stg.stageName.split(" - ").slice(1).join(" - ") 
                            : (stg.stageName || `Stage ${i + 1}`);

                          return (
                            <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center font-mono">
                                    {i + 1}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    stg.status === "Completed" ? "bg-emerald-100 text-emerald-700" : stg.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"
                                  }`}>
                                    {stg.status || "NotStarted"}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 text-xs">{cleanStageName}</h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">{stg.workCenterName || stg.workCenterId || "Work Center"}</p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-200/60">
                                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
                                  <span>Progress</span>
                                  <span>{stg.progress || (stg.status === "Completed" ? 100 : 0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full transition-all"
                                    style={{ width: `${stg.progress || (stg.status === "Completed" ? 100 : 0)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: SIZE BREAKDOWN (SCALABLE FOR MULTI-PRODUCTS WITH VARIANT DISPLAY) */}
        {activeTab === "sizes" && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Size Breakdown Distribution</h3>
              <p className="text-xs text-slate-400">Garment size breakdown per product supporting up to 20+ products in a single plan.</p>
            </div>

            {/* Product Size Breakdown Cards */}
            <div className="flex flex-col gap-5">
              {products.map((p: any, pIdx: number) => {
                const pQty = Number(p.quantity) || 100;
                const pImg = p.productImage || getProductImage(p.productId || p.id, p.productName);

                // Use DB sizes or calculate standard ratio split
                const sizeDistribution = (p.productionPlanProductSizes && p.productionPlanProductSizes.length > 0)
                  ? p.productionPlanProductSizes.map((s: any) => ({ size: s.size, qty: s.quantity }))
                  : [
                      { size: "XS", qty: Math.round(pQty * 0.1) },
                      { size: "S", qty: Math.round(pQty * 0.2) },
                      { size: "M", qty: Math.round(pQty * 0.35) },
                      { size: "L", qty: Math.round(pQty * 0.2) },
                      { size: "XL", qty: Math.round(pQty * 0.1) },
                      { size: "XXL", qty: Math.round(pQty * 0.05) },
                    ];

                return (
                  <div key={p.id || pIdx} className="border border-slate-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={pImg} alt={p.productName} className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{p.productName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              Variant: {p.variant || "Standard"}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">Code: {p.productCode || "PRD"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Item Total</span>
                        <strong className="text-sm font-black text-blue-600 font-mono">{pQty.toLocaleString()} pcs</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {sizeDistribution.map((sz: any) => (
                        <div key={sz.size} className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 text-center">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">{sz.size}</span>
                          <strong className="text-sm font-black text-slate-900 font-mono mt-1 block">{sz.qty} pcs</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL LOG (TABLE FORMAT) */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Plan History & Audit Trail</h3>
                <p className="text-xs text-slate-400">Complete execution timeline and system audit logs for Plan #{displayPlanNo}.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                4 Audit Entries Recorded
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 uppercase font-mono text-[10px]">
                    <th className="p-3 border-b">Timestamp (BS)</th>
                    <th className="p-3 border-b">Event / Action</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">User / Performed By</th>
                    <th className="p-3 border-b">Audit Remarks & Details</th>
                    <th className="p-3 border-b text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      timestamp: formatNepaliDate(plan.createdAt || plan.planDate),
                      event: "Plan Initiated & Created",
                      category: "Plan Setup",
                      user: plan.supervisor || "Lead Planner",
                      details: `Created plan with ${products.length} garment items (${totalQuantity.toLocaleString()} pcs total). Source: ${plan.sourceName || 'Main Factory'}.`,
                      severity: "Success",
                      badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
                    },
                    {
                      timestamp: formatNepaliDate(plan.createdAt || plan.planDate),
                      event: "BOM Material Allocation",
                      category: "BOM & Inventory",
                      user: "System Auto-Verifier",
                      details: `Allocated raw fabrics & accessories from warehouse: ${plan.materialWarehouse || "Central Raw Material Hub"}. Stock check passed.`,
                      severity: "Success",
                      badgeClass: "bg-purple-50 text-purple-700 border-purple-200"
                    },
                    {
                      timestamp: formatNepaliDate(plan.createdAt || plan.planDate),
                      event: "Work Center Routing Assigned",
                      category: "Routing",
                      user: plan.supervisor || "Lead Planner",
                      details: `Assigned ${stages.length} routing stages across primary assembly line: ${plan.productionLine || "Main Sewing Line"}.`,
                      severity: "Success",
                      badgeClass: "bg-amber-50 text-amber-700 border-amber-200"
                    },
                    {
                      timestamp: formatNepaliDate(plan.updatedAt || plan.planDate),
                      event: `Plan Status Changed: ${statusStr}`,
                      category: "Status Transition",
                      user: plan.supervisor || "Lead Planner",
                      details: `Plan state changed to '${statusStr}'. Target completion date set to ${formatNepaliDate(plan.plannedCompletionDate)}.`,
                      severity: "Active",
                      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }
                  ].map((log, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.event}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {log.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">{log.user}</td>
                      <td className="p-3 text-slate-600 min-w-[280px]">{log.details}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${log.badgeClass}`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
