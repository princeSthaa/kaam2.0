"use client";

import React, { useState, useMemo } from "react";
import "../styles/warehouse-factoryrequest.css";
import { CreatePurchaseOrderModal } from "../components/CreatePurchaseOrderModal";

export type FactoryRequest = {
  id: string;
  reqId: string;
  planId: string;
  materialName: string;
  sku: string;
  qtyRequested: number;
  qtyAvailable: number;
  uom: string;
  workCenter: string;
  urgency: "Critical" | "Normal";
  stockStatus: "In Stock" | "Partial" | "Out of Stock" | "Issued" | "Declined";
  location: { aisle: string; rack: string; bin: string };
  issuedAt?: string;
};

export default function WarehouseFactoryRequestsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "issued">("pending");
  const [selectedLine, setSelectedLine] = useState("All Lines");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<FactoryRequest | null>(null);
  const [issueQty, setIssueQty] = useState("");

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState<FactoryRequest[]>([
    {
      id: "req-1",
      reqId: "RQ-8901",
      planId: "PP-1024",
      materialName: "100% Cotton Twill - Navy",
      sku: "TWL-NVY-100",
      qtyRequested: 150,
      qtyAvailable: 420,
      uom: "Rolls",
      workCenter: "WC 04 - Stitching",
      urgency: "Critical",
      stockStatus: "In Stock",
      location: { aisle: "Aisle 04", rack: "Rack B", bin: "Bin 12" },
    },
    {
      id: "req-2",
      reqId: "RQ-8902",
      planId: "PP-1024",
      materialName: "Polyester Thread - Navy #40",
      sku: "THR-NVY-040",
      qtyRequested: 500,
      qtyAvailable: 350,
      uom: "Cones",
      workCenter: "WC 04 - Stitching",
      urgency: "Normal",
      stockStatus: "Partial",
      location: { aisle: "Aisle 02", rack: "Rack A", bin: "Bin 04" },
    },
    {
      id: "req-3",
      reqId: "RQ-8899",
      planId: "PP-1018",
      materialName: "Metal Zippers 8\" - Silver",
      sku: "TRM-ZIP-SLV-08",
      qtyRequested: 1200,
      qtyAvailable: 0,
      uom: "Pcs",
      workCenter: "WC 02 - Assembly",
      urgency: "Critical",
      stockStatus: "Out of Stock",
      location: { aisle: "Aisle 01", rack: "Rack C", bin: "Bin 08" },
    },
    {
      id: "req-4",
      reqId: "RQ-8898",
      planId: "PP-1018",
      materialName: "Denim 12oz - Indigo",
      sku: "FAB-DNM-IND-12",
      qtyRequested: 80,
      qtyAvailable: 120,
      uom: "Rolls",
      workCenter: "WC 01 - Cutting",
      urgency: "Normal",
      stockStatus: "In Stock",
      location: { aisle: "Aisle 05", rack: "Rack D", bin: "Bin 02" },
    },
  ]);

  // Issued Materials State
  const [issuedRequests, setIssuedRequests] = useState<FactoryRequest[]>([
    {
      id: "req-101",
      reqId: "RQ-8890",
      planId: "PP-1012",
      materialName: "Elastic Band 1.5\" - White",
      sku: "TRM-ELT-WHT-15",
      qtyRequested: 300,
      qtyAvailable: 600,
      uom: "Meters",
      workCenter: "WC 04 - Stitching",
      urgency: "Normal",
      stockStatus: "Issued",
      location: { aisle: "Aisle 02", rack: "Rack C", bin: "Bin 01" },
      issuedAt: "Today, 11:20 AM",
    },
    {
      id: "req-102",
      reqId: "RQ-8892",
      planId: "PP-1014",
      materialName: "Poly Bag Packaging - Medium",
      sku: "PKG-BAG-MED-01",
      qtyRequested: 1500,
      qtyAvailable: 5000,
      uom: "Pcs",
      workCenter: "WC 05 - Packing",
      urgency: "Normal",
      stockStatus: "Issued",
      location: { aisle: "Aisle 06", rack: "Rack A", bin: "Bin 10" },
      issuedAt: "Today, 09:45 AM",
    },
  ]);

  // Quick Issue Open Handler
  const handleOpenConfirmModal = (req: FactoryRequest) => {
    setSelectedReq(req);
    setIssueQty(req.qtyRequested.toString());
    setIsConfirmModalOpen(true);
  };

  // Confirm Issue Handler (Moves item from Pending to Issued)
  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const issuedItem: FactoryRequest = {
      ...selectedReq,
      stockStatus: "Issued",
      issuedAt: "Just now",
    };

    setPendingRequests((prev) => prev.filter((r) => r.id !== selectedReq.id));
    setIssuedRequests((prev) => [issuedItem, ...prev]);
    setIsConfirmModalOpen(false);
  };

  // Decline / Cancel Request Handler
  const handleDeclineRequest = (id: string) => {
    if (confirm("Are you sure you want to decline/cancel this material request?")) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Open Create PO Drawer Handler for Out of Stock items
  const handleOpenCreatePO = (req: FactoryRequest) => {
    setSelectedReq(req);
    setIsCreatePOModalOpen(true);
  };

  // Filtered Requests List
  const filteredRequests = useMemo(() => {
    const targetList = activeTab === "pending" ? pendingRequests : issuedRequests;

    return targetList.filter((req) => {
      // Line filter
      if (selectedLine !== "All Lines" && !req.workCenter.includes(selectedLine.split(" - ")[0])) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        const matchReq = req.reqId.toLowerCase().includes(lower);
        const matchPlan = req.planId.toLowerCase().includes(lower);
        const matchMat = req.materialName.toLowerCase().includes(lower);
        const matchSku = req.sku.toLowerCase().includes(lower);
        if (!matchReq && !matchPlan && !matchMat && !matchSku) return false;
      }

      return true;
    });
  }, [pendingRequests, issuedRequests, activeTab, selectedLine, searchTerm]);

  return (
    <div className="wh-freq-page">
      
      {/* ── HEADER CARD ── */}
      <div className="wh-freq-header-card">
        <div className="wh-freq-header-top">
          <div className="wh-freq-title">
            <div className="flex items-center gap-3">
              <h1>Material Issuance Hub</h1>
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Factory Requests
              </span>
            </div>
            <p>Manage and issue raw materials requested by factory production lines in real time.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, Material..."
                className="wh-freq-search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO STATS GRID CARDS ── */}
      <div className="wh-freq-bento-grid">
        
        {/* Pending Requests */}
        <div className="wh-freq-stat-card">
          <div className="wh-freq-stat-header">
            <span className="wh-freq-stat-title">PENDING REQUESTS</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
            </div>
          </div>
          <div className="wh-freq-stat-value">{pendingRequests.length}</div>
          <div className="wh-freq-stat-footer text-emerald-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+5 since last hour</span>
          </div>
        </div>

        {/* Critical Shortages */}
        <div className="wh-freq-stat-card alert">
          <div className="wh-freq-stat-header">
            <span className="wh-freq-stat-title text-red-700">CRITICAL SHORTAGES</span>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="wh-freq-stat-value text-red-700">
            {pendingRequests.filter((r) => r.urgency === "Critical" && r.stockStatus === "Out of Stock").length || 1}
          </div>
          <div className="wh-freq-stat-footer text-red-600 font-bold">
            Blocking Lines: 02, 05
          </div>
        </div>

        {/* Materials Issued (Today) */}
        <div className="wh-freq-stat-card">
          <div className="wh-freq-stat-header">
            <span className="wh-freq-stat-title">MATERIALS ISSUED (TODAY)</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="wh-freq-stat-value">Rs 1.2M</div>
          <div className="wh-freq-stat-footer text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
            <span>{issuedRequests.length} Batches / 12k Units</span>
          </div>
        </div>

        {/* Throughput Rate */}
        <div className="wh-freq-stat-card">
          <div className="wh-freq-stat-header">
            <span className="wh-freq-stat-title">THROUGHPUT RATE</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </div>
          </div>
          <div>
            <div className="wh-freq-stat-value">88%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-slate-900 h-full rounded-full" style={{ width: "88%" }}></div>
            </div>
          </div>
          <div className="wh-freq-stat-footer text-slate-500">Fulfilled vs Requested</div>
        </div>

      </div>

      {/* ── TOOLBAR & TABS CARD ── */}
      <div className="wh-freq-toolbar-card">
        
        {/* Filter Tabs */}
        <div className="wh-freq-tabs">
          <button
            onClick={() => setActiveTab("pending")}
            className={`wh-freq-tab-btn ${activeTab === "pending" ? "active" : ""}`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("issued")}
            className={`wh-freq-tab-btn ${activeTab === "issued" ? "active" : ""}`}
          >
            Issued Materials ({issuedRequests.length})
          </button>
        </div>

        {/* Dropdown Controls */}
        <div className="wh-freq-filter-controls">
          
          {/* Line Filter */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="wh-freq-select"
          >
            <option>All Lines</option>
            <option>Line 01 - Cutting</option>
            <option>Line 04 - Stitching</option>
            <option>Line 05 - Packing</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="wh-freq-select"
          >
            <option>All Categories</option>
            <option>Fabrics</option>
            <option>Trims</option>
            <option>Threads</option>
          </select>

        </div>
      </div>

      {/* ── MASTER DATA TABLE CARD ── */}
      <div className="wh-freq-table-card">
        <div className="overflow-x-auto">
          <table className="wh-freq-table">
            <thead>
              <tr>
                <th>REQ ID</th>
                <th>PLAN ID</th>
                <th>MATERIAL</th>
                <th className="text-right">QTY</th>
                <th>UOM</th>
                <th>WORK CENTER</th>
                <th>URGENCY</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 text-sm font-semibold">
                    {activeTab === "pending"
                      ? "No pending factory material requests match your filter."
                      : "No issued material logs match your filter."}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    
                    {/* Req ID */}
                    <td>
                      <span className="wh-freq-code-badge">{req.reqId}</span>
                    </td>

                    {/* Plan ID */}
                    <td>
                      <span className="font-mono text-xs font-semibold text-slate-600">{req.planId}</span>
                    </td>

                    {/* Material */}
                    <td>
                      <div className="font-bold text-slate-900">{req.materialName}</div>
                      <div className="text-[11px] font-mono text-slate-500">SKU: {req.sku}</div>
                    </td>

                    {/* Qty */}
                    <td className="text-right font-mono font-bold text-slate-900">
                      {req.qtyRequested}
                    </td>

                    {/* UOM */}
                    <td className="font-semibold text-slate-600 text-xs">
                      {req.uom}
                    </td>

                    {/* Work Center */}
                    <td className="font-medium text-slate-700 text-xs">
                      {req.workCenter}
                    </td>

                    {/* Urgency */}
                    <td>
                      <span
                        className={`wh-freq-urgency-pill ${
                          req.urgency === "Critical" ? "critical" : "normal"
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      {activeTab === "pending" ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              req.stockStatus === "In Stock"
                                ? "bg-emerald-600"
                                : req.stockStatus === "Partial"
                                ? "bg-amber-500"
                                : "bg-red-600"
                            }`}
                          ></div>
                          <span className="text-slate-700">
                            {req.stockStatus} ({req.qtyAvailable})
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Issued ({req.issuedAt || "Today"})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      {activeTab === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* In Stock Actions */}
                          {req.stockStatus === "In Stock" && (
                            <button
                              onClick={() => handleOpenConfirmModal(req)}
                              className="wh-freq-btn-quick-issue"
                            >
                              Quick Issue
                            </button>
                          )}

                          {/* Partial Stock Actions */}
                          {req.stockStatus === "Partial" && (
                            <>
                              <button
                                onClick={() => handleOpenConfirmModal(req)}
                                className="wh-freq-btn-quick-issue"
                              >
                                Quick Issue
                              </button>
                              <button
                                onClick={() => handleOpenConfirmModal(req)}
                                className="wh-freq-btn-partial"
                              >
                                Issue Partial
                              </button>
                            </>
                          )}

                          {/* Out of Stock Actions (Decline / Cancel & Open Create PO Modal) */}
                          {req.stockStatus === "Out of Stock" && (
                            <>
                              <button
                                onClick={() => handleDeclineRequest(req.id)}
                                title="Decline or Cancel Request"
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                              >
                                Decline / Cancel
                              </button>
                              
                              <button
                                onClick={() => handleOpenCreatePO(req)}
                                title="Create Purchase Order"
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 text-slate-800 bg-white hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                                <span>Create PO</span>
                              </button>
                            </>
                          )}

                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          Complete
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STITCH DESIGN: MATERIAL ISSUANCE CONFIRMATION MODAL ── */}
      {isConfirmModalOpen && selectedReq && (
        <div className="wh-freq-modal-overlay">
          <div className="wh-freq-modal">
            
            {/* Header */}
            <div className="wh-freq-modal-header">
              <h3 className="text-slate-900 font-extrabold text-lg">Confirm Material Issuance</h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmIssue}>
              <div className="wh-freq-modal-body">
                
                {/* Material Details Card */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center font-bold text-xl">
                    <span className="material-symbols-outlined">layers</span>
                  </div>
                  <div className="flex flex-col justify-center flex-grow">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">MATERIAL</span>
                    <h4 className="font-extrabold text-slate-900 text-base m-0">{selectedReq.materialName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-blue-50 text-blue-700 font-mono text-xs font-bold px-2 py-0.5 rounded border border-blue-200">
                        SKU: {selectedReq.sku}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">REQUESTED QTY</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      {selectedReq.qtyRequested} <span className="text-xs font-normal text-slate-500">{selectedReq.uom}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">AVAILABLE QTY</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      {selectedReq.qtyAvailable} <span className="text-xs font-normal text-slate-500">{selectedReq.uom}</span>
                    </div>
                  </div>
                </div>

                {/* Location Callout Banner */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-700 mt-0.5">location_on</span>
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-800 block mb-1 uppercase">STORAGE LOCATION</span>
                    <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-white px-2 py-1 rounded border border-emerald-300">{selectedReq.location.aisle}</span>
                      <span className="text-slate-400">/</span>
                      <span className="bg-white px-2 py-1 rounded border border-emerald-300">{selectedReq.location.rack}</span>
                      <span className="text-slate-400">/</span>
                      <span className="bg-white px-2 py-1 rounded border border-emerald-300">{selectedReq.location.bin}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Input Section */}
                <div className="wh-freq-field">
                  <label htmlFor="issue-qty">QUANTITY TO ISSUE ({selectedReq.uom.toUpperCase()})</label>
                  <div className="relative flex items-center">
                    <input
                      id="issue-qty"
                      type="number"
                      value={issueQty}
                      onChange={(e) => setIssueQty(e.target.value)}
                      className="font-mono text-lg font-bold"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Quantity matches requested amount for Work Center {selectedReq.workCenter}.
                  </p>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="wh-freq-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="wh-freq-btn-partial"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-freq-btn-quick-issue flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Confirm &amp; Print Label</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── SHARED STITCH CREATE PURCHASE ORDER MODAL ── */}
      <CreatePurchaseOrderModal
        isOpen={isCreatePOModalOpen}
        onClose={() => setIsCreatePOModalOpen(false)}
        planCode={selectedReq?.planId || "PP-1018"}
        materialName={selectedReq?.materialName}
        shortageQty={selectedReq ? `${selectedReq.qtyRequested} ${selectedReq.uom}` : undefined}
      />

    </div>
  );
}
