"use client";

import React, { useState, useEffect } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";

export default function FinishedGoodsAndSalesDispatchPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab active state
  const [activeTab, setActiveTab] = useState<"accept" | "sale">("accept");

  // Accept Form State
  const [acceptProductId, setAcceptProductId] = useState("");
  const [acceptProductName, setAcceptProductName] = useState("");
  const [acceptQuantity, setAcceptQuantity] = useState("");
  const [sourceFactoryLine, setSourceFactoryLine] = useState("Factory Stitching Line 1");
  const [location, setLocation] = useState("Central Warehouse Rack A");

  // Sale Form State
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [saleNotes, setSaleNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Activity Log
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:5083/api/product");
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const prod = products.find((p) => p.id === acceptProductId);
    const productName = prod ? prod.productName || prod.name : acceptProductName || "Garment Product";

    const qtyNum = Number(acceptQuantity);
    if (!acceptQuantity || qtyNum <= 0) {
      setMessage({ type: "error", text: "Please enter valid quantity of finished goods." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/warehouse/accept-finished-goods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: acceptProductId || "CUSTOM",
          productName,
          quantity: qtyNum,
          sourceFactoryLine,
          location,
          acceptedBy: "Warehouse Supervisor",
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.message || "Failed to accept finished goods.");

      setMessage({ type: "success", text: resData.message });

      setActivityLogs((prev) => [
        {
          id: `ACC-${Date.now().toString().slice(-4)}`,
          type: "Acceptance",
          item: productName,
          quantity: qtyNum,
          sourceDest: sourceFactoryLine,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setAcceptProductId("");
      setAcceptProductName("");
      setAcceptQuantity("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error accepting finished goods." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const prod = products.find((p) => p.id === saleProductId);
    const productName = prod ? prod.productName || prod.name : "Garment Product";

    const qtyNum = Number(saleQuantity);
    if (!saleQuantity || qtyNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid sale quantity." });
      return;
    }

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Please enter customer name." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5083/api/warehouse/initiate-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: saleProductId || "CUSTOM",
          productName,
          quantity: qtyNum,
          customerName: customerName.trim(),
          orderNumber: orderNumber.trim() || `ORD-${Date.now().toString().slice(-5)}`,
          notes: saleNotes,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.message || "Failed to initiate product sale dispatch.");

      setMessage({ type: "success", text: resData.message });

      setActivityLogs((prev) => [
        {
          id: `SALE-${Date.now().toString().slice(-4)}`,
          type: "Sales Dispatch",
          item: productName,
          quantity: qtyNum,
          sourceDest: `Customer: ${customerName}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setSaleProductId("");
      setSaleQuantity("");
      setCustomerName("");
      setOrderNumber("");
      setSaleNotes("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error initiating sales dispatch." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="warehouse-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WarehousePageHeader
        title="Finished Goods & Sales Dispatch"
        subtitle="Accept completed garments from the factory floor into warehouse storage, and initiate product sales dispatch to customers."
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("accept")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            border: "none",
            backgroundColor: activeTab === "accept" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "accept" ? "#ffffff" : "#475569",
          }}
        >
          📦 1. Accept Finished Goods from Factory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sale")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            border: "none",
            backgroundColor: activeTab === "sale" ? "#059669" : "#e2e8f0",
            color: activeTab === "sale" ? "#ffffff" : "#475569",
          }}
        >
          🚀 2. Initiate Product Sale to Customer
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Form Column */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {activeTab === "accept" ? (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
                Accept Finished Goods Handover
              </h2>

              <form onSubmit={handleAcceptSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Select Finished Product
                  </label>
                  <select
                    className="form-select"
                    value={acceptProductId}
                    onChange={(e) => setAcceptProductId(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName || p.name} ({p.sku || p.category})
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom Finished Product</option>
                  </select>
                </div>

                {acceptProductId === "CUSTOM" && (
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Slim Fit Denim Jacket"
                      value={acceptProductName}
                      onChange={(e) => setAcceptProductName(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Quantity Received *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={acceptQuantity}
                      onChange={(e) => setAcceptQuantity(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Source Factory Line
                    </label>
                    <input
                      type="text"
                      value={sourceFactoryLine}
                      onChange={(e) => setSourceFactoryLine(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Target Warehouse Rack / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                  {submitting ? "Accepting..." : "Accept Garments into Warehouse Stock"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
                Initiate Product Sales Dispatch
              </h2>

              <form onSubmit={handleSaleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Select Finished Product to Dispatch *
                  </label>
                  <select
                    className="form-select"
                    value={saleProductId}
                    onChange={(e) => setSaleProductId(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Dispatch Quantity *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu Apparel Outlets"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Order / Invoice Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-98213"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Dispatch Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Shipping details or customer delivery notes..."
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
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
                  {submitting ? "Processing Sales..." : "Dispatch Product Sale to Customer"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Finished Goods Catalog Overview */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
            Finished Goods Catalog
          </h2>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: "#64748b" }}>No finished products found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {products.map((p) => (
                <div
                  key={p.id}
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
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>{p.productName || p.name}</strong>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                      SKU: {p.sku || p.id} | Price: NPR {p.price || "N/A"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("sale");
                      setSaleProductId(p.id);
                      setSaleQuantity("10");
                    }}
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#059669",
                      background: "#e0f2fe",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Initiate Sale
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>
          Recent Dispatch & Acceptance Activity Log
        </h2>

        {activityLogs.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No recent handover or sales dispatch activity logged in this session.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "8px" }}>Log ID</th>
                <th style={{ padding: "8px" }}>Activity</th>
                <th style={{ padding: "8px" }}>Product</th>
                <th style={{ padding: "8px" }}>Quantity</th>
                <th style={{ padding: "8px" }}>Source / Customer</th>
                <th style={{ padding: "8px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px", fontFamily: "monospace" }}>{log.id}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: log.type === "Acceptance" ? "#dbeafe" : "#d1fae5",
                        color: log.type === "Acceptance" ? "#1e40af" : "#065f46",
                      }}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", fontWeight: "600" }}>{log.item}</td>
                  <td style={{ padding: "10px 8px" }}>{log.quantity} pcs</td>
                  <td style={{ padding: "10px 8px" }}>{log.sourceDest}</td>
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
