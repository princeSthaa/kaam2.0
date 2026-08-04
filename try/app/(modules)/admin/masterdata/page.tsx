"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RegisterSkuModal, RegisterSkuFormData } from "../components/modals/registerskumodal";
import { DefineMaterialModal, MaterialSpecFormData } from "../components/modals/definematerial";
import { ManageProductionStagesModal } from "../components/modals/manageproductionstagesmodal";

interface MasterDataEntry {
  id: string;
  type: "Supplier" | "Customer" | "Product" | "Material";
  name: string;
  updatedBy: string;
  userInitials: string;
  userColor: string;
  status: "Active" | "Review" | "Blocked";
  timestamp: string;
}

const INITIAL_LOG_DATA: MasterDataEntry[] = [
  {
    id: "SUP-24091",
    type: "Supplier",
    name: "Indigo Textiles & Mills Co.",
    updatedBy: "J. Smith",
    userInitials: "JS",
    userColor: "bg-blue-100 text-blue-900",
    status: "Active",
    timestamp: "10:42 AM",
  },
  {
    id: "PRD-JKT-01",
    type: "Product",
    name: "Vintage Selvedge Denim Jacket",
    updatedBy: "A. Kumar",
    userInitials: "AK",
    userColor: "bg-purple-100 text-purple-900",
    status: "Review",
    timestamp: "09:15 AM",
  },
  {
    id: "MAT-CTN-100",
    type: "Material",
    name: "100% Organic Combed Cotton Knit (180 GSM)",
    updatedBy: "System",
    userInitials: "SYS",
    userColor: "bg-slate-200 text-slate-800",
    status: "Active",
    timestamp: "Yesterday",
  },
  {
    id: "CUS-URB-88",
    type: "Customer",
    name: "Urban Apparel Retail Group",
    updatedBy: "J. Smith",
    userInitials: "JS",
    userColor: "bg-blue-100 text-blue-900",
    status: "Blocked",
    timestamp: "Yesterday",
  },
  {
    id: "SUP-ZIP-402",
    type: "Supplier",
    name: "Himalayan Zipper & Trims Corp.",
    updatedBy: "M. Rossi",
    userInitials: "MR",
    userColor: "bg-emerald-100 text-emerald-900",
    status: "Active",
    timestamp: "Oct 24",
  },
  {
    id: "MAT-DYE-B2",
    type: "Material",
    name: "Reactive Indigo Dye Concentrate #B2",
    updatedBy: "R. Sharma",
    userInitials: "RS",
    userColor: "bg-amber-100 text-amber-900",
    status: "Active",
    timestamp: "Oct 23",
  },
];

