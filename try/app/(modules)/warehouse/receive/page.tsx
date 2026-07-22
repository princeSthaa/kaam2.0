"use client";

import React, { useState, useEffect } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";

export default function SupplierReceivingInspectionPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [customMaterialName, setCustomMaterialName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState<"Accepted" | "Purchase Return">("Accepted");
  const [notes, setNotes] = useState("");
  const [inspectorName, setInspectorName] = useState("Quality Inspector");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inspection history log
  const [inspectionsLog, setInspectionsLog] = useState<any[]>([]);

  const loadMaterials = async () => {
    try {
      const res = await fetch("http://localhost:5083/api/material");
      if (res.ok) {
        const data = await res.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const mat = materials.find((m) => m.id === selectedMaterialId);
    const materialId = selectedMaterialId || "CUSTOM";
    const materialName = mat ? mat.name : customMaterialName || "Raw Material";

    const qtyNum = Number(receivedQuantity);
    if (!receivedQuantity || qtyNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid received quantity." });
      return;
    }

    if (!supplierName.trim()) {
      setMessage({ type: "error", text: "Please specify supplier name." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/warehouse/receive-inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          materialName,
          supplierName: supplierName.trim(),
          receivedQuantity: qtyNum,
          inspectionStatus,
          notes,
          inspectorName,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Failed to process supplier shipment inspection.");
      }

      setMessage({ type: "success", text: resData.message });

      // Add to inspection log
      setInspectionsLog((prev) => [
        {
          id: `INSP-${Date.now().toString().slice(-4)}`,
          materialName,
          quantity: qtyNum,
          supplierName,
          status: inspectionStatus,
          inspector: inspectorName,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      // Reset form
      setSelectedMaterialId("");
      setCustomMaterialName("");
      setReceivedQuantity("");
      setNotes("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error processing inspection." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="warehouse-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WarehousePageHeader
        title="Supplier Receiving & Quality Inspection"
        subtitle="Inspect incoming raw material shipments. Tag accepted goods into stock, or initiate purchase returns for damaged shipments."
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
        {/* Inspection Form */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Incoming Shipment Inspection
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Select Material Received
              </label>
              <select
                className="form-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="">-- Select Material --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.materialCode || m.type})
                  </option>
                ))}
                <option value="CUSTOM">+ Custom Received Material</option>
              </select>
            </div>

            {selectedMaterialId === "CUSTOM" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Material Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Cotton Thread Roll"
                  value={customMaterialName}
                  onChange={(e) => setCustomMaterialName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Received Quantity *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={receivedQuantity}
                  onChange={(e) => setReceivedQuantity(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Supplier Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Everest Textiles"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            </div>

            {/* Inspection Status Tags */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                Quality Inspection Status Tag *
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setInspectionStatus("Accepted")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    border: inspectionStatus === "Accepted" ? "2px solid #059669" : "1px solid #cbd5e1",
                    backgroundColor: inspectionStatus === "Accepted" ? "#d1fae5" : "#ffffff",
                    color: inspectionStatus === "Accepted" ? "#065f46" : "#475569",
                  }}
                >
                  ✓ ACCEPTED (Add to Inventory Stock)
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionStatus("Purchase Return")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    border: inspectionStatus === "Purchase Return" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                    backgroundColor: inspectionStatus === "Purchase Return" ? "#fee2e2" : "#ffffff",
                    color: inspectionStatus === "Purchase Return" ? "#991b1b" : "#475569",
                  }}
                >
                  ⚠ DAMAGED (Initiate Purchase Return)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Inspection Notes / Damage Description
              </label>
              <textarea
                rows={3}
                placeholder="Details of material condition or damage justification..."
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
                backgroundColor: inspectionStatus === "Accepted" ? "#059669" : "#dc2626",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Processing..." : inspectionStatus === "Accepted" ? "Accept Shipment & Add to Stock" : "Initiate Supplier Purchase Return"}
            </button>
          </form>
        </div>

        {/* Workflow Information */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Inspection Workflow Tags
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px", background: "#ffffff", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <strong style={{ color: "#1d4ed8", display: "block", fontSize: "14px" }}>🏷 Tag: Received & Under Inspection</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Shipment has arrived at warehouse bay. Physical quantity and fabric test parameters are under evaluation.
              </p>
            </div>

            <div style={{ padding: "14px", background: "#ffffff", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
              <strong style={{ color: "#047857", display: "block", fontSize: "14px" }}>🏷 Tag: Accepted</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Shipment passed quality check. Automatically added to available stock (`Materials.AvailableQty`).
              </p>
            </div>

            <div style={{ padding: "14px", background: "#ffffff", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#b91c1c", display: "block", fontSize: "14px" }}>🏷 Tag: Purchase Return</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Shipment damaged, defective, or incorrect spec. Goods rejected and returned to supplier. Stock is NOT incremented.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection History Table */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Recent Receiving & Inspection History
        </h2>

        {inspectionsLog.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No supplier inspection logs recorded in this session.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "8px" }}>Insp ID</th>
                <th style={{ padding: "8px" }}>Material</th>
                <th style={{ padding: "8px" }}>Quantity</th>
                <th style={{ padding: "8px" }}>Supplier</th>
                <th style={{ padding: "8px" }}>Status Tag</th>
                <th style={{ padding: "8px" }}>Inspector</th>
                <th style={{ padding: "8px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {inspectionsLog.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>{log.id}</td>
                  <td style={{ padding: "10px 8px", fontWeight: "600" }}>{log.materialName}</td>
                  <td style={{ padding: "10px 8px" }}>{log.quantity} pcs</td>
                  <td style={{ padding: "10px 8px" }}>{log.supplierName}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: log.status === "Accepted" ? "#d1fae5" : "#fee2e2",
                        color: log.status === "Accepted" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>{log.inspector}</td>
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
