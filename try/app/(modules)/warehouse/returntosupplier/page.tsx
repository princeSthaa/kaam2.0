"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import "../styles/warehouse-stock.css"; // Reuse standard layout CSS

type ReturnItem = {
  id: string;
  date: string;
  supplier: string;
  materialName: string;
  sku: string;
  qty: string;
  reason: "Defect" | "Damage" | "Wrong Item" | "Excess";
  status: "Pending" | "In Transit" | "Resolved";
};

const initialData: ReturnItem[] = [
  { id: "#RET-2023-042", date: "Oct 24, 2023", supplier: "Global Polymer Corp", materialName: "High-Density Polyethylene", sku: "FAB-COT-NVY-01", qty: "120.0 m", reason: "Defect", status: "In Transit" },
  { id: "#RET-2023-041", date: "Oct 22, 2023", supplier: "Inox Logistics India", materialName: "Industrial Sealant v4", sku: "SL-IND-400X", qty: "45.0 units", reason: "Damage", status: "Pending" },
  { id: "#RET-2023-040", date: "Oct 19, 2023", supplier: "Precision Gears Ltd", materialName: "Stainless Spindle #8", sku: "SS-SPN-08B", qty: "12.0 pcs", reason: "Excess", status: "Resolved" },
];

export default function ReturnToSupplierPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredItems = useMemo(() => {
    return initialData.filter((item) => {
      if (reasonFilter !== "All Reasons" && item.reason !== reasonFilter) return false;
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        if (
          !item.id.toLowerCase().includes(lower) &&
          !item.sku.toLowerCase().includes(lower) &&
          !item.supplier.toLowerCase().includes(lower) &&
          !item.materialName.toLowerCase().includes(lower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, reasonFilter, statusFilter]);

  const getReasonStyles = (reason: string) => {
    switch (reason) {
      case "Defect": return { bg: "#ffdad6", text: "#93000a", dot: "#ba1a1a" };
      case "Damage": return { bg: "#d2e1fa", text: "#556379", dot: "#515f74" };
      case "Wrong Item": return { bg: "#fef3c7", text: "#92400e", dot: "#d97706" };
      case "Excess": return { bg: "#e2e2e9", text: "#45474c", dot: "#76777d" };
      default: return { bg: "#f2f4f6", text: "#45464d", dot: "#45464d" };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending": return { bg: "#e0e3e5", text: "#45464d", dot: "#76777d" };
      case "In Transit": return { bg: "#FEF3C7", text: "#92400E", dot: "#92400E" };
      case "Resolved": return { bg: "#F0FDF4", text: "#166534", dot: "#166534" };
      default: return { bg: "#f2f4f6", text: "#45464d", dot: "#45464d" };
    }
  };

  return (
    <div className="wh-stock-page">
      {/* -- HEADER CARD WITH ACTIONS -- */}
      <div className="wh-stock-header-card">
        <div className="wh-stock-header-top">
          <div className="wh-stock-title">
            <div className="flex items-center gap-3">
              <h1>Supplier Returns</h1>
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Logistics
              </span>
            </div>
            <p>Manage reverse logistics, track pending credits, and handle material defects.</p>
          </div>

          <div className="wh-stock-actions">
            <button className="wh-stock-btn-secondary">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Ledger</span>
            </button>
            <Link href="/warehouse/supplierproductandinspect" className="wh-stock-btn-primary" style={{textDecoration: 'none'}}>
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Create New Return</span>
            </Link>
          </div>
        </div>
      </div>

      {/* -- KPI BENTO GRID CARDS -- */}
      <div className="wh-stock-kpi-grid">
        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">ACTIVE RETURNS</span>
            <span className="material-symbols-outlined text-slate-400">assignment_return</span>
          </div>
          <div className="wh-stock-kpi-value">42</div>
          <div className="wh-stock-kpi-footer text-emerald-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_down</span>
            <span>-12% vs last month</span>
          </div>
        </div>

        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">PENDING CREDITS</span>
            <span className="material-symbols-outlined text-slate-400">payments</span>
          </div>
          <div className="wh-stock-kpi-value">Rs 8.4M</div>
          <div className="wh-stock-kpi-footer text-slate-500 flex items-center gap-1">
            <span>Across 18 vendors</span>
          </div>
        </div>

        <div className="wh-stock-kpi-card alert">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title text-red-700">QUALITY RETURNS</span>
            <span className="material-symbols-outlined text-red-600">verified</span>
          </div>
          <div className="wh-stock-kpi-value text-red-700">74%</div>
          <div className="wh-stock-kpi-footer text-red-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+5% material defects</span>
          </div>
        </div>

        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">AVG. RESOLUTION</span>
            <span className="material-symbols-outlined text-slate-400">timer</span>
          </div>
          <div className="wh-stock-kpi-value">5.2 Days</div>
          <div className="wh-stock-kpi-footer text-emerald-600 flex items-center gap-1">
            <span>Target: 6.0 Days</span>
          </div>
        </div>
      </div>

      {/* -- TOOLBAR & FILTERS CARD -- */}
      <div className="wh-stock-toolbar-card">
        {/* Tab Buttons for Status */}
        <div className="wh-stock-tabs">
          {["All", "Pending", "In Transit", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`wh-stock-tab-btn ${statusFilter === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div className="wh-stock-filter-controls">
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="wh-stock-select"
          >
            <option>All Reasons</option>
            <option>Defect</option>
            <option>Damage</option>
            <option>Wrong Item</option>
            <option>Excess</option>
          </select>

          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, SKU, or Supplier..."
              className="wh-stock-search-input"
            />
          </div>
        </div>
      </div>

      {/* -- MASTER DATA TABLE CARD -- */}
      <div className="wh-stock-table-card">
        <div className="overflow-x-auto">
          <table className="wh-stock-table">
            <thead>
              <tr>
                <th>RETURN ID</th>
                <th>DATE INITIATED</th>
                <th>SUPPLIER</th>
                <th>MATERIAL / SKU</th>
                <th className="text-right">QTY RETURNED</th>
                <th className="text-center">REASON</th>
                <th className="text-center">STATUS</th>
                <th className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-semibold">
                    No returns match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const rs = getReasonStyles(item.reason);
                  const ss = getStatusStyles(item.status);
                  
                  return (
                    <tr key={item.id}>
                      <td className="font-bold text-slate-900">{item.id}</td>
                      <td className="font-semibold text-slate-600">{item.date}</td>
                      <td className="font-bold text-slate-800">{item.supplier}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.materialName}</span>
                          <span className="wh-stock-sku-badge mt-0.5">{item.sku}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900">{item.qty}</td>
                      <td className="text-center">
                        <span 
                          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1"
                          style={{ backgroundColor: rs.bg, color: rs.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rs.dot }}></span> {item.reason}
                        </span>
                      </td>
                      <td className="text-center">
                        <span 
                          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1"
                          style={{ backgroundColor: ss.bg, color: ss.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }}></span> {item.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer" title="View Details">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer" title="Download Memo">
                            <span className="material-symbols-outlined text-[18px]">description</span>
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
    </div>
  );
}
