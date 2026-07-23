"use client";

import React, { useState, useMemo, useRef } from "react";
import "../styles/warehouse-purchaseorder.css";
import { CreatePurchaseOrderModal } from "../components/CreatePurchaseOrderModal";
import { PurchaseOrderActionsMenu } from "../components/PurchaseOrderActionsMenu";

export type PurchaseOrderItem = {
  id: string;
  poId: string;
  dateCreated: string;
  supplier: string;
  totalAmount: string;
  expectedDate: string;
  status: "Sent" | "Draft" | "Partially Received" | "Completed" | "Cancelled";
};

export default function WarehousePurchaseOrderPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Actions menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Master Data matching Stitch screen 30d11125dbae42deacd526ac4b6a8208
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([
    {
      id: "po-1",
      poId: "PO-2024-001",
      dateCreated: "Oct 12, 2024",
      supplier: "Apex Industrial",
      totalAmount: "145,200.00",
      expectedDate: "Oct 20, 2024",
      status: "Sent",
    },
    {
      id: "po-2",
      poId: "PO-2024-002",
      dateCreated: "Oct 14, 2024",
      supplier: "Global Tech Supply",
      totalAmount: "32,500.50",
      expectedDate: "--",
      status: "Draft",
    },
    {
      id: "po-3",
      poId: "PO-2024-003",
      dateCreated: "Oct 05, 2024",
      supplier: "Metro Logistics",
      totalAmount: "89,000.00",
      expectedDate: "Oct 15, 2024",
      status: "Partially Received",
    },
    {
      id: "po-4",
      poId: "PO-2024-004",
      dateCreated: "Sep 28, 2024",
      supplier: "Apex Industrial",
      totalAmount: "210,000.00",
      expectedDate: "Oct 10, 2024",
      status: "Completed",
    },
    {
      id: "po-5",
      poId: "PO-2024-005",
      dateCreated: "Oct 15, 2024",
      supplier: "Vanguard Materials",
      totalAmount: "15,000.00",
      expectedDate: "--",
      status: "Cancelled",
    },
  ]);

  // Handle Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedItems.length === orders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(orders.map((o) => o.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle PO Creation from Modal
  const handlePOCreated = (data: any) => {
    const newPO: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      poId: `PO-2024-00${orders.length + 1}`,
      dateCreated: "Oct 23, 2026",
      supplier: data.supplier || "Apex Industrial",
      totalAmount: "485,000.00",
      expectedDate: data.requiredDate || "Oct 30, 2026",
      status: "Sent",
    };

    setOrders((prev) => [newPO, ...prev]);
  };

  // ── Actions menu handlers ──
  const handleToggleMenu = (poId: string) => {
    setOpenMenuId((prev) => (prev === poId ? null : poId));
  };

  const handleViewDetails = (poId: string) => {
    console.log("View details for:", poId);
  };

  const handleEditDraft = (poId: string) => {
    console.log("Edit draft:", poId);
  };

  const handleSendToSupplier = (poId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.poId === poId ? { ...o, status: "Sent" as const } : o
      )
    );
  };

  const handleMarkReceived = (poId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.poId === poId ? { ...o, status: "Completed" as const } : o
      )
    );
  };

  const handleDuplicatePO = (poId: string) => {
    const src = orders.find((o) => o.poId === poId);
    if (!src) return;
    const dup: PurchaseOrderItem = {
      ...src,
      id: `po-${Date.now()}`,
      poId: `PO-2024-00${orders.length + 1}`,
      status: "Draft",
      dateCreated: "Jul 23, 2026",
    };
    setOrders((prev) => [dup, ...prev]);
  };

  const handleCancelPO = (poId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.poId === poId ? { ...o, status: "Cancelled" as const } : o
      )
    );
  };

  const handleDownloadPDF = (poId: string) => {
    console.log("Download PDF for:", poId);
  };

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter
      if (selectedStatus) {
        if (selectedStatus === "sent" && ord.status !== "Sent") return false;
        if (selectedStatus === "draft" && ord.status !== "Draft") return false;
        if (selectedStatus === "partial" && ord.status !== "Partially Received") return false;
        if (selectedStatus === "completed" && ord.status !== "Completed") return false;
      }

      // Supplier filter
      if (selectedSupplier) {
        if (selectedSupplier === "apex" && ord.supplier !== "Apex Industrial") return false;
        if (selectedSupplier === "global" && ord.supplier !== "Global Tech Supply") return false;
        if (selectedSupplier === "metro" && ord.supplier !== "Metro Logistics") return false;
      }

      return true;
    });
  }, [orders, selectedStatus, selectedSupplier]);

  return (
    <div className="wh-pom-page">
      
      {/* ── STITCH DESIGN: PAGE HEADER & ACTIONS ── */}
      <div className="wh-pom-header">
        <div className="wh-pom-header-title">
          <h2>Purchase Orders</h2>
          <p>Manage and track supplier procurement orders.</p>
        </div>

        <div className="wh-pom-header-actions">
          <button className="wh-pom-btn-export">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="wh-pom-btn-create"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* ── STITCH DESIGN: FILTERS BAR ── */}
      <div className="wh-pom-filter-bar">
        <div className="wh-pom-filter-label">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span>FILTERS:</span>
        </div>

        {/* Status Dropdown */}
        <div className="wh-pom-select-wrapper">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="wh-pom-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partial">Partially Received</option>
            <option value="completed">Completed</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
            arrow_drop_down
          </span>
        </div>

        {/* Supplier Dropdown */}
        <div className="wh-pom-select-wrapper">
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="wh-pom-filter-select"
          >
            <option value="">All Suppliers</option>
            <option value="apex">Apex Industrial</option>
            <option value="global">Global Tech Supply</option>
            <option value="metro">Metro Logistics</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
            arrow_drop_down
          </span>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="wh-pom-filter-date"
          />
        </div>
      </div>

      {/* ── STITCH DESIGN: DATA TABLE CONTAINER ── */}
      <div className="wh-pom-table-card">
        <div className="overflow-x-auto">
          <table className="wh-pom-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === orders.length && orders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th>PO ID</th>
                <th>Date Created</th>
                <th>Supplier</th>
                <th className="text-right">Total Amount (Rs)</th>
                <th>Expected Date</th>
                <th>Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-semibold">
                    No purchase orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(ord.id)}
                        onChange={() => toggleSelectItem(ord.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* PO ID */}
                    <td>
                      <span className="wh-pom-code-mono">{ord.poId}</span>
                    </td>

                    {/* Date Created */}
                    <td className="text-slate-500 font-medium">{ord.dateCreated}</td>

                    {/* Supplier */}
                    <td className="font-bold text-slate-900">{ord.supplier}</td>

                    {/* Total Amount */}
                    <td className="text-right font-mono font-bold text-slate-900">
                      {ord.totalAmount}
                    </td>

                    {/* Expected Date */}
                    <td className="text-slate-500 font-medium">{ord.expectedDate}</td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`wh-pom-status-chip ${
                          ord.status === "Sent"
                            ? "sent"
                            : ord.status === "Draft"
                            ? "draft"
                            : ord.status === "Partially Received"
                            ? "partial"
                            : ord.status === "Completed"
                            ? "completed"
                            : "cancelled"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* ── STITCH DESIGN: THREE-DOT ACTION MENU ── */}
                    <td className="text-right">
                      <div className="wh-poam-menu-wrapper">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMenu(ord.poId);
                          }}
                          className="wh-poam-trigger"
                          title="More actions"
                          aria-label={`Actions for ${ord.poId}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {/* ── STITCH DESIGN: PURCHASE ORDER ACTIONS MENU ── */}
                        <PurchaseOrderActionsMenu
                          isOpen={openMenuId === ord.poId}
                          onClose={() => setOpenMenuId(null)}
                          poId={ord.poId}
                          status={ord.status}
                          onViewDetails={handleViewDetails}
                          onEditDraft={handleEditDraft}
                          onSendToSupplier={handleSendToSupplier}
                          onMarkReceived={handleMarkReceived}
                          onDuplicatePO={handleDuplicatePO}
                          onCancelPO={handleCancelPO}
                          onDownloadPDF={handleDownloadPDF}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* STITCH DESIGN: PAGINATION FOOTER */}
        <div className="wh-pom-pagination">
          <span className="text-xs text-slate-500 font-medium">
            Showing 1 to {filteredOrders.length} of 24 entries
          </span>
          <div className="flex items-center gap-1">
            <button className="wh-pom-page-btn text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="wh-pom-page-btn active">1</button>
            <button className="wh-pom-page-btn">2</button>
            <button className="wh-pom-page-btn">3</button>
            <span className="text-slate-400 px-1 text-xs">...</span>
            <button className="wh-pom-page-btn">5</button>
            <button className="wh-pom-page-btn text-slate-600 hover:bg-slate-100">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STITCH DESIGN: CREATE PURCHASE ORDER MODAL ── */}
      <CreatePurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePOCreated}
      />

    </div>
  );
}
