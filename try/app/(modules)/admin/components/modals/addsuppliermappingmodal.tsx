"use client";

import React, { useState } from "react";

export interface MaterialMapping {
  id: string;
  sku: string;
  description: string;
  primarySupplier: string;
  secondarySupplier?: string;
  leadTimeDays: number;
  unitPrice: number;
  priceVariance: number;
  priceTrend: "up" | "down" | "flat";
  moq: string;
  moqDetail: string;
  lastOrderDate: string;
  poNumber: string;
  riskStatus: "NORMAL" | "WARNING" | "CRITICAL";
}

interface AddSupplierMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newMappingData: Partial<MaterialMapping>) => void;
}

export default function AddSupplierMappingModal({
  isOpen,
  onClose,
  onSave,
}: AddSupplierMappingModalProps) {
  const [newMapping, setNewMapping] = useState<Partial<MaterialMapping>>({
    leadTimeDays: 14,
    riskStatus: "NORMAL",
    priceTrend: "flat",
  });

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapping.sku || !newMapping.primarySupplier) return;

    onSave(newMapping);
    onClose();
    setNewMapping({ leadTimeDays: 14, riskStatus: "NORMAL", priceTrend: "flat" });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 srm-modal-backdrop overflow-y-auto">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200 srm-modal-content">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New Supplier Mapping</h3>
              <div className="flex items-center mt-2 space-x-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                  SKU CONTEXT
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {newMapping.sku || "FAB-COT-NAVY-01"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Material Identification */}
          <section className="space-y-2">
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MATERIAL IDENTIFICATION
            </label>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FAB-COT-NAVY-01"
                  value={newMapping.sku || ""}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, sku: e.target.value })
                  }
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Organic Cotton Twill 200GSM"
                  value={newMapping.description || ""}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, description: e.target.value })
                  }
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Supplier Assignment */}
          <section className="space-y-2">
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SUPPLIER ASSIGNMENT
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Supplier *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-11 focus-within:ring-2 focus-within:ring-slate-900">
                  <span className="material-symbols-outlined px-3 text-slate-400 text-base">search</span>
                  <input
                    type="text"
                    required
                    placeholder="Search primary supplier..."
                    value={newMapping.primarySupplier || ""}
                    onChange={(e) =>
                      setNewMapping({ ...newMapping, primarySupplier: e.target.value })
                    }
                    className="w-full h-full bg-transparent border-none focus:outline-none text-slate-900 pr-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Secondary Supplier (Optional)</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-11 focus-within:ring-2 focus-within:ring-slate-900">
                  <span className="material-symbols-outlined px-3 text-slate-400 text-base">search</span>
                  <input
                    type="text"
                    placeholder="Search backup supplier..."
                    value={newMapping.secondarySupplier || ""}
                    onChange={(e) =>
                      setNewMapping({ ...newMapping, secondarySupplier: e.target.value })
                    }
                    className="w-full h-full bg-transparent border-none focus:outline-none text-slate-900 pr-3"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Logistics & Commercial Data */}
          <section className="space-y-2">
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              LOGISTICS & COMMERCIAL DATA
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Std. Lead Time (Days)</label>
                <input
                  type="number"
                  value={newMapping.leadTimeDays || 14}
                  onChange={(e) =>
                    setNewMapping({
                      ...newMapping,
                      leadTimeDays: Number(e.target.value),
                    })
                  }
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">MOQ (Units/Mtrs)</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Meters"
                  value={newMapping.moq || ""}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, moq: e.target.value })
                  }
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Unit Price (Rs)</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl h-11 px-3 focus-within:ring-2 focus-within:ring-slate-900">
                  <span className="font-mono text-slate-400 mr-2">Rs</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.50"
                    value={newMapping.unitPrice || ""}
                    onChange={(e) =>
                      setNewMapping({
                        ...newMapping,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    className="w-full h-full bg-transparent border-none focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Quality & Compliance */}
          <section className="space-y-2">
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              QUALITY INDICATORS
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Quality Grade</label>
                <select className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none">
                  <option>Grade A (Premium - 99%+ pass rate)</option>
                  <option>Grade B (Standard - 95%+ pass rate)</option>
                  <option>Grade C (Economy - 90%+ pass rate)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase font-mono leading-none">
                    Automated Validation
                  </p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Pricing within ±5% of market benchmark.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Information Notice */}
          <div className="p-4 bg-slate-100 flex items-start space-x-3 rounded-xl border border-slate-200 text-slate-700">
            <span className="material-symbols-outlined text-slate-800 text-lg shrink-0 mt-0.5">info</span>
            <p className="text-xs leading-relaxed">
              Creating this mapping will update the sourcing priority for <strong>{newMapping.sku || "this material"}</strong> across all active production planning modules. Primary suppliers are auto-selected for RFQs.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              <span>Discard</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-mono text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add_link</span>
                <span>Create Mapping</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
