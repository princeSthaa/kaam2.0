"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";

export default function SupplierPurchaseDemandPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [customMaterialName, setCustomMaterialName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [requestedBy, setRequestedBy] = useState("Warehouse Manager");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Recent requests state
  const [requests, setRequests] = useState<any[]>([]);

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

    if (!quantity || Number(quantity) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid requested quantity greater than 0." });
      return;
    }

    if (!supplierName.trim()) {
      setMessage({ type: "error", text: "Please specify the target supplier name." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/material/request-supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          materialName,
          requestedQuantity: Number(quantity),
          supplierName: supplierName.trim(),
          urgency,
          requiredDate: requiredDate ? new Date(requiredDate).toISOString() : null,
          notes,
          requestedBy,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit purchase demand.");
      }

      setMessage({ type: "success", text: `Successfully requested ${quantity} units of ${materialName} from ${supplierName}.` });

      // Add to local recent requests table
      setRequests((prev) => [
        {
          id: `REQ-${Date.now().toString().slice(-4)}`,
          materialName,
          quantity,
          supplierName,
          urgency,
          date: new Date().toLocaleDateString(),
          status: "Requested",
        },
        ...prev,
      ]);

      // Reset form
      setSelectedMaterialId("");
      setCustomMaterialName("");
      setQuantity("");
      setSupplierName("");
      setNotes("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error submitting request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="warehouse-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WarehousePageHeader
        title="Purchase Demand / Supplier Request"
        subtitle="Request raw materials from external suppliers when stock is unavailable or short in the warehouse."
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
        {/* Form Card */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            New Supplier Request
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Select Raw Material
              </label>
              <select
                className="form-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="">-- Choose Material --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.materialCode || m.type}) - Available: {m.availableQty} {m.unit}
                  </option>
                ))}
                <option value="CUSTOM">+ Custom / Unlisted Material</option>
              </select>
            </div>

            {selectedMaterialId === "CUSTOM" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Custom Material Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy Duty Zipper 12inch"
                  value={customMaterialName}
                  onChange={(e) => setCustomMaterialName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Requested Quantity *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Target Supplier *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Everest Fabrics Pvt Ltd"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent / Critical">Urgent / Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Required Date
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Notes / Procurement Reasons
              </label>
              <textarea
                rows={3}
                placeholder="Reason for supplier demand request..."
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
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting Request..." : "Submit Supplier Purchase Demand"}
            </button>
          </form>
        </div>

        {/* Low Stock Overview Card */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Low Stock & Shortage Items
          </h2>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading materials...</p>
          ) : materials.length === 0 ? (
            <p style={{ color: "#64748b" }}>No raw materials found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {materials.map((m) => {
                const isLow = Number(m.availableQty) < 100;
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: "12px 16px",
                      background: "#ffffff",
                      borderRadius: "8px",
                      border: `1px solid ${isLow ? "#fecaca" : "#e2e8f0"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>{m.name}</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Code: {m.materialCode || m.id}</span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: isLow ? "#fee2e2" : "#e0f2fe",
                          color: isLow ? "#991b1b" : "#0369a1",
                        }}
                      >
                        {m.availableQty} {m.unit} Available
                      </span>
                      {isLow && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMaterialId(m.id);
                            setQuantity("500");
                          }}
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "11px",
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Request Supplier
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Supplier Requests Log */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Recent Supplier Requests
        </h2>

        {requests.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No recent requests submitted in this session.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "8px" }}>Req ID</th>
                <th style={{ padding: "8px" }}>Material</th>
                <th style={{ padding: "8px" }}>Quantity</th>
                <th style={{ padding: "8px" }}>Supplier</th>
                <th style={{ padding: "8px" }}>Urgency</th>
                <th style={{ padding: "8px" }}>Date</th>
                <th style={{ padding: "8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>{r.id}</td>
                  <td style={{ padding: "10px 8px", fontWeight: "600" }}>{r.materialName}</td>
                  <td style={{ padding: "10px 8px" }}>{r.quantity} pcs</td>
                  <td style={{ padding: "10px 8px" }}>{r.supplierName}</td>
                  <td style={{ padding: "10px 8px" }}>{r.urgency}</td>
                  <td style={{ padding: "10px 8px" }}>{r.date}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: "600" }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
