"use client";

import React, { useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";

export default function CustomerDamageReturnPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [returnedQuantity, setReturnedQuantity] = useState("");
  const [reason, setReason] = useState("Damaged / Defective");
  const [notes, setNotes] = useState("");
  const [processedBy, setProcessedBy] = useState("Warehouse Representative");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Return History Log
  const [returnsLog, setReturnsLog] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!orderNumber.trim()) {
      setMessage({ type: "error", text: "Please enter order number." });
      return;
    }

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Please enter customer name." });
      return;
    }

    const qtyNum = Number(returnedQuantity);
    if (!returnedQuantity || qtyNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid returned quantity." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/warehouse/customer-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          customerName: customerName.trim(),
          productId: productId || "PROD-GENERIC",
          returnedQuantity: qtyNum,
          reason,
          notes,
          processedBy,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.message || "Failed to process customer return.");

      setMessage({ type: "success", text: resData.message });

      setReturnsLog((prev) => [
        {
          id: `RET-${Date.now().toString().slice(-4)}`,
          orderNumber,
          customerName,
          quantity: qtyNum,
          reason,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setOrderNumber("");
      setCustomerName("");
      setProductId("");
      setReturnedQuantity("");
      setNotes("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error processing customer return." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="warehouse-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WarehousePageHeader
        title="Customer Damage & Product Returns"
        subtitle="Process damage return requests initiated by customers. Tag damaged products and log return records into quarantine storage."
        actions={
          <ActionButton href="/warehouse" variant="secondary" size="sm">
            Back to Warehouse
          </ActionButton>
        }
      />

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Customer Return Form */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Log Customer Return Request
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Order Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-98213"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp / Sita Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Returned Quantity *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={returnedQuantity}
                  onChange={(e) => setReturnedQuantity(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Reason for Return *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                >
                  <option value="Damaged / Defective">Damaged / Defective</option>
                  <option value="Wrong Size Handed Over">Wrong Size Handed Over</option>
                  <option value="Fabric Tear / Stitch Issue">Fabric Tear / Stitch Issue</option>
                  <option value="Color Discrepancy">Color Discrepancy</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Return Inspection Notes
              </label>
              <textarea
                rows={3}
                placeholder="Condition of returned item and resolution..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Processing..." : "Process Customer Return"}
            </button>
          </form>
        </div>

        {/* Quarantine & Damage Policy */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Damaged Goods Policy
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#475569" }}>
            <div style={{ padding: "12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#991b1b" }}>1. Immediate Quarantine</strong>
              <p style={{ margin: "4px 0 0 0" }}>
                All returned damaged items are placed into designated Quarantine Storage to prevent mixing with prime finished goods stock.
              </p>
            </div>

            <div style={{ padding: "12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <strong style={{ color: "#0369a1" }}>2. Return Audit Log</strong>
              <p style={{ margin: "4px 0 0 0" }}>
                Transactions are recorded under `Customer Damage Return` with customer details and original order reference.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Returns History */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Customer Returns Log
        </h2>

        {returnsLog.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No customer returns processed in this session.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "8px" }}>Return ID</th>
                <th style={{ padding: "8px" }}>Order #</th>
                <th style={{ padding: "8px" }}>Customer</th>
                <th style={{ padding: "8px" }}>Qty Returned</th>
                <th style={{ padding: "8px" }}>Reason</th>
                <th style={{ padding: "8px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {returnsLog.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>{log.id}</td>
                  <td style={{ padding: "10px 8px", fontWeight: "600" }}>{log.orderNumber}</td>
                  <td style={{ padding: "10px 8px" }}>{log.customerName}</td>
                  <td style={{ padding: "10px 8px", color: "#dc2626", fontWeight: "700" }}>
                    {log.quantity} pcs
                  </td>
                  <td style={{ padding: "10px 8px" }}>{log.reason}</td>
                  <td style={{ padding: "10px 8px", color: "#64748b" }}>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
