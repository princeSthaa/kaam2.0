"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import "../styles/warehouse-visualization.css";

export type VisualKpi = {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: "blue" | "green" | "soft" | "error";
  progress?: number;
};

export type ShelfItem = {
  code: string;
  tone: "high" | "medium" | "low" | "full" | "empty";
  active?: boolean;
  item?: string;
  quantity?: string;
  capacity?: string;
  type?: string;
  batchId?: string;
  utilizationPct?: number;
};

export default function WarehouseVisualizationPage() {
  const [selectedFloor, setSelectedFloor] = useState("Floor 1");
  const [selectedRack, setSelectedRack] = useState("Rack A");
  const [selectedMaterialType, setSelectedMaterialType] = useState("All Types");
  const [selectedShelfCode, setSelectedShelfCode] = useState<string>("A1-04");
  const [visualData, setVisualData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch backend warehouse visualization data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5083/api/warehouse/visualization", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVisualData(data);
      }
    } catch (err) {
      console.error("Failed to load warehouse visualization data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Preset Shelves layout by Levels for Rack visualization (Levels 4 down to 1)
  const defaultLevels: { level: string; shelves: ShelfItem[] }[] = useMemo(() => {
    return [
      {
        level: "LVL 4",
        shelves: [
          { code: "A4-01", tone: "low", item: "Zippers 12inch", quantity: "150 pcs", capacity: "1,000 pcs", type: "Raw Materials", batchId: "ZP-8810", utilizationPct: 15 },
          { code: "A4-02", tone: "empty", item: "Empty Shelf", quantity: "0", capacity: "500 pcs", type: "Unassigned", utilizationPct: 0 },
          { code: "A4-03", tone: "high", item: "Dyed Thread", quantity: "5,000 spools", capacity: "4,000 spools", type: "Raw Materials", batchId: "TH-2091", utilizationPct: 95 },
          { code: "A4-04", tone: "full", item: "Dyed Cotton", quantity: "1,000 m", capacity: "1,000 m", type: "Raw Materials", batchId: "CT-5541", utilizationPct: 100 },
        ]
      },
      {
        level: "LVL 3",
        shelves: [
          { code: "A3-01", tone: "medium", item: "Buttons 15mm", quantity: "4,500 pcs", capacity: "10,000 pcs", type: "Raw Materials", batchId: "BT-1022", utilizationPct: 45 },
          { code: "A3-02", tone: "low", item: "Elastic Band 2inch", quantity: "80 m", capacity: "500 m", type: "Raw Materials", batchId: "EL-9012", utilizationPct: 16 },
          { code: "A3-03", tone: "full", item: "Polo Shirt Finished", quantity: "250 pcs", capacity: "250 pcs", type: "Finished Goods", batchId: "PS-3390", utilizationPct: 100 },
          { code: "A3-04", tone: "high", item: "Denim Fabric Roll", quantity: "620 m", capacity: "800 m", type: "Raw Materials", batchId: "DM-7712", utilizationPct: 78 },
        ]
      },
      {
        level: "LVL 2",
        shelves: [
          { code: "A2-01", tone: "low", item: "Cotton Twill Fabric", quantity: "200 m", capacity: "1,000 m", type: "Finished Goods", batchId: "CT-1102", utilizationPct: 20 },
          { code: "A2-02", tone: "high", item: "Casual Shirts Finished", quantity: "425 pcs", capacity: "500 pcs", type: "Raw Materials", batchId: "CS-8891", utilizationPct: 85 },
          { code: "A2-03", tone: "empty", item: "Empty Shelf", quantity: "0", capacity: "500 pcs", type: "Unassigned", utilizationPct: 0 },
          { code: "A2-04", tone: "empty", item: "Empty Shelf", quantity: "0", capacity: "500 pcs", type: "Unassigned", utilizationPct: 0 },
        ]
      },
      {
        level: "LVL 1",
        shelves: [
          { code: "A1-01", tone: "high", item: "Cotton Twill Rolls", quantity: "360 pcs", capacity: "400 pcs", type: "Finished Goods", batchId: "BA-1092", utilizationPct: 90 },
          { code: "A1-02", tone: "empty", item: "Empty Shelf", quantity: "0", capacity: "500 pcs", type: "Unassigned", utilizationPct: 0 },
          { code: "A1-03", tone: "medium", item: "Polyester Thread Rolls", quantity: "225 pcs", capacity: "500 pcs", type: "Raw Materials", batchId: "BB-4421", utilizationPct: 45 },
          { code: "A1-04", tone: "high", item: "Cotton Twill & Zippers", quantity: "300 pcs", capacity: "400 pcs", type: "Finished Goods", batchId: "CX-9980", utilizationPct: 75 },
        ]
      }
    ];
  }, []);

  // Currently active selected shelf
  const selectedShelf = useMemo(() => {
    for (const lvl of defaultLevels) {
      const match = lvl.shelves.find((s) => s.code === selectedShelfCode);
      if (match) return match;
    }
    return defaultLevels[3].shelves[3]; // Fallback to A1-04
  }, [defaultLevels, selectedShelfCode]);

  // Dynamic Stored Items Table data for selected shelf
  const storedItems = useMemo(() => {
    if (selectedShelf.code === "A1-04") {
      return [
        { name: "Cotton Twill Fabric", batch: "BA-1092", qty: "150 pcs" },
        { name: "Polyester Thread Rolls", batch: "BB-4421", qty: "100 pcs" },
        { name: "Zinc Alloy Zippers", batch: "CX-9980", qty: "50 pcs" },
      ];
    }
    if (selectedShelf.tone === "empty") return [];
    return [
      { name: selectedShelf.item || "Standard Stock", batch: selectedShelf.batchId || "BA-2026", qty: selectedShelf.quantity || "100 pcs" }
    ];
  }, [selectedShelf]);

  // Recent activity stream for selected shelf
  const recentActivities = useMemo(() => {
    return [
      { type: "STOWED", time: "10:45 AM", item: `+50 ${selectedShelf.item || "Cotton Twill Fabric"}`, meta: "By: Operator 4", isStowed: true },
      { type: "PICKED", time: "09:12 AM", item: `-20 Zinc Alloy Zippers (CX-9980)`, meta: "Order #ORD-882", isStowed: false },
    ];
  }, [selectedShelf]);

  return (
    <div className="warehouse-visual-page flex-1 flex flex-col bg-slate-50 font-sans gap-6 min-h-[calc(100vh-80px)]">

      {/* ── PAGE HEADER & CONTROL BAR CARD ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-5 mt-1">

        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Floor Map Visualization</h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80">Live Spatial Map</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Real-time spatial inventory mapping, rack utilization, and stock locations.</p>
          </div>
        </div>

        {/* ── CONTROL BAR TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-slate-100 pt-4">

          {/* THREE DROPDOWN SELECTS ('Floor', 'Rack', 'Material Type') WITH SMALL LABELS ABOVE */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Floor Select */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-0.5">Floor</label>
              <div className="relative">
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full h-[40px] bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <option>Floor 1</option>
                  <option>Floor 2</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Rack Select */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-0.5">Rack</label>
              <div className="relative">
                <select
                  value={selectedRack}
                  onChange={(e) => setSelectedRack(e.target.value)}
                  className="w-full h-[40px] bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <option>Rack A</option>
                  <option>Rack B</option>
                  <option>Rack C</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Material Type Select */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-0.5">Material Type</label>
              <div className="relative">
                <select
                  value={selectedMaterialType}
                  onChange={(e) => setSelectedMaterialType(e.target.value)}
                  className="w-full h-[40px] bg-white border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <option>All Types</option>
                  <option>Finished Goods</option>
                  <option>Raw Materials</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
              </div>
            </div>

          </div>

          {/* 'Sync Map' BUTTON PUSHED TO FAR RIGHT EDGE */}
          <div className="sm:ml-auto flex items-end">
            <button
              onClick={fetchData}
              className="h-[40px] px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-md shadow-blue-500/20"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Sync Map
            </button>
          </div>

        </div>

      </div>

      {/* ── KPI STRIP (4 CARDS WITH PROPER MARGINS & SPACING) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: TOTAL STOCK VALUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">TOTAL STOCK VALUE</span>
          <div className="text-3xl font-extrabold text-slate-900">₹1.2Cr</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center mt-3">
            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +2.4% vs last week
          </div>
        </div>

        {/* Card 2: RACK UTILIZATION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">RACK UTILIZATION</span>
          <div className="text-3xl font-extrabold text-slate-900">87%</div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: "87%" }}></div>
          </div>
        </div>

        {/* Card 3: ACTIVE PICKUPS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">ACTIVE PICKUPS</span>
          <div className="text-3xl font-extrabold text-slate-900">24</div>
          <div className="text-xs text-slate-500 font-medium mt-3">In progress across floor</div>
        </div>

        {/* Card 4: CRITICAL SHORTAGES */}
        <div className="bg-rose-50/60 border border-rose-200/80 border-l-4 border-l-rose-500 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            CRITICAL SHORTAGES
          </span>
          <div className="text-3xl font-extrabold text-rose-600">3</div>
          <div className="text-xs text-rose-700 font-medium mt-3">Items below min threshold</div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE GRID: RACK MAP (2 COLS ON XL) + SIDE INSPECTOR (1 COL ON XL) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* RACK VISUALIZATION MAP CONTAINER (2 COLS ON XL) */}
        <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

          {/* Header Title & Material Legend */}
          <div className="wh-map-header-container">
            <div>
              <h2 className="wh-map-title">
                <span className="material-symbols-outlined">layers</span>
                {selectedFloor} &gt; {selectedRack} Spatial Map
              </h2>
              <p className="wh-map-subtitle">Click any tactile shelf block to view stored batches, capacity, and activity stream.</p>
            </div>

            {/* Material Legend Badges */}
            <div className="wh-map-legend">
              <div className="wh-map-legend-item">
                <div className="wh-map-dot finished"></div>
                <span>Finished Goods</span>
              </div>
              <div className="wh-map-legend-item">
                <div className="wh-map-dot raw"></div>
                <span>Raw Materials</span>
              </div>
            </div>
          </div>

          {/* Stacked Shelf Levels Grid (Level 4 down to Level 1) */}
          <div className="flex flex-col-reverse gap-6 bg-slate-50/80 p-6 md:p-7 rounded-2xl border border-slate-200/80">
            {defaultLevels.map((lvl) => (
              <div key={lvl.level} className="flex items-center gap-6">
                {/* Level Label */}
                <div className="w-16 flex items-center justify-center text-xs font-extrabold text-slate-600 uppercase tracking-wider border-r border-slate-300 pr-4 shrink-0">
                  {lvl.level}
                </div>

                {/* Shelves Grid (4 Columns with Safe Margins & Clean Borders) */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {lvl.shelves.map((shelf) => {
                    const isSelected = shelf.code === selectedShelfCode;
                    const isEmpty = shelf.tone === "empty";
                    const isFinishedGoods = shelf.type === "Finished Goods";

                    return (
                      <div
                        key={shelf.code}
                        onClick={() => setSelectedShelfCode(shelf.code)}
                        className={`wh-visual-tactile-shelf border rounded-2xl h-28 relative overflow-hidden cursor-pointer transition-all duration-200 p-3.5 flex flex-col justify-between ${isSelected
                            ? "border-blue-600 ring-4 ring-blue-500/20 bg-white shadow-md scale-[1.02]"
                            : isEmpty
                              ? "border-dashed border-slate-300 bg-slate-50/60 hover:border-blue-400"
                              : "border-slate-300 bg-white hover:border-blue-500 hover:shadow-sm"
                          }`}
                      >
                        {/* Utilization Progress Fill Indicator */}
                        {!isEmpty && (
                          <div
                            className={`absolute bottom-0 left-0 h-full ${isFinishedGoods ? "bg-[#3980f4]/20" : "bg-[#d97706]/20"
                              } transition-all duration-300 pointer-events-none`}
                            style={{ width: `${shelf.utilizationPct || 50}%` }}
                          ></div>
                        )}

                        {/* Top Inner Row: Shelf Code Badge & Type Dot (Safe Inner Margins) */}
                        <div className="flex items-center justify-between relative z-10">
                          <span className="font-mono text-xs font-extrabold text-slate-900 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200/90 shadow-xs">
                            {shelf.code}
                          </span>
                          {!isEmpty && (
                            <span
                              className={`w-3 h-3 rounded-full shadow-xs shrink-0 ${isFinishedGoods ? "bg-[#3980f4]" : "bg-[#d97706]"
                                }`}
                            ></span>
                          )}
                        </div>

                        {/* Bottom Inner Row: Utilization % / Empty Text (Safe Inner Margins) */}
                        <div className="flex items-center justify-end relative z-10">
                          {!isEmpty ? (
                            <span className="font-mono text-xs font-extrabold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded">
                              {shelf.utilizationPct}%
                            </span>
                          ) : (
                            <span className="w-full text-center text-slate-400 font-mono text-xs font-semibold">
                              EMPTY
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* SIDE PANEL INSPECTOR (1 COL ON XL - SPACIOUS & ROOMY) */}
        <div className="xl:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-sm space-y-6">

          {/* Panel Header */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">inventory_2</span>
                <h3 className="text-xl font-extrabold text-slate-900">Shelf {selectedShelf.code}</h3>
              </div>
              <span className="text-xs font-extrabold font-mono px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                {selectedShelf.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {selectedShelf.type === "Finished Goods" ? "Finished Goods Storage Zone" : selectedShelf.type === "Unassigned" ? "Unassigned Location" : "Raw Materials & Accessories Zone"}
            </p>
          </div>

          {/* Shelf Capacity Gauge Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-4.5 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span className="uppercase tracking-wider text-[11px] text-slate-500">CAPACITY UTILIZATION</span>
              <span className="text-slate-900 font-mono text-xs font-extrabold">{selectedShelf.utilizationPct || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${selectedShelf.type === "Finished Goods" ? "bg-[#3980f4]" : "bg-[#d97706]"
                  }`}
                style={{ width: `${selectedShelf.utilizationPct || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Current Stock: <strong className="text-slate-900 font-bold">{selectedShelf.quantity || "0"}</strong></span>
              <span>Max Capacity: <strong className="text-slate-900 font-bold">{selectedShelf.capacity || "500 pcs"}</strong></span>
            </div>
          </div>

          {/* Current Stored Items List (Spacious Card-Based View with Margins) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Current Stored Items</h4>
              <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{storedItems.length} items</span>
            </div>

            <div className="space-y-3">
              {storedItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                  No items currently stored on this shelf.
                </div>
              ) : (
                storedItems.map((st, i) => (
                  <div key={i} className="p-4 border border-slate-200/90 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{st.name}</span>
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">{st.qty}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Batch ID: <strong className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-bold">{st.batch}</strong></span>
                      <span className="text-blue-600 font-extrabold cursor-pointer hover:underline text-[11px]">Inspect</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="space-y-3.5 pt-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Recent Activity</h4>
            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-slate-50/70">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${act.isStowed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {act.isStowed ? "arrow_downward" : "arrow_upward"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${act.isStowed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                      >
                        {act.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{act.time}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">{act.item}</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">{act.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
