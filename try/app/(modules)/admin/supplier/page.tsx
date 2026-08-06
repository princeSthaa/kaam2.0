"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierDto
} from "../api/supplier.api";
import AddNewSupplierModal, { SupplierFormData, getInitials } from "../components/modals/addnewsupplier";
import { AddMaterialToSupplierModal } from "../components/modals/addmaterialtosuppliermodal";

interface Supplier {
  id: string;
  name: string;
  code: string;
  category: "FABRIC" | "TRIMS" | "HARDWARE" | "PACKAGING" | string;
  status: "ACTIVE" | "UNDER REVIEW" | "BLACKLISTED" | string;
  lastAudit: string;
  materialsSupplied: string;
  email: string;
  phone: string;
  location: string;
  complianceScore: number;
  materialCategoryIds?: string[];
}

export default function AdminSupplierDirectoryPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
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

  const loadSuppliersFromApi = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      if (Array.isArray(data)) {
        const mapped: Supplier[] = data.map((s: SupplierDto) => ({
          id: s.id,
          name: s.name,
          code: s.supplierCode || `SUP-${s.id.slice(0, 4)}`,
          category: (s.materialCategories?.[0]?.name?.toUpperCase() as any) || "FABRIC",
          status: s.status === 2 || s.status === "Blacklisted" ? "BLACKLISTED" : s.status === 1 || s.status === "Inactive" ? "UNDER REVIEW" : "ACTIVE",
          lastAudit: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Recently",
          materialsSupplied: `${s.totalOrders || 0} orders`,
          email: s.contactEmail || "—",
          phone: s.contactPhone || "—",
          location: s.address || "Kathmandu, Nepal",
          complianceScore: s.rating ? Math.round(Number(s.rating)) : 90,
          materialCategoryIds: s.materialCategories?.map((c) => c.materialCategoryId) || [],
        }));
        setSuppliers(mapped);
      }
    } catch (err) {
      console.warn("Backend API supplier fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliersFromApi();
  }, []);

  // Filtered suppliers calculation
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || supplier.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" || supplier.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchTerm, selectedCategory, selectedStatus]);

  // Statistics calculation
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;
  const reviewCount = suppliers.filter((s) => s.status === "UNDER REVIEW").length;
  const avgCompliance = (
    suppliers.reduce((acc, curr) => acc + curr.complianceScore, 0) / (suppliers.length || 1)
  ).toFixed(1);

  const handleAddSupplierSubmit = async (formData: SupplierFormData) => {
    await loadSuppliersFromApi();
    setIsAddModalOpen(false);
  };

  const handleEditSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      if (editingSupplier.id.includes("-")) {
        await updateSupplier(editingSupplier.id, {
          supplierCode: editingSupplier.code,
          name: editingSupplier.name,
          contactEmail: editingSupplier.email,
          contactPhone: editingSupplier.phone,
          address: editingSupplier.location,
          status: editingSupplier.status === "BLACKLISTED" ? "Blacklisted" : editingSupplier.status === "UNDER REVIEW" ? "Inactive" : "Active"
        });
        await loadSuppliersFromApi();
      }
    } catch (err) {
      console.error("Failed to update supplier via API:", err);
    }

    setSuppliers(
      suppliers.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
    );
    if (selectedSupplier && selectedSupplier.id === editingSupplier.id) {
      setSelectedSupplier(editingSupplier);
    }
    setEditingSupplier(null);
  };

  const exportSupplierList = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredSuppliers, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `suppliers_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supplier Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and audit your global supply network from a centralized hub.
          </p>
        </div>
        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Supplier Menu Dropdown (Click Controlled with Click Outside Ref) */}
          <div className="relative" ref={supplierMenuRef}>
            <button
              type="button"
              onClick={() => setIsSupplierMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Supplier Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isSupplierMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(true);
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">add_business</span>
                  <span>Add Supplier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin/suppliedmaterialdirectory";
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">inventory_2</span>
                  <span>Supplier Material</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportSupplierList();
                    setIsSupplierMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors border-t border-slate-100"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">download</span>
                  <span>Export List</span>
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Suppliers
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{totalCount}</div>
        </div>

        {/* Active Partners */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Partners
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{activeCount}</div>
        </div>

        {/* Under Review */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">pending</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{reviewCount}</div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Compliance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">rule</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{avgCompliance}%</div>
        </div>
      </div>

      {/* Directory Grid & Table Section */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, ID or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">CATEGORY: ALL</option>
              <option value="FABRIC">FABRIC</option>
              <option value="TRIMS">TRIMS</option>
              <option value="HARDWARE">HARDWARE</option>
              <option value="PACKAGING">PACKAGING</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">STATUS: ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="BLACKLISTED">BLACKLISTED</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
            <span>
              DISPLAYING {filteredSuppliers.length} OF {suppliers.length}
            </span>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Supplier Name
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Materials Supplied
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-mono">
                    Loading suppliers directory...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2">
                      search_off
                    </span>
                    No matching suppliers found. Try modifying filters.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                    {/* Supplier Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {getInitials(supplier.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {supplier.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {supplier.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold font-mono">
                        {supplier.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {supplier.status === "ACTIVE" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span className="font-mono text-xs font-bold">ACTIVE</span>
                        </div>
                      )}
                      {supplier.status === "UNDER REVIEW" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span className="font-mono text-xs font-bold">UNDER REVIEW</span>
                        </div>
                      )}
                      {supplier.status === "BLACKLISTED" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          <span className="font-mono text-xs font-bold">BLACKLISTED</span>
                        </div>
                      )}
                    </td>

                    {/* Last Audit */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {supplier.lastAudit}
                    </td>

                    {/* Materials Supplied */}
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-900">
                      {supplier.materialsSupplied}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="text-slate-900 hover:text-blue-600 font-bold text-xs uppercase tracking-wide hover:underline transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <button className="flex items-center space-x-1 font-semibold hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Previous</span>
          </button>
          <div className="flex items-center space-x-1 font-mono">
            <button className="w-7 h-7 rounded bg-slate-900 text-white font-bold">
              1
            </button>
            <button className="w-7 h-7 rounded hover:bg-slate-200">2</button>
            <button className="w-7 h-7 rounded hover:bg-slate-200">3</button>
            <span>...</span>
            <button className="w-7 h-7 rounded hover:bg-slate-200">12</button>
          </div>
          <button className="flex items-center space-x-1 font-semibold hover:text-slate-900 transition-colors">
            <span>Next</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Supplier Profile Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
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
                      <span className="bg-emerald-50 text-emerald-700 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all">
                    <span className="material-symbols-outlined text-base">
                      contact_support
                    </span>
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={() => setEditingSupplier(selectedSupplier)}
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
                      <span className="text-2xl font-bold text-slate-900">94.8%</span>
                      <span className="text-emerald-600 font-mono text-xs font-bold">+1.2%</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>QUALITY GRADE</span>
                      <span className="material-symbols-outlined text-slate-700">verified</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">A-</span>
                      <span className="text-slate-500 font-mono text-xs">Top 5%</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>RISK LEVEL</span>
                      <span className="material-symbols-outlined text-emerald-600">gpp_good</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-700 uppercase">Low</span>
                      <span className="text-slate-500 font-mono text-xs">Stable</span>
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
                        <p className="font-bold text-slate-900">Roberto Mendoza</p>
                        <p className="text-[11px] text-slate-500">Procurement Director</p>
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
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between text-xs">
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
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8821</td>
                          <td className="px-4 py-3 text-slate-600">Oct 08, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 42,350.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8794</td>
                          <td className="px-4 py-3 text-slate-600">Sep 24, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 18,900.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8910</td>
                          <td className="px-4 py-3 text-slate-600">Oct 11, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 112,400.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                              TRANSIT
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Active Materials Catalog */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Active Materials Catalog ({selectedSupplier.category})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">texture</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">M-882-C</span>
                      <h4 className="font-bold text-slate-900">Egyptian Cotton 800TC</h4>
                      <p className="text-[10px] font-mono text-emerald-600 font-semibold">IN STOCK: 2,400kg</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">waves</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">M-910-S</span>
                      <h4 className="font-bold text-slate-900">Ultra-Strength Silk</h4>
                      <p className="text-[10px] font-mono text-amber-600 font-semibold">LOW STOCK: 120kg</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">colorize</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">D-441-B</span>
                      <h4 className="font-bold text-slate-900">Reactive Indigo Dye</h4>
                      <p className="text-[10px] font-mono text-emerald-600 font-semibold">IN STOCK: 4,000L</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">category</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">P-122-Z</span>
                      <h4 className="font-bold text-slate-900">Industrial Spindles</h4>
                      <p className="text-[10px] font-mono text-slate-500">REORDERED: 50 units</p>
                    </div>
                  </div>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
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
                    <label className="font-semibold text-slate-700">Category</label>
                    <select
                      value={editingSupplier.category}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="FABRIC">Fabric</option>
                      <option value="TRIMS">Trims</option>
                      <option value="HARDWARE">Hardware</option>
                      <option value="PACKAGING">Packaging</option>
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
                        value={editingSupplier.email}
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
                        value={editingSupplier.phone}
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
                  <label className="font-semibold text-slate-700">Billing Address</label>
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

              {/* Helper Banner */}
              <div className="flex items-center space-x-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
                <span className="material-symbols-outlined text-slate-800 text-base">info</span>
                <p className="text-[11px] leading-tight">
                  Changes will reflect across all open contracts and procurement cycles.
                </p>
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

      {/* Add Material to Supplier Modal */}
      <AddMaterialToSupplierModal
        isOpen={isMapMaterialModalOpen}
        onClose={() => setIsMapMaterialModalOpen(false)}
      />
    </div>
  );
}
