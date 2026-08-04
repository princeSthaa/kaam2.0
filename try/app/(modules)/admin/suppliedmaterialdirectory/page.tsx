"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import AddSupplierMappingModal, {
  MaterialMapping,
} from "../components/modals/addsuppliermappingmodal";
import UpdateSupplierMappingModal from "../components/modals/updatesuppliermappingmodal";
import { ManageMaterialCategoryModal } from "../components/modals/managematerialcategorymodal";
import { ManageMaterialTypeModal } from "../components/modals/managematerialtypemodal";

const INITIAL_MAPPINGS: MaterialMapping[] = [
  {
    id: "1",
    sku: "FAB-COT-NAVY-01",
    description: "Cotton Twill, 180GSM",
    primarySupplier: "Global Textile Corp.",
    secondarySupplier: "Indo-Loom Exports",
    leadTimeDays: 12,
    unitPrice: 12.45,
    priceVariance: 2.4,
    priceTrend: "up",
    moq: "500 Units",
    moqDetail: "Batch-size limited",
    lastOrderDate: "Oct 24, 2023",
    poNumber: "PO-#88219",
    riskStatus: "NORMAL",
  },
  {
    id: "2",
    sku: "MET-ZIP-BRS-04",
    description: "Brass Zippers, YKK-grade",
    primarySupplier: "Prestige Metals Ltd.",
    leadTimeDays: 45,
    unitPrice: 0.85,
    priceVariance: -1.2,
    priceTrend: "down",
    moq: "2,500 Units",
    moqDetail: "Volume pricing",
    lastOrderDate: "Nov 02, 2023",
    poNumber: "PO-#88450",
    riskStatus: "CRITICAL",
  },
  {
    id: "3",
    sku: "SYN-PLY-STRETCH-22",
    description: "Recycled Poly, 4-way Stretch",
    primarySupplier: "EcoThread Mills",
    secondarySupplier: "Ocean-Bound Fibers",
    leadTimeDays: 28,
    unitPrice: 18.9,
    priceVariance: 0.0,
    priceTrend: "flat",
    moq: "1,000 Units",
    moqDetail: "Tier 2 Discount",
    lastOrderDate: "Aug 15, 2023",
    poNumber: "PO-#87011",
    riskStatus: "WARNING",
  },
  {
    id: "4",
    sku: "TRM-BTN-HDW-09",
    description: "Heavy-duty Matte Buttons 20mm",
    primarySupplier: "Apex Trims Ltd.",
    secondarySupplier: "Global Threads",
    leadTimeDays: 8,
    unitPrice: 0.32,
    priceVariance: 1.1,
    priceTrend: "up",
    moq: "5,000 Units",
    moqDetail: "Standard box",
    lastOrderDate: "Dec 10, 2023",
    poNumber: "PO-#89102",
    riskStatus: "NORMAL",
  },
  {
    id: "5",
    sku: "FAB-DEN-RAW-14",
    description: "Raw Indigo Denim, 14oz",
    primarySupplier: "Indigo Textiles Co.",
    leadTimeDays: 35,
    unitPrice: 24.5,
    priceVariance: 5.2,
    priceTrend: "up",
    moq: "800 Meters",
    moqDetail: "Roll minimum",
    lastOrderDate: "Jan 18, 2024",
    poNumber: "PO-#90124",
    riskStatus: "CRITICAL",
  },
];

