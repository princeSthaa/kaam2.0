"use client";

import React, { useState, useEffect } from "react";
import "../styles/supplier-inspect.css";
// import { fetchPurchaseOrders, PurchaseOrderGetDto } from "../api/constant";
import { fetchPurchaseOrders, PurchaseOrderGetDto, fetchMaterialInspections, fetchPurchaseOrderReceipts } from "../api/constant";
import { updateMaterialInspection } from "../api/constant";
import { createPurchaseOrderReceipt } from "../api/constant";
import { adToBs } from "../../../components/ui/NepaliDatePicker";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

/* ─── Types ─────────────────────────────────────────────── */
type POStatus =
  | "Pending"
  | "Processing"
  | "PartiallyDelivered"
  | "Delivered"
  | "Completed"
  | "Cancelled";

type PendingPO = {
  id: string;
  poNumber: string;
  supplier: string;
  status: POStatus;
  date: string;
  quantity: string;
};

type MaterialRow = {
  sku: string;
  description: string;
  expectedQty: number;
  inspectedQty: number;
};

type InspectionMaterialState = {
  id: string; // This is the PO item ID
  inspectionItemId?: string; // This is the Material Inspection Item ID from the backend
  materialId: string;
  materialCode: string;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  status: "pending" | "accepted" | "rejected" | "partial";
  notes: string;
};

