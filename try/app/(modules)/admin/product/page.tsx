"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";
import { ManageProductCategoryModal } from "../components/modals/manageproductcategorymodal";

export interface ProductDirectoryItem {
  id: string;
  baseSku: string;
  name: string;
  category: string;
  gender: string;
  uom: string;
  sizes: string[];
  materialsCount: number;
  stagesCount: number;
  status: "Active" | "Review" | "Draft" | "Archived";
  updatedBy: string;
  updatedAt: string;
  thumbnailUrl?: string;
  adminNotes?: string;
}

const INITIAL_PRODUCTS: ProductDirectoryItem[] = [
  {
    id: "1",
    baseSku: "JKT-DNM-IND-001",
    name: "Premium Denim Jacket - Indigo Series",
    category: "Jackets",
    gender: "Unisex",
    uom: "pcs",
    sizes: ["S", "M", "L", "XL", "XXL"],
    materialsCount: 3,
    stagesCount: 4,
    status: "Active",
    updatedBy: "J. Smith",
    updatedAt: "10:42 AM",
    adminNotes: "Standard 14.5oz Indigo Denim jacket with custom topstitching.",
  },
  {
    id: "2",
    baseSku: "TSH-COT-BLK-042",
    name: "Heavyweight Crewneck Tee - Charcoal",
    category: "T-Shirts",
    gender: "Male",
    uom: "pcs",
    sizes: ["XS", "S", "M", "L", "XL"],
    materialsCount: 2,
    stagesCount: 3,
    status: "Active",
    updatedBy: "A. Kumar",
    updatedAt: "09:15 AM",
    adminNotes: "100% Organic Combed Cotton knit fabric 220 GSM.",
  },
  {
    id: "3",
    baseSku: "PNT-SLV-RAW-008",
    name: "Selvedge Raw Denim Tapered Pants",
    category: "Pants",
    gender: "Male",
    uom: "pcs",
    sizes: ["S", "M", "L", "XL"],
    materialsCount: 4,
    stagesCount: 5,
    status: "Review",
    updatedBy: "M. Rossi",
    updatedAt: "Yesterday",
    adminNotes: "Japanese raw selvedge 15oz weave with copper shank buttons.",
  },
  {
    id: "4",
    baseSku: "HDY-FLC-GRY-102",
    name: "Oversized Fleece Pullover Hoodie",
    category: "Hoodies",
    gender: "Unisex",
    uom: "pcs",
    sizes: ["S", "M", "L", "XL", "XXL"],
    materialsCount: 3,
    stagesCount: 3,
    status: "Active",
    updatedBy: "R. Sharma",
    updatedAt: "Yesterday",
    adminNotes: "Heavy brushed fleece interior with double-lined hood.",
  },
  {
    id: "5",
    baseSku: "SHR-LNN-WHT-055",
    name: "Relaxed Fit Linen Button-Down Shirt",
    category: "Shirts",
    gender: "Female",
    uom: "pcs",
    sizes: ["XS", "S", "M", "L"],
    materialsCount: 2,
    stagesCount: 3,
    status: "Draft",
    updatedBy: "J. Smith",
    updatedAt: "Oct 24",
    adminNotes: "Pre-washed 100% French linen fabric for soft texture.",
  },
];

