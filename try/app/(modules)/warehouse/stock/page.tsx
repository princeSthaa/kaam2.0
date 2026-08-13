"use client";

import React, { useState, useMemo, useEffect } from "react";
import "../styles/warehouse-stock.css";
import { StockDiscrepancyModal } from "../components/StockDiscrepancyModal";
import { NewMaterialReceiptModal } from "../components/NewMaterialReceiptModal";
import { fetchMaterials } from "../api/constant";

export type StockItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: "raw" | "finished";
  currentStock: number;
  unit: string;
  location: string;
  capacityPct: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  totalValue: string;
  batchNo?: string;
  weight?: string;
  qcStatus?: string;
  inspector?: string;
  image?: string;
};

export default function WarehouseStockPage() {
  const [activeTab, setActiveTab] = useState<"all" | "raw" | "finished">("all");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isMoveMaterialOpen, setIsMoveMaterialOpen] = useState(false);
  const [isMoveFGOpen, setIsMoveFGOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form State for Material Movement Modal
  const [destFloor, setDestFloor] = useState("FL-01");
  const [destRack, setDestRack] = useState("RK-C1");
  const [destShelf, setDestShelf] = useState("SH-02");
  const [moveQty, setMoveQty] = useState("150");
  const [transferReason, setTransferReason] = useState("Staging for Production");

  // Form State for Manual Adjustment Modal
  const [adjustType, setAdjustType] = useState<"add" | "reduce" | "reset">("add");
  const [adjustQty, setAdjustQty] = useState("5");
  const [adjustReason, setAdjustReason] = useState("Audit Reconciliation");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Stock Items Master List
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const responseData = await fetchMaterials();
      const data = (responseData as any).value || responseData;
      
      if (!Array.isArray(data)) {
        setStockItems([]);
        return;
      }

      const mapped: StockItem[] = data.map((item: any) => {
        const qty = item.availableQty || 0;
        const status = qty > 50 ? "In Stock" : (qty > 0 ? "Low Stock" : "Out of Stock");
        const totalVal = qty * (item.costPerUnit || 0);

        return {
          id: item.id,
          name: item.name,
          sku: item.materialCode || "N/A",
          category: item.materialCategoryName || item.materialCategory?.name || "Uncategorized",
          type: "raw",
          currentStock: qty,
          unit: "Units", 
          location: "", 
          capacityPct: Math.floor(Math.random() * 40) + 20, 
          status: status as any,
          totalValue: `Rs ${totalVal.toLocaleString()}`,
          image: item.imagePath || undefined,
        };
      });

      setStockItems(mapped);
    } catch (err) {
      console.error("Failed to load materials", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Handlers
  const handleOpenMoveModal = (item: StockItem) => {
    setSelectedItem(item);
    setMoveQty("150");
    setDestFloor("FL-01");
    setDestRack("RK-C1");
    setDestShelf("SH-02");
    setTransferReason("Staging for Production");

    if (item.type === "raw") {
      setIsMoveMaterialOpen(true);
    } else {
      setIsMoveFGOpen(true);
    }
  };

  const handleOpenAdjustModal = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustQty("5");
    setAdjustReason("Audit Reconciliation");
    setAdjustNotes("");
    setIsAdjustStockOpen(true);
  };

  // Submit Handlers
  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newLoc = `${destFloor} › ${destRack} › ${destShelf}`;
    setStockItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? { ...it, location: newLoc }
          : it
      )
    );

    setIsMoveMaterialOpen(false);
    setIsMoveFGOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustQty) return;

    const qtyNum = parseInt(adjustQty) || 0;
    setStockItems((prev) =>
      prev.map((it) => {
        if (it.id === selectedItem.id) {
          let newQty = it.currentStock;
          if (adjustType === "add") newQty += qtyNum;
          else if (adjustType === "reduce") newQty = Math.max(0, newQty - qtyNum);
          else if (adjustType === "reset") newQty = qtyNum;

          const newStatus = newQty < 300 ? "Low Stock" : "In Stock";
          return { ...it, currentStock: newQty, status: newStatus };
        }
        return it;
      })
    );

    setIsAdjustStockOpen(false);
  };

  // Compute KPI Stats
  const kpiStats = useMemo(() => {
    let totalValue = 0;
    let rawCount = 0;
    let finishedCount = 0;
    let lowStockCount = 0;

    stockItems.forEach(item => {
      // Parse totalValue back from string format "Rs 1,000"
      const valStr = item.totalValue.replace(/Rs\s|,/g, '');
      totalValue += (parseFloat(valStr) || 0);

      if (item.type === "raw") rawCount += item.currentStock;
      if (item.type === "finished") finishedCount += item.currentStock;
      if (item.status === "Low Stock" || item.status === "Out of Stock") lowStockCount++;
    });

    const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    return {
      totalValueStr: `Rs ${formatNumber(totalValue)}`,
      rawCountStr: formatNumber(rawCount),
      finishedCountStr: formatNumber(finishedCount),
      lowStockCount
    };
  }, [stockItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      // Tab filter
      if (activeTab === "raw" && item.type !== "raw") return false;
      if (activeTab === "finished" && item.type !== "finished") return false;

      // Category filter
      if (selectedCategory !== "All Categories" && item.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(lower);
        const matchSku = item.sku.toLowerCase().includes(lower);
        const matchLoc = item.location.toLowerCase().includes(lower);
        if (!matchName && !matchSku && !matchLoc) return false;
      }

      return true;
    });
  }, [stockItems, activeTab, selectedCategory, searchTerm]);

  return (
    <div className="wh-stock-page">

      {/* ── HEADER CARD WITH ACTIONS ── */}
      <div className="wh-stock-header-card">
        <div className="wh-stock-header-top">
          <div className="wh-stock-title">
            <div className="flex items-center gap-3">
              <h1>Stock Management</h1>
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Inventory Overview
              </span>
            </div>
            <p>Real-time overview of raw materials, finished goods, and location telemetry.</p>
          </div>

          <div className="wh-stock-actions">
            <button className="wh-stock-btn-secondary">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsNewReceiptModalOpen(true)}
              className="wh-stock-btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI BENTO GRID CARDS ── */}
      <div className="wh-stock-kpi-grid">

        {/* Total Stock Value */}
        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">TOTAL STOCK VALUE</span>
            <span className="material-symbols-outlined text-slate-400">account_balance</span>
          </div>
          <div className="wh-stock-kpi-value">{kpiStats.totalValueStr}</div>
          <div className="wh-stock-kpi-footer text-emerald-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Live Valuation</span>
          </div>
        </div>

        {/* Raw Materials */}
        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">RAW MATERIALS</span>
            <span className="material-symbols-outlined text-slate-400">layers</span>
          </div>
          <div className="wh-stock-kpi-value">{kpiStats.rawCountStr} <span className="text-xs text-slate-500 font-semibold">Units</span></div>
          <div className="wh-stock-kpi-footer text-slate-500 flex items-center justify-between">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mr-3">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: "45%" }}></div>
            </div>
            <span className="shrink-0 text-xs font-bold">45% Cap</span>
          </div>
        </div>

        {/* Finished Goods */}
        <div className="wh-stock-kpi-card">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title">FINISHED GOODS</span>
            <span className="material-symbols-outlined text-slate-400">checkroom</span>
          </div>
          <div className="wh-stock-kpi-value">{kpiStats.finishedCountStr} <span className="text-xs text-slate-500 font-semibold">Units</span></div>
          <div className="wh-stock-kpi-footer text-slate-500 flex items-center justify-between">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mr-3">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: "20%" }}></div>
            </div>
            <span className="shrink-0 text-xs font-bold">20% Cap</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="wh-stock-kpi-card alert">
          <div className="wh-stock-kpi-header">
            <span className="wh-stock-kpi-title text-red-700">LOW STOCK ALERTS</span>
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <div className="wh-stock-kpi-value text-red-700">{kpiStats.lowStockCount} <span className="text-xs text-red-500 font-semibold">SKUs</span></div>
          <div className="wh-stock-kpi-footer text-red-600">
            <button
              type="button"
              onClick={() => {
                const lowItem = stockItems.find((it) => it.status === "Low Stock" || it.status === "Out of Stock") || stockItems[0];
                if (lowItem) {
                  setSelectedItem(lowItem);
                  setIsDiscrepancyModalOpen(true);
                }
              }}
              className="underline cursor-pointer font-bold hover:text-red-800 bg-transparent border-none p-0 text-red-600"
            >
              Review immediately
            </button>
          </div>
        </div>

      </div>

      {/* ── TOOLBAR & FILTERS CARD ── */}
      <div className="wh-stock-toolbar-card">

        {/* Tab Buttons */}
        <div className="wh-stock-tabs">
          <button
            onClick={() => setActiveTab("all")}
            className={`wh-stock-tab-btn ${activeTab === "all" ? "active" : ""}`}
          >
            All Stock
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`wh-stock-tab-btn ${activeTab === "raw" ? "active" : ""}`}
          >
            Raw Materials
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`wh-stock-tab-btn ${activeTab === "finished" ? "active" : ""}`}
          >
            Finished Goods
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="wh-stock-filter-controls">

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="wh-stock-select"
          >
            <option>All Categories</option>
            <option>Fabric</option>
            <option>Trims</option>
            <option>Shirts</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="wh-stock-select"
          >
            <option>All Locations</option>
            <option>Floor 1 &gt; Rack A</option>
            <option>Floor 1 &gt; Rack B</option>
            <option>Floor 2 &gt; Reserve</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU, Location, or Lot #..."
              className="wh-stock-search-input"
            />
          </div>

        </div>
      </div>

      {/* ── MASTER DATA TABLE CARD ── */}
      <div className="wh-stock-table-card">
        <div className="overflow-x-auto">
          <table className="wh-stock-table">
            <thead>
              <tr>
                <th>ITEM &amp; SKU</th>
                <th>CATEGORY</th>
                <th>CURRENT STOCK</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th className="text-right">TOTAL VALUE</th>
                <th className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-sm font-semibold">
                    No inventory stock items match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>

                    {/* Item & SKU */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center shadow-xs">
                          <img
                            src={item.image || "/images/products/place-holder.png"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/products/place-holder.png";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="mt-0.5">
                            <span className="wh-stock-sku-badge">{item.sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="font-semibold text-slate-600">{item.category} ({item.type === "raw" ? "Raw" : "Finished"})</td>

                    {/* Current Stock */}
                    <td className="font-mono font-bold text-slate-900">
                      {item.currentStock.toLocaleString()} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                    </td>

                    {/* Location */}
                    <td>
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {item.location}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`wh-stock-status-pill ${item.status === "In Stock"
                            ? "instock"
                            : item.status === "Low Stock"
                              ? "lowstock"
                              : "reserved"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Total Value */}
                    <td className="text-right font-mono font-bold text-slate-800">{item.totalValue}</td>

                    {/* Action Buttons */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">

                        {/* Move Stock Button */}
                        <button
                          onClick={() => handleOpenMoveModal(item)}
                          title="Move Stock Location"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                        </button>

                        {/* Adjust Stock Button */}
                        <button
                          onClick={() => handleOpenAdjustModal(item)}
                          title="Adjust Stock Quantity"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STITCH DESIGN 1: MATERIAL MOVEMENT MODAL (RAW MATERIALS) ── */}
      {isMoveMaterialOpen && selectedItem && (
        <div className="wh-stock-modal-overlay">
          <div className="wh-stock-modal">

            {/* Header */}
            <div className="wh-stock-modal-header">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-900 text-2xl">swap_horiz</span>
                <h3>Material Movement</h3>
              </div>
              <button
                onClick={() => setIsMoveMaterialOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMoveSubmit}>
              <div className="wh-stock-modal-body">

                {/* Selected Item Info Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={selectedItem.image || "/images/products/place-holder.png"}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/products/place-holder.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-600">{selectedItem.sku}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                        RAW MATERIAL
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base m-0">{selectedItem.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Weight: {selectedItem.weight || "1.2kg/unit"} | Batch: {selectedItem.batchNo || "B-40291"}
                    </p>
                  </div>
                </div>

                {/* Movement Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

                  {/* Current Location Box */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">my_location</span>
                      CURRENT LOCATION
                    </label>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between h-full">
                      <div>
                        <div className="font-mono text-sm font-bold text-slate-900 mb-1">
                          {selectedItem.location}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Main Warehouse - Heavy Goods Section</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs font-semibold mb-1">
                          <span className="text-slate-500">Available Qty</span>
                          <span className="font-mono text-slate-900 font-bold">{selectedItem.currentStock} {selectedItem.unit}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-900 h-full rounded-full" style={{ width: `${selectedItem.capacityPct}%` }}></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block text-right mt-1">{selectedItem.capacityPct}% Capacity</span>
                      </div>
                    </div>
                  </div>

                  {/* Destination Location Box */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">place</span>
                      DESTINATION LOCATION
                    </label>

                    <div className="p-4 rounded-xl border-2 border-slate-900 bg-white shadow-xs flex flex-col gap-4">
                      {/* Hierarchical Dropdowns */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="wh-stock-field">
                          <label>FLOOR</label>
                          <select value={destFloor} onChange={(e) => setDestFloor(e.target.value)}>
                            <option>FL-01</option>
                            <option>FL-02</option>
                          </select>
                        </div>
                        <div className="wh-stock-field">
                          <label>RACK</label>
                          <select value={destRack} onChange={(e) => setDestRack(e.target.value)}>
                            <option>RK-C1</option>
                            <option>RK-C2</option>
                            <option>RK-B4</option>
                          </select>
                        </div>
                        <div className="wh-stock-field">
                          <label>SHELF</label>
                          <select value={destShelf} onChange={(e) => setDestShelf(e.target.value)}>
                            <option>SH-01</option>
                            <option>SH-02</option>
                            <option>SH-03</option>
                          </select>
                        </div>
                      </div>

                      {/* Shelf Utilization Preview */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Shelf Utilization Preview</span>
                        <div className="h-5 w-full rounded overflow-hidden border border-slate-300 flex">
                          <div className="bg-slate-400 h-full" style={{ width: "20%" }} title="Current"></div>
                          <div className="bg-slate-900 h-full wh-stock-striped-bar" style={{ width: "40%" }} title="Incoming Transfer"></div>
                          <div className="bg-white h-full" style={{ width: "40%" }} title="Remaining"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] font-bold font-mono">
                          <span className="text-slate-500">Current: 20%</span>
                          <span className="text-slate-900">New: 60%</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Transfer Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                  <div className="wh-stock-field">
                    <label>QUANTITY TO MOVE</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={moveQty}
                        onChange={(e) => setMoveQty(e.target.value)}
                        className="font-mono text-lg font-bold w-32"
                        required
                      />
                      <span className="text-xs font-semibold text-slate-500">/ {selectedItem.currentStock} {selectedItem.unit} Max</span>
                    </div>
                  </div>

                  <div className="wh-stock-field">
                    <label>TRANSFER REASON</label>
                    <select value={transferReason} onChange={(e) => setTransferReason(e.target.value)}>
                      <option>Staging for Production</option>
                      <option>Space Optimization</option>
                      <option>Damage Quarantine</option>
                      <option>Inventory Audit Repositioning</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="wh-stock-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsMoveMaterialOpen(false)}
                  className="wh-stock-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-stock-btn-primary">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Complete Transfer</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── STITCH DESIGN 2: FINISHED GOODS MOVEMENT MODAL ── */}
      {isMoveFGOpen && selectedItem && (
        <div className="wh-stock-modal-overlay">
          <div className="wh-stock-modal">

            {/* Header */}
            <div className="wh-stock-modal-header">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-900 text-2xl">inventory_2</span>
                <h3>Finished Goods Movement</h3>
              </div>
              <button
                onClick={() => setIsMoveFGOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMoveSubmit}>
              <div className="wh-stock-modal-body">

                {/* 2 Column Info & QC Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                  {/* Item Info Card */}
                  <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={selectedItem.image || "/images/products/place-holder.png"}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/products/place-holder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-600">{selectedItem.sku}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          FINISHED GOODS
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base m-0">{selectedItem.name}</h4>
                      <div className="mt-1 text-xs text-slate-500 font-medium">
                        Batch: {selectedItem.batchNo || "FG-2026-08"} • Finishing Line 04
                      </div>
                    </div>
                  </div>

                  {/* Quality Control Status Card */}
                  <div className="md:col-span-5 bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase mb-2">QUALITY CONTROL STATUS</div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-lg">verified</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">QC Verified</div>
                          <div className="text-[11px] text-emerald-700 font-semibold">Grade A • Passed</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-emerald-200/60 flex justify-between items-center text-[10px] font-mono text-slate-600 font-semibold">
                      <span>Inspector: {selectedItem.inspector || "J. Doe (ID: 8492)"}</span>
                    </div>
                  </div>

                </div>

                {/* Destination Assignment Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 m-0">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      Destination Assignment
                    </h4>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      ZONE: FINISHED GOODS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="wh-stock-field">
                      <label>FLOOR</label>
                      <select value={destFloor} onChange={(e) => setDestFloor(e.target.value)}>
                        <option>Main Level</option>
                        <option>Mezzanine A</option>
                      </select>
                    </div>
                    <div className="wh-stock-field">
                      <label>RACK</label>
                      <select value={destRack} onChange={(e) => setDestRack(e.target.value)}>
                        <option>R-14</option>
                        <option>R-15</option>
                        <option>R-16</option>
                      </select>
                    </div>
                    <div className="wh-stock-field">
                      <label>SHELF / BIN</label>
                      <select value={destShelf} onChange={(e) => setDestShelf(e.target.value)}>
                        <option>S-02-B</option>
                        <option>S-03-A</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination Shelf Utilization Bar */}
                  <div className="mt-4 bg-slate-100 rounded-lg p-3">
                    <div className="flex justify-between items-end mb-1.5">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">DESTINATION SHELF UTILIZATION</div>
                        <div className="text-xs font-semibold text-slate-800">Shelf S-02-B Capacity (Post-Transfer)</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-900">85%</span>
                        <span className="text-[10px] text-slate-500 block font-semibold">Projected</span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full bg-white rounded-full overflow-hidden flex border border-slate-200">
                      <div className="h-full bg-slate-400 w-[45%]" title="Current: 45%"></div>
                      <div className="h-full bg-blue-600 wh-stock-striped-bar w-[40%]" title="Incoming: 40%"></div>
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
                      <span>Current: 450 units</span>
                      <span>Capacity Limit: 1,000 units</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Action Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">TOTAL COMPLETED QTY</span>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {selectedItem.currentStock} <span className="text-xs font-normal text-slate-500">units</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="wh-stock-field">
                      <label>QUANTITY TO MOVE</label>
                      <input
                        type="number"
                        value={moveQty}
                        onChange={(e) => setMoveQty(e.target.value)}
                        className="font-mono text-lg font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="wh-stock-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsMoveFGOpen(false)}
                  className="wh-stock-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-stock-btn-primary">
                  <span>Confirm &amp; Move to Warehouse</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── STITCH DESIGN 3: MANUAL STOCK ADJUSTMENT MODAL ── */}
      {isAdjustStockOpen && selectedItem && (
        <div className="wh-stock-modal-overlay">
          <div className="wh-stock-modal">
            <div className="wh-stock-modal-header">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-2xl">edit_square</span>
                <h3>Manual Stock Adjustment</h3>
              </div>
              <button
                onClick={() => setIsAdjustStockOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div className="wh-stock-modal-body">

                {/* Target Item Summary */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={selectedItem.image || "/images/products/place-holder.png"}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/products/place-holder.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base">{selectedItem.name}</div>
                      <div className="text-xs font-mono text-slate-600 mt-0.5">{selectedItem.sku}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">SYSTEM STOCK</div>
                    <div className="font-mono text-lg font-extrabold text-blue-700">{selectedItem.currentStock} {selectedItem.unit}</div>
                  </div>
                </div>

                {/* Adjustment Mode */}
                <div className="wh-stock-field">
                  <label>ADJUSTMENT ACTION</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType("add")}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${adjustType === "add"
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      + Add Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType("reduce")}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${adjustType === "reduce"
                          ? "bg-red-50 border-red-500 text-red-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      - Reduce Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType("reset")}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${adjustType === "reset"
                          ? "bg-amber-50 border-amber-500 text-amber-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      Set Exact Count
                    </button>
                  </div>
                </div>

                {/* Quantity Delta */}
                <div className="wh-stock-field">
                  <label>
                    {adjustType === "add"
                      ? "QUANTITY TO ADD"
                      : adjustType === "reduce"
                        ? "QUANTITY TO DEDUCT"
                        : "NEW EXACT COUNT"}
                  </label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    required
                  />
                </div>

                {/* Reason */}
                <div className="wh-stock-field">
                  <label>REASON FOR ADJUSTMENT</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  >
                    <option>Audit Reconciliation</option>
                    <option>Damage / Spill</option>
                    <option>QC Rejection</option>
                    <option>Supplier Return</option>
                  </select>
                </div>

                {/* Supervisor Notes */}
                <div className="wh-stock-field">
                  <label>SUPERVISOR NOTES / REASONING</label>
                  <textarea
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="Enter audit details or approval code..."
                  ></textarea>
                </div>

              </div>

              <div className="wh-stock-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAdjustStockOpen(false)}
                  className="wh-stock-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-stock-btn-primary">
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STITCH DESIGN: REVIEW IMMEDIATELY - MULTI-SKU DISCREPANCY RESOLUTION MODAL ── */}
      <StockDiscrepancyModal
        isOpen={isDiscrepancyModalOpen}
        onClose={() => setIsDiscrepancyModalOpen(false)}
        onSaveBatchResolutions={(resolutions, notes) => {
          console.log("Batch Resolutions saved:", resolutions, notes);
          setIsDiscrepancyModalOpen(false);
        }}
      />

      {/* ── STITCH DESIGN: NEW MATERIAL RECEIPT MODAL ── */}
      <NewMaterialReceiptModal
        isOpen={isNewReceiptModalOpen}
        onClose={() => setIsNewReceiptModalOpen(false)}
        onProcessReceipt={(receiptData) => {
          console.log("Receipt processed:", receiptData);
        }}
      />

    </div>
  );
}
