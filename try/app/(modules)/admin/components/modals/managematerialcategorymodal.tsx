"use client";

import React, { useState, useEffect } from "react";
import {
  fetchMaterialCategories as apiFetchMaterialCategories,
  createMaterialCategory as apiCreateMaterialCategory,
  updateMaterialCategory as apiUpdateMaterialCategory,
  deleteMaterialCategory as apiDeleteMaterialCategory,
  MaterialCategoryDto,
} from "../../api/materialcategory.api";
import { fetchMaterialTypes, MaterialTypeDto } from "../../api/materialtype.api";

export interface MaterialCategoryItem extends MaterialCategoryDto {
  materialType?: string;
}

interface ManageMaterialCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CATEGORIES: MaterialCategoryItem[] = [
  { id: "1", name: "Cotton", description: "100% Organic & Combed Cotton Weaves", materialType: "Fabric" },
  { id: "2", name: "Denim", description: "Indigo Dyed Heavyweight Twill Fabric", materialType: "Fabric" },
  { id: "3", name: "Zippers & Fasteners", description: "YKK Metallic & Nylon Zippers", materialType: "Trim" },
  { id: "4", name: "Dyes & Dope Wash", description: "Vat & Reactive Indigo Concentrates", materialType: "Chemical" },
  { id: "5", name: "Master Cartons", description: "Corrugated 5-Ply Shipping Boxes", materialType: "Packaging" },
];

export function ManageMaterialCategoryModal({ isOpen, onClose }: ManageMaterialCategoryModalProps) {
  const [categories, setCategories] = useState<MaterialCategoryItem[]>(DEFAULT_CATEGORIES);
  const [materialTypes, setMaterialTypes] = useState<MaterialTypeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Add / Edit Category Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCategoriesAndTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, types] = await Promise.all([
        apiFetchMaterialCategories().catch(() => []),
        fetchMaterialTypes().catch(() => []),
      ]);
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
      if (Array.isArray(types)) {
        setMaterialTypes(types);
        if (!selectedTypeId && types.length > 0 && types[0].id) {
          setSelectedTypeId(types[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load categories/types from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndTypes();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = (cat: MaterialCategoryItem) => {
    if (!cat.id) return;
    setEditingId(cat.id);
    setNewCatName(cat.name || "");
    setNewCatDesc(cat.description || "");
    setSelectedTypeId(cat.materialTypeId || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewCatName("");
    setNewCatDesc("");
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiUpdateMaterialCategory(editingId, {
          name: newCatName.trim(),
          materialTypeId: selectedTypeId || undefined,
          description: newCatDesc.trim(),
        });
        showToast(`Category "${newCatName}" updated successfully!`);
      } else {
        await apiCreateMaterialCategory({
          name: newCatName.trim(),
          materialTypeId: selectedTypeId || undefined,
          description: newCatDesc.trim(),
        });
        showToast(`Category "${newCatName}" added successfully!`);
      }
      await loadCategoriesAndTypes();
      handleCancelEdit();
    } catch (err) {
      console.error("Category save API failed:", err);
      showToast(`Failed to ${editingId ? "update" : "create"} category.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this material category?")) return;

    try {
      await apiDeleteMaterialCategory(id);
      showToast("Category deleted successfully!");
      await loadCategoriesAndTypes();
    } catch (err) {
      console.warn("Delete category API failed, removing locally:", err);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category removed!");
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <span className="material-symbols-outlined text-slate-700">category</span>
              Manage Material Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure and organize material classification categories for inventory & procurement.
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
          {/* Add / Edit Category Form Section */}
          <form
            onSubmit={handleSaveCategory}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  {editingId ? "edit_note" : "add_circle"}
                </span>
                {editingId ? "Edit Material Category" : "Add New Material Category"}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combed Cotton"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Material Type
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                >
                  {materialTypes.length > 0 ? (
                    materialTypes.map((t) => (
                      <option key={t.id || t.name} value={t.id || ""}>
                        {t.name} {t.unit ? `(${t.unit})` : ""}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Fabric</option>
                      <option value="">Trim</option>
                      <option value="">Chemical</option>
                      <option value="">Packaging</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief category specification or usage details..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
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
                disabled={isSubmitting || !newCatName.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  {editingId ? "edit" : "add"}
                </span>
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingId
                    ? "Update Category"
                    : "Add Category"}
                </span>
              </button>
            </div>
          </form>

          {/* Existing Categories Directory List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Category Directory ({categories.length})
              </h3>
              <div className="relative w-48">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter categories..."
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
                    <th className="py-2.5 px-4">Category Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">
                        Loading material categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, idx) => {
                      const matchedType = materialTypes.find((t) => t.id === cat.materialTypeId);
                      return (
                        <tr key={cat.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 font-medium">
                            {cat.materialCode || "—"}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{cat.name}</td>
                          <td className="py-2.5 px-4 font-mono">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">
                              {matchedType ? matchedType.name : cat.materialType || "General"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                            {cat.description || "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                title="Edit Material Category"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id ? String(cat.id) : undefined)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Material Category"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
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
