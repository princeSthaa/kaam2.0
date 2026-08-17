"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { EditSkuModal, EditSkuFormData } from "../components/modals/editskumodal";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";
import { ManageProductCategoryModal } from "../components/modals/manageproductcategorymodal";
import { fetchProducts, deleteProduct as apiDeleteProduct, ProductDto } from "../api/constant";
import { fetchProductCategories, ProductCategoryDto } from "../api/constant";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

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
  originalData?: ProductDto;
}

type SortKey = "name" | "sku" | "category" | "sizes" | "materials" | "stages" | "status";

function ProductAvatar({ src, name, sku }: { src?: string; name: string; sku: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0 shadow-xs overflow-hidden border border-slate-200">
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

export default function ProductDirectoryPage() {
  const [products, setProducts] = useState<ProductDirectoryItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<ProductCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-selection state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Modal States
  const [isRegisterSkuModalOpen, setIsRegisterSkuModalOpen] = useState(false);
  const [isEditSkuModalOpen, setIsEditSkuModalOpen] = useState(false);
  const [isDefineMaterialModalOpen, setIsDefineMaterialModalOpen] = useState(false);
  const [isManageStagesModalOpen, setIsManageStagesModalOpen] = useState(false);
  const [isManageProductCategoryModalOpen, setIsManageProductCategoryModalOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<ProductDirectoryItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDirectoryItem | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<ProductDirectoryItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchProductCategories().catch(() => []),
      ]);

      setCategoriesList(Array.isArray(catsData) ? catsData : []);

      if (Array.isArray(prodsData)) {
        const mapped: ProductDirectoryItem[] = prodsData.map((p) => {
          let imgUrl: string | undefined = undefined;
          if (p.imagePath) {
            imgUrl = p.imagePath.startsWith("http")
              ? p.imagePath
              : `${API_MAIN_URL.replace("/api", "")}${p.imagePath}`;
          }

          return {
            id: p.id,
            baseSku: p.sku?.trim() || `SKU-${p.id.slice(0, 4).toUpperCase()}`,
            name: p.name?.trim() || "Unnamed Product",
            category: p.productCategoryName || p.productCategory?.name || "Uncategorized",
            gender: "Unisex",
            uom: "pcs",
            sizes: extractSizes(p.materialRequirements),
            materialsCount: p.materialRequirements ? p.materialRequirements.length : 0,
            stagesCount: p.productionStages ? p.productionStages.length : 0,
            status: p.isActive !== false ? "Active" : "Draft",
            thumbnailUrl: imgUrl,
            originalData: p,
          };
        });
        setProducts(mapped);
      }
    } catch (err: any) {
      console.warn("Failed to load products/categories from API:", err);
      showToast(err.message || "Failed to load products from API.", "error");
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, pageSize]);

  // Handle Sort Click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted Products
  const filteredAndSortedProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const filtered = products.filter((item) => {
      const matchesSearch =
        !term ||
        item.baseSku.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.sizes.some((sz) => sz.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategory === "ALL" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "ALL" ||
        item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "sku") {
        comparison = a.baseSku.localeCompare(b.baseSku);
      } else if (sortKey === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortKey === "sizes") {
        comparison = a.sizes.length - b.sizes.length;
      } else if (sortKey === "materials") {
        comparison = a.materialsCount - b.materialsCount;
      } else if (sortKey === "stages") {
        comparison = a.stagesCount - b.stagesCount;
      } else if (sortKey === "status") {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, sortKey, sortDirection]);

  // Paginated Sliced Data
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedProducts, currentPage, pageSize]);

  // Selection Checkbox Handlers
  const isAllOnPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProductIds.has(p.id));

  const handleToggleSelectAll = () => {
    const next = new Set(selectedProductIds);
    if (isAllOnPageSelected) {
      paginatedProducts.forEach((p) => next.delete(p.id));
    } else {
      paginatedProducts.forEach((p) => next.add(p.id));
    }
    setSelectedProductIds(next);
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProductIds(next);
  };

  // Modals Save Handlers
  const handleSaveSku = (skuData: RegisterSkuFormData) => {
    loadData();
    showToast(`Successfully saved Product SKU: ${skuData.baseSku}`);
  };

  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    showToast(`Successfully defined Material Spec: ${matData.name}`);
  };

  // Delete Single Product
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await apiDeleteProduct(deleteConfirmProduct.id);
      showToast(`Removed product "${deleteConfirmProduct.name}"`);
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirmProduct.id);
        return next;
      });
      if (viewingProduct?.id === deleteConfirmProduct.id) {
        setViewingProduct(null);
      }
      setDeleteConfirmProduct(null);
      await loadData();
    } catch (err: any) {
      console.warn("Delete product API failed:", err);
      showToast(err.message || `Failed to remove product "${deleteConfirmProduct.name}"`, "error");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!selectedProductIds.size) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    for (const id of Array.from(selectedProductIds)) {
      try {
        await apiDeleteProduct(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete product ${id}:`, e);
      }
    }
    showToast(`Deleted ${successCount} products from catalog.`);
    setSelectedProductIds(new Set());
    setIsBulkDeleting(false);
    await loadData();
  };

  // Export to CSV
  const exportProductCsv = () => {
    const listToExport = selectedProductIds.size
      ? products.filter((p) => selectedProductIds.has(p.id))
      : filteredAndSortedProducts;

    const headers = [
      "Base SKU",
      "Product Name",
      "Category",
      "Available Sizes",
      "BOM Materials Count",
      "Production Stages Count",
      "Status",
    ];

    const rows = listToExport.map((p) => [
      `"${p.baseSku.replace(/"/g, '""')}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.sizes.join(", ").replace(/"/g, '""')}"`,
      `"${p.materialsCount}"`,
      `"${p.stagesCount}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${listToExport.length} products to CSV.`);
  };

  // Export to JSON
  const exportProductJson = () => {
    const listToExport = selectedProductIds.size
      ? products.filter((p) => selectedProductIds.has(p.id))
      : filteredAndSortedProducts;

    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(listToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `products_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${listToExport.length} products to JSON.`);
  };

  const categoryOptions = useMemo(() => {
    const names = categoriesList.map((c) => c.name).filter(Boolean);
    return ["ALL", ...Array.from(new Set(names))];
  }, [categoriesList]);

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-16 w-full max-w-full">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium transition-all animate-fadeIn ${
            toast.type === "success" ? "bg-slate-900 border border-slate-800" : "bg-red-600 border border-red-700"
          }`}
        >
          <span className="material-symbols-outlined text-xl text-emerald-400">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Product Directory &amp; SKU Catalog
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized product catalog, Bill of Materials (BOM) size matrices, and manufacturing stage assignments.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            title="Refresh Directory"
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

          {/* Product Menu Dropdown */}
          <div className="relative" ref={productMenuRef}>
            <button
              type="button"
              onClick={() => setIsProductMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Product Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isProductMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterSkuModalOpen(true);
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-base">add</span>
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
                  <span className="material-symbols-outlined text-blue-600 text-base">account_tree</span>
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
                  <span className="material-symbols-outlined text-purple-600 text-base">category</span>
                  <span>Manage Product Category</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    exportProductCsv();
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">table_chart</span>
                  <span>Export to CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportProductJson();
                    setIsProductMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">download</span>
                  <span>Export to JSON</span>
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
        {/* Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Product SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">category</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">{products.length}</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +24 catalog items active
            </div>
          </div>
        </div>

        {/* BOM Configured */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              BOM Specs Linked
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">inventory_2</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {products.filter((p) => p.materialsCount > 0).length}
            </div>
            <div className="flex items-center text-blue-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
              Precision size matrix enabled
            </div>
          </div>
        </div>

        {/* Manufacturing Stages */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Production Pipeline
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">account_tree</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {products.filter((p) => p.status === "Active").length}
            </div>
            <div className="flex items-center text-amber-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">precision_manufacturing</span>
              Active cutting &amp; assembly
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Spec Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">rate_review</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {products.filter((p) => p.status === "Review" || p.status === "Draft").length}
            </div>
            <div className="flex items-center text-rose-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">warning</span>
              Requires admin verification
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH PRODUCT DIRECTORY CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between w-full">
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
                placeholder="Search SKU code, name, category, sizes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              )}
            </div>

            {/* Category Filter, Status Filter & Page Size */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold border border-slate-200 bg-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
              >
                {categoryOptions.map((cat, idx) => (
                  <option key={`${cat}-${idx}`} value={cat}>
                    {cat === "ALL" ? "ALL CATEGORIES" : cat}
                  </option>
                ))}
              </select>

              {/* Status Filter Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold border border-slate-200 bg-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="Active">ACTIVE</option>
                <option value="Review">REVIEW</option>
                <option value="Draft">DRAFT</option>
              </select>

              {/* Rows Per Page */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-xs font-semibold border border-slate-200 bg-white rounded-lg py-2 px-2.5 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
                title="Rows per page"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedProductIds.size > 0 && (
            <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono font-bold text-[11px]">
                  {selectedProductIds.size}
                </span>
                <span>products selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportProductCsv}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Export Selected</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Delete Selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds(new Set())}
                  className="text-slate-400 hover:text-white px-2 py-1 text-xs"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Product Directory Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-mono text-[10px] uppercase tracking-wider">
                  {/* Checkbox Header */}
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllOnPageSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </th>

                  {/* Name & SKU */}
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name / Base SKU</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "name"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Category */}
                  <th
                    onClick={() => handleSort("category")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "category"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Available Sizes */}
                  <th
                    onClick={() => handleSort("sizes")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Available Sizes</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "sizes"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* BOM Spec */}
                  <th
                    onClick={() => handleSort("materials")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>BOM Spec</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "materials"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Pipeline */}
                  <th
                    onClick={() => handleSort("stages")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Pipeline</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "stages"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Status */}
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "status"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Actions */}
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 font-mono">
                      <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span>Loading products catalog...</span>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                        search_off
                      </span>
                      <p className="font-bold text-slate-700 text-sm">No product items found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try clearing search keywords or selecting a different category.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("ALL");
                          setSelectedStatus("ALL");
                        }}
                        className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod) => {
                    const isSelected = selectedProductIds.has(prod.id);

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(prod.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </td>

                        {/* Name & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <ProductAvatar src={prod.thumbnailUrl} name={prod.name} sku={prod.baseSku} />
                            <div>
                              <div
                                onClick={() => setViewingProduct(prod)}
                                className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 cursor-pointer"
                              >
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
                          <div className="flex items-center justify-end gap-1.5">
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
                                setIsEditSkuModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-amber-600 transition-colors rounded-lg bg-slate-100 hover:bg-amber-50 inline-flex items-center justify-center"
                              title="Edit Product Spec"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmProduct(prod)}
                              className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-lg bg-slate-100 hover:bg-red-50 inline-flex items-center justify-center"
                              title="Delete Product"
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

        {/* Footer Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <span className="material-symbols-outlined text-sm">first_page</span>
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1 font-mono">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= currentPage - 2 && p <= currentPage + 2)
              )
              .map((pageNum, idx, arr) => {
                const prevNum = arr[idx - 1];
                const showEllipsis = prevNum && pageNum - prevNum > 1;

                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                        currentPage === pageNum
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <span className="material-symbols-outlined text-sm">last_page</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW PRODUCT SPEC DRAWER / MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900 my-auto space-y-4">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{viewingProduct.name}</h3>
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
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Product SKU?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">{deleteConfirmProduct.name}</strong> (
                {deleteConfirmProduct.baseSku})? This action will remove the product SKU and associated BOM configurations from the catalog.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                Yes, Delete
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
        }}
        onSave={handleSaveSku}
      />

      {editingProduct && (
        <EditSkuModal
          isOpen={isEditSkuModalOpen}
          onClose={() => {
            setIsEditSkuModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveSku as any}
          initialData={editingProduct.originalData}
        />
      )}

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
