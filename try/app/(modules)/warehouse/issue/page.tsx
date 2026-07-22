"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";

export default function IssueMaterialToFactoryPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [issueQuantity, setIssueQuantity] = useState("");
  const [targetDestination, setTargetDestination] = useState("Factory Assembly Line 1");
  const [issuedTo, setIssuedTo] = useState("Factory Supervisor");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Recent issuances log
  const [issuanceLog, setIssuanceLog] = useState<any[]>([]);

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

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedMaterialId) {
      setMessage({ type: "error", text: "Please select a material to issue." });
      return;
    }

    const qtyNum = Number(issueQuantity);
    if (!issueQuantity || qtyNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid issue quantity greater than 0." });
      return;
    }

    if (selectedMaterial && qtyNum > Number(selectedMaterial.availableQty)) {
      setMessage({
        type: "error",
        text: `Cannot issue ${qtyNum} ${selectedMaterial.unit}. Insufficient stock (Available: ${selectedMaterial.availableQty} ${selectedMaterial.unit}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/material/issue-factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterialId,
          issueQuantity: qtyNum,
          targetDestination,
          issuedTo,
          notes,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Failed to issue material to factory.");
      }

      setMessage({
        type: "success",
        text: resData.message || `Issued ${qtyNum} units to ${targetDestination}.`,
      });

      // Update local material state
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === selectedMaterialId
            ? { ...m, availableQty: resData.remainingQty !== undefined ? resData.remainingQty : m.availableQty - qtyNum }
            : m
        )
      );

      // Add to issuance log
      setIssuanceLog((prev) => [
        {
          id: `ISS-${Date.now().toString().slice(-4)}`,
          materialName: selectedMaterial ? selectedMaterial.name : "Material",
          quantity: qtyNum,
          unit: selectedMaterial ? selectedMaterial.unit : "pcs",
          destination: targetDestination,
          issuedTo,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      // Reset form
      setSelectedMaterialId("");
      setIssueQuantity("");
      setNotes("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error issuing material." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="warehouse-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WarehousePageHeader
        title="Issue Material to Factory"
        subtitle="Transfer raw materials from warehouse stock directly to production lines / factory floor."
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
        {/* Issue Form */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Issue Material Form
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Select Raw Material *
              </label>
              <select
                className="form-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="">-- Select Material from Stock --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.materialCode || m.type}) — Available: {m.availableQty} {m.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f0f9ff",
                  borderRadius: "6px",
                  border: "1px solid #bae6fd",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#0369a1",
                }}
              >
                <strong>{selectedMaterial.name}</strong> — Current Stock: <strong>{selectedMaterial.availableQty} {selectedMaterial.unit}</strong> (Cost per unit: NPR {selectedMaterial.costPerUnit})
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Quantity to Issue *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={issueQuantity}
                  onChange={(e) => setIssueQuantity(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Destination Factory / Line *
                </label>
                <select
                  value={targetDestination}
                  onChange={(e) => setTargetDestination(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                >
                  <option value="Factory Assembly Line 1">Factory Assembly Line 1</option>
                  <option value="Cutting Section">Cutting Section</option>
                  <option value="Stitching Floor">Stitching Floor</option>
                  <option value="Finishing & Packaging">Finishing & Packaging</option>
                  <option value="Main Garment Factory">Main Garment Factory</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Issued To / Receiver Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ram Bahadur (Factory Supervisor)"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Notes / Reference Production Batch
              </label>
              <textarea
                rows={3}
                placeholder="Production plan ID or job order reference..."
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
                backgroundColor: "#059669",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Processing Issue..." : "Deduct Stock & Issue to Factory"}
            </button>
          </form>
        </div>

        {/* Warehouse Stock Overview */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Warehouse Material Stock
          </h2>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading stock...</p>
          ) : materials.length === 0 ? (
            <p style={{ color: "#64748b" }}>No stock items available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {materials.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "12px 16px",
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>{m.name}</strong>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                      Type: {m.type} | Code: {m.materialCode || m.id}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>
                      {m.availableQty} {m.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterialId(m.id);
                        setIssueQuantity("50");
                      }}
                      style={{
                        display: "block",
                        marginTop: "2px",
                        fontSize: "11px",
                        color: "#059669",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Quick Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Issuances */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Recent Material Issuances
        </h2>

        {issuanceLog.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No material issuances logged in this session.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "8px" }}>Issue ID</th>
                <th style={{ padding: "8px" }}>Material</th>
                <th style={{ padding: "8px" }}>Issued Quantity</th>
                <th style={{ padding: "8px" }}>Destination</th>
                <th style={{ padding: "8px" }}>Issued To</th>
                <th style={{ padding: "8px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {issuanceLog.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>{log.id}</td>
                  <td style={{ padding: "10px 8px", fontWeight: "600" }}>{log.materialName}</td>
                  <td style={{ padding: "10px 8px", color: "#059669", fontWeight: "700" }}>
                    -{log.quantity} {log.unit}
                  </td>
                  <td style={{ padding: "10px 8px" }}>{log.destination}</td>
                  <td style={{ padding: "10px 8px" }}>{log.issuedTo}</td>
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
