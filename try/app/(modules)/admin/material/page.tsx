"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";
import { ManageMaterialCategoryModal } from "../components/modals/managematerialcategorymodal";
import { ManageMaterialTypeModal } from "../components/modals/managematerialtypemodal";

export interface MaterialDirectoryItem {
  id: string;
  code: string;
  name: string;
  type: "fabric" | "trim" | "chemical" | "packaging";
  unit: string;
  categories: string[];
  pricePerUnit?: string | number;
  weightGsm?: string | number;
  widthInches?: string;
  colorCode?: string;
  composition?: string;
  qualityStandard?: string;
  mandatoryTests: string[];
  updatedBy: string;
  updatedAt: string;
}

const INITIAL_MATERIALS: MaterialDirectoryItem[] = [
  {
    id: "1",
    code: "MAT-FAB-001",
    name: "Primary Fabric - 100% Cotton Denim (14.5oz Indigo)",
    type: "fabric",
    unit: "meters",
    categories: ["Cotton", "Denim", "Woven"],
    pricePerUnit: "450",
    weightGsm: "420",
    widthInches: "58/60\"",
    colorCode: "TCX 19-4052 (Classic Navy Indigo)",
    composition: "98% Cotton, 2% Elastane",
    qualityStandard: "Oeko-Tex Standard 100",
    mandatoryTests: ["Color Fastness to Washing", "Shrinkage Test", "Tear Resistance"],
    updatedBy: "J. Smith",
    updatedAt: "10:42 AM",
  },
  {
    id: "2",
    code: "MAT-LIN-012",
    name: "Lining Material - Cotton Pocketing Twill",
    type: "fabric",
    unit: "meters",
    categories: ["Cotton", "Woven"],
    pricePerUnit: "180",
    weightGsm: "130",
    widthInches: "54\"",
    colorCode: "Bleached Natural White",
    composition: "100% Combed Cotton",
    qualityStandard: "ISO 9001 Certified",
    mandatoryTests: ["Formaldehyde & Chemical Safety", "Shrinkage Test"],
    updatedBy: "A. Kumar",
    updatedAt: "09:15 AM",
  },
  {
    id: "3",
    code: "MAT-TRM-005",
    name: "Trim - YKK 8 inch Heavy Brass Zipper",
    type: "trim",
    unit: "pcs",
    categories: ["Zippers", "Buckles"],
    pricePerUnit: "45",
    colorCode: "Antiqued Brass Finish",
    composition: "Solid Brass & Cotton Tape",
    qualityStandard: "YKK Quality Benchmark",
    mandatoryTests: ["Tensile Strength"],
    updatedBy: "M. Rossi",
    updatedAt: "Yesterday",
  },
  {
    id: "4",
    code: "MAT-DYE-B2",
    name: "Chemical - Vat Indigo Dye Concentrate #B2",
    type: "chemical",
    unit: "kg",
    categories: ["Indigo Liquid Dye", "Enzyme Wash"],
    pricePerUnit: "1,200",
    composition: "High-grade Vat Indigo Dye Extract",
    qualityStandard: "GOTS 6.0 Organic Chemical Standard",
    mandatoryTests: ["Formaldehyde & Chemical Safety"],
    updatedBy: "R. Sharma",
    updatedAt: "Yesterday",
  },
  {
    id: "5",
    code: "MAT-PKG-088",
    name: "Packaging - Master Cartons 5-Ply Corrugated",
    type: "packaging",
    unit: "pcs",
    categories: ["Master Cartons"],
    pricePerUnit: "85",
    composition: "Recycled Heavy-Duty Corrugated Board",
    qualityStandard: "Burst Strength Standard 14 kg/cm2",
    mandatoryTests: ["Tear Resistance"],
    updatedBy: "J. Smith",
    updatedAt: "Oct 24",
  },
];

