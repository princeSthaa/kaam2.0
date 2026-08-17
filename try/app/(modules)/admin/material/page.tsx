"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";
import { ManageMaterialCategoryModal } from "../components/modals/managematerialcategorymodal";
import { ManageMaterialTypeModal } from "../components/modals/managematerialtypemodal";
import { fetchMaterials, deleteMaterial as apiDeleteMaterial, MaterialGetDto } from "../api/constant";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface MaterialDirectoryItem {
  id: string;
  code: string;
  name: string;
  type: "fabric" | "trim" | "chemical" | "packaging" | string;
  unit: string;
  categories: string[];
  pricePerUnit?: string | number;
  imageUrl?: string;
  weightGsm?: string | number;
  widthInches?: string;
  colorCode?: string;
  composition?: string;
  qualityStandard?: string;
  mandatoryTests: string[];
  updatedBy: string;
  updatedAt: string;
}

type SortKey = "name" | "code" | "type" | "unit" | "price" | "quality";

function MaterialAvatar({ src, name, code }: { src?: string; name: string; code: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 shadow-xs overflow-hidden border border-slate-200">
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="uppercase">{code ? code.slice(0, 3) : "MAT"}</span>
      )}
    </div>
  );
}

export default function MaterialDirectoryPage() {
  const [materials, setMaterials] = useState<MaterialDirectoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-selection state
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Modal States
  const [isDefineMaterialModalOpen, setIsDefineMaterialModalOpen] = useState(false);
  const [isRegisterSkuModalOpen, setIsRegisterSkuModalOpen] = useState(false);
  const [isManageStagesModalOpen, setIsManageStagesModalOpen] = useState(false);
  const [isManageCategoryModalOpen, setIsManageCategoryModalOpen] = useState(false);
  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<MaterialDirectoryItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialDirectoryItem | null>(null);
  const [deleteConfirmMaterial, setDeleteConfirmMaterial] = useState<MaterialDirectoryItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const materialMenuRef = useRef<HTMLDivElement>(null);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchMaterials();
      if (Array.isArray(data)) {
        const mapped: MaterialDirectoryItem[] = data.map((m) => {
          let imgUrl: string | undefined = undefined;
          if (m.imagePath) {
            imgUrl = m.imagePath.startsWith("http")
              ? m.imagePath
              : `${API_MAIN_URL.replace("/api", "")}${m.imagePath}`;
          }

          return {
            id: m.id,
            code: m.materialCode?.trim() || `MAT-${m.id.slice(0, 4).toUpperCase()}`,
            name: m.name?.trim() || "Unnamed Material",
            type: (m.materialType?.name || "fabric").toLowerCase(),
            unit: "meters",
            categories: m.materialCategory?.name ? [m.materialCategory.name] : [],
            pricePerUnit: m.costPerUnit || 0,
            imageUrl: imgUrl,
            weightGsm: m.weightGsm,
            widthInches: m.widthInches,
            colorCode: m.colorCode,
            composition: m.composition,
            qualityStandard: m.qualityStandard || "Standard Tested",
            mandatoryTests: m.mandatoryTests || [],
            updatedBy: "Admin",
            updatedAt: "Today",
          };
        });
        setMaterials(mapped);
      }
    } catch (err: any) {
      console.warn("Failed to load materials from API:", err);
      showToast(err.message || "Failed to load materials from API.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (materialMenuRef.current && !materialMenuRef.current.contains(e.target as Node)) {
        setIsMaterialMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTypeFilter, pageSize]);

  // Handle Sort Click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted Materials
  const filteredAndSortedMaterials = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const filtered = materials.filter((item) => {
      const matchesSearch =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.categories.some((c) => c.toLowerCase().includes(term)) ||
        (item.composition && item.composition.toLowerCase().includes(term)) ||
        (item.colorCode && item.colorCode.toLowerCase().includes(term)) ||
        (item.qualityStandard && item.qualityStandard.toLowerCase().includes(term));

      const matchesType =
        selectedTypeFilter === "ALL" ||
        item.type.toLowerCase() === selectedTypeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "code") {
        comparison = a.code.localeCompare(b.code);
      } else if (sortKey === "type") {
        comparison = a.type.localeCompare(b.type);
      } else if (sortKey === "unit") {
        comparison = a.unit.localeCompare(b.unit);
      } else if (sortKey === "price") {
        comparison = Number(a.pricePerUnit || 0) - Number(b.pricePerUnit || 0);
      } else if (sortKey === "quality") {
        comparison = (a.qualityStandard || "").localeCompare(b.qualityStandard || "");
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [materials, searchTerm, selectedTypeFilter, sortKey, sortDirection]);

  // Paginated Sliced Data
  const totalItems = filteredAndSortedMaterials.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedMaterials.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedMaterials, currentPage, pageSize]);

  // Selection Checkbox Handlers
  const isAllOnPageSelected =
    paginatedMaterials.length > 0 &&
    paginatedMaterials.every((m) => selectedMaterialIds.has(m.id));

  const handleToggleSelectAll = () => {
    const next = new Set(selectedMaterialIds);
    if (isAllOnPageSelected) {
      paginatedMaterials.forEach((m) => next.delete(m.id));
    } else {
      paginatedMaterials.forEach((m) => next.add(m.id));
    }
    setSelectedMaterialIds(next);
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedMaterialIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMaterialIds(next);
  };

  // Modals Save Handlers
  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    loadMaterials();
    showToast(`Successfully defined Material Spec: ${matData.name}`);
  };

  const handleSaveSku = (skuData: RegisterSkuFormData) => {
    showToast(`Successfully registered Product SKU: ${skuData.baseSku}`);
  };

  // Delete Single Material
  const handleConfirmDelete = async () => {
    if (!deleteConfirmMaterial) return;
    try {
      await apiDeleteMaterial(deleteConfirmMaterial.id);
      showToast(`Removed material spec "${deleteConfirmMaterial.name}"`);
      setSelectedMaterialIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirmMaterial.id);
        return next;
      });
      if (viewingMaterial?.id === deleteConfirmMaterial.id) {
        setViewingMaterial(null);
      }
      setDeleteConfirmMaterial(null);
      await loadMaterials();
    } catch (err: any) {
      console.warn("Delete material API failed:", err);
      showToast(err.message || `Failed to remove material "${deleteConfirmMaterial.name}"`, "error");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!selectedMaterialIds.size) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    for (const id of Array.from(selectedMaterialIds)) {
      try {
        await apiDeleteMaterial(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete material ${id}:`, e);
      }
    }
    showToast(`Deleted ${successCount} material specifications.`);
    setSelectedMaterialIds(new Set());
    setIsBulkDeleting(false);
    await loadMaterials();
  };

  // Export to CSV
  const exportMaterialCsv = () => {
    const listToExport = selectedMaterialIds.size
      ? materials.filter((m) => selectedMaterialIds.has(m.id))
      : filteredAndSortedMaterials;

    const headers = [
      "Material Code",
      "Material Name",
      "Type",
      "Unit",
      "Categories",
      "Price Per Unit",
      "Quality Standard",
      "Composition",
      "Color Code",
    ];

    const rows = listToExport.map((m) => [
      `"${m.code.replace(/"/g, '""')}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.type.replace(/"/g, '""')}"`,
      `"${m.unit.replace(/"/g, '""')}"`,
      `"${m.categories.join(", ").replace(/"/g, '""')}"`,
      `"Rs ${m.pricePerUnit || 0}"`,
      `"${(m.qualityStandard || "Standard").replace(/"/g, '""')}"`,
      `"${(m.composition || "").replace(/"/g, '""')}"`,
      `"${(m.colorCode || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `materials_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${listToExport.length} material specs to CSV.`);
  };

  // Export to JSON
  const exportMaterialJson = () => {
    const listToExport = selectedMaterialIds.size
      ? materials.filter((m) => selectedMaterialIds.has(m.id))
      : filteredAndSortedMaterials;

    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(listToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `materials_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${listToExport.length} material specs to JSON.`);
  };

  const TYPE_OPTIONS = ["ALL", "fabric", "trim", "chemical", "packaging"];

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
              Material Specs &amp; Raw Inventory Directory
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {materials.length} Materials
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized raw material specifications, quality standards, technical parameters, and unit costs.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadMaterials()}
            disabled={loading}
            title="Refresh Directory"
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

          {/* Material Menu Dropdown */}
          <div className="relative" ref={materialMenuRef}>
            <button
              type="button"
              onClick={() => setIsMaterialMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Material Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isMaterialMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMaterial(null);
                    setIsDefineMaterialModalOpen(true);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-base">add</span>
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
                  <span className="material-symbols-outlined text-blue-600 text-base">category</span>
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
                  <span className="material-symbols-outlined text-purple-600 text-base">settings_suggest</span>
                  <span>Material Type Manage</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    exportMaterialCsv();
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">table_chart</span>
                  <span>Export to CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportMaterialJson();
                    setIsMaterialMenuOpen(false);
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
            onClick={() => {
              setEditingMaterial(null);
              setIsDefineMaterialModalOpen(true);
            }}
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
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Material SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">category</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">{materials.length}</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +14 synced with ERP
            </div>
          </div>
        </div>

        {/* Fabrics */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fabrics &amp; Knits
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">texture</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {materials.filter((m) => m.type === "fabric").length}
            </div>
            <div className="flex items-center text-blue-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
              Denim, Cotton, Linen
            </div>
          </div>
        </div>

        {/* Trims */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trims &amp; Hardware
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">hardware</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {materials.filter((m) => m.type === "trim").length}
            </div>
            <div className="flex items-center text-purple-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">shield</span>
              Zippers, Buttons, Tags
            </div>
          </div>
        </div>

        {/* Quality Certified */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quality Compliant
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {materials.filter((m) => m.qualityStandard).length}
            </div>
            <div className="flex items-center text-amber-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">verified_user</span>
              Oeko-Tex &amp; ISO 9001
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH MATERIAL CATALOG CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between w-full">
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
                placeholder="Search material code, name, category, composition..."
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

            {/* Type Pills Filter Tabs & Page Size */}
            <div className="flex items-center gap-3">
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
                          ? "bg-slate-900 text-white shadow-xs"
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
          {selectedMaterialIds.size > 0 && (
            <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono font-bold text-[11px]">
                  {selectedMaterialIds.size}
                </span>
                <span>material specifications selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportMaterialCsv}
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
                  onClick={() => setSelectedMaterialIds(new Set())}
                  className="text-slate-400 hover:text-white px-2 py-1 text-xs"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Full-Width Material Directory Table */}
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

                  {/* Material Name & Code */}
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Material Name &amp; Code</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "name"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Type */}
                  <th
                    onClick={() => handleSort("type")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Type</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "type"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Unit */}
                  <th
                    onClick={() => handleSort("unit")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Unit</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "unit"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Categories */}
                  <th className="py-3 px-4">Categories</th>

                  {/* Price */}
                  <th
                    onClick={() => handleSort("price")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Price / Unit</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "price"
                          ? sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </div>
                  </th>

                  {/* Quality Standard */}
                  <th
                    onClick={() => handleSort("quality")}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Quality Standard</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {sortKey === "quality"
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
                {loading && materials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 font-mono">
                      <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span>Loading materials catalog...</span>
                    </td>
                  </tr>
                ) : paginatedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                        search_off
                      </span>
                      <p className="font-bold text-slate-700 text-sm">No material specifications found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying search keywords or selecting a different material type.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedTypeFilter("ALL");
                        }}
                        className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map((mat) => {
                    const isSelected = selectedMaterialIds.has(mat.id);

                    return (
                      <tr
                        key={mat.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(mat.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </td>

                        {/* Name & Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <MaterialAvatar src={mat.imageUrl} name={mat.name} code={mat.code} />
                            <div>
                              <div
                                onClick={() => setViewingMaterial(mat)}
                                className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 cursor-pointer"
                              >
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
                            {mat.categories.length > 0 ? (
                              mat.categories.map((c) => (
                                <span
                                  key={c}
                                  className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
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
                            <span className="text-slate-400 font-normal">Standard Tested</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
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
                              onClick={() => {
                                setEditingMaterial(mat);
                                setIsDefineMaterialModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-amber-600 transition-colors rounded-lg bg-slate-100 hover:bg-amber-50 inline-flex items-center justify-center"
                              title="Edit Material Spec"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmMaterial(mat)}
                              className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-lg bg-slate-100 hover:bg-red-50 inline-flex items-center justify-center"
                              title="Delete Material"
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

      {/* VIEW MATERIAL SPEC MODAL */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900 my-auto space-y-4">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{viewingMaterial.name}</h3>
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
            {viewingMaterial.imageUrl && (
              <div className="px-6 pt-2">
                <img
                  src={viewingMaterial.imageUrl}
                  alt={viewingMaterial.name}
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            )}

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

              {viewingMaterial.mandatoryTests && viewingMaterial.mandatoryTests.length > 0 && (
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmMaterial && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Material Specification?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">{deleteConfirmMaterial.name}</strong> (
                {deleteConfirmMaterial.code})? This action will remove the specification from the catalog.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMaterial(null)}
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
      <DefineMaterialModal
        isOpen={isDefineMaterialModalOpen}
        onClose={() => {
          setIsDefineMaterialModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        initialData={editingMaterial}
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
