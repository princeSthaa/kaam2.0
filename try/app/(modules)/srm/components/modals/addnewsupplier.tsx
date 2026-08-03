"use client";

import React, { useState, useEffect, useRef } from "react";

export interface SupplierFormData {
  id?: string;
  name: string;
  code: string;
  category?: string;
  email?: string;
  phone?: string;
  location?: string;
  materialCategoryIds?: string[];
}

interface AddNewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (supplierData: SupplierFormData) => void;
}

export function CategoryMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5083/api/material")
      .then((res) => res.json())
      .then((data: any[]) => {
        const unique = new Map();
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.materialCategoryId && item.materialTypeName) {
              unique.set(item.materialCategoryId, item.materialTypeName);
            }
          });
        }
        const catArray = Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
        setCategories(catArray);
      })
      .catch((err) => console.error("Failed to fetch material categories:", err));
  }, []);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-within:ring-2 focus-within:ring-slate-900 cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 && <span className="text-slate-400">Select Categories...</span>}
        {selectedIds.map((id) => {
          const cat = categories.find((c) => c.id === id);
          return (
            <span
              key={id}
              className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm"
            >
              {cat ? cat.name.toUpperCase() : id}
              <span
                className="material-symbols-outlined text-[14px] cursor-pointer hover:text-slate-300"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(id);
                }}
              >
                close
              </span>
            </span>
          );
        })}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 outline-none text-xs focus:ring-1 focus:ring-slate-900"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="px-3 py-2 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(cat.id);
                }}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedIds.includes(cat.id)
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedIds.includes(cat.id) && (
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  )}
                </div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function getInitials(name: string): string {
  if (!name) return "SUP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function AddNewSupplierModal({
  isOpen,
  onClose,
  onSave,
}: AddNewSupplierModalProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    code: "",
    category: "FABRIC",
    email: "",
    phone: "",
    location: "",
    materialCategoryIds: [],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (onSave) {
      onSave(formData);
    }
    onClose();
    // Reset form
    setFormData({
      name: "",
      code: "",
      category: "FABRIC",
      email: "",
      phone: "",
      location: "",
      materialCategoryIds: [],
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 srm-modal-backdrop overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 srm-modal-content space-y-6 my-8 max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow">
              <span className="material-symbols-outlined">add_business</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Account</h2>
              <p className="text-xs text-slate-500 font-sans">
                Initialize entry for Industrial SRM procurement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body - 2 Columns Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form (8 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 text-xs">
            {/* Core Identity Section */}
            <section className="space-y-3">
              <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                CORE IDENTITY
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">BRAND / COMPANY NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industrial Fabrics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">SUPPLIER CODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="SUP-FAB-2026-X"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">CATEGORIES</label>
                  <div className="relative">
                    <CategoryMultiSelect
                      selectedIds={formData.materialCategoryIds || []}
                      onChange={(ids) => setFormData({ ...formData, materialCategoryIds: ids })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Communication Nodes Section */}
            <section className="space-y-3">
              <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                COMMUNICATION NODES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">PHONE</label>
                  <input
                    type="tel"
                    placeholder="+977 1-4000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Physical Location Section */}
            <section className="space-y-3">
              <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                PHYSICAL LOCATION
              </h3>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">PRIMARY ADDRESS</label>
                <textarea
                  rows={2}
                  placeholder="Full facility address including City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                ></textarea>
              </div>
            </section>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                DISCARD
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
              >
                CREATE SUPPLIER ACCOUNT
              </button>
            </div>
          </form>

          {/* Right Column: Visual Preview Cards (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Onboarding Preview Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                ONBOARDING PREVIEW
              </div>
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow">
                {formData.name ? getInitials(formData.name) : "SUP"}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {formData.name || "Brand Name Placeholder"}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {formData.code || "SUP-AUTO-ID"}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded border border-emerald-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                ACTIVE REG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
