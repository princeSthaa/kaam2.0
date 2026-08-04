"use client";

import React, { useState, useEffect } from "react";

export interface MaterialTypeItem {
  id?: string | number;
  name: string;
  code: string;
  defaultUom?: string;
  description?: string;
}

interface ManageMaterialTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TYPES: MaterialTypeItem[] = [
  { id: 1, name: "Fabric", code: "TYP-FAB", defaultUom: "meters", description: "Woven, knitted, or non-woven raw textile rolls" },
  { id: 2, name: "Trim & Hardware", code: "TYP-TRM", defaultUom: "pcs", description: "Zippers, buttons, rivets, buckles, and thread" },
  { id: 3, name: "Chemical & Wash", code: "TYP-CHM", defaultUom: "kg", description: "Dyes, enzymes, softeners, and chemical agents" },
  { id: 4, name: "Packaging Materials", code: "TYP-PKG", defaultUom: "pcs", description: "Cartons, polybags, tags, and barcode stickers" },
];

export function ManageMaterialTypeModal({ isOpen, onClose }: ManageMaterialTypeModalProps) {
  const [types, setTypes] = useState<MaterialTypeItem[]>(DEFAULT_TYPES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Type Form state
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [newTypeUom, setNewTypeUom] = useState("meters");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const API_URL = "http://localhost:5083/api/material-type";

  const fetchMaterialTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTypes(data);
        }
      }
    } catch (err: any) {
      console.warn("API GET http://localhost:5083/api/material-type failed, fallback to local data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMaterialTypes();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setIsSubmitting(true);
    const typePayload: MaterialTypeItem = {
      name: newTypeName.trim(),
      code: newTypeCode.trim() || `TYP-${Date.now().toString().slice(-4)}`,
      defaultUom: newTypeUom,
      description: newTypeDesc.trim(),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typePayload),
      });

      if (res.ok) {
        const created = await res.json();
        setTypes((prev) => [created || typePayload, ...prev]);
        showToast(`Material Type "${newTypeName}" created via API!`);
      } else {
        setTypes((prev) => [{ ...typePayload, id: Date.now() }, ...prev]);
        showToast(`Material Type "${newTypeName}" added to directory!`);
      }
    } catch (err) {
      setTypes((prev) => [{ ...typePayload, id: Date.now() }, ...prev]);
      showToast(`Material Type "${newTypeName}" added locally!`);
    } finally {
      setIsSubmitting(false);
      setNewTypeName("");
      setNewTypeCode("");
      setNewTypeDesc("");
    }
  };

  if (!isOpen) return null;

  const filteredTypes = types.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden text-slate-900 my-auto flex flex-col max-h-[90vh]">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
              {toastMessage}
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">settings_suggest</span>
              Manage Material Types
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure and organize material types and default units of measurement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Add Type Form Section */}
          <form
            onSubmit={handleAddType}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add New Material Type
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthetic Rubber"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Type Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. TYP-RUB"
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Default UOM
                </label>
                <select
                  value={newTypeUom}
                  onChange={(e) => setNewTypeUom(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                >
                  <option value="meters">meters</option>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="rolls">rolls</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Classification rules and default inventory behavior..."
                value={newTypeDesc}
                onChange={(e) => setNewTypeDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !newTypeName.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{isSubmitting ? "Saving..." : "Add Material Type"}</span>
              </button>
            </div>
          </form>

          {/* Existing Material Types List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Material Types Directory ({types.length})
              </h3>
              <div className="relative w-48">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Type Name</th>
                    <th className="py-2.5 px-4">Default UOM</th>
                    <th className="py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                        Loading material types from {API_URL}...
                      </td>
                    </tr>
                  ) : filteredTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                        No material types found.
                      </td>
                    </tr>
                  ) : (
                    filteredTypes.map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{t.code}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{t.name}</td>
                        <td className="py-2.5 px-4 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">
                            {t.defaultUom || "meters"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                          {t.description || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