export default function MasterDataPage() {
  const [logData, setLogData] = useState<MasterDataEntry[]>(INITIAL_LOG_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRegisterSkuModalOpen, setIsRegisterSkuModalOpen] = useState(false);
  const [isDefineMaterialModalOpen, setIsDefineMaterialModalOpen] = useState(false);
  const [isManageStagesModalOpen, setIsManageStagesModalOpen] = useState(false);
  const [isQuickActionsMenuOpen, setIsQuickActionsMenuOpen] = useState(false);
  const [activeActionTitle, setActiveActionTitle] = useState("");

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === "Register Product SKU") {
      setIsRegisterSkuModalOpen(true);
      return;
    }
    if (actionName === "Define Material Spec") {
      setIsDefineMaterialModalOpen(true);
      return;
    }
    if (actionName === "Manage Production Stages") {
      setIsManageStagesModalOpen(true);
      return;
    }
    setActiveActionTitle(actionName);
    setIsActionModalOpen(true);
  };

  const handleSaveSku = (skuData: RegisterSkuFormData) => {
    const newEntry: MasterDataEntry = {
      id: skuData.baseSku || `SKU-${Date.now().toString().slice(-4)}`,
      type: "Product",
      name: skuData.productName,
      updatedBy: "Admin User",
      userInitials: "AU",
      userColor: "bg-purple-100 text-purple-900",
      status: "Active",
      timestamp: "Just now",
    };
    setLogData((prev) => [newEntry, ...prev]);
    showToast(`Successfully registered Product SKU: ${skuData.baseSku}`);
  };

  const handleSaveMaterial = (matData: MaterialSpecFormData) => {
    const newEntry: MasterDataEntry = {
      id: matData.code || `MAT-${Date.now().toString().slice(-4)}`,
      type: "Material",
      name: matData.name,
      updatedBy: "Admin User",
      userInitials: "AU",
      userColor: "bg-slate-200 text-slate-800",
      status: "Active",
      timestamp: "Just now",
    };
    setLogData((prev) => [newEntry, ...prev]);
    showToast(`Successfully defined Material Spec: ${matData.name}`);
  };

  const handleBulkImport = () => {
    showToast("Opening Master Data Bulk Import wizard (CSV / Excel)...");
  };

  const filteredLogs = useMemo(() => {
    return logData.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.updatedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "ALL" || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [logData, searchTerm, selectedType]);

  return (
    <div className="space-y-6 text-[#191c1e] font-sans pb-12">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3 transition-all animate-bounce">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Master Data Management
            </h1>
            <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              Admin Central
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralize, standardize, and govern core business entities across the enterprise infrastructure.
          </p>
        </div>

        {/* Search & Quick Actions Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search master data logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Quick Actions Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setIsQuickActionsMenuOpen(true)}
            onMouseLeave={() => setIsQuickActionsMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsQuickActionsMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Quick Actions</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {isQuickActionsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    handleActionClick("New Supplier Onboarding");
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">add</span>
                  <span>New Supplier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleActionClick("Onboard Customer Account");
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">person_add</span>
                  <span>Onboard Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleActionClick("Register Product SKU");
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">barcode_scanner</span>
                  <span>Register Product SKU</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleActionClick("Define Material Spec");
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">precision_manufacturing</span>
                  <span>Define Material Spec</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleActionClick("Manage Production Stages");
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">account_tree</span>
                  <span>Manage Production Stages</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    handleBulkImport();
                    setIsQuickActionsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">upload_file</span>
                  <span>Bulk Import Data (CSV/XLSX)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BENTO KPI CARDS (4 GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Suppliers Card */}
        <Link
          href="/srm/suppliers"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Suppliers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">124</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
              +3 onboarded this week
            </div>
          </div>
        </Link>

        {/* Customers Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Verified Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-950 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">3,492</div>
            <div className="flex items-center text-slate-500 font-mono text-[11px] mt-2 font-medium">
              <span className="material-symbols-outlined text-sm mr-0.5">horizontal_rule</span>
              Stable account ledger
            </div>
          </div>
        </div>

        {/* Product Catalog Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Product Catalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">1,850</div>
            <div className="flex items-center text-amber-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-0.5">warning</span>
              12 pending spec review
            </div>
          </div>
        </div>

        {/* Materials SKUs Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Materials SKUs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">850</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-0.5">check_circle</span>
              All synced with ERP
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH RECENTLY UPDATED MASTER DATA LOG TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between w-full">
          <div>
            <div className="p-5 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50/50 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recently Updated Master Data</h2>
                <p className="text-xs text-slate-500">Audit history of entity modifications and synchronizations</p>
              </div>

              {/* Type Filter Buttons */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {["ALL", "Supplier", "Customer", "Product", "Material"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 font-mono text-[11px] font-bold rounded transition-all ${
                      selectedType === type
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">Entity ID</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5">Name / Description</th>
                    <th className="py-3 px-5">Updated By</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                        No master data entries match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{log.id}</td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">{log.type}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900">{log.name}</td>
                        <td className="py-3.5 px-5 text-slate-700">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${log.userColor}`}
                            >
                              {log.userInitials}
                            </div>
                            <span>{log.updatedBy}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              log.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : log.status === "Review"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                log.status === "Active"
                                  ? "bg-emerald-600"
                                  : log.status === "Review"
                                  ? "bg-amber-600"
                                  : "bg-rose-600"
                              }`}
                            ></span>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-500 text-right whitespace-nowrap">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right text-xs text-slate-400 font-mono">
            Showing {filteredLogs.length} of {INITIAL_LOG_DATA.length} log entries
          </div>
        </div>

      {/* QUICK ACTION MODAL */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="material-symbols-outlined text-slate-900 mr-2">database</span>
                {activeActionTitle}
              </h3>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Form entry for <strong>{activeActionTitle}</strong>. Initialize master record details below:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsActionModalOpen(false);
                showToast(`New record created for ${activeActionTitle}!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entity Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Entity A"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entity Identifier Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ENT-2026-X"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 shadow"
                >
                  Create Master Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER PRODUCT SKU MODAL */}
      <RegisterSkuModal
        isOpen={isRegisterSkuModalOpen}
        onClose={() => setIsRegisterSkuModalOpen(false)}
        onSave={handleSaveSku}
      />

      {/* DEFINE MATERIAL SPEC MODAL */}
      <DefineMaterialModal
        isOpen={isDefineMaterialModalOpen}
        onClose={() => setIsDefineMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
      />

      {/* MANAGE PRODUCTION STAGES MODAL */}
      <ManageProductionStagesModal
        isOpen={isManageStagesModalOpen}
        onClose={() => setIsManageStagesModalOpen(false)}
      />
    </div>
  );
}