/* ─── Component ─────────────────────────────────────────── */
export default function SupplierProductAndInspectPage() {
  const [orders, setOrders] = useState<PurchaseOrderGetDto[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderGetDto | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionMaterialState[]>([]);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Delivered">("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [poReceipts, setPoReceipts] = useState<any[]>([]);

  const fetchAndEnrichOrders = async () => {
    const [ordersData, materialsData] = await Promise.all([
      fetchPurchaseOrders(),
      fetch(`${API_MAIN_URL}/material`).then(res => res.json())
    ]);

    return ordersData.map((order: PurchaseOrderGetDto) => ({
      ...order,
      items: order.items?.map(item => {
        const materialInfo = materialsData.find((m: any) => m.id === item.materialId);
        return {
          ...item,
          materialCode: item.materialCode || materialInfo?.materialCode || "N/A",
          materialName: item.materialName || materialInfo?.name || "Unknown Material"
        };
      }) || []
    }));
  };

  useEffect(() => {
    fetchAndEnrichOrders()
      .then((enrichedOrders) => {
        setOrders(enrichedOrders);
        if (enrichedOrders.length > 0) setSelectedPO(enrichedOrders[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function loadInspectionData() {
      if (!selectedPO?.items) {
        setInspectionItems([]);
        setCurrentInspectionId(null);
        setPoReceipts([]);
        return;
      }

      let backendInspection = null;
      try {
        // Fetch all receipts and filter to those belonging to this PO
        const allReceipts = await fetchPurchaseOrderReceipts().catch(() => []);
        const receiptsForPO = allReceipts.filter((r: any) => r.purchaseOrderId === selectedPO.id);
        setPoReceipts(receiptsForPO);

        if (receiptsForPO.length > 0) {
          const allInspections = await fetchMaterialInspections();
          const receiptIds = new Set(receiptsForPO.map((r: any) => r.id));

          // Find all inspections linked to this PO's receipts
          const inspectionsForPO = allInspections.filter(i => receiptIds.has(i.purchaseOrderReceiptId));

          // Prefer a non-completed (active) inspection, otherwise take the latest completed one
          backendInspection = inspectionsForPO.find(i => i.inspectionStatus !== "4")
            || inspectionsForPO.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0]
            || null;

          if (backendInspection) {
            setCurrentInspectionId(backendInspection.id);
          } else {
            setCurrentInspectionId(null);
          }
        } else {
          setPoReceipts([]);
          setCurrentInspectionId(null);
        }
      } catch (e) {
        console.error("Failed to load inspections", e);
      }

      setInspectionItems(
        selectedPO.items.map(item => {
          // Find the corresponding item in the auto-created backend inspection (if it exists)
          const matchedBackendItem = backendInspection?.items?.find((bi: any) => bi.materialId === item.materialId);

          return {
            id: item.id, // PO item ID
            inspectionItemId: matchedBackendItem?.id, // Backend auto-created ID!
            materialId: item.materialId,
            materialCode: item.materialCode,
            materialName: item.materialName,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.orderedQuantity,
            acceptedQuantity: matchedBackendItem?.acceptedQuantity ?? item.orderedQuantity,
            rejectedQuantity: matchedBackendItem?.rejectedQuantity ?? 0,
            status: matchedBackendItem ? 
              (matchedBackendItem.inspectionStatus === "1" ? "accepted" : 
               matchedBackendItem.inspectionStatus === "2" ? "rejected" : "partial") 
              : (backendInspection?.inspectionStatus === "4" ? "accepted" : "pending"),
            notes: matchedBackendItem?.notes ?? (backendInspection?.inspectionStatus === "4" ? "Auto-completed" : "")
          };
        })
      );
    }

    loadInspectionData();
  }, [selectedPO]);

  const acceptedCount = inspectionItems.reduce((sum, item) => sum + item.acceptedQuantity, 0);
  const totalReceivedCount = inspectionItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const rejectedCount = inspectionItems.reduce((sum, item) => sum + item.rejectedQuantity, 0);

  // Initiate Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
  ]);

  function updateItem(materialId: string, patch: Partial<InspectionMaterialState>) {
    setInspectionItems((prev) => prev.map((r) => {
      if (r.materialId === materialId) {
        const updated = { ...r, ...patch };
        if (patch.acceptedQuantity !== undefined) {
          updated.rejectedQuantity = Math.max(0, updated.receivedQuantity - patch.acceptedQuantity);
        } else if (patch.rejectedQuantity !== undefined) {
          updated.acceptedQuantity = Math.max(0, updated.receivedQuantity - patch.rejectedQuantity);
        } else if (patch.receivedQuantity !== undefined) {
          // If they just update received quantity, keep accepted as is, and recalculate rejected.
          updated.rejectedQuantity = Math.max(0, patch.receivedQuantity - updated.acceptedQuantity);
        }
        return updated;
      }
      return r;
    }));
  }

  function markItemStatus(materialId: string, status: InspectionMaterialState["status"]) {
    updateItem(materialId, { status });
  }

  // async function handleConfirmReceipt() {
  //   if (!selectedPO) return;
  //   try {
  //     // Create PO Receipt
  //     const receiptPayload = {
  //       purchaseOrderId: selectedPO.id,
  //       orderNumber: selectedPO.orderNumber,
  //       receivedBy: "Warehouse User",
  //       status: "PendingInspection", // <--- Updated to match C# ReceiptStatus enum
  //       items: selectedPO.items.map(item => ({
  //         purchaseOrderItemId: item.id,
  //         materialId: item.materialId,
  //         receivedQuantity: item.orderedQuantity
  //       }))
  //     };

  //     await createPurchaseOrderReceipt(receiptPayload);

  //     // Update PO Status
  //     await updatePurchaseOrderStatus(selectedPO.id, "Delivered");

  //     // Refresh local state
  //     const updatedOrders = await fetchPurchaseOrders();
  //     setOrders(updatedOrders);
  //     setSelectedPO(updatedOrders.find(o => o.id === selectedPO.id) || null);

  //     alert("Receipt confirmed! You can now inspect the materials.");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to confirm receipt.");
  //   }
  // }

  async function handleConfirmReceipt() {
    if (!selectedPO) return;
    try {
      // 1. Create PO Receipt payload
      const receiptPayload = {
        purchaseOrderId: selectedPO.id,
        receivedBy: "Admin",
        items: selectedPO.items.map(item => ({
          purchaseOrderItemId: item.id,
          materialId: item.materialId,
          receivedQuantity: item.orderedQuantity
        }))
      };

      // 2. Send receipt creation request to the backend
      await createPurchaseOrderReceipt(receiptPayload);

      // 3. Fetch the latest data from the database to refresh the UI
      const updatedOrders = await fetchAndEnrichOrders();

      // 4. Apply the updated data to the screen
      setOrders(updatedOrders);
      setSelectedPO(updatedOrders.find(o => o.id === selectedPO.id) || null);

      alert("Receipt confirmed! You can now inspect the materials.");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm receipt.");
    }
  }

  async function handleSaveProgress() {
    if (!selectedPO) return;
    try {
      if (!currentInspectionId) {
        alert("No inspection record found. Please confirm receipt first.");
        return;
      }

      // Only send items that the user has explicitly inspected (not pending)
      const itemsToProcess = inspectionItems.filter((i) => i.status !== "pending" && i.inspectionItemId);
      if (itemsToProcess.length === 0) {
        alert("No items inspected yet to save. Please accept or reject at least one item.");
        return;
      }

      // Backend UpdateMaterialInspectionItemDto expects: id, acceptedQuantity, rejectedQuantity, notes
      const payloadItems = itemsToProcess.map(item => ({
        id: item.inspectionItemId!,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity,
        inspectionStatus: item.status === "accepted" ? "1" : item.status === "rejected" ? "2" : "0",
        notes: item.notes || "Progress saved"
      }));

      const payload = {
        inspectionStatus: "InProgress",
        inspectorName: "Admin",
        notes: "Progress saved",
        items: payloadItems
      };

      await updateMaterialInspection(currentInspectionId, payload);

      // Refresh data after saving
      const updatedOrders = await fetchAndEnrichOrders();
      setOrders(updatedOrders);
      setSelectedPO(updatedOrders.find(o => o.id === selectedPO.id) || null);

      alert("Progress saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save progress: ${err.message || "Unknown error"}`);
    }
  }

  const handleCompleteInspection = async () => {
    if (!selectedPO) return;
    try {
      if (!currentInspectionId) {
        alert("No inspection record found. Please confirm receipt first.");
        return;
      }

      // For complete inspection, ALL items must be inspected.
      // Items still pending will be auto-accepted with full quantity.
      const payloadItems = inspectionItems
        .filter(item => item.inspectionItemId)
        .map(item => {
          if (item.status === "pending") {
            // Auto-accept uninspected items with full received quantity
            return {
              id: item.inspectionItemId!,
              acceptedQuantity: item.receivedQuantity,
              rejectedQuantity: 0,
              inspectionStatus: "1",
              notes: item.notes || "Auto-accepted on completion"
            };
          }
          return {
            id: item.inspectionItemId!,
            acceptedQuantity: item.acceptedQuantity,
            rejectedQuantity: item.rejectedQuantity,
            inspectionStatus: item.status === "accepted" ? "1" : item.status === "rejected" ? "2" : "0",
            notes: item.notes || ""
          };
        });

      if (payloadItems.length === 0) {
        alert("No inspection items found. Please confirm receipt first.");
        return;
      }

      const payload = {
        inspectionStatus: "Completed",
        inspectorName: "Admin",
        notes: "Inspection completed",
        items: payloadItems
      };

      await updateMaterialInspection(currentInspectionId, payload);

      // Refresh data after completing
      const updatedOrders = await fetchAndEnrichOrders();
      setOrders(updatedOrders);
      setSelectedPO(updatedOrders.find(o => o.id === selectedPO.id) || null);

      alert("Inspection completed successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to complete inspection: ${err.message || "Unknown error"}`);
    }
  }

  return (
    <main className="wh-si-main">

      {/* ── Left: Pending Receipts Queue ── */}
      <section className="wh-si-queue-panel">
        <div className="wh-si-queue-header" style={{ position: "relative" }}>
          <h3 className="wh-si-queue-title">Pending Receipts</h3>
          <button className="wh-si-icon-btn" title="Filter" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}>
            <span className="wh-si-icon">filter_list</span>
          </button>

          {isFilterDropdownOpen && (
            <div style={{ position: "absolute", top: "100%", right: "16px", background: "white", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 16px", cursor: "pointer", background: filterStatus === "All" ? "#f0f0f0" : "transparent" }} onClick={() => { setFilterStatus("All"); setIsFilterDropdownOpen(false); }}>All</div>
              <div style={{ padding: "8px 16px", cursor: "pointer", background: filterStatus === "Pending" ? "#f0f0f0" : "transparent" }} onClick={() => { setFilterStatus("Pending"); setIsFilterDropdownOpen(false); }}>Pending Delivery</div>
              <div style={{ padding: "8px 16px", cursor: "pointer", background: filterStatus === "Delivered" ? "#f0f0f0" : "transparent" }} onClick={() => { setFilterStatus("Delivered"); setIsFilterDropdownOpen(false); }}>Delivered</div>
            </div>
          )}
        </div>

        <div className="wh-si-queue-list">
          {orders.filter(po => {
            if (filterStatus === "All") return true;
            if (filterStatus === "Delivered") return po.status === "Delivered";
            return po.status !== "Delivered";
          }).map((po) => {
            const isActive = selectedPO?.id === po.id;
            const totalQty = po.items ? po.items.reduce((sum, item) => sum + item.orderedQuantity, 0) : 0;
            return (
              <div
                key={po.id}
                className={`wh-si-queue-item ${isActive ? "wh-si-queue-item-active" : ""}`}
                onClick={() => setSelectedPO(po)}
              >
                {isActive && <div className="wh-si-queue-active-bar" />}
                <div className={`wh-si-queue-item-top ${isActive ? "wh-si-queue-item-top-selected" : ""}`}>
                  <div>
                    <div className={`wh-si-po-number ${isActive ? "wh-si-po-number-active" : "wh-si-po-number-muted"}`}>
                      {po.orderNumber}
                    </div>
                    <div className="wh-si-supplier-name">{po.supplierName}</div>
                  </div>
                </div>
                <div className={`wh-si-queue-item-bottom ${isActive ? "wh-si-queue-item-top-selected" : ""}`}>
                  <div className="wh-si-date-label">
                    <span className="wh-si-icon wh-si-icon-sm">calendar_today</span>
                    {adToBs(po.createdAt)}
                  </div>
                  <div className="wh-si-qty-label">{totalQty} Units</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Right: Active Inspection Workspace ── */}
      <section className="wh-si-workspace">

        {/* Workspace Header */}
        <div className="wh-si-workspace-header">
          <div>
            <div className="wh-si-workspace-title-row">
              <h2 className="wh-si-workspace-po">{selectedPO?.orderNumber || "Select PO"}</h2>
              <div className="wh-si-inspecting-badge">
                <span className="wh-si-pulse-dot" />
                <span className="wh-si-inspecting-label">INSPECTING</span>
              </div>
            </div>
            <p className="wh-si-workspace-subtitle">
              {selectedPO?.supplierName || "Supplier"} {selectedPO?.shippingMethod ? <>&bull; Carrier: {selectedPO.shippingMethod}</> : ""}
            </p>
          </div>
          {/*
          <div className="wh-si-workspace-actions">
            <button className="wh-si-action-btn">
              <span className="wh-si-icon wh-si-icon-sm">print</span>
              Print Roll Tags
            </button>
            <button className="wh-si-action-btn">
              <span className="wh-si-icon wh-si-icon-sm">attachment</span>
              View BOL
            </button>
          </div>
          */}
        </div>

        {/* Scrollable content */}
        <div className="wh-si-workspace-body">

          {/* Expected Materials Table */}
          <div className="wh-si-section">
            <h3 className="wh-si-section-title">Expected Materials</h3>
            <div className="wh-si-table-wrap">
              <table className="wh-si-table">
                <thead>
                  <tr className="wh-si-table-head-row">
                    <th className="wh-si-th">Item / SKU</th>
                    <th className="wh-si-th">Description</th>
                    <th className="wh-si-th wh-si-th-right">Expected Qty</th>
                    <th className="wh-si-th wh-si-th-right">Inspected</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO?.items?.map((mat, idx) => {
                    // Use the fetched receipts (poReceipts) since selectedPO.receipts is empty from the API
                    const inspectedQty = poReceipts.reduce((sum: number, receipt: any) => {
                      const item = receipt.items?.find((i: any) => i.materialId === mat.materialId);
                      return sum + (item ? item.receivedQuantity : 0);
                    }, 0) || 0;

                    return (
                      <tr key={mat.id} className={`wh-si-table-row ${idx < selectedPO.items.length - 1 ? "wh-si-table-row-border" : ""}`}>
                        <td className="wh-si-td wh-si-td-mono">{mat.materialCode}</td>
                        <td className="wh-si-td">{mat.materialName}</td>
                        <td className="wh-si-td wh-si-td-mono wh-si-td-right">{mat.orderedQuantity} Units</td>
                        <td className={`wh-si-td wh-si-td-mono wh-si-td-right ${inspectedQty > 0 ? "wh-si-inspected-active" : "wh-si-inspected-zero"}`}>
                          {inspectedQty} / {mat.orderedQuantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Material Inspection Grid */}
          {selectedPO && ["Delivered", "Processing", "Completed"].includes(selectedPO.status) ? (
            <div className="wh-si-section">
              <div className="wh-si-roll-header">
                <h3 className="wh-si-section-title">
                  Material Inspection:{" "}
                  <span className="wh-si-roll-sku">{selectedPO?.items?.[0]?.materialCode || "Select Item"}</span>
                </h3>
              </div>

              <div className="wh-si-qc-grid-card">
                {/* Grid header */}
                <div className="wh-si-qc-grid-head">
                  <div className="wh-si-col-label">Material Code</div>
                  <div className="wh-si-col-label">Material Name</div>
                  <div className="wh-si-col-label">Received Qty</div>
                  <div className="wh-si-col-label">Accepted Qty</div>
                  <div className="wh-si-col-label">Rejected Qty</div>
                  <div className="wh-si-col-label">Notes</div>
                  <div className="wh-si-col-label wh-si-col-label-right">Action</div>
                </div>

                {/* Grid rows */}
                {inspectionItems.map((item) => (
                  <div
                    key={item.materialId}
                    className={`wh-si-qc-row
                    ${item.status === "accepted" ? "wh-si-qc-row-accepted" : ""}
                    ${item.status === "pending" || item.status === "partial" ? "wh-si-qc-row-active" : ""}
                    ${item.status === "rejected" ? "wh-si-qc-row-rejected" : ""}
                  `}
                  >
                    {/* Material Code */}
                    <div className={`wh-si-td-mono
                    ${item.status === "accepted" ? "wh-si-roll-id-accepted" : ""}
                    ${item.status === "pending" || item.status === "partial" ? "wh-si-roll-id-active" : ""}
                    ${item.status === "rejected" ? "wh-si-roll-id-muted" : ""}
                  `}>
                      {item.materialCode}
                    </div>

                    {/* Material Name */}
                    <div className="wh-si-supplier-tag">{item.materialName}</div>

                    {/* Received Qty */}
                    <div>
                      <input
                        type="number"
                        className={`wh-si-cell-input ${item.status === "pending" ? "wh-si-cell-input-active" : "wh-si-cell-input-disabled"}`}
                        value={item.receivedQuantity}
                        disabled={item.status !== "pending"}
                        onChange={(e) => updateItem(item.materialId, { receivedQuantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Accepted Qty */}
                    <div>
                      <input
                        type="number"
                        className={`wh-si-cell-input ${item.status === "pending" ? "wh-si-cell-input-active" : "wh-si-cell-input-disabled"}`}
                        value={item.acceptedQuantity}
                        disabled={item.status !== "pending"}
                        onChange={(e) => updateItem(item.materialId, { acceptedQuantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Rejected Qty */}
                    <div>
                      <input
                        type="number"
                        className={`wh-si-cell-input ${item.status === "pending" ? "wh-si-cell-input-active" : "wh-si-cell-input-disabled"}`}
                        value={item.rejectedQuantity}
                        disabled={item.status !== "pending"}
                        onChange={(e) => updateItem(item.materialId, { rejectedQuantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <input
                        type="text"
                        placeholder="Add notes..."
                        className={`wh-si-cell-input ${item.status === "pending" ? "wh-si-cell-input-active" : "wh-si-cell-input-disabled"}`}
                        value={item.notes}
                        disabled={item.status !== "pending"}
                        onChange={(e) => updateItem(item.materialId, { notes: e.target.value })}
                        style={{ width: "100%", padding: "4px 8px" }}
                      />
                    </div>

                    {/* Action */}
                    <div className="wh-si-action-col">
                      {item.status === "accepted" && (
                        <span 
                          className="wh-si-accepted-tag" 
                          style={{ cursor: "pointer" }} 
                          onClick={() => markItemStatus(item.materialId, "pending")}
                          title="Click to edit"
                        >
                          <span className="wh-si-icon wh-si-icon-xs">check_circle</span>
                          ACCEPTED
                        </span>
                      )}
                      {item.status === "rejected" && (
                        <span 
                          className="wh-si-rejected-tag" 
                          style={{ cursor: "pointer" }} 
                          onClick={() => markItemStatus(item.materialId, "pending")}
                          title="Click to edit"
                        >
                          <span className="wh-si-icon wh-si-icon-xs">cancel</span>
                          REJECTED
                        </span>
                      )}
                      {item.status === "partial" && (
                        <span 
                          className="wh-si-waiting-tag" 
                          style={{ cursor: "pointer" }} 
                          onClick={() => markItemStatus(item.materialId, "pending")}
                          title="Click to edit"
                        >
                          PARTIAL
                        </span>
                      )}
                      {item.status === "pending" && (
                        <div className="wh-si-row-btns">
                          <button
                            className="wh-si-reject-btn"
                            title="Reject All"
                            onClick={() => {
                              updateItem(item.materialId, { acceptedQuantity: 0, rejectedQuantity: item.receivedQuantity });
                              markItemStatus(item.materialId, "rejected");
                            }}
                          >
                            <span className="wh-si-icon wh-si-icon-sm">close</span>
                          </button>
                          <button
                            className="wh-si-accept-btn"
                            title="Confirm Quantities"
                            onClick={() => {
                              if (item.acceptedQuantity + item.rejectedQuantity !== item.receivedQuantity) {
                                updateItem(item.materialId, { acceptedQuantity: item.receivedQuantity - item.rejectedQuantity });
                              }
                              markItemStatus(item.materialId, item.rejectedQuantity > 0 ? "partial" : "accepted");
                            }}
                          >
                            <span className="wh-si-icon wh-si-icon-sm">check</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="wh-si-section" style={{ textAlign: "center", padding: "40px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px dashed #ccc", marginTop: "16px" }}>
              <span className="wh-si-icon" style={{ fontSize: "48px", color: "#999", marginBottom: "16px" }}>inventory_2</span>
              <h3 style={{ marginBottom: "8px", color: "#333", fontSize: "18px", fontWeight: "600" }}>PO is Pending Receipt</h3>
              <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
                The materials for this Purchase Order have not been marked as delivered yet.
                Confirm receipt to begin the quality inspection process.
              </p>
              <button className="wh-si-btn-primary" onClick={handleConfirmReceipt}>
                Confirm Receipt
                <span className="wh-si-icon wh-si-icon-sm" style={{ marginLeft: "8px" }}>done_all</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        {selectedPO && ["Delivered", "Processing", "Completed"].includes(selectedPO.status) && (
          <div className="wh-si-bottom-bar">
            <div className="wh-si-bottom-stats">
              <div className="wh-si-stat-text">
                Total Accepted:{" "}
                <span className="wh-si-stat-value wh-si-stat-primary">{acceptedCount}</span>
                {" "}/ {totalReceivedCount}
              </div>
              <div className="wh-si-stat-divider" />
              <div className="wh-si-stat-text wh-si-stat-error">
                Total Rejected:{" "}
                <span className="wh-si-stat-value">{rejectedCount}</span>
              </div>
            </div>
            <div className="wh-si-bottom-btns">
              <button className="wh-si-btn-secondary" onClick={handleSaveProgress}>Save Progress</button>
              <button
                className="wh-si-btn-danger"
                onClick={() => setIsReturnModalOpen(true)}
              >
                Initiate Return ({rejectedCount})
              </button>
              <button className="wh-si-btn-primary" onClick={handleCompleteInspection}>
                Complete Inspection
                <span className="wh-si-icon wh-si-icon-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── MODAL: INITIATE RETURN (Stitch node 0c2c8d3b32154982aa0d3206141b7b49) ── */}
      {isReturnModalOpen && (
        <>
          <div
            className="wh-si-modal-backdrop"
            onClick={() => setIsReturnModalOpen(false)}
          />
          <div className="wh-si-modal-wrapper">
            <div className="wh-si-return-card">

              {/* Header */}
              <div className="wh-si-return-header">
                <div className="wh-si-return-header-left">
                  <div className="wh-si-return-icon-box">
                    <span className="wh-si-icon wh-si-return-header-icon">assignment_return</span>
                  </div>
                  <div>
                    <h3 className="wh-si-return-title">Initiate Return</h3>
                    <p className="wh-si-return-subtitle">
                      Record inspection failure for shipment {selectedPO?.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="wh-si-return-close-btn"
                >
                  <span className="wh-si-icon text-[20px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="wh-si-return-body">

                {/* Line Items for Return */}
                <div>
                  <label className="wh-si-return-label">Line Items for Return</label>
                  <div className="wh-si-return-item-box">
                    <div className="wh-si-return-item-left">
                      <div className="wh-si-return-item-thumb">
                        <span className="wh-si-icon text-[24px]">texture</span>
                      </div>
                      <div>
                        <p className="wh-si-return-item-name">1 Roll of FAB-COT-NAVY-01</p>
                        <p className="wh-si-return-item-batch">Batch #TX-2024-001 • Pima Cotton Roll</p>
                      </div>
                    </div>
                    <div className="wh-si-return-item-right">
                      <p className="wh-si-return-item-qty">QTY: 01</p>
                      <span className="wh-si-return-rejected-badge">REJECTED</span>
                    </div>
                  </div>
                </div>

                {/* Grid 2-col inputs */}
                <div className="wh-si-return-grid-2">

                  {/* Reason for Return */}
                  <div>
                    <label className="wh-si-return-label">Reason for Return</label>
                    <div className="wh-si-return-select-wrap">
                      <select
                        className="wh-si-return-select"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                      >
                        <option value="" disabled>Select a reason...</option>
                        <option value="damaged">Damaged during transit</option>
                        <option value="wrong_shade">Wrong Shade / Color Variance</option>
                        <option value="defective">Defective Material / Holes</option>
                        <option value="incorrect_sku">Incorrect SKU Sent</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="wh-si-icon wh-si-return-select-arrow text-[18px]">expand_more</span>
                    </div>
                  </div>

                  {/* Photo Evidence Upload */}
                  <div>
                    <label className="wh-si-return-label">Photo Evidence</label>
                    <div className="wh-si-return-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        className="wh-si-return-upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEvidenceImages((prev) => [...prev, url]);
                          }
                        }}
                      />
                      <div className="wh-si-return-upload-label">
                        <span className="wh-si-icon text-[20px] text-slate-500">cloud_upload</span>
                        <span className="wh-si-return-upload-text">Upload images (Max 5MB)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Additional Comments */}
                <div>
                  <label className="wh-si-return-label">Additional Comments</label>
                  <textarea
                    className="wh-si-return-textarea"
                    placeholder="Describe the specific defect or situation for the supplier..."
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                  />
                </div>

                {/* Evidence Gallery */}
                <div className="wh-si-return-gallery">
                  {evidenceImages.map((imgUrl, idx) => (
                    <div key={idx} className="wh-si-return-thumb-card">
                      <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="wh-si-return-thumb-img" />
                      <button
                        type="button"
                        className="wh-si-return-thumb-del"
                        onClick={() => setEvidenceImages((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <span className="wh-si-icon text-[14px]">close</span>
                      </button>
                    </div>
                  ))}

                  <label className="wh-si-return-add-more-btn">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setEvidenceImages((prev) => [...prev, url]);
                        }
                      }}
                    />
                    <span className="wh-si-icon text-[20px]">add_photo_alternate</span>
                    <span className="wh-si-return-add-more-text">ADD MORE</span>
                  </label>
                </div>

              </div>

              {/* Footer */}
              <div className="wh-si-return-footer">
                <button
                  type="button"
                  className="wh-si-return-btn-cancel"
                  onClick={() => setIsReturnModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="wh-si-return-btn-confirm"
                  onClick={() => setIsReturnModalOpen(false)}
                >
                  Confirm Return
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </main>
  );
}
