"use client";

import React, { useState, useEffect } from "react";
import {
  fetchProductCategories as apiFetchProductCategories,
  createProductCategory as apiCreateProductCategory,
  updateProductCategory as apiUpdateProductCategory,
  deleteProductCategory as apiDeleteProductCategory,
  ProductCategoryDto,
} from "../../api/productcategory.api";

export interface ProductCategoryItem extends ProductCategoryDto {}

interface ManageProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: "1", name: "Jackets", categoryCode: "CAT-00001", isActive: true },
  { id: "2", name: "T-Shirts", categoryCode: "CAT-00002", isActive: true },
  { id: "3", name: "Pants", categoryCode: "CAT-00003", isActive: true },
  { id: "4", name: "Hoodies", categoryCode: "CAT-00004", isActive: true },
  { id: "5", name: "Shirts", categoryCode: "CAT-00005", isActive: true },
];

export function ManageProductCategoryModal({ isOpen, onClose }: ManageProductCategoryModalProps) {
  const [categories, setCategories] = useState<ProductCategoryItem[]>(DEFAULT_PRODUCT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Form state
  const [newCatName, setNewCatName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await apiFetchProductCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.warn("API GET http://localhost:5083/api/product-category failed, using fallback data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      await apiCreateProductCategory({
        name: newCatName.trim(),
        isActive: newIsActive,
      });
      await loadCategories();
      showToast(`Product category "${newCatName}" added successfully!`);
    } catch (err) {
      console.warn("Create product category API failed, fallback to local:", err);
      const fallback: ProductCategoryItem = {
        id: Date.now().toString(),
        name: newCatName.trim(),
        isActive: newIsActive,
      };
      setCategories((prev) => [fallback, ...prev]);
      showToast(`Product category "${newCatName}" added locally!`);
    } finally {
      setIsSubmitting(false);
      setNewCatName("");
      setNewIsActive(true);
    }
  };

  const handleToggleCategoryStatus = async (cat: ProductCategoryItem) => {
    const newStatus = cat.isActive === false ? true : false;

    // Optimistic update
    setCategories((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, isActive: newStatus } : item))
    );

    if (cat.id) {
      try {
        await apiUpdateProductCategory(cat.id, {
          name: cat.name,
          categoryCode: cat.categoryCode,
          isActive: newStatus,
        });
        showToast(`Category "${cat.name}" is now ${newStatus ? "Active" : "Inactive"}`);
      } catch (err) {
        console.warn("Update product category API failed:", err);
        showToast(`Updated status for "${cat.name}" locally`);
      }
    }
  };

  const handleDeleteCategory = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this product category?")) return;

    try {
      await apiDeleteProductCategory(id);
      showToast("Product category deleted successfully!");
      await loadCategories();
    } catch (err) {
      console.warn("Delete product category API failed, removing locally:", err);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Product category removed!");
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
              Manage Product Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure and organize product classification categories for manufacturing and sales catalog.
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
          {/* Add Category Form Section */}
          <form
            onSubmit={handleAddCategory}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add New Product Category
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Denim Jackets"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 font-mono">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Is Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !newCatName.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{isSubmitting ? "Saving..." : "Add Product Category"}</span>
              </button>
            </div>
          </form>

          {/* Directory List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Product Category Directory ({categories.length})
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
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                        Loading product categories from http://localhost:5083/api/product-category...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                        No product categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, idx) => (
                      <tr key={cat.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 font-medium">
                          {cat.categoryCode || "—"}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{cat.name}</td>
                        <td className="py-2.5 px-4 font-mono">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                cat.isActive !== false
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {cat.isActive !== false ? "Active" : "Inactive"}
                            </span>
                            {/* Visual Slider Switch Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleCategoryStatus(cat)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cat.isActive !== false ? "bg-emerald-600" : "bg-slate-300"
                              }`}
                              title={`Toggle status to ${cat.isActive !== false ? "Inactive" : "Active"}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  cat.isActive !== false ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product Category"
                          >
                            <span className="material-symbols-outlined text-base align-middle">delete</span>
                          </button>
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