export default function ProductDirectoryPage() {
  const [products, setProducts] = useState<ProductDirectoryItem[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Modal States
  const [isRegisterSkuModalOpen, setIsRegisterSkuModalOpen] = useState(false);
  const [isDefineMaterialModalOpen, setIsDefineMaterialModalOpen] = useState(false);
  const [isManageStagesModalOpen, setIsManageStagesModalOpen] = useState(false);
  const [isManageProductCategoryModalOpen, setIsManageProductCategoryModalOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<ProductDirectoryItem | null>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setIsProductMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveSku = (skuData: RegisterSkuFormData) => {
    const newEntry: ProductDirectoryItem = {
      id: Date.now().toString(),
      baseSku: skuData.baseSku || `SKU-${Date.now().toString().slice(-4)}`,
      name: skuData.productName,
      category: skuData.category ? skuData.category.charAt(0).toUpperCase() + skuData.category.slice(1) : "Garments",
      gender: skuData.gender ? skuData.gender.charAt(0).toUpperCase() + skuData.gender.slice(1) : "Unisex",
      uom: skuData.uom || "pcs",
      sizes: skuData.selectedSizes.map((s) => s.toUpperCase()),
      materialsCount: skuData.materials.length,
      stagesCount: skuData.pipelineStages.length,
      status: (skuData.lifecycleStatus
        ? skuData.lifecycleStatus.charAt(0).toUpperCase() + skuData.lifecycleStatus.slice(1)
        : "Active") as any,
      updatedBy: "Admin User",
      updatedAt: "Just now",
      adminNotes: skuData.adminNotes,
    };
    setProducts((prev) => [newEntry, ...prev]);
    showToast(`Successfully registered Product SKU: ${newEntry.baseSku}`);
  };

  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    showToast(`Successfully defined Material Spec: ${matData.name}`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Removed product item "${name}"`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.baseSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStatus =
        selectedStatus === "ALL" || item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const CATEGORY_OPTIONS = ["ALL", "Jackets", "T-Shirts", "Pants", "Hoodies", "Shirts"];

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
              Product Directory &amp; SKU Catalog
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized product catalog, Bill of Materials (BOM) size matrices, and manufacturing stage assignments.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Product Menu Dropdown (Click Controlled with Click Outside Ref) */}
          <div className="relative" ref={productMenuRef}>
            <button
              type="button"
              onClick={() => setIsProductMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Product Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isProductMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterSkuModalOpen(true);
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">add</span>
                  <span>Register Product SKU</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageStagesModalOpen(true);
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">account_tree</span>
                  <span>Manage Production Stage</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageProductCategoryModalOpen(true);
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">category</span>
                  <span>Manage Product Category</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsRegisterSkuModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Register Product SKU</span>
          </button>
        </div>
      </div>

      {/* COMPACT BENTO KPI CARDS (4 GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Products */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Product SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">category</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{products.length}</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +24 catalog items active
            </div>
          </div>
        </div>

        {/* BOM Configured */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              BOM Specs Linked
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">inventory_2</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {products.filter((p) => p.materialsCount > 0).length}
            </div>
            <div className="flex items-center text-blue-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
              Precision size matrix enabled
            </div>
          </div>
        </div>

        {/* Manufacturing Stages */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Production Pipeline
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">account_tree</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {products.filter((p) => p.status === "Active").length}
            </div>
            <div className="flex items-center text-amber-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">precision_manufacturing</span>
              Active cutting &amp; assembly
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Spec Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">rate_review</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {products.filter((p) => p.status === "Review" || p.status === "Draft").length}
            </div>
            <div className="flex items-center text-rose-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">warning</span>
              Requires admin verification
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH PRODUCT DIRECTORY & TOOLBAR CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between w-full">
        <div>
          {/* Controls Header Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-slate-50/60 gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search SKU code, name, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-mono uppercase">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Pills */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-mono">
                {["ALL", "Active", "Review", "Draft"].map((st) => {
                  const isActive = selectedStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Directory Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-5">Product Name / Base SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Sizes</th>
                  <th className="py-3 px-4">BOM Spec</th>
                  <th className="py-3 px-4">Pipeline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-mono">
                      No product items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                            {prod.baseSku.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-snug">
                              {prod.name}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                              SKU: <span className="font-bold text-slate-700">{prod.baseSku}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-slate-700 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 inline-block">
                          {prod.category}
                        </span>
                      </td>

                      {/* Sizes */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {prod.sizes.map((sz) => (
                            <span
                              key={sz}
                              className="font-mono text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* BOM Spec */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm text-slate-400">inventory_2</span>
                          {prod.materialsCount} Materials
                        </span>
                      </td>

                      {/* Pipeline Stages */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm text-slate-400">account_tree</span>
                          {prod.stagesCount} Stages
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            prod.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : prod.status === "Review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              prod.status === "Active"
                                ? "bg-emerald-600"
                                : prod.status === "Review"
                                ? "bg-amber-600"
                                : "bg-slate-500"
                            }`}
                          ></span>
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingProduct(prod)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-mono font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                          title="View Product Spec"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete Product"
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
          Showing {filteredProducts.length} of {products.length} products in catalog
        </div>
      </div>

      {/* VIEW PRODUCT SPEC DRAWER / MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900 my-auto space-y-4">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{viewingProduct.name}</h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Base SKU: <span className="font-bold text-slate-900">{viewingProduct.baseSku}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Garment Category</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingProduct.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Target Variant</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingProduct.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Unit of Measure</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingProduct.uom}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Lifecycle Status</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingProduct.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Configured Available Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewingProduct.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-3 py-1.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-sm"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>

              {viewingProduct.adminNotes && (
                <div className="space-y-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <span className="font-mono text-[10px] font-bold text-amber-800 uppercase block">
                    Admin Notes
                  </span>
                  <p className="text-slate-800 text-xs font-mono">{viewingProduct.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <RegisterSkuModal
        isOpen={isRegisterSkuModalOpen}
        onClose={() => setIsRegisterSkuModalOpen(false)}
        onSave={handleSaveSku}
      />

      <DefineMaterialModal
        isOpen={isDefineMaterialModalOpen}
        onClose={() => setIsDefineMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
      />

      <ManageProductionStagesModal
        isOpen={isManageStagesModalOpen}
        onClose={() => setIsManageStagesModalOpen(false)}
      />

      <ManageProductCategoryModal
        isOpen={isManageProductCategoryModalOpen}
        onClose={() => setIsManageProductCategoryModalOpen(false)}
      />
    </div>
  );
}
