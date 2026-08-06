"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";
import { ManageProductCategoryModal } from "../components/modals/manageproductcategorymodal";
import { fetchProducts, deleteProduct as apiDeleteProduct, ProductDto } from "../api/product.api";
import { fetchProductCategories, ProductCategoryDto } from "../api/productcategory.api";

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
  updatedBy?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  adminNotes?: string;
}

function ProductAvatar({ src, name, sku }: { src?: string; name: string; sku: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0 shadow-sm overflow-hidden border border-slate-200">
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="uppercase">{sku ? sku.slice(0, 3) : "PRD"}</span>
      )}
    </div>
  );
}

export default function ProductDirectoryPage() {
  const [products, setProducts] = useState<ProductDirectoryItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<ProductCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [editingProduct, setEditingProduct] = useState<ProductDirectoryItem | null>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);

const SIZE_NAMES = ["XS", "S", "M", "L", "XL", "XXL"];

function extractSizes(materialRequirements?: any[]): string[] {
  if (!Array.isArray(materialRequirements) || materialRequirements.length === 0) {
    return ["All Sizes"];
  }

  const foundSizes = new Set<string>();
  materialRequirements.forEach((req) => {
    if (req.productSize !== undefined && req.productSize !== null) {
      if (typeof req.productSize === "number") {
        const name = SIZE_NAMES[req.productSize] || String(req.productSize);
        foundSizes.add(name);
      } else if (typeof req.productSize === "string") {
        foundSizes.add(req.productSize.toUpperCase());
      }
    }
  });

  if (foundSizes.size === 0) {
    return ["S", "M", "L", "XL"];
  }

  return Array.from(foundSizes).sort((a, b) => {
    const idxA = SIZE_NAMES.indexOf(a);
    const idxB = SIZE_NAMES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });
}

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchProductCategories().catch(() => []),
      ]);

      setCategoriesList(Array.isArray(catsData) ? catsData : []);

      if (Array.isArray(prodsData)) {
        const mapped: ProductDirectoryItem[] = prodsData.map((p) => ({
          id: p.id,
          baseSku: p.sku || "SKU-0000",
          name: p.name,
          category: p.productCategory?.name || "Uncategorized",
          gender: "Unisex",
          uom: "pcs",
          sizes: extractSizes(p.materialRequirements),
          materialsCount: p.materialRequirements ? p.materialRequirements.length : 0,
          stagesCount: p.productionStages ? p.productionStages.length : 0,
          status: p.isActive !== false ? "Active" : "Draft",
          thumbnailUrl: p.imagePath
            ? p.imagePath.startsWith("http")
              ? p.imagePath
              : `http://localhost:5083${p.imagePath}`
            : undefined,
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.warn("Failed to load products/categories from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    loadData();
    showToast(`Successfully registered Product SKU: ${skuData.baseSku}`);
  };

  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    showToast(`Successfully defined Material Spec: ${matData.name}`);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      try {
        await apiDeleteProduct(id);
        showToast(`Removed product item "${name}"`);
        loadData();
      } catch (err) {
        console.warn("Delete product API failed:", err);
        showToast(`Failed to remove product item "${name}"`);
      }
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

  const categoryOptions = useMemo(() => {
    const names = categoriesList.map((c) => c.name).filter(Boolean);
    return ["ALL", ...Array.from(new Set(names))];
  }, [categoriesList]);

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
                {categoryOptions.map((cat, idx) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={`${cat}-${idx}`}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-mono">
                      Loading products catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
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
                          <ProductAvatar src={prod.thumbnailUrl} name={prod.name} sku={prod.baseSku} />
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
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="View Product Spec"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsRegisterSkuModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50 inline-flex items-center justify-center"
                          title="Edit Product Spec"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 inline-flex items-center justify-center"
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
            {viewingProduct.thumbnailUrl && (
              <div className="px-6 pt-2">
                <img
                  src={viewingProduct.thumbnailUrl}
                  alt={viewingProduct.name}
                  className="w-full max-h-48 object-cover rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
            )}

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
        onClose={() => {
          setIsRegisterSkuModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveSku}
        initialData={editingProduct}
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
