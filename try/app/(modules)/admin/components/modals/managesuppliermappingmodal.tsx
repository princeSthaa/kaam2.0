"use client";

import React, { useState, useEffect } from "react";
import { MaterialMapping } from "./addsuppliermappingmodal";

interface ManageSupplierMappingModalProps {
  selectedMapping: MaterialMapping | null;
  onClose: () => void;
  onUpdate: (updatedMapping: MaterialMapping) => void;
}

export default function ManageSupplierMappingModal({
  selectedMapping,
  onClose,
  onUpdate,
}: ManageSupplierMappingModalProps) {
  const [modalTab, setModalTab] = useState<"terms" | "leadtime" | "price">("terms");
  const [editingMapping, setEditingMapping] = useState<MaterialMapping | null>(selectedMapping);

  useEffect(() => {
    setEditingMapping(selectedMapping);
  }, [selectedMapping]);

  if (!selectedMapping || !editingMapping) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editingMapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 srm-modal-backdrop overflow-y-auto">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200 srm-modal-content">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow">
              <span className="material-symbols-outlined">settings_suggest</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Manage Mapping: {editingMapping.sku}
              </h1>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                Material SKU: {editingMapping.sku} • {editingMapping.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content Area - 2 Columns (Sub-Sidebar + Pane) */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row text-xs">
          {/* Left Sub-Sidebar */}
          <aside className="w-full md:w-56 border-r border-slate-200 bg-slate-50 p-4 space-y-1 shrink-0">
            <button
              type="button"
              onClick={() => setModalTab("terms")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                modalTab === "terms"
                  ? "bg-slate-900 text-white font-bold shadow"
                  : "text-slate-600 hover:bg-slate-200/60 font-semibold"
              }`}
            >
              <span className="material-symbols-outlined text-base">factory</span>
              <span className="font-mono text-xs uppercase">Supplier Terms</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab("leadtime")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                modalTab === "leadtime"
                  ? "bg-slate-900 text-white font-bold shadow"
                  : "text-slate-600 hover:bg-slate-200/60 font-semibold"
              }`}
            >
              <span className="material-symbols-outlined text-base">schedule</span>
              <span className="font-mono text-xs uppercase">Lead Time History</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab("price")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                modalTab === "price"
                  ? "bg-slate-900 text-white font-bold shadow"
                  : "text-slate-600 hover:bg-slate-200/60 font-semibold"
              }`}
            >
              <span className="material-symbols-outlined text-base">trending_up</span>
              <span className="font-mono text-xs uppercase">Price Variance</span>
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
              <h4 className="px-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                QUICK ACTIONS
              </h4>
              <button
                type="button"
                onClick={() => alert(`Quote request initiated for ${editingMapping.sku}`)}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-base">request_quote</span>
                <span>Request Quote</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("leadtime")}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-base">update</span>
                <span>Update Lead Time</span>
              </button>
            </div>
          </aside>

          {/* Right Content Panes */}
          <main className="flex-1 p-6 md:p-8 bg-white space-y-6">
            {/* Pane 1: Supplier Terms */}
            {modalTab === "terms" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mapping & Commercials</h3>
                  <p className="text-xs text-slate-500">
                    Configure primary procurement channels and volume thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Supplier */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      PRIMARY SUPPLIER *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMapping.primarySupplier}
                      onChange={(e) =>
                        setEditingMapping({
                          ...editingMapping,
                          primarySupplier: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Secondary Supplier */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      SECONDARY SUPPLIER
                    </label>
                    <input
                      type="text"
                      value={editingMapping.secondarySupplier || ""}
                      onChange={(e) =>
                        setEditingMapping({
                          ...editingMapping,
                          secondarySupplier: e.target.value,
                        })
                      }
                      placeholder="Backup Supplier"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      UNIT PRICE (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                        Rs
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingMapping.unitPrice}
                        onChange={(e) =>
                          setEditingMapping({
                            ...editingMapping,
                            unitPrice: Number(e.target.value),
                          })
                        }
                        className="w-full h-10 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* MOQ */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      MINIMUM ORDER QTY (MOQ)
                    </label>
                    <input
                      type="text"
                      value={editingMapping.moq}
                      onChange={(e) =>
                        setEditingMapping({
                          ...editingMapping,
                          moq: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Context KPI Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase">CURRENT STOCK</span>
                      <span className="material-symbols-outlined text-slate-700 text-base">inventory</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      4,200 <span className="text-xs font-normal text-slate-500">Mtrs</span>
                    </div>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase">YTD VARIANCE</span>
                      <span className="material-symbols-outlined text-emerald-600 text-base">trending_down</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-emerald-600">
                      -2.4% <span className="text-xs font-normal text-slate-500">vs Avg</span>
                    </div>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase">ACTIVE POs</span>
                      <span className="material-symbols-outlined text-amber-600 text-base">pending_actions</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      03 <span className="text-xs font-normal text-slate-500">Orders</span>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Pane 2: Lead Time History */}
            {modalTab === "leadtime" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lead Time Performance</h3>
                  <p className="text-xs text-slate-500">
                    Historical fulfillment cycles for {editingMapping.sku}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] font-bold text-slate-400 uppercase">LAST ORDER</p>
                      <p className="font-mono text-2xl font-bold text-slate-900">
                        {editingMapping.leadTimeDays} <span className="text-xs font-normal text-slate-500">Days</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] font-bold text-slate-400 uppercase">AVG PERFORMANCE</p>
                      <p className="font-mono text-2xl font-bold text-slate-900">
                        14 <span className="text-xs font-normal text-slate-500">Days</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">monitoring</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                    RECENT ORDERS FULFILLMENT
                  </label>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="w-24 text-slate-500">PO #88210</div>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[60%]"></div>
                      </div>
                      <div className="w-12 text-right font-bold text-slate-900">12d</div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="w-24 text-slate-500">PO #87902</div>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[85%]"></div>
                      </div>
                      <div className="w-12 text-right font-bold text-slate-900">17d</div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="w-24 text-slate-500">PO #87554</div>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full w-[70%]"></div>
                      </div>
                      <div className="w-12 text-right font-bold text-slate-900">14d</div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                      <span>Target: 14 Days</span>
                      <span>Deviation: -1.2 Days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 3: Price Variance */}
            {modalTab === "price" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Price Variance Analysis</h3>
                  <p className="text-xs text-slate-500">
                    Market benchmark vs Current procurement cost (${editingMapping.unitPrice.toFixed(2)}/unit).
                  </p>
                </div>

                <div className="h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-4 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-slate-700">bar_chart</span>
                  <p className="font-mono text-xs text-center font-semibold text-slate-700">
                    Price Variance: {editingMapping.priceVariance > 0 ? `+${editingMapping.priceVariance}%` : `${editingMapping.priceVariance}%`} vs Market Benchmark
                  </p>
                  <p className="text-[11px] text-slate-400 text-center">
                    Cost history is synced with factory material ledger.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-10 text-xs">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <span className="material-symbols-outlined text-base">info</span>
            <span>Changes will affect future MRP calculations.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 font-mono font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-slate-900 text-white font-mono font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
