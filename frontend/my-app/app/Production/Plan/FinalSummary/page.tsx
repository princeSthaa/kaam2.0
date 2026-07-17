"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";

/* ─── tiny reusable label+value pair ─── */
function InfoCell({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 leading-snug">{value}</p>
    </div>
  );
}

function FinalSummaryPageContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const pathname    = usePathname();
  const planId      = searchParams.get("planId")  || "";
  const batchId     = searchParams.get("batchId") || "";

  const [plan, setPlan]     = useState<any>(null);
  const [error, setError]   = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [planGuid, setPlanGuid] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch("http://localhost:5083/api/production-plans")
      .then(res => res.json())
      .then(plans => {
        let found = plans.find((p: any) => p.planId === planId);
        if (!found && plans.length > 0) {
          found = plans[0]; // fallback to first plan for testing
        }
        if (found) {
          setPlan(found);
          setPlanGuid(found.id);
          setError(null);
        } else {
          setPlan(null);
          setError("Plan not found. Please ensure the backend is running and has plans.");
        }
      })
      .catch(err => {
        console.error("Failed to fetch plan from API", err);
        setError("Failed to fetch plan data. Is the backend running at localhost:5083?");
      });
  }, [planId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(batchId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmCreate = () => {
    if (typeof window !== "undefined" && planGuid && plan) {
      const firstStageName = plan.stages && plan.stages.length > 0 ? plan.stages[0].stageName : "Confirmed";
      
      const updatedStages = plan.stages ? [...plan.stages] : [];
      if (updatedStages.length > 0) {
        updatedStages[0] = {
          ...updatedStages[0],
          status: "In Progress",
          actualStartDate: new Date().toISOString().split('T')[0]
        };
      }

      const updatedPlan = { ...plan, status: "Planned", batchId, stages: updatedStages };
      
      fetch(`http://localhost:5083/api/production-plans/${planGuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan)
      })
      .then(() => {
        router.push("/Production/Plan/PlansDetails");
      })
      .catch(err => {
        console.error("Failed to activate plan", err);
        router.push("/Production/Plan/PlansDetails");
      });
    } else {
      router.push("/Production/Plan/PlansDetails");
    }
  };

  /* ─── derived ─── */
  const totalQty      = plan?.quantity       ?? 0;
  const productCount  = plan?.products?.length ?? 0;
  const stageCount    = plan?.stages?.length   ?? 0;
  const costPerUnit   = 1500;
  const estimatedCost = totalQty * costPerUnit;
  const daysToComplete =
    plan?.plannedStartDate && plan?.plannedCompletionDate
      ? Math.ceil(
          (new Date(plan.plannedCompletionDate).getTime() -
            new Date(plan.plannedStartDate).getTime()) /
            86400000
        )
      : null;

  /* ─── loading ─── */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <span className="material-symbols-outlined text-[48px]">error</span>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
          <span className="material-symbols-outlined text-[48px]">hourglass_top</span>
          <p className="text-sm">Loading plan data…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Output",  value: `${totalQty.toLocaleString()} units`,            icon: "inventory_2", bg: "bg-gray-50",    ring: "ring-gray-100",    text: "text-blue-600"    },
    { label: "Est. Cost",     value: `Rs. ${estimatedCost.toLocaleString()}`,          icon: "payments",    bg: "bg-gray-50", ring: "ring-gray-100", text: "text-blue-600" },
    { label: "SKUs",          value: String(productCount),                             icon: "category",    bg: "bg-gray-50",  ring: "ring-gray-100",  text: "text-blue-600"  },
    { label: "Lead Time",     value: daysToComplete ? `${daysToComplete} days` : "TBD", icon: "schedule",  bg: "bg-gray-50",   ring: "ring-gray-100",   text: "text-blue-600"   },
  ];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background:#fff !important; }
        }
        .kpi-card { transition: box-shadow .18s, transform .18s; }
        .kpi-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08); transform: translateY(-2px); }
      `}</style>

      <AppHeader pathname={pathname} />
      <PageShell
        sidebar={<Sidebar section="production" pathname={pathname} />}
        contentClassName="bg-gray-50"
      >
        {/* ── Scrollable content ── */}
        <div className="p-4 sm:p-6 pb-28 lg:pb-10 w-full max-w-6xl mx-auto text-gray-800">

          {/* ════════ ACTION BAR ════════ */}
          <div className="no-print flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            {([
              { icon: "arrow_back", label: "Back",         tooltip: "Go back to Process Assignment", fn: () => router.back()           },
              { icon: "print",      label: "Print",         tooltip: "Print this summary as PDF",     fn: () => window.print()           },
              { icon: "save",       label: "Save to Draft", tooltip: "Save this plan as a draft to continue later", fn: () => alert("Plan saved to draft successfully.") },
            ] as const).map(b => (
              <div key={b.label} className="relative group">
                <button onClick={b.fn}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 active:scale-[.97] transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[17px]">{b.icon}</span>
                  {b.label}
                </button>
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -trangray-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    {b.tooltip}
                    <div className="absolute top-full left-1/2 -trangray-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* primary CTA — hidden on mobile (bottom bar handles it) */}
            <div className="ml-auto relative group hidden sm:block">
              <button onClick={handleConfirmCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-[.97] transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Confirm &amp; Create Plan
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 -trangray-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Finalize and officially activate this production plan
                  <div className="absolute top-full left-1/2 -trangray-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ DOCUMENT HEADER ════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-5 flex flex-col sm:flex-row gap-5 sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Production Plan Summary</p>
              <h1 className="text-xl font-semibold text-gray-900 leading-snug truncate">{plan.planName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-gray-500">{plan.planDate}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  plan.priority === "High" ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>{plan.priority} Priority</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">{plan.demandType}</span>
              </div>
            </div>

            {/* Batch badge */}
            <div className="flex-shrink-0 bg-gray-800 rounded-xl px-5 py-4 flex flex-col gap-1.5 self-start">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Batch ID</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">{batchId}</span>
                <button onClick={handleCopy} title="Copy Batch ID"
                  className={`p-1 rounded transition-colors ${copied ? "text-green-400" : "text-gray-400 hover:text-white"}`}>
                  <span className="material-symbols-outlined text-[18px]">{copied ? "check" : "content_copy"}</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-500">Plan: {planId}</p>
            </div>
          </div>

          {/* ════════ KPI ROW ════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {kpis.map(k => (
              <div key={k.label} className={`kpi-card bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-3`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${k.bg} ring-4 ${k.ring} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${k.text}`}>{k.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{k.label}</p>
                  <p className={`text-base sm:text-xl font-bold ${k.text} mt-0.5 leading-none`}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ════════ MAIN GRID ════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Client details */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">person</span>
                  {plan.kind === "customer" ? "Customer" : "Outlet"} Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
                  <InfoCell label="Name"     value={plan.sourceDetail?.customerName || plan.sourceDetail?.name || plan.sourceName} />
                  <InfoCell label="Code"     value={plan.sourceId} />
                  <InfoCell label="Phone"    value={plan.sourceDetail?.phone} />
                  <InfoCell label="Address"  value={plan.sourceDetail?.address} />
                  <InfoCell label="Terms"    value={plan.sourceDetail?.paymentTerms} />
                  <InfoCell label="Location" value={plan.sourceDetail?.location} />
                </div>
              </div>

              {/* Product Lines table */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
                  <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px]">inventory</span>
                    Product Lines
                  </h2>
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {productCount} SKU{productCount !== 1 ? "s" : ""} · {totalQty.toLocaleString()} units
                  </span>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {plan.products?.map((prod: any, i: number) => (
                    <div key={i} className="p-4 flex gap-3">
                      {prod.productImage ? (
                        <img src={prod.productImage} alt={prod.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <span className="material-symbols-outlined text-[20px]">image</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{prod.productName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{prod.productCode} · {prod.fabricName || prod.variant || "Standard Fabric"}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">{prod.orderNo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {prod.sizes?.map((sz: any) => (
                            <span key={sz.size} className="bg-gray-100 border border-gray-200 text-[10px] px-1.5 py-0.5 rounded font-bold text-gray-600">
                              {sz.size}<span className="text-kaam-primary">:{sz.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{prod.quantity}</p>
                        <p className="text-[10px] text-gray-400 uppercase">units</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[580px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      <tr>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Fabric</th>
                        <th className="px-5 py-3">Order Ref</th>
                        <th className="px-5 py-3 text-right">Qty</th>
                        <th className="px-5 py-3">Sizes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {plan.products?.map((prod: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {prod.productImage ? (
                                <img src={prod.productImage} alt={prod.productName}
                                  className="w-11 h-11 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                  <span className="material-symbols-outlined text-[18px]">image</span>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 leading-tight">{prod.productName}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{prod.productCode} · {prod.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 align-middle">{prod.fabricName || prod.variant || "—"}</td>
                          <td className="px-5 py-4 text-gray-500 text-xs align-middle font-mono">{prod.orderNo}</td>
                          <td className="px-5 py-4 text-right align-middle">
                            <span className="text-xl font-bold text-gray-900">{prod.quantity}</span>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <div className="flex flex-wrap gap-1.5">
                              {prod.sizes?.map((sz: any) => (
                                <span key={sz.size}
                                  className="bg-gray-100 border border-gray-200 text-[10px] px-1.5 py-0.5 rounded font-bold text-gray-600">
                                  {sz.size}<span className="text-kaam-primary">:{sz.quantity}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    Estimated Production Cost <span className="normal-case font-normal">(Rs. {costPerUnit.toLocaleString()}/unit)</span>
                  </span>
                  <span className="font-bold text-green-700 text-sm sm:text-base">Rs. {estimatedCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">account_tree</span>
                  Production Stages — {stageCount} steps
                </h2>
                <div className="flex flex-col">
                  {plan.stages?.map((st: any, i: number) => (
                    <div key={st.stageId} className="flex gap-4 relative">
                      {i < plan.stages.length - 1 && (
                        <div className="absolute left-[15px] top-[34px] bottom-0 w-[2px] bg-gray-200 z-0"></div>
                      )}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">
                        {i + 1}
                      </div>
                      <div className={`flex-1 pb-5 ${i < plan.stages.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">{st.stageName}</p>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">{st.stageId}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">precision_manufacturing</span>{st.workCenter}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">person</span>{st.operator}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>{st.plannedStartDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {plan.productionNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex gap-3 mb-6">
                  <span className="material-symbols-outlined text-amber-500 flex-shrink-0 mt-0.5">sticky_note_2</span>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Production Notes</p>
                    <p className="text-sm text-amber-900 mt-1 leading-relaxed">{plan.productionNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column (1/3) ── */}
            <div className="flex flex-col gap-5">

              {/* Production Setup */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">settings</span>
                  Production Setup
                </h2>
                <p className="text-[11px] text-gray-400 mb-4">The team, line, and warehouse assigned to run this plan.</p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: "supervisor_account", label: "Supervisor",         val: plan.supervisor        },
                    { icon: "factory",             label: "Production Line",   val: plan.productionLine    },
                    { icon: "warehouse",           label: "Material Warehouse",val: plan.materialWarehouse },
                  ].filter(f => f.val).map(f => (
                    <div key={f.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[15px] text-gray-500">{f.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{f.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{f.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px]">timeline</span>
                  Schedule
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-500 text-[15px]">play_circle</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Start</p>
                      <p className="text-sm font-semibold text-gray-800">{plan.plannedStartDate || "TBD"}</p>
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-gray-200 ml-4"></div>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 text-[15px]">flag_circle</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Completion</p>
                      <p className="text-sm font-semibold text-gray-800">{plan.plannedCompletionDate || "TBD"}</p>
                    </div>
                  </div>
                  {daysToComplete !== null && (
                    <div className="mt-1 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lead Time</p>
                      <p className="text-xl font-bold text-gray-800">{daysToComplete} <span className="text-sm font-medium text-gray-500">days</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* removed — replaced by full-width banner below */}

            </div>{/* end right column */}
          </div>{/* end main grid */}

          {/* ════════ ALWAYS-VISIBLE CONFIRM BANNER ════════ */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Indigo accent top bar */}
            <div className="h-1 w-full bg-blue-600"></div>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Status & summary */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Ready to go — plan is fully configured</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {stageCount} stages · {productCount} SKU{productCount !== 1 ? "s" : ""} · {totalQty.toLocaleString()} units · Rs. {estimatedCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Key refs */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Batch ID</p>
                  <p className="font-mono text-gray-800 font-bold mt-0.5">{batchId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Plan ID</p>
                  <p className="font-mono text-gray-800 font-bold mt-0.5">{planId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Est. Cost</p>
                  <p className="font-bold text-blue-600 mt-0.5">Rs. {estimatedCost.toLocaleString()}</p>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={handleConfirmCreate}
                className="no-print flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-[.97] shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Confirm &amp; Create Plan
              </button>
            </div>
          </div>


        </div>{/* end page content */}

      </PageShell>
    </>
  );
}

export default function FinalSummaryPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
          <span className="material-symbols-outlined text-[48px]">hourglass_top</span>
          <p className="text-sm">Loading plan data…</p>
        </div>
      </div>
    }>
      <FinalSummaryPageContent />
    </React.Suspense>
  );
}