export default function MaterialDirectoryPage() {
  const [materials, setMaterials] = useState<MaterialDirectoryItem[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Modal States
  const [isDefineMaterialModalOpen, setIsDefineMaterialModalOpen] = useState(false);
  const [isRegisterSkuModalOpen, setIsRegisterSkuModalOpen] = useState(false);
  const [isManageStagesModalOpen, setIsManageStagesModalOpen] = useState(false);
  const [isManageCategoryModalOpen, setIsManageCategoryModalOpen] = useState(false);
  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<MaterialDirectoryItem | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    const newEntry: MaterialDirectoryItem = {
      id: Date.now().toString(),
      code: matData.code || `MAT-${Date.now().toString().slice(-4)}`,
      name: matData.name,
      type: (matData.type || "fabric") as any,
      unit: matData.unit || "meters",
      categories: matData.categories || [],
      pricePerUnit: matData.pricePerUnit,
      weightGsm: matData.weightGsm,
      widthInches: matData.widthInches,
      colorCode: matData.colorCode,
      composition: matData.composition,
      qualityStandard: matData.qualityStandard,
      mandatoryTests: matData.mandatoryTests || [],
      updatedBy: "Admin User",
      updatedAt: "Just now",
    };
    setMaterials((prev) => [newEntry, ...prev]);
    showToast(`Successfully defined Material Spec: ${newEntry.name}`);
  };

  const handleSaveSku = (skuData: RegisterSkuFormData) => {
    showToast(`Successfully registered Product SKU: ${skuData.baseSku}`);
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove material specification "${name}"?`)) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      showToast(`Removed material spec "${name}"`);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType =
        selectedTypeFilter === "ALL" || item.type.toLowerCase() === selectedTypeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, selectedTypeFilter]);

  const TYPE_OPTIONS = ["ALL", "fabric", "trim", "chemical", "packaging"];

  return (
    <div className="space-y-6 text-[#191c1e] font-sans pb-12 w-full max-w-full">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transition-all animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Material Specs &amp; Raw Inventory Directory
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {materials.length} Materials
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized raw material specifications, quality standards, technical parameters, and unit costs.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Material Menu Dropdown (Hover / Click) */}
          <div
            className="relative"
            onMouseEnter={() => setIsMaterialMenuOpen(true)}
            onMouseLeave={() => setIsMaterialMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsMaterialMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Material Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isMaterialMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsDefineMaterialModalOpen(true);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">add</span>
                  <span>Define Material</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageCategoryModalOpen(true);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">category</span>
                  <span>Material Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageTypeModalOpen(true);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">settings_suggest</span>
                  <span>Material Type Manage</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsDefineMaterialModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Define Material</span>
          </button>
        </div>
      </div>

      {/* COMPACT BENTO KPI CARDS (4 GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Materials */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Material SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">category</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{materials.length}</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +14 synced with ERP
            </div>
          </div>
        </div>

        {/* Fabrics */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fabrics &amp; Knits
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">texture</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {materials.filter((m) => m.type === "fabric").length}
            </div>
            <div className="flex items-center text-blue-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
              Denim, Cotton, Linen
            </div>
          </div>
        </div>

        {/* Trims */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trims &amp; Hardware
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">hardware</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {materials.filter((m) => m.type === "trim").length}
            </div>
            <div className="flex items-center text-purple-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">shield</span>
              Zippers, Buttons, Tags
            </div>
          </div>
        </div>

        {/* Quality Certified */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quality Compliant
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {materials.filter((m) => m.qualityStandard).length}
            </div>
            <div className="flex items-center text-amber-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">verified_user</span>
              Oeko-Tex &amp; ISO 9001
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH MATERIAL CATALOG & CONTROLS TOOLBAR CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between w-full">
        <div>
          {/* Header Controls Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-slate-50/60 gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search material code, name, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Type Pills Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-mono uppercase overflow-x-auto">
              {TYPE_OPTIONS.map((t) => {
                const isActive = selectedTypeFilter === t;
                const count =
                  t === "ALL"
                    ? materials.length
                    : materials.filter((m) => m.type.toLowerCase() === t.toLowerCase()).length;

                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(t)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <span>{t}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width Material Directory Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-5">Material Name &amp; Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Categories</th>
                  <th className="py-3 px-4">Price / Unit</th>
                  <th className="py-3 px-4">Quality Standard</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-mono">
                      No material specifications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Code */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 shadow-sm">
                            {mat.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-snug">
                              {mat.name}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                              Code: <span className="font-bold text-slate-700">{mat.code}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border ${
                            mat.type === "fabric"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : mat.type === "trim"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : mat.type === "chemical"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {mat.type}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {mat.unit}
                      </td>

                      {/* Categories */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {mat.categories.map((c) => (
                            <span
                              key={c}
                              className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {mat.pricePerUnit ? `Rs ${mat.pricePerUnit}` : "—"}
                      </td>

                      {/* Quality Standard */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                        {mat.qualityStandard ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            {mat.qualityStandard}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Optional</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingMaterial(mat)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="View Material Spec"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete Material"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right text-xs text-slate-500 font-mono">
          Showing {filteredMaterials.length} of {materials.length} material specifications
        </div>
      </div>

      {/* VIEW MATERIAL SPEC MODAL */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900 my-auto space-y-4">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{viewingMaterial.name}</h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Material Code: <span className="font-bold text-slate-900">{viewingMaterial.code}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingMaterial(null)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Material Type</span>
                  <span className="font-bold text-slate-900 text-sm uppercase">{viewingMaterial.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Unit</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingMaterial.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Price per Unit</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingMaterial.pricePerUnit ? `Rs ${viewingMaterial.pricePerUnit}` : "N/A"}
                  </span>
                </div>
                {viewingMaterial.weightGsm && (
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Weight (GSM)</span>
                    <span className="font-bold text-slate-900 text-sm">{viewingMaterial.weightGsm}</span>
                  </div>
                )}
                {viewingMaterial.widthInches && (
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Width</span>
                    <span className="font-bold text-slate-900 text-sm">{viewingMaterial.widthInches}</span>
                  </div>
                )}
                {viewingMaterial.colorCode && (
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Color Code / Pantone</span>
                    <span className="font-bold text-slate-900 text-sm">{viewingMaterial.colorCode}</span>
                  </div>
                )}
              </div>

              {viewingMaterial.composition && (
                <div className="space-y-1 font-mono">
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">
                    Detailed Composition
                  </span>
                  <p className="text-slate-900 font-semibold text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {viewingMaterial.composition}
                  </p>
                </div>
              )}

              {viewingMaterial.mandatoryTests.length > 0 && (
                <div className="space-y-2 font-mono">
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">
                    Mandatory Quality Tests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {viewingMaterial.mandatoryTests.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMaterial(null)}
                className="px-4 py-2 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DefineMaterialModal
        isOpen={isDefineMaterialModalOpen}
        onClose={() => setIsDefineMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
      />

      <RegisterSkuModal
        isOpen={isRegisterSkuModalOpen}
        onClose={() => setIsRegisterSkuModalOpen(false)}
        onSave={handleSaveSku}
      />

      <ManageProductionStagesModal
        isOpen={isManageStagesModalOpen}
        onClose={() => setIsManageStagesModalOpen(false)}
      />

      <ManageMaterialCategoryModal
        isOpen={isManageCategoryModalOpen}
        onClose={() => setIsManageCategoryModalOpen(false)}
      />

      <ManageMaterialTypeModal
        isOpen={isManageTypeModalOpen}
        onClose={() => setIsManageTypeModalOpen(false)}
      />
    </div>
  );
}
