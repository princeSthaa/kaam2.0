"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import "../styles/warehouse-purchaseorder.css";
import { CreatePurchaseOrderModal } from "../components/CreatePurchaseOrderModal";
import { PurchaseOrderActionsMenu } from "../components/PurchaseOrderActionsMenu";
import { ViewPurchaseOrderModal } from "../components/ViewPurchaseOrderModal";
import { fetchPurchaseOrders, PurchaseOrderGetDto } from "../api/purchaseorder.api";
import { fetchSuppliers, SupplierDto } from "../api/supplier.api";
import { NepaliDatePicker, adToBs } from "../../../components/ui/NepaliDatePicker";

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
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Actions menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [rawOrders, setRawOrders] = useState<PurchaseOrderGetDto[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedViewPoId, setSelectedViewPoId] = useState<string | null>(null);

  const loadPOs = async () => {
    try {
      const data = await fetchPurchaseOrders();
      const mappedOrders: PurchaseOrderItem[] = data.map((d: PurchaseOrderGetDto) => ({
        id: d.id,
        poId: d.orderNumber,
        dateCreated: adToBs(d.createdAt),
        supplier: d.supplierName,
        totalAmount: d.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        expectedDate: adToBs(d.expectedDeliveryDate),
        status: d.status as any
      }));
      setOrders(mappedOrders.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()));
      setRawOrders(data);
    } catch (error) {
      console.error("Failed to load Purchase Orders:", error);
    }
  };

  useEffect(() => {
    loadPOs();
    fetchSuppliers().then((data) => {
      if (Array.isArray(data)) setSuppliers(data);
    }).catch(console.error);
  }, []);

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
    // Reload the list from backend
    loadPOs();
  };

  // ── Actions menu handlers ──
  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, poId: string) => {
    e.stopPropagation();
    if (openMenuId === poId) {
      setOpenMenuId(null);
      setAnchorEl(null);
    } else {
      setOpenMenuId(poId);
      setAnchorEl(e.currentTarget);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedViewPoId(id);
    setIsViewModalOpen(true);
  };

  const handleEditDraft = (id: string) => {
    console.log("Edit draft:", id);
  };

  const handleSendToSupplier = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "Sent" as const } : o
      )
    );
  };

  const handleMarkReceived = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "Completed" as const } : o
      )
    );
  };

  const handleDuplicatePO = (id: string) => {
    const src = orders.find((o) => o.id === id);
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

  const handleCancelPO = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "Cancelled" as const } : o
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
        if (ord.supplier !== selectedSupplier) return false;
      }

      // Date filter
      if (selectedDate) {
        if (ord.dateCreated !== selectedDate && ord.expectedDate !== selectedDate) return false;
      }

      return true;
    });
  }, [orders, selectedStatus, selectedSupplier, selectedDate]);

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
            {suppliers.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
            arrow_drop_down
          </span>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <NepaliDatePicker
            id="expected_date_filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            onDateChange={setSelectedDate}
            className="wh-pom-filter-date"
            enableNepaliPicker={true}
            placeholder="Select date"
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
                          onClick={(e) => handleToggleMenu(e, ord.id)}
                          className="wh-poam-trigger"
                          title="More actions"
                          aria-label={`Actions for ${ord.poId}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {/* ── STITCH DESIGN: PURCHASE ORDER ACTIONS MENU ── */}
                        <PurchaseOrderActionsMenu
                          isOpen={openMenuId === ord.id}
                          onClose={() => { setOpenMenuId(null); setAnchorEl(null); }}
                          anchorRef={{ current: anchorEl as HTMLElement }}
                          id={ord.id}
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
            Showing 1 to {filteredOrders.length} of {orders.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button className="wh-pom-page-btn text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="wh-pom-page-btn active">1</button>
            <button className="wh-pom-page-btn text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled>
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

      {/* ── VIEW PURCHASE ORDER MODAL ── */}
      <ViewPurchaseOrderModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        purchaseOrder={rawOrders.find((o) => o.id === selectedViewPoId) || null}
      />
    </div>
  );
}
