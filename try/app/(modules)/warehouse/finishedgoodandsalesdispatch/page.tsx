"use client";

import React, { useState, useMemo } from "react";
import "../styles/finished-goods-dispatch.css";

type FactoryIntakeItem = {
  id: string;
  productName: string;
  sku: string;
  planId: string;
  batchNo: string;
  qty: number;
  qcStatus: "SUCCESS" | "FAIL";
  image: string;
};

type SalesDispatchOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  itemsCount: number;
  totalValue: number;
  status: "AWAITING PICK" | "PACKED" | "SHIPPED";
  carrier: string;
  carrierIcon: string;
};

export default function FinishedGoodsAndSalesDispatchPage() {
  // --- State Management ---
  const [activeFilter, setActiveFilter] = useState<"ALL" | "AWAITING PICK" | "PACKED" | "SHIPPED">("ALL");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Modal States
  const [isNewIntakeModalOpen, setIsNewIntakeModalOpen] = useState(false);
  const [activeActionOrder, setActiveActionOrder] = useState<SalesDispatchOrder | null>(null);
  const [activeQCReviewItem, setActiveQCReviewItem] = useState<FactoryIntakeItem | null>(null);

  // New Intake Form Fields
  const [newPoNumber, setNewPoNumber] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [newBatchNo, setNewBatchNo] = useState("");
  const [newQty, setNewQty] = useState<number | "">("");
  const [newQcStatus, setNewQcStatus] = useState<"pass" | "fail">("pass");
  const [newPrintBarcode, setNewPrintBarcode] = useState(true);
  const intakeDispatchDate = new Date().toLocaleString("en-NP", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  // QC Review Form State
  type QCRadioVal = "pass" | "minor" | "fail" | "";
  const [qcCriteria, setQcCriteria] = useState<Record<string, QCRadioVal>>({
    stitching: "pass",
    color: "pass",
    sizing: "minor",
    fabric: "pass",
  });
  type DefectEntry = { id: string; type: string; qty: number };
  const [qcDefects, setQcDefects] = useState<DefectEntry[]>([
    { id: "d1", type: "Measurement Deviation", qty: 24 },
    { id: "d2", type: "Loose Threads", qty: 12 },
  ]);
  const [qcDefectType, setQcDefectType] = useState("");
  const [qcDefectQty, setQcDefectQty] = useState<number>(1);
  const [qcRemarks, setQcRemarks] = useState("");

  const qcInspected = activeQCReviewItem ? Math.round(activeQCReviewItem.qty * 0.1) : 0;
  const qcPassed = activeQCReviewItem ? qcInspected - qcDefects.reduce((s, d) => s + d.qty, 0) : 0;
  const qcFailed = qcDefects.reduce((s, d) => s + d.qty, 0);

  function addQcDefect() {
    if (!qcDefectType) return;
    setQcDefects((prev) => [...prev, { id: Date.now().toString(), type: qcDefectType, qty: qcDefectQty }]);
    setQcDefectType("");
    setQcDefectQty(1);
  }

  function removeQcDefect(id: string) {
    setQcDefects((prev) => prev.filter((d) => d.id !== id));
  }

  // Mock Factory Intake Items
  const [factoryIntakeItems, setFactoryIntakeItems] = useState<FactoryIntakeItem[]>([
    {
      id: "fi-1",
      productName: "Premium Cotton Polo",
      sku: "SKU: PC-NVY-04",
      planId: "PLN-2024-0089",
      batchNo: "B-4522-XP",
      qty: 450,
      qcStatus: "SUCCESS",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "fi-2",
      productName: "Structured Blazer",
      sku: "SKU: SB-CHR-01",
      planId: "PLN-2024-0092",
      batchNo: "B-4610-ZM",
      qty: 125,
      qcStatus: "SUCCESS",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "fi-3",
      productName: "Athletic Crew Socks",
      sku: "SKU: AS-WHT-12",
      planId: "PLN-2024-0095",
      batchNo: "B-4688-LQ",
      qty: 1200,
      qcStatus: "FAIL",
      image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=120&q=80",
    },
  ]);

  // Mock Sales Dispatch Orders
  const [salesOrders, setSalesOrders] = useState<SalesDispatchOrder[]>([
    {
      id: "so-1",
      orderCode: "ORD-77412",
      customerName: "Urban Lifestyle Retailers",
      itemsCount: 42,
      totalValue: 142500.0,
      status: "AWAITING PICK",
      carrier: "LogiLink Express",
      carrierIcon: "local_shipping",
    },
    {
      id: "so-2",
      orderCode: "ORD-77415",
      customerName: "Grand Central Plaza",
      itemsCount: 18,
      totalValue: 65820.0,
      status: "PACKED",
      carrier: "SwiftAir Cargo",
      carrierIcon: "flight_takeoff",
    },
    {
      id: "so-3",
      orderCode: "ORD-77418",
      customerName: "Moda International Ltd.",
      itemsCount: 105,
      totalValue: 312000.0,
      status: "SHIPPED",
      carrier: "Oceanic Freight",
      carrierIcon: "directions_boat",
    },
    {
      id: "so-4",
      orderCode: "ORD-77422",
      customerName: "Elite Garment Boutique",
      itemsCount: 8,
      totalValue: 22400.0,
      status: "AWAITING PICK",
      carrier: "LogiLink Express",
      carrierIcon: "local_shipping",
    },
  ]);

  // Handle Accept to Stock
  const handleAcceptToStock = (id: string) => {
    setFactoryIntakeItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter Sales Orders
  const filteredOrders = useMemo(() => {
    if (activeFilter === "ALL") return salesOrders;
    return salesOrders.filter((ord) => ord.status === activeFilter);
  }, [salesOrders, activeFilter]);

  // Selection Checkboxes Logic
  const handleToggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedOrderIds([]);
      setIsSelectAll(false);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
      setIsSelectAll(true);
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selected Total Value
  const selectedTotalValue = useMemo(() => {
    return salesOrders
      .filter((o) => selectedOrderIds.includes(o.id))
      .reduce((sum, o) => sum + o.totalValue, 0);
  }, [salesOrders, selectedOrderIds]);

  // Handle New Intake Submit
  const handleCreateNewIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newBatchNo) return;

    const newItem: FactoryIntakeItem = {
      id: `fi-${Date.now()}`,
      productName: newProductName,
      sku: `SKU: ${newProductName.slice(0, 3).toUpperCase()}-001`,
      planId: newPlanId || "PLN-2024-0100",
      batchNo: newBatchNo,
      qty: Number(newQty) || 100,
      qcStatus: "SUCCESS",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=120&q=80",
    };

    setFactoryIntakeItems((prev) => [newItem, ...prev]);
    setIsNewIntakeModalOpen(false);
    setNewPoNumber("");
    setNewProductName("");
    setNewPlanId("");
    setNewBatchNo("");
    setNewQty("");
  };

  return (
    <main className="wh-dispatch-container">
      {/* ── PAGE HEADER CARD ── */}
      <div className="wh-dispatch-header-card">
        <div className="wh-dispatch-title-group">
          <h1>Finished Goods &amp; Sales Dispatch Hub</h1>
          <p>Managing factory completions and high-velocity sales fulfillment.</p>
        </div>

        <div className="wh-dispatch-header-actions">
          <button className="wh-dispatch-btn wh-dispatch-btn-outline">
            <span className="wh-dispatch-icon">print</span>
            <span>Print Manifests</span>
          </button>
          <button
            onClick={() => setIsNewIntakeModalOpen(true)}
            className="wh-dispatch-btn wh-dispatch-btn-primary"
          >
            <span className="wh-dispatch-icon">add</span>
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* ── FACTORY INTAKE SECTION ── */}
      <section className="wh-dispatch-section-card">
        <div className="wh-dispatch-section-title">
          <h2>
            <span className="wh-dispatch-icon text-slate-800">factory</span>
            <span>Factory Intake</span>
          </h2>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
            {factoryIntakeItems.length} Pending
          </span>
        </div>

        <div className="wh-dispatch-table-wrapper">
          <table className="wh-dispatch-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Plan ID</th>
                <th>Batch No</th>
                <th className="text-right">Qty</th>
                <th>QC Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {factoryIntakeItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                    No pending factory intake items. All batches accepted to stock.
                  </td>
                </tr>
              ) : (
                factoryIntakeItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                          <p className="font-mono text-[11px] text-slate-500">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-700">{item.planId}</td>
                    <td className="font-mono text-xs font-semibold text-slate-700">{item.batchNo}</td>
                    <td className="font-mono text-xs font-bold text-slate-900 text-right">{item.qty.toLocaleString()}</td>
                    <td>
                      {item.qcStatus === "SUCCESS" ? (
                        <span className="wh-dispatch-badge success">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                          SUCCESS
                        </span>
                      ) : (
                        <span className="wh-dispatch-badge fail">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          FAIL
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {item.qcStatus === "SUCCESS" ? (
                        <button
                          onClick={() => handleAcceptToStock(item.id)}
                          className="wh-dispatch-btn wh-dispatch-btn-primary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Accept to Stock
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveQCReviewItem(item)}
                          className="wh-dispatch-btn wh-dispatch-btn-outline"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Review QC
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SALES DISPATCH HUB SECTION ── */}
      <section className="wh-dispatch-section-card">
        <div className="wh-dispatch-section-title">
          <h2>
            <span className="wh-dispatch-icon text-slate-800">local_shipping</span>
            <span>Sales Dispatch Hub</span>
          </h2>
          <button className="wh-dispatch-btn wh-dispatch-btn-primary">
            <span className="wh-dispatch-icon">verified</span>
            <span>Dispatch Selected</span>
          </button>
        </div>

        {/* Filters & Selected Summary Strip */}
        <div className="wh-dispatch-filter-strip">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`wh-dispatch-pill ${activeFilter === "ALL" ? "active" : "inactive"}`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveFilter("AWAITING PICK")}
              className={`wh-dispatch-pill ${activeFilter === "AWAITING PICK" ? "active" : "inactive"}`}
            >
              Awaiting Pick
            </button>
            <button
              onClick={() => setActiveFilter("PACKED")}
              className={`wh-dispatch-pill ${activeFilter === "PACKED" ? "active" : "inactive"}`}
            >
              Packed
            </button>
            <button
              onClick={() => setActiveFilter("SHIPPED")}
              className={`wh-dispatch-pill ${activeFilter === "SHIPPED" ? "active" : "inactive"}`}
            >
              Shipped
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
              <span className="wh-dispatch-icon">filter_list</span>
              <span>Filter</span>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Selected Value</p>
              <p className="font-mono font-bold text-slate-900 text-sm">
                Rs {selectedTotalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="wh-dispatch-table-wrapper">
          <table className="wh-dispatch-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th className="text-center">Items</th>
                <th className="text-right">Total Value</th>
                <th>Status</th>
                <th>Carrier</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(ord.id)}
                      onChange={() => handleToggleSelectOrder(ord.id)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </td>
                  <td className="font-mono font-bold text-slate-900">{ord.orderCode}</td>
                  <td className="font-semibold text-slate-800">{ord.customerName}</td>
                  <td className="font-mono text-center font-semibold text-slate-700">{ord.itemsCount}</td>
                  <td className="font-mono font-semibold text-slate-900 text-right">
                    Rs {ord.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {ord.status === "AWAITING PICK" ? (
                      <span className="wh-dispatch-badge warning">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        AWAITING PICK
                      </span>
                    ) : ord.status === "PACKED" ? (
                      <span className="wh-dispatch-badge info">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        PACKED
                      </span>
                    ) : (
                      <span className="wh-dispatch-badge success">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                        SHIPPED
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="wh-dispatch-icon text-slate-400">{ord.carrierIcon}</span>
                      <span>{ord.carrier}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setActiveActionOrder(ord)}
                      className="text-slate-400 hover:text-slate-900 p-1 rounded-md transition-colors"
                      title="Order Actions"
                    >
                      <span className="wh-dispatch-icon">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BENTO STATS GRID ── */}
      <div className="wh-dispatch-bento-grid">
        <div className="wh-dispatch-bento-card">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Velocity</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">94.2%</h3>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 w-[94.2%] transition-all duration-1000"></div>
          </div>
          <p className="mt-3 text-xs font-bold text-emerald-600">↑ 2.1% from yesterday</p>
        </div>

        <div className="wh-dispatch-bento-card items-center text-center">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-2">
            <span className="wh-dispatch-icon">inventory</span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Acceptance</p>
          <p className="text-2xl font-black text-slate-900 mt-1">1,775</p>
        </div>

        <div className="wh-dispatch-bento-card items-center text-center">
          <div className="w-10 h-10 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl flex items-center justify-center mb-2">
            <span className="wh-dispatch-icon">package_2</span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Shipments</p>
          <p className="text-2xl font-black text-slate-900 mt-1">42</p>
        </div>
      </div>

      {/* ── MODAL 1: NEW INTAKE MODAL (Stitch b78038c778c64dfd9b898df827ca60aa) ── */}
      {isNewIntakeModalOpen && (
        <>
          <div
            className="wh-dispatch-modal-backdrop"
            onClick={() => setIsNewIntakeModalOpen(false)}
          />
          <div className="wh-dispatch-modal-wrapper">
            <div className="wh-intake-modal-card">

              {/* Header */}
              <div className="wh-intake-header">
                <div className="wh-intake-header-left">
                  <div className="wh-intake-icon-box">
                    <span className="wh-dispatch-icon wh-intake-icon">inventory_2</span>
                  </div>
                  <h2 className="wh-intake-title">New Intake</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewIntakeModalOpen(false)}
                  className="wh-intake-close-btn"
                >
                  <span className="wh-dispatch-icon text-[22px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="wh-intake-body">
                <form onSubmit={handleCreateNewIntake}>

                  {/* Product Selection */}
                  <div className="wh-intake-field-group">
                    <label className="wh-intake-label" htmlFor="ni-product">Product Selection</label>
                    <div className="wh-intake-select-wrap">
                      <select
                        id="ni-product"
                        className="wh-intake-select"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      >
                        <option value="">Select SKU / Product Name...</option>
                        <option value="Premium Cotton Polo">SKU-PC04 – Premium Cotton Polo</option>
                        <option value="Denim Cargo Shorts">SKU-DC12 – Denim Cargo Shorts</option>
                        <option value="Fleece Hoodie">SKU-FH07 – Fleece Hoodie</option>
                        <option value="Athletic Crew Socks">SKU-AS19 – Athletic Crew Socks</option>
                      </select>
                      <span className="wh-intake-select-arrow wh-dispatch-icon">expand_more</span>
                    </div>
                  </div>

                  {/* 3-col: Batch | Plan ID | Quantity */}
                  <div className="wh-intake-row-3">
                    <div className="wh-intake-field-group">
                      <label className="wh-intake-label" htmlFor="ni-batch">Batch Number</label>
                      <input
                        id="ni-batch"
                        type="text"
                        className="wh-intake-input wh-intake-mono"
                        placeholder="e.g. BT-24X9"
                        value={newBatchNo}
                        onChange={(e) => setNewBatchNo(e.target.value)}
                      />
                    </div>
                    <div className="wh-intake-field-group">
                      <label className="wh-intake-label" htmlFor="ni-plan">Plan ID</label>
                      <input
                        id="ni-plan"
                        type="text"
                        className="wh-intake-input wh-intake-mono"
                        placeholder="PLN-00912"
                        value={newPlanId}
                        onChange={(e) => setNewPlanId(e.target.value)}
                      />
                    </div>
                    <div className="wh-intake-field-group">
                      <label className="wh-intake-label" htmlFor="ni-qty">Quantity</label>
                      <div className="wh-intake-qty-wrap">
                        <input
                          id="ni-qty"
                          type="number"
                          className="wh-intake-input wh-intake-mono wh-intake-qty-input"
                          placeholder="0"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        <span className="wh-intake-qty-unit">UN</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="wh-intake-divider" />

                  {/* Material Traceability */}
                  <div className="wh-intake-traceability">
                    <div className="wh-intake-traceability-glow" />
                    <div className="wh-intake-traceability-heading">
                      <span className="wh-dispatch-icon wh-intake-factory-icon">factory</span>
                      <h3 className="wh-intake-traceability-title">Material Traceability</h3>
                    </div>
                    <div className="wh-intake-traceability-grid">
                      <div>
                        <span className="wh-intake-label">Origin Factory Unit</span>
                        <div className="wh-intake-factory-name">
                          <span className="wh-intake-factory-dot" />
                          Kathmandu Industrial Garment Unit — Balaju, Nepal
                        </div>
                      </div>
                      <div>
                        <span className="wh-intake-label">Dispatch Date/Time</span>
                        <div className="wh-intake-mono wh-intake-dispatch-date">
                          {intakeDispatchDate} NPT
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QC Status toggle */}
                  <div className="wh-intake-field-group">
                    <label className="wh-intake-label">QC Status</label>
                    <div className="wh-intake-qc-row">
                      <button
                        type="button"
                        className={`wh-intake-qc-btn ${newQcStatus === "pass" ? "wh-intake-qc-btn-pass-active" : "wh-intake-qc-btn-inactive"}`}
                        onClick={() => setNewQcStatus("pass")}
                      >
                        <span className="wh-dispatch-icon text-[18px]">check_circle</span>
                        Pass
                      </button>
                      <button
                        type="button"
                        className={`wh-intake-qc-btn ${newQcStatus === "fail" ? "wh-intake-qc-btn-fail-active" : "wh-intake-qc-btn-inactive"}`}
                        onClick={() => setNewQcStatus("fail")}
                      >
                        <span className="wh-dispatch-icon text-[18px]">cancel</span>
                        Fail
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="wh-intake-footer">
                    <label className="wh-intake-barcode-label">
                      <div className="wh-intake-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="wh-intake-checkbox-hidden"
                          id="ni-barcode"
                          checked={newPrintBarcode}
                          onChange={(e) => setNewPrintBarcode(e.target.checked)}
                        />
                        <div className={`wh-intake-checkbox-box ${newPrintBarcode ? "wh-intake-checkbox-checked" : ""}`}>
                          {newPrintBarcode && <span className="wh-dispatch-icon wh-intake-check-icon">check</span>}
                        </div>
                      </div>
                      <span className="wh-intake-barcode-text">Print Barcode automatically</span>
                    </label>
                    <div className="wh-intake-footer-btns">
                      <button
                        type="button"
                        onClick={() => setIsNewIntakeModalOpen(false)}
                        className="wh-intake-btn-cancel"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="wh-intake-btn-accept">
                        <span className="wh-dispatch-icon text-[18px]">download</span>
                        Accept into Stock
                      </button>
                    </div>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── MODAL 2: THREE-DOT ORDER ACTIONS MODAL (SCOPED STYLES) ── */}
      {activeActionOrder && (
        <>
          <div
            className="wh-dispatch-modal-backdrop"
            onClick={() => setActiveActionOrder(null)}
          />
          <div className="wh-dispatch-modal-wrapper">
            <div className="wh-dispatch-actions-modal-card">
              <div className="wh-dispatch-actions-header">
                <div>
                  <h3>Order Actions</h3>
                  <p>{activeActionOrder.orderCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-close-icon-btn"
                >
                  <span className="wh-dispatch-icon text-[20px]">close</span>
                </button>
              </div>

              <div className="wh-dispatch-action-list">
                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">visibility</span>
                  </div>
                  <span>View Full Order Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">edit</span>
                  </div>
                  <span>Edit Shipping Address</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">local_shipping</span>
                  </div>
                  <span>Change Carrier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">print</span>
                  </div>
                  <span>Print Packing Slip</span>
                </button>

                <div className="wh-dispatch-divider" />

                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item warning"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">pause</span>
                  </div>
                  <span>Put on Hold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionOrder(null)}
                  className="wh-dispatch-action-item danger"
                >
                  <div className="wh-dispatch-action-item-icon">
                    <span className="wh-dispatch-icon text-[18px]">cancel</span>
                  </div>
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL 3: REVIEW QC MODAL (Stitch 28004cec68fe49b6a56ea06a602290f4) ── */}
      {activeQCReviewItem && (
        <>
          <div
            className="wh-dispatch-modal-backdrop"
            onClick={() => setActiveQCReviewItem(null)}
          />
          <div className="wh-dispatch-modal-wrapper">
            <div className="wh-dispatch-qc-modal-card">

              {/* ── Header ── */}
              <div className="wh-dispatch-qc-header">
                <div>
                  <h2 className="wh-dispatch-qc-header-title">
                    <span className="wh-dispatch-icon wh-dispatch-qc-header-icon">fact_check</span>
                    Quality Control Review
                  </h2>
                  <div className="wh-dispatch-qc-header-meta">
                    <span className="wh-dispatch-qc-batch-chip">Batch: {activeQCReviewItem.batchNo}</span>
                    <span className="wh-dispatch-qc-meta-sep">•</span>
                    <span>Product: {activeQCReviewItem.productName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQCReviewItem(null)}
                  className="wh-dispatch-close-icon-btn"
                >
                  <span className="wh-dispatch-icon text-[20px]">close</span>
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="wh-dispatch-qc-body">

                {/* 1. Summary Stats */}
                <div className="wh-dispatch-qc-stats-grid">
                  <div className="wh-dispatch-qc-stat-card">
                    <span className="wh-dispatch-qc-stat-label">Total Quantity</span>
                    <div className="wh-dispatch-qc-stat-value">{activeQCReviewItem.qty.toLocaleString()}</div>
                  </div>
                  <div className="wh-dispatch-qc-stat-card">
                    <span className="wh-dispatch-qc-stat-label">Inspected</span>
                    <div className="wh-dispatch-qc-stat-value">
                      {qcInspected.toLocaleString()}{" "}
                      <span className="wh-dispatch-qc-stat-sub">(10%)</span>
                    </div>
                  </div>
                  <div className="wh-dispatch-qc-stat-card wh-dispatch-qc-stat-pass">
                    <span className="wh-dispatch-qc-stat-label wh-dispatch-qc-stat-label-pass">Passed</span>
                    <div className="wh-dispatch-qc-stat-value wh-dispatch-qc-stat-value-pass">{Math.max(0, qcPassed).toLocaleString()}</div>
                  </div>
                  <div className="wh-dispatch-qc-stat-card wh-dispatch-qc-stat-fail">
                    <span className="wh-dispatch-qc-stat-label wh-dispatch-qc-stat-label-fail">Failed / Issues</span>
                    <div className="wh-dispatch-qc-stat-value wh-dispatch-qc-stat-value-fail">{qcFailed}</div>
                  </div>
                </div>

                {/* 2. Inspection Criteria Table */}
                <div className="wh-dispatch-qc-section-block">
                  <h3 className="wh-dispatch-qc-section-heading">
                    <span className="wh-dispatch-icon wh-dispatch-qc-section-icon">checklist</span>
                    Inspection Criteria
                  </h3>
                  <div className="wh-dispatch-qc-table-wrap">
                    <table className="wh-dispatch-qc-table">
                      <thead>
                        <tr className="wh-dispatch-qc-table-head-row">
                          <th className="wh-dispatch-qc-th wh-dispatch-qc-th-param">Parameter</th>
                          <th className="wh-dispatch-qc-th wh-dispatch-qc-th-center">Pass</th>
                          <th className="wh-dispatch-qc-th wh-dispatch-qc-th-center">Minor</th>
                          <th className="wh-dispatch-qc-th wh-dispatch-qc-th-center">Fail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {([
                          { key: "stitching", label: "Stitching Quality" },
                          { key: "color", label: "Color Consistency" },
                          { key: "sizing", label: "Sizing Accuracy" },
                          { key: "fabric", label: "Fabric Integrity" },
                        ] as { key: string; label: string }[]).map((row) => (
                          <tr key={row.key} className="wh-dispatch-qc-table-row">
                            <td className="wh-dispatch-qc-td wh-dispatch-qc-td-label">{row.label}</td>
                            <td className="wh-dispatch-qc-td wh-dispatch-qc-td-center">
                              <input
                                type="radio"
                                name={`qc-${row.key}`}
                                className="wh-dispatch-qc-radio wh-dispatch-qc-radio-pass"
                                checked={qcCriteria[row.key] === "pass"}
                                onChange={() => setQcCriteria((p) => ({ ...p, [row.key]: "pass" }))}
                              />
                            </td>
                            <td className="wh-dispatch-qc-td wh-dispatch-qc-td-center">
                              <input
                                type="radio"
                                name={`qc-${row.key}`}
                                className="wh-dispatch-qc-radio wh-dispatch-qc-radio-minor"
                                checked={qcCriteria[row.key] === "minor"}
                                onChange={() => setQcCriteria((p) => ({ ...p, [row.key]: "minor" }))}
                              />
                            </td>
                            <td className="wh-dispatch-qc-td wh-dispatch-qc-td-center">
                              <input
                                type="radio"
                                name={`qc-${row.key}`}
                                className="wh-dispatch-qc-radio wh-dispatch-qc-radio-fail"
                                checked={qcCriteria[row.key] === "fail"}
                                onChange={() => setQcCriteria((p) => ({ ...p, [row.key]: "fail" }))}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3+4. Defect Log & Evidence side by side */}
                <div className="wh-dispatch-qc-two-col">

                  {/* Defect Log */}
                  <div className="wh-dispatch-qc-section-block">
                    <h3 className="wh-dispatch-qc-section-heading">
                      <span className="wh-dispatch-icon wh-dispatch-qc-section-icon">bug_report</span>
                      Defect Log
                    </h3>
                    <div className="wh-dispatch-qc-defect-card">
                      <div className="wh-dispatch-qc-defect-add-row">
                        <select
                          className="wh-dispatch-qc-defect-select"
                          value={qcDefectType}
                          onChange={(e) => setQcDefectType(e.target.value)}
                        >
                          <option value="">Select Defect Type...</option>
                          <option>Loose Threads</option>
                          <option>Oil Stains</option>
                          <option>Measurement Deviation</option>
                          <option>Uneven Dyeing</option>
                        </select>
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          className="wh-dispatch-qc-defect-qty-input"
                          value={qcDefectQty}
                          onChange={(e) => setQcDefectQty(Number(e.target.value))}
                        />
                        <button
                          type="button"
                          className="wh-dispatch-qc-defect-add-btn"
                          onClick={addQcDefect}
                        >
                          <span className="wh-dispatch-icon text-[20px]">add</span>
                        </button>
                      </div>
                      <ul className="wh-dispatch-qc-defect-list">
                        {qcDefects.map((d) => (
                          <li key={d.id} className="wh-dispatch-qc-defect-item">
                            <span className="wh-dispatch-qc-defect-name">{d.type}</span>
                            <div className="wh-dispatch-qc-defect-item-right">
                              <span className="wh-dispatch-qc-defect-qty-chip">Qty: {d.qty}</span>
                              <button
                                type="button"
                                className="wh-dispatch-qc-defect-del-btn"
                                onClick={() => removeQcDefect(d.id)}
                              >
                                <span className="wh-dispatch-icon text-[16px]">delete</span>
                              </button>
                            </div>
                          </li>
                        ))}
                        {qcDefects.length === 0 && (
                          <li className="wh-dispatch-qc-defect-empty">No defects logged</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="wh-dispatch-qc-section-block">
                    <h3 className="wh-dispatch-qc-section-heading">
                      <span className="wh-dispatch-icon wh-dispatch-qc-section-icon">photo_camera</span>
                      Evidence
                    </h3>
                    <div className="wh-dispatch-qc-evidence-zone">
                      <span className="wh-dispatch-icon wh-dispatch-qc-evidence-icon">add_a_photo</span>
                      <span className="wh-dispatch-qc-evidence-text">Click to capture or drag photos here</span>
                    </div>
                  </div>

                </div>

                {/* 5. Inspector Remarks */}
                <div className="wh-dispatch-qc-section-block">
                  <h3 className="wh-dispatch-qc-section-heading">
                    <span className="wh-dispatch-icon wh-dispatch-qc-section-icon">notes</span>
                    Inspector Remarks
                  </h3>
                  <textarea
                    className="wh-dispatch-qc-remarks-textarea"
                    placeholder="Enter any additional notes regarding the batch inspection..."
                    value={qcRemarks}
                    onChange={(e) => setQcRemarks(e.target.value)}
                  />
                </div>

              </div>{/* end qc-body */}

              {/* ── Footer ── */}
              <div className="wh-dispatch-qc-footer-bar">
                <div className="wh-dispatch-qc-footer-info">
                  <span className="wh-dispatch-icon text-[16px]">info</span>
                  Review final before submitting.
                </div>
                <div className="wh-dispatch-qc-footer-actions">
                  <button
                    type="button"
                    className="wh-dispatch-qc-btn-fail"
                    onClick={() => {
                      setFactoryIntakeItems((prev) =>
                        prev.map((i) =>
                          i.id === activeQCReviewItem.id ? { ...i, qcStatus: "FAIL" } : i
                        )
                      );
                      setActiveQCReviewItem(null);
                    }}
                  >
                    <span className="wh-dispatch-icon text-[18px]">block</span>
                    Fail Batch
                  </button>
                  <button
                    type="button"
                    className="wh-dispatch-qc-btn-pass"
                    onClick={() => {
                      setFactoryIntakeItems((prev) =>
                        prev.map((i) =>
                          i.id === activeQCReviewItem.id ? { ...i, qcStatus: "SUCCESS" } : i
                        )
                      );
                      setActiveQCReviewItem(null);
                    }}
                  >
                    <span className="wh-dispatch-icon text-[18px]">check_circle</span>
                    Pass Batch
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </main>
  );
}
