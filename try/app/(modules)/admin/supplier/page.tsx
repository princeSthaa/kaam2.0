"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierDto,
  SupplierCategoryResponseDto,
} from "../api/constant";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import AddNewSupplierModal, { SupplierFormData, getInitials } from "../components/modals/addnewsupplier";
import { AddMaterialToSupplierModal } from "../components/modals/addmaterialtosuppliermodal";

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: "FABRIC" | "TRIMS" | "HARDWARE" | "PACKAGING" | string;
  status: "ACTIVE" | "UNDER REVIEW" | "BLACKLISTED" | string;
  lastAudit: string;
  materialsSupplied: string;
  totalOrdersCount: number;
  email: string;
  phone: string;
  location: string;
  complianceScore: number;
  materialCategoryIds?: string[];
  onTimeDeliveryRate?: number;
  defectRate?: number;
  rating?: number;
  materialCategories?: SupplierCategoryResponseDto[];
  createdAt?: string;
}

type SortKey = "name" | "code" | "category" | "status" | "lastAudit" | "orders" | "compliance";

export default function AdminSupplierDirectoryPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Modals state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState<Supplier | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [supplierOrders, setSupplierOrders] = useState<any[]>([]);

  // Menu state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapMaterialModalOpen, setIsMapMaterialModalOpen] = useState(false);
  const [isSupplierMenuOpen, setIsSupplierMenuOpen] = useState(false);
  const supplierMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierMenuRef.current && !supplierMenuRef.current.contains(e.target as Node)) {
        setIsSupplierMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch POs for selected supplier
  useEffect(() => {
    if (selectedSupplier) {
      fetch(`${API_MAIN_URL}/purchase-order?supplierId=${selectedSupplier.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setSupplierOrders(data.slice(0, 5));
          } else {
            setSupplierOrders([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch supplier POs:", err);
          setSupplierOrders([]);
        });
    } else {
      setSupplierOrders([]);
    }
  }, [selectedSupplier]);

  // Load suppliers from API
  const loadSuppliersFromApi = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      if (Array.isArray(data)) {
        const mapped: Supplier[] = data.map((s: SupplierDto) => {
          const catName =
            s.materialCategories && s.materialCategories.length > 0
              ? s.materialCategories.map((c) => c.name).join(", ")
              : "FABRIC";

          const normalizedStatus =
            s.status === 2 || s.status === "Blacklisted"
              ? "BLACKLISTED"
              : s.status === 1 || s.status === "Inactive"
              ? "UNDER REVIEW"
              : "ACTIVE";

          return {
            id: s.id,
            name: s.name?.trim() || "Unnamed Supplier",
            code: s.supplierCode?.trim() || `SUP-${s.id.slice(0, 4).toUpperCase()}`,
            category: catName,
            status: normalizedStatus,
            lastAudit: s.createdAt
              ? new Date(s.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Recently",
            materialsSupplied: `${s.totalOrders || 0} orders`,
            totalOrdersCount: Number(s.totalOrders) || 0,
            email: s.contactEmail?.trim() || "—",
            phone: s.contactPhone?.trim() || "—",
            location: s.address?.trim() || "Kathmandu, Nepal",
            complianceScore: s.rating ? Math.round(Number(s.rating) * 20) : 90,
            materialCategoryIds: s.materialCategories?.map((c) => c.materialCategoryId) || [],
            onTimeDeliveryRate: s.onTimeDeliveryRate,
            defectRate: s.defectRate,
            rating: s.rating,
            materialCategories: s.materialCategories,
            createdAt: s.createdAt,
          };
        });
        setSuppliers(mapped);
      }
    } catch (err: any) {
      console.warn("Backend API supplier fetch failed:", err);
      showToast(err.message || "Failed to load suppliers from API.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliersFromApi();
  }, []);

  // Reset page to 1 when filters or search change
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

  // Filtered & Sorted Suppliers
  const filteredAndSortedSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const filtered = suppliers.filter((supplier) => {
      const matchesSearch =
        !term ||
        supplier.name.toLowerCase().includes(term) ||
        supplier.code.toLowerCase().includes(term) ||
        supplier.category.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term) ||
        supplier.phone.toLowerCase().includes(term) ||
        supplier.location.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "ALL" ||
        supplier.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || supplier.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "code") {
        comparison = a.code.localeCompare(b.code);
      } else if (sortKey === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortKey === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortKey === "lastAudit") {
        comparison = (a.createdAt || "").localeCompare(b.createdAt || "");
      } else if (sortKey === "orders") {
        comparison = a.totalOrdersCount - b.totalOrdersCount;
      } else if (sortKey === "compliance") {
        comparison = a.complianceScore - b.complianceScore;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [suppliers, searchTerm, selectedCategory, selectedStatus, sortKey, sortDirection]);

  // Paginated Sliced Data
  const totalItems = filteredAndSortedSuppliers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedSuppliers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedSuppliers, currentPage, pageSize]);

  // Statistics calculation for KPI cards
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;
  const reviewCount = suppliers.filter((s) => s.status === "UNDER REVIEW").length;
  const avgCompliance = suppliers.length
    ? (
        suppliers.reduce((acc, curr) => acc + curr.complianceScore, 0) /
        suppliers.length
      ).toFixed(1)
    : "0";

  // Selection Checkbox Handlers
  const isAllOnPageSelected =
    paginatedSuppliers.length > 0 &&
    paginatedSuppliers.every((s) => selectedSupplierIds.has(s.id));

  const handleToggleSelectAll = () => {
    const next = new Set(selectedSupplierIds);
    if (isAllOnPageSelected) {
      paginatedSuppliers.forEach((s) => next.delete(s.id));
    } else {
      paginatedSuppliers.forEach((s) => next.add(s.id));
    }
    setSelectedSupplierIds(next);
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedSupplierIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSupplierIds(next);
  };

  // Add Supplier Submit
  const handleAddSupplierSubmit = async (_formData: SupplierFormData) => {
    await loadSuppliersFromApi();
    setIsAddModalOpen(false);
    showToast("New supplier added successfully!");
  };

  // Edit Supplier Submit
  const handleEditSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      if (editingSupplier.id) {
        await updateSupplier(editingSupplier.id, {
          supplierCode: editingSupplier.code,
          name: editingSupplier.name,
          contactEmail: editingSupplier.email,
          contactPhone: editingSupplier.phone,
          address: editingSupplier.location,
          status:
            editingSupplier.status === "BLACKLISTED"
              ? 2
              : editingSupplier.status === "UNDER REVIEW"
              ? 1
              : 0,
        });
        showToast(`Supplier "${editingSupplier.name}" updated successfully!`);
        await loadSuppliersFromApi();
      }
    } catch (err: any) {
      console.error("Failed to update supplier via API:", err);
      showToast(err.message || "Failed to update supplier via API.", "error");
    }

    if (selectedSupplier && selectedSupplier.id === editingSupplier.id) {
      setSelectedSupplier(editingSupplier);
    }
    setEditingSupplier(null);
  };

  // Quick Status Change on Row
  const handleQuickStatusChange = async (
    supplier: Supplier,
    newStatus: "ACTIVE" | "UNDER REVIEW" | "BLACKLISTED"
  ) => {
    try {
      await updateSupplier(supplier.id, {
        supplierCode: supplier.code,
        name: supplier.name,
        contactEmail: supplier.email,
        contactPhone: supplier.phone,
        address: supplier.location,
        status: newStatus === "BLACKLISTED" ? 2 : newStatus === "UNDER REVIEW" ? 1 : 0,
      });
      showToast(`Supplier "${supplier.name}" marked as ${newStatus}!`);
      await loadSuppliersFromApi();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err.message || "Failed to update status.", "error");
    }
  };

  // Delete Single Supplier
  const handleConfirmDelete = async () => {
    if (!deleteConfirmSupplier) return;
    try {
      await deleteSupplier(deleteConfirmSupplier.id);
      showToast(`Supplier "${deleteConfirmSupplier.name}" deleted successfully.`);
      setSelectedSupplierIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirmSupplier.id);
        return next;
      });
      if (selectedSupplier?.id === deleteConfirmSupplier.id) {
        setSelectedSupplier(null);
      }
      setDeleteConfirmSupplier(null);
      await loadSuppliersFromApi();
    } catch (err: any) {
      console.error("Delete supplier failed:", err);
      showToast(err.message || "Failed to delete supplier.", "error");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!selectedSupplierIds.size) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    for (const id of Array.from(selectedSupplierIds)) {
      try {
        await deleteSupplier(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete supplier ${id}:`, e);
      }
    }
    showToast(`Deleted ${successCount} suppliers.`);
    setSelectedSupplierIds(new Set());
    setIsBulkDeleting(false);
    await loadSuppliersFromApi();
  };

  // Bulk Status Change
  const handleBulkStatusChange = async (newStatus: "ACTIVE" | "UNDER REVIEW" | "BLACKLISTED") => {
    if (!selectedSupplierIds.size) return;
    const statusNum = newStatus === "BLACKLISTED" ? 2 : newStatus === "UNDER REVIEW" ? 1 : 0;
    let count = 0;
    for (const id of Array.from(selectedSupplierIds)) {
      const sup = suppliers.find((s) => s.id === id);
      if (sup) {
        try {
          await updateSupplier(id, {
            name: sup.name,
            supplierCode: sup.code,
            status: statusNum,
          });
          count++;
        } catch (e) {
          console.error(e);
        }
      }
    }
    showToast(`Updated ${count} suppliers to ${newStatus}.`);
    setSelectedSupplierIds(new Set());
    await loadSuppliersFromApi();
  };

  // Export to CSV
  const exportSupplierCsv = () => {
    const listToExport = selectedSupplierIds.size
      ? suppliers.filter((s) => selectedSupplierIds.has(s.id))
      : filteredAndSortedSuppliers;

    const headers = [
      "Supplier ID",
      "Supplier Name",
      "Category",
      "Status",
      "Last Audit",
      "Total Orders",
      "Email",
      "Phone",
      "Address",
      "Compliance Score",
    ];

    const rows = listToExport.map((s) => [
      `"${s.code.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      `"${s.status.replace(/"/g, '""')}"`,
      `"${s.lastAudit.replace(/"/g, '""')}"`,
      `"${s.materialsSupplied.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.phone.replace(/"/g, '""')}"`,
      `"${s.location.replace(/"/g, '""')}"`,
      `"${s.complianceScore}%"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suppliers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported ${listToExport.length} suppliers to CSV.`);
  };

  // Export to JSON
  const exportSupplierList = () => {
    const listToExport = selectedSupplierIds.size
      ? suppliers.filter((s) => selectedSupplierIds.has(s.id))
      : filteredAndSortedSuppliers;

    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(listToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `suppliers_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${listToExport.length} suppliers to JSON.`);
  };

  return (
    <div className="space-y-6 text-slate-800 pb-16">
      {/* Toast Notification */}
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

      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Supplier Directory
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              Procurement &amp; SRM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage, audit, and track procurement relationships across raw material vendors.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadSuppliersFromApi()}
            disabled={loading}
            title="Refresh Directory"
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

          {/* Supplier Menu Dropdown */}
          <div className="relative" ref={supplierMenuRef}>
            <button
              type="button"
              onClick={() => setIsSupplierMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Supplier Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isSupplierMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(true);
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-base">add_business</span>
                  <span>Add New Supplier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin/suppliedmaterialdirectory";
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-600 text-base">inventory_2</span>
                  <span>Supplied Material Directory</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    exportSupplierCsv();
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">table_chart</span>
                  <span>Export to CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportSupplierList();
                    setIsSupplierMenuOpen(false);
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Suppliers
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Registered supply partners</div>
        </div>

        {/* Active Partners */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Partners
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Verified for active purchase orders</div>
        </div>

        {/* Under Review */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">pending</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{reviewCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Pending audit or onboarding checks</div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Compliance
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">rule</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{avgCompliance}%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Average quality &amp; SLA compliance</div>
        </div>
      </div>

      {/* Directory Grid & Table Section */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, ID, phone, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
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

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="FABRIC">FABRIC</option>
              <option value="TRIMS">TRIMS</option>
              <option value="HARDWARE">HARDWARE</option>
              <option value="PACKAGING">PACKAGING</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="BLACKLISTED">BLACKLISTED</option>
            </select>

            {/* Page Size Select */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-2.5 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer text-slate-700"
              title="Rows per page"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>
              DISPLAYING {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalItems)} OF {totalItems}
            </span>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedSupplierIds.size > 0 && (
          <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono font-bold text-[11px]">
                {selectedSupplierIds.size}
              </span>
              <span>suppliers selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange("ACTIVE")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition-colors"
              >
                Mark Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("UNDER REVIEW")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors"
              >
                Set Under Review
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("BLACKLISTED")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs transition-colors"
              >
                Blacklist
              </button>
              <button
                type="button"
                onClick={exportSupplierCsv}
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
                onClick={() => setSelectedSupplierIds(new Set())}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Supplier Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </th>

                {/* Supplier Name */}
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Supplier Name</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">
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
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">
                      {sortKey === "category"
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
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">
                      {sortKey === "status"
                        ? sortDirection === "asc"
                          ? "arrow_upward"
                          : "arrow_downward"
                        : "unfold_more"}
                    </span>
                  </div>
                </th>

                {/* Last Audit */}
                <th
                  onClick={() => handleSort("lastAudit")}
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Audit</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">
                      {sortKey === "lastAudit"
                        ? sortDirection === "asc"
                          ? "arrow_upward"
                          : "arrow_downward"
                        : "unfold_more"}
                    </span>
                  </div>
                </th>

                {/* Materials Supplied */}
                <th
                  onClick={() => handleSort("orders")}
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Materials Supplied</span>
                    <span className="material-symbols-outlined text-sm text-slate-400">
                      {sortKey === "orders"
                        ? sortDirection === "asc"
                          ? "arrow_upward"
                          : "arrow_downward"
                        : "unfold_more"}
                    </span>
                  </div>
                </th>

                {/* Actions */}
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-mono">
                    <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Loading suppliers directory...</span>
                  </td>
                </tr>
              ) : paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                      search_off
                    </span>
                    <p className="font-bold text-slate-700 text-sm">No matching suppliers found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search queries or filter selections.
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
                paginatedSuppliers.map((supplier) => {
                  const isSelected = selectedSupplierIds.has(supplier.id);

                  return (
                    <tr
                      key={supplier.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(supplier.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Supplier Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                            {getInitials(supplier.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              onClick={() => setSelectedSupplier(supplier)}
                              className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer truncate"
                            >
                              {supplier.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ID: {supplier.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold font-mono">
                          {supplier.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="relative inline-block">
                          <select
                            value={supplier.status}
                            onChange={(e) =>
                              handleQuickStatusChange(supplier, e.target.value as any)
                            }
                            className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border appearance-none pr-6 cursor-pointer focus:outline-none ${
                              supplier.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : supplier.status === "UNDER REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="UNDER REVIEW">UNDER REVIEW</option>
                            <option value="BLACKLISTED">BLACKLISTED</option>
                          </select>
                        </div>
                      </td>

                      {/* Last Audit */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {supplier.lastAudit}
                      </td>

                      {/* Materials Supplied */}
                      <td className="px-4 py-4 text-right font-mono text-xs font-bold text-slate-900">
                        {supplier.materialsSupplied}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Profile Details"
                            onClick={() => setSelectedSupplier(supplier)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>

                          <button
                            type="button"
                            title="Edit Supplier"
                            onClick={() => setEditingSupplier(supplier)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          <button
                            type="button"
                            title="Delete Supplier"
                            onClick={() => setDeleteConfirmSupplier(supplier)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
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

      {/* Supplier Profile Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col relative border border-slate-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-20"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Main Content Body */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
              {/* Header Banner */}
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow">
                    {getInitials(selectedSupplier.name)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      {selectedSupplier.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span
                        className={`font-mono font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                          selectedSupplier.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : selectedSupplier.status === "UNDER REVIEW"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedSupplier.status === "ACTIVE"
                              ? "bg-emerald-600"
                              : selectedSupplier.status === "UNDER REVIEW"
                              ? "bg-amber-600"
                              : "bg-red-600"
                          }`}
                        ></span>
                        {selectedSupplier.status}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {selectedSupplier.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingSupplier(selectedSupplier);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow transition-all"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>Edit Profile</span>
                  </button>
                </div>
              </header>

              {/* Performance Summary Bento Grid */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Performance Summary
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last Audit: {selectedSupplier.lastAudit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>ON-TIME DELIVERY</span>
                      <span className="material-symbols-outlined text-slate-700">schedule</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {selectedSupplier.onTimeDeliveryRate
                          ? `${selectedSupplier.onTimeDeliveryRate}%`
                          : "96%"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>QUALITY GRADE</span>
                      <span className="material-symbols-outlined text-slate-700">verified</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {selectedSupplier.rating ? `${selectedSupplier.rating}/5` : "4.8/5"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>DEFECT RATE</span>
                      <span className="material-symbols-outlined text-emerald-600">gpp_good</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-700 uppercase">
                        {selectedSupplier.defectRate ? `${selectedSupplier.defectRate}%` : "1.2%"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Info & Recent Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Information (1 col) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 font-mono uppercase tracking-wider border-b border-slate-100 pb-2">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Primary Liaison</p>
                        <p className="font-bold text-slate-900">{selectedSupplier.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">mail</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Email Address</p>
                        <p className="font-medium text-slate-900 underline truncate">
                          {selectedSupplier.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">call</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Phone Number</p>
                        <p className="font-medium text-slate-900">{selectedSupplier.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">domain</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Location</p>
                        <p className="text-slate-700">{selectedSupplier.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-start text-xs">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 font-mono uppercase tracking-wider">
                      Recent Transactions
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Supplied: {selectedSupplier.materialsSupplied}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5 uppercase">PO Number</th>
                          <th className="px-4 py-2.5 uppercase">Date</th>
                          <th className="px-4 py-2.5 uppercase">Value</th>
                          <th className="px-4 py-2.5 uppercase text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {supplierOrders.length > 0 ? (
                          supplierOrders.map((order, idx) => {
                            const isDelivered =
                              order.status === "Delivered" ||
                              order.status === "Closed" ||
                              order.status === 2;
                            return (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {order.orderNumber || `#${order.id?.slice(0, 8)}`}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {order.expectedDeliveryDate
                                    ? new Date(order.expectedDeliveryDate).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "2-digit",
                                          year: "numeric",
                                        }
                                      )
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {order.totalAmount != null
                                    ? `Rs ${order.totalAmount.toLocaleString()}`
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {isDelivered ? (
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                                      DELIVERED
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200 uppercase">
                                      {order.status || "PENDING"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                              No recent transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Active Materials Catalog */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Active Materials Catalog
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {selectedSupplier.materialCategories &&
                  selectedSupplier.materialCategories.length > 0 ? (
                    selectedSupplier.materialCategories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                          <span className="material-symbols-outlined text-lg">category</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">
                            CODE: {cat.materialCode || cat.materialCategoryId?.slice(0, 8) || "—"}
                          </span>
                          <h4 className="font-bold text-slate-900">{cat.name}</h4>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 col-span-4">No material categories mapped.</p>
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      )}

      {/* Reusable Add Supplier Modal */}
      <AddNewSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSupplierSubmit}
      />

      {/* Edit Supplier Profile Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col relative border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-mono">
                    Edit Supplier Profile
                  </h2>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-slate-800">{editingSupplier.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded font-bold">
                      {editingSupplier.code}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSupplierSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Core Identity */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">domain</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Core Identity
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Brand / Company Name</label>
                    <input
                      type="text"
                      required
                      value={editingSupplier.name}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, name: e.target.value })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Supplier Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={editingSupplier.code}
                        className="w-full h-10 px-3 bg-slate-100 border border-dashed border-slate-300 rounded-lg font-mono text-slate-500 cursor-not-allowed"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        lock
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Status</label>
                    <select
                      value={editingSupplier.status}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UNDER REVIEW">UNDER REVIEW</option>
                      <option value="BLACKLISTED">BLACKLISTED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">contact_phone</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        mail
                      </span>
                      <input
                        type="email"
                        value={editingSupplier.email === "—" ? "" : editingSupplier.email}
                        onChange={(e) =>
                          setEditingSupplier({ ...editingSupplier, email: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        call
                      </span>
                      <input
                        type="tel"
                        value={editingSupplier.phone === "—" ? "" : editingSupplier.phone}
                        onChange={(e) =>
                          setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Location */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">location_on</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Physical Location
                  </h3>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Billing / Operational Address</label>
                  <textarea
                    rows={2}
                    value={editingSupplier.location}
                    onChange={(e) =>
                      setEditingSupplier({ ...editingSupplier, location: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Supplier?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">{deleteConfirmSupplier.name}</strong> (
                {deleteConfirmSupplier.code})? This action will remove the supplier record from the directory.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSupplier(null)}
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

      {/* Add Material to Supplier Modal */}
      <AddMaterialToSupplierModal
        isOpen={isMapMaterialModalOpen}
        onClose={() => setIsMapMaterialModalOpen(false)}
      />
    </div>
  );
}
