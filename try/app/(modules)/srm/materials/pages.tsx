"use client";

import React, { useState, useMemo } from "react";

interface MaterialMapping {
  id: string;
  sku: string;
  description: string;
  primarySupplier: string;
  secondarySupplier?: string;
  leadTimeDays: number;
  unitPrice: number;
  priceVariance: number; // positive = increase %, negative = decrease %
  priceTrend: "up" | "down" | "flat";
  moq: string;
  moqDetail: string;
  lastOrderDate: string;
  poNumber: string;
  riskStatus: "NORMAL" | "WARNING" | "CRITICAL";
}

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

export default function MaterialMappingPage() {
  const [mappings, setMappings] = useState<MaterialMapping[]>(INITIAL_MAPPINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "CRITICAL" | "NEW">("ALL");
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<MaterialMapping | null>(null);
  const [modalTab, setModalTab] = useState<"terms" | "leadtime" | "price">("terms");
  const [newMapping, setNewMapping] = useState<Partial<MaterialMapping>>({
    leadTimeDays: 14,
    riskStatus: "NORMAL",
    priceTrend: "flat",
  });

  const handleUpdateMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping) return;

    setMappings(
      mappings.map((m) => (m.id === selectedMapping.id ? selectedMapping : m))
    );
    setSelectedMapping(null);
  };

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapping.sku || !newMapping.primarySupplier) return;

    const created: MaterialMapping = {
      id: String(Date.now()),
      sku: newMapping.sku,
      description: newMapping.description || "General Material SKU",
      primarySupplier: newMapping.primarySupplier,
      secondarySupplier: newMapping.secondarySupplier,
      leadTimeDays: Number(newMapping.leadTimeDays) || 14,
      unitPrice: Number(newMapping.unitPrice) || 10.0,
      priceVariance: 0.0,
      priceTrend: "flat",
      moq: newMapping.moq || "500 Units",
      moqDetail: newMapping.moqDetail || "Standard Lot",
      lastOrderDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      poNumber: `PO-#${Math.floor(10000 + Math.random() * 90000)}`,
      riskStatus: (newMapping.riskStatus as any) || "NORMAL",
    };

    setMappings([created, ...mappings]);
    setIsAddModalOpen(false);
    setNewMapping({ leadTimeDays: 14, riskStatus: "NORMAL", priceTrend: "flat" });
  };

  const exportReport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredMappings, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `material_mappings_${Date.now()}.json`);
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
            Material Mapping & Lead Time
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKU-to-supplier relationships and monitor procurement efficiency.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs rounded-lg shadow transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Supplier Mapping</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Overview (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs Tracked */}
        <div className="srm-glass-card p-5 rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-slate-800">
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
        <div className="srm-glass-card p-5 rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-amber-500">
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
        <div className="srm-glass-card p-5 rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-red-500">
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
        <div className="srm-glass-card p-5 rounded-xl flex flex-col justify-between h-32 border-l-4 border-l-blue-600">
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
      <div className="srm-glass-card rounded-2xl overflow-hidden border border-slate-200">
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
                <tr key={item.id} className="srm-table-row group">
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
                        ${item.unitPrice.toFixed(2)}
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
        <div className="srm-glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
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
        <div className="srm-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
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

      {/* Add Supplier Mapping Modal (Stitch Screen c0c8968fd27e4d7bb30631851fafa694) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 srm-modal-backdrop overflow-y-auto">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200 srm-modal-content">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Supplier Mapping</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                      SKU CONTEXT
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {newMapping.sku || "FAB-COT-NAVY-01"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Section 1: Material Identification */}
              <section className="space-y-2">
                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MATERIAL IDENTIFICATION
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Material SKU *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAB-COT-NAVY-01"
                      value={newMapping.sku || ""}
                      onChange={(e) =>
                        setNewMapping({ ...newMapping, sku: e.target.value })
                      }
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Organic Cotton Twill 200GSM"
                      value={newMapping.description || ""}
                      onChange={(e) =>
                        setNewMapping({ ...newMapping, description: e.target.value })
                      }
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Supplier Assignment */}
              <section className="space-y-2">
                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  SUPPLIER ASSIGNMENT
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Primary Supplier *</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-11 focus-within:ring-2 focus-within:ring-slate-900">
                      <span className="material-symbols-outlined px-3 text-slate-400 text-base">search</span>
                      <input
                        type="text"
                        required
                        placeholder="Search primary supplier..."
                        value={newMapping.primarySupplier || ""}
                        onChange={(e) =>
                          setNewMapping({ ...newMapping, primarySupplier: e.target.value })
                        }
                        className="w-full h-full bg-transparent border-none focus:outline-none text-slate-900 pr-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Secondary Supplier (Optional)</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-11 focus-within:ring-2 focus-within:ring-slate-900">
                      <span className="material-symbols-outlined px-3 text-slate-400 text-base">search</span>
                      <input
                        type="text"
                        placeholder="Search backup supplier..."
                        value={newMapping.secondarySupplier || ""}
                        onChange={(e) =>
                          setNewMapping({ ...newMapping, secondarySupplier: e.target.value })
                        }
                        className="w-full h-full bg-transparent border-none focus:outline-none text-slate-900 pr-3"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Logistics & Commercial Data */}
              <section className="space-y-2">
                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  LOGISTICS & COMMERCIAL DATA
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Std. Lead Time (Days)</label>
                    <input
                      type="number"
                      value={newMapping.leadTimeDays || 14}
                      onChange={(e) =>
                        setNewMapping({
                          ...newMapping,
                          leadTimeDays: Number(e.target.value),
                        })
                      }
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">MOQ (Units/Mtrs)</label>
                    <input
                      type="text"
                      placeholder="e.g. 500 Meters"
                      value={newMapping.moq || ""}
                      onChange={(e) =>
                        setNewMapping({ ...newMapping, moq: e.target.value })
                      }
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Unit Price ($)</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl h-11 px-3 focus-within:ring-2 focus-within:ring-slate-900">
                      <span className="font-mono text-slate-400 mr-2">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="12.50"
                        value={newMapping.unitPrice || ""}
                        onChange={(e) =>
                          setNewMapping({
                            ...newMapping,
                            unitPrice: Number(e.target.value),
                          })
                        }
                        className="w-full h-full bg-transparent border-none focus:outline-none font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Quality & Compliance */}
              <section className="space-y-2">
                <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  QUALITY INDICATORS
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Quality Grade</label>
                    <select className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none">
                      <option>Grade A (Premium - 99%+ pass rate)</option>
                      <option>Grade B (Standard - 95%+ pass rate)</option>
                      <option>Grade C (Economy - 90%+ pass rate)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase font-mono leading-none">
                        Automated Validation
                      </p>
                      <p className="text-xs text-emerald-800 mt-1">
                        Pricing within ±5% of market benchmark.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Notice */}
              <div className="p-4 bg-slate-100 flex items-start space-x-3 rounded-xl border border-slate-200 text-slate-700">
                <span className="material-symbols-outlined text-slate-800 text-lg shrink-0 mt-0.5">info</span>
                <p className="text-xs leading-relaxed">
                  Creating this mapping will update the sourcing priority for <strong>{newMapping.sku || "this material"}</strong> across all active production planning modules. Primary suppliers are auto-selected for RFQs.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">delete_sweep</span>
                  <span>Discard</span>
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 font-mono text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">add_link</span>
                    <span>Create Mapping</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Supplier Mapping Modal (Stitch Screen 1b573c866e614223ac659977a9708beb) */}
      {selectedMapping && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 srm-modal-backdrop overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200 srm-modal-content">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow">
                  <span className="material-symbols-outlined">settings_suggest</span>
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">
                    Manage Mapping: {selectedMapping.sku}
                  </h1>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    Material SKU: {selectedMapping.sku} • {selectedMapping.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMapping(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            {/* Content Area - 2 Columns (Sub-Sidebar + Pane) */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row text-xs">
              {/* Left Sub-Sidebar */}
              <aside className="w-full md:w-56 border-r border-slate-200 bg-slate-50 p-4 space-y-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalTab("terms")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    modalTab === "terms"
                      ? "bg-slate-900 text-white font-bold shadow"
                      : "text-slate-600 hover:bg-slate-200/60 font-semibold"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">factory</span>
                  <span className="font-mono text-xs uppercase">Supplier Terms</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("leadtime")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    modalTab === "leadtime"
                      ? "bg-slate-900 text-white font-bold shadow"
                      : "text-slate-600 hover:bg-slate-200/60 font-semibold"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span className="font-mono text-xs uppercase">Lead Time History</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("price")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    modalTab === "price"
                      ? "bg-slate-900 text-white font-bold shadow"
                      : "text-slate-600 hover:bg-slate-200/60 font-semibold"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span className="font-mono text-xs uppercase">Price Variance</span>
                </button>

                <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                  <h4 className="px-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    QUICK ACTIONS
                  </h4>
                  <button
                    type="button"
                    onClick={() => alert(`Quote request initiated for ${selectedMapping.sku}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">request_quote</span>
                    <span>Request Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab("leadtime")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">update</span>
                    <span>Update Lead Time</span>
                  </button>
                </div>
              </aside>

              {/* Right Content Panes */}
              <main className="flex-1 p-6 md:p-8 bg-white space-y-6">
                {/* Pane 1: Supplier Terms */}
                {modalTab === "terms" && (
                  <form onSubmit={handleUpdateMappingSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Mapping & Commercials</h3>
                      <p className="text-xs text-slate-500">
                        Configure primary procurement channels and volume thresholds.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Supplier */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                          PRIMARY SUPPLIER *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedMapping.primarySupplier}
                          onChange={(e) =>
                            setSelectedMapping({
                              ...selectedMapping,
                              primarySupplier: e.target.value,
                            })
                          }
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Secondary Supplier */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                          SECONDARY SUPPLIER
                        </label>
                        <input
                          type="text"
                          value={selectedMapping.secondarySupplier || ""}
                          onChange={(e) =>
                            setSelectedMapping({
                              ...selectedMapping,
                              secondarySupplier: e.target.value,
                            })
                          }
                          placeholder="Backup Supplier"
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                          UNIT PRICE ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={selectedMapping.unitPrice}
                            onChange={(e) =>
                              setSelectedMapping({
                                ...selectedMapping,
                                unitPrice: Number(e.target.value),
                              })
                            }
                            className="w-full h-10 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* MOQ */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                          MINIMUM ORDER QTY (MOQ)
                        </label>
                        <input
                          type="text"
                          value={selectedMapping.moq}
                          onChange={(e) =>
                            setSelectedMapping({
                              ...selectedMapping,
                              moq: e.target.value,
                            })
                          }
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Context KPI Cards */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-mono text-[10px] font-bold uppercase">CURRENT STOCK</span>
                          <span className="material-symbols-outlined text-slate-700 text-base">inventory</span>
                        </div>
                        <div className="font-mono text-lg font-bold text-slate-900">
                          4,200 <span className="text-xs font-normal text-slate-500">Mtrs</span>
                        </div>
                      </div>

                      <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-mono text-[10px] font-bold uppercase">YTD VARIANCE</span>
                          <span className="material-symbols-outlined text-emerald-600 text-base">trending_down</span>
                        </div>
                        <div className="font-mono text-lg font-bold text-emerald-600">
                          -2.4% <span className="text-xs font-normal text-slate-500">vs Avg</span>
                        </div>
                      </div>

                      <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-mono text-[10px] font-bold uppercase">ACTIVE POs</span>
                          <span className="material-symbols-outlined text-amber-600 text-base">pending_actions</span>
                        </div>
                        <div className="font-mono text-lg font-bold text-slate-900">
                          03 <span className="text-xs font-normal text-slate-500">Orders</span>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Pane 2: Lead Time History */}
                {modalTab === "leadtime" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Lead Time Performance</h3>
                      <p className="text-xs text-slate-500">
                        Historical fulfillment cycles for {selectedMapping.sku}.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-[10px] font-bold text-slate-400 uppercase">LAST ORDER</p>
                          <p className="font-mono text-2xl font-bold text-slate-900">
                            {selectedMapping.leadTimeDays} <span className="text-xs font-normal text-slate-500">Days</span>
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">verified</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-[10px] font-bold text-slate-400 uppercase">AVG PERFORMANCE</p>
                          <p className="font-mono text-2xl font-bold text-slate-900">
                            14 <span className="text-xs font-normal text-slate-500">Days</span>
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">monitoring</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                        RECENT ORDERS FULFILLMENT
                      </label>
                      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                        <div className="flex items-center gap-4 font-mono text-xs">
                          <div className="w-24 text-slate-500">PO #88210</div>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[60%]"></div>
                          </div>
                          <div className="w-12 text-right font-bold text-slate-900">12d</div>
                        </div>

                        <div className="flex items-center gap-4 font-mono text-xs">
                          <div className="w-24 text-slate-500">PO #87902</div>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full w-[85%]"></div>
                          </div>
                          <div className="w-12 text-right font-bold text-slate-900">17d</div>
                        </div>

                        <div className="flex items-center gap-4 font-mono text-xs">
                          <div className="w-24 text-slate-500">PO #87554</div>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full w-[70%]"></div>
                          </div>
                          <div className="w-12 text-right font-bold text-slate-900">14d</div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                          <span>Target: 14 Days</span>
                          <span>Deviation: -1.2 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pane 3: Price Variance */}
                {modalTab === "price" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Price Variance Analysis</h3>
                      <p className="text-xs text-slate-500">
                        Market benchmark vs Current procurement cost (${selectedMapping.unitPrice.toFixed(2)}/unit).
                      </p>
                    </div>

                    <div className="h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-4 space-y-2">
                      <span className="material-symbols-outlined text-4xl text-slate-700">bar_chart</span>
                      <p className="font-mono text-xs text-center font-semibold text-slate-700">
                        Price Variance: {selectedMapping.priceVariance > 0 ? `+${selectedMapping.priceVariance}%` : `${selectedMapping.priceVariance}%`} vs Market Benchmark
                      </p>
                      <p className="text-[11px] text-slate-400 text-center">
                        Cost history is synced with factory material ledger.
                      </p>
                    </div>
                  </div>
                )}
              </main>
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-10 text-xs">
              <div className="flex items-center gap-2 text-amber-700 font-semibold">
                <span className="material-symbols-outlined text-base">info</span>
                <span>Changes will affect future MRP calculations.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMapping(null)}
                  className="px-5 py-2 font-mono font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleUpdateMappingSubmit}
                  className="px-6 py-2 bg-slate-900 text-white font-mono font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

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
