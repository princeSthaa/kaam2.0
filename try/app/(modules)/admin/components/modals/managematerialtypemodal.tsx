"use client";

import React, { useState, useEffect } from "react";
import {
  fetchMaterialTypes as apiFetchMaterialTypes,
  createMaterialType as apiCreateMaterialType,
  updateMaterialType as apiUpdateMaterialType,
  deleteMaterialType as apiDeleteMaterialType,
  MaterialTypeDto,
} from "../../api/materialtype.api";

export interface MaterialTypeItem extends MaterialTypeDto {
  defaultUom?: string;
}

interface ManageMaterialTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMaterialTypeModal({ isOpen, onClose }: ManageMaterialTypeModalProps) {
  const [types, setTypes] = useState<MaterialTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add / Edit Type Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeUom, setNewTypeUom] = useState("meters");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMaterialTypes = async () => {
    setLoading(true);
    try {
      const data = await apiFetchMaterialTypes();
      if (Array.isArray(data)) {
        setTypes(data);
      }
    } catch (err: any) {
      console.error("Failed to load material types from server:", err);
      showToast("Failed to load material types from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMaterialTypes();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = (item: MaterialTypeItem) => {
    if (!item.id) return;
    setEditingId(item.id);
    setNewTypeName(item.name || "");
    setNewTypeUom(item.unit || item.defaultUom || "meters");
    setNewTypeDesc(item.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTypeName("");
    setNewTypeUom("meters");
    setNewTypeDesc("");
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiUpdateMaterialType(editingId, {
          name: newTypeName.trim(),
          unit: newTypeUom,
          defaultUom: newTypeUom,
          description: newTypeDesc.trim(),
        });
        showToast(`Material Type "${newTypeName}" updated successfully!`);
      } else {
        await apiCreateMaterialType({
          name: newTypeName.trim(),
          unit: newTypeUom,
          defaultUom: newTypeUom,
          description: newTypeDesc.trim(),
        });
        showToast(`Material Type "${newTypeName}" created successfully!`);
      }
      await loadMaterialTypes();
      handleCancelEdit();
    } catch (err: any) {
      console.error("Failed to save material type via API:", err);
      showToast(`Failed to ${editingId ? "update" : "create"} material type. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this material type?")) return;

    try {
      await apiDeleteMaterialType(id);
      showToast("Material Type deleted successfully!");
      await loadMaterialTypes();
    } catch (err) {
      console.error("Failed to delete material type via API:", err);
      showToast("Failed to delete material type.");
    }
  };

  if (!isOpen) return null;

  const filteredTypes = types.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          {/* Add / Edit Type Form Section */}
          <form
            onSubmit={handleSaveType}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  {editingId ? "edit_note" : "add_circle"}
                </span>
                {editingId ? "Edit Material Type" : "Add New Material Type"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="flex justify-end pt-1 gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !newTypeName.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  {editingId ? "edit" : "add"}
                </span>
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingId
                    ? "Update Material Type"
                    : "Add Material Type"}
                </span>
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
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">
                        Loading material types...
                      </td>
                    </tr>
                  ) : filteredTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">
                        No material types found.
                      </td>
                    </tr>
                  ) : (
                    filteredTypes.map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 font-medium">
                          {t.materialCode || "—"}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{t.name}</td>
                        <td className="py-2.5 px-4 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">
                            {t.unit || t.defaultUom || "meters"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                          {t.description || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(t)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Edit Material Type"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteType(t.id ? String(t.id) : undefined)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Material Type"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
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