export default function SuppliedMaterialDirectoryPage() {
  const [mappings, setMappings] = useState<MaterialMapping[]>(INITIAL_MAPPINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "CRITICAL" | "NEW">("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<MaterialMapping | null>(null);
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);
  const [isManageCategoryModalOpen, setIsManageCategoryModalOpen] = useState(false);
  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const materialMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (materialMenuRef.current && !materialMenuRef.current.contains(e.target as Node)) {
        setIsMaterialMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMappings = useMemo(() => {
    return mappings.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.primarySupplier.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterMode === "CRITICAL") {
        return (
          matchesSearch &&
          (item.riskStatus === "CRITICAL" ||
            item.leadTimeDays > 30 ||
            item.priceVariance > 3.0)
        );
      }
      if (filterMode === "NEW") {
        return (
          matchesSearch &&
          (item.priceTrend === "flat" || item.priceVariance === 0)
        );
      }
      return matchesSearch;
    });
  }, [mappings, searchTerm, filterMode]);

  const handleAddMappingSave = (newMappingData: Partial<MaterialMapping>) => {
    const created: MaterialMapping = {
      id: String(Date.now()),
      sku: newMappingData.sku || "FAB-COT-NEW",
      description: newMappingData.description || "General Material SKU",
      primarySupplier: newMappingData.primarySupplier || "Primary Supplier",
      secondarySupplier: newMappingData.secondarySupplier,
      leadTimeDays: Number(newMappingData.leadTimeDays) || 14,
      unitPrice: Number(newMappingData.unitPrice) || 10.0,
      priceVariance: 0.0,
      priceTrend: "flat",
      moq: newMappingData.moq || "500 Units",
      moqDetail: newMappingData.moqDetail || "Standard Lot",
      lastOrderDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      poNumber: `PO-#${Math.floor(10000 + Math.random() * 90000)}`,
      riskStatus: (newMappingData.riskStatus as any) || "NORMAL",
    };

    setMappings([created, ...mappings]);
  };

  const handleUpdateMapping = (updatedMapping: MaterialMapping) => {
    setMappings(
      mappings.map((m) => (m.id === updatedMapping.id ? updatedMapping : m))
    );
  };

  const exportReport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredMappings, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `supplied_materials_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supplied Material Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKU-to-supplier relationships and monitor procurement efficiency.
          </p>
        </div>
        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Material Menu Dropdown (Click Controlled with Click Outside Ref) */}
          <div className="relative" ref={materialMenuRef}>
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
                    setIsAddModalOpen(true);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">add_link</span>
                  <span>Add Supplier Mapping</span>
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

                <button
                  type="button"
                  onClick={() => {
                    exportReport();
                    setIsMaterialMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors border-t border-slate-100"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">download</span>
                  <span>Export Report</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Supplier Mapping</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Overview (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs Tracked */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +4.2%
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">1,284</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total SKUs Tracked
            </div>
          </div>
        </div>

        {/* Median Lead Time */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Avg 14d
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">12.5 Days</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Median Lead Time
            </div>
          </div>
        </div>

        {/* Price Variance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-700">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              8 Alerts
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">1.8%</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Price Variance
            </div>
          </div>
        </div>

        {/* Secondary Sources */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-600 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">hub</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              92% Cover
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">426</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Secondary Sources
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-slate-900">
              <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
              <input
                type="text"
                placeholder="Search SKU or Supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none text-slate-900 w-48"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-900">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === "ALL"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Materials
              </button>
              <button
                onClick={() => setFilterMode("CRITICAL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === "CRITICAL"
                    ? "bg-red-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Critical Risk
              </button>
              <button
                onClick={() => setFilterMode("NEW")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === "NEW"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                New Mappings
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <span className="font-bold text-slate-900">{filteredMappings.length}</span> of {mappings.length} SKUs
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Material SKU
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Supply Sources
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Standard Lead Time
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Current Unit Price
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  MOQ / Inventory
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredMappings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  {/* SKU */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {item.sku}
                      </span>
                      <span className="text-xs text-slate-400">{item.description}</span>
                    </div>
                  </td>

                  {/* Supply Sources */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                        <span className="text-xs font-semibold text-slate-900">
                          {item.primarySupplier}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-300">
                          PRI
                        </span>
                      </div>
                      {item.secondarySupplier ? (
                        <div className="flex items-center space-x-2 text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          <span className="text-xs">{item.secondarySupplier}</span>
                          <span className="text-[9px] bg-slate-50 text-slate-500 font-mono px-1.5 py-0.5 rounded">
                            SEC
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 italic text-red-500 text-xs">
                          <span className="material-symbols-outlined text-xs">
                            warning
                          </span>
                          <span>No backup defined</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Standard Lead Time */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono text-xs font-bold ${
                          item.leadTimeDays > 30 ? "text-red-600" : "text-slate-900"
                        }`}
                      >
                        {item.leadTimeDays} Days
                      </span>
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.leadTimeDays > 30 ? "bg-red-500" : "bg-emerald-600"
                          }`}
                          style={{
                            width: `${Math.min(100, (item.leadTimeDays / 45) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Current Unit Price */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        Rs {item.unitPrice.toFixed(2)}
                      </span>
                      {item.priceVariance > 0 && (
                        <div className="flex items-center text-red-600 font-mono text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">
                            arrow_upward
                          </span>
                          <span>{item.priceVariance}%</span>
                        </div>
                      )}
                      {item.priceVariance < 0 && (
                        <div className="flex items-center text-emerald-600 font-mono text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">
                            arrow_downward
                          </span>
                          <span>{Math.abs(item.priceVariance)}%</span>
                        </div>
                      )}
                      {item.priceVariance === 0 && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          0.0%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* MOQ / Inventory */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-900 font-semibold">
                        {item.moq}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.moqDetail}
                      </span>
                    </div>
                  </td>

                  {/* Last Order */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-900 font-medium">
                        {item.lastOrderDate}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.poNumber}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => setSelectedMapping(item)}
                        className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                        title="Update Mapping"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit_note
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Bento Section (Lead Time Heatmap + Recent Update Logs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Lead Time Heatmap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lead Time Heatmap</h3>
              <p className="text-xs text-slate-500">
                Identifying bottlenecks in material supply chain
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-400">timeline</span>
          </div>

          <div className="h-36 flex items-end gap-2 pb-3">
            <div className="flex-1 bg-slate-300 hover:bg-slate-800 rounded-t h-20 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-slate-300 hover:bg-slate-800 rounded-t h-14 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-slate-400 hover:bg-slate-800 rounded-t h-28 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-slate-800 hover:bg-slate-900 rounded-t h-32 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-slate-400 hover:bg-slate-800 rounded-t h-24 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-red-500 hover:bg-red-600 rounded-t h-36 transition-all cursor-pointer"></div>
            <div className="flex-1 bg-slate-300 hover:bg-slate-800 rounded-t h-16 transition-all cursor-pointer"></div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
            <span>Q3 AUG</span>
            <span>Q4 SEP</span>
            <span>CURRENT</span>
          </div>
        </div>

        {/* Recent Update Logs */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3">Recent Update Logs</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
                <span className="material-symbols-outlined text-slate-700">sync</span>
                <div>
                  <p className="text-slate-900 font-medium">
                    <span className="font-bold">System</span> updated primary supplier for{" "}
                    <span className="font-mono font-semibold">MET-ZIP-BRS-04</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 bg-emerald-50 rounded-xl text-emerald-900">
                <span className="material-symbols-outlined text-emerald-600">
                  add_link
                </span>
                <div>
                  <p className="font-medium">
                    <span className="font-bold">Admin</span> added secondary source to{" "}
                    <span className="font-mono font-semibold">SYN-PLY-STRETCH-22</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    5 hours ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Supplier Mapping Modal */}
      <AddSupplierMappingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMappingSave}
      />

      {/* Update Supplier Mapping Modal */}
      <UpdateSupplierMappingModal
        selectedMapping={selectedMapping}
        onClose={() => setSelectedMapping(null)}
        onUpdate={handleUpdateMapping}
      />

      {/* Manage Material Category Modal */}
      <ManageMaterialCategoryModal
        isOpen={isManageCategoryModalOpen}
        onClose={() => setIsManageCategoryModalOpen(false)}
      />

      {/* Manage Material Type Modal */}
      <ManageMaterialTypeModal
        isOpen={isManageTypeModalOpen}
        onClose={() => setIsManageTypeModalOpen(false)}
      />

      {/* Floating Action Button for Quick Add */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
        title="Map New SKU"
      >
        <span className="material-symbols-outlined text-2xl">compare_arrows</span>
        <div className="absolute right-full mr-3 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-lg">
          Map New SKU
        </div>
      </button>
    </div>
  );
}
