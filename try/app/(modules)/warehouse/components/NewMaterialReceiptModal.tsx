"use client";

import React, { useState } from "react";
import "../styles/new-material-receipt-modal.css";

export interface ReceiptItemRow {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  uom: string;
  batchNo: string;
  location: string;
  qcPass: boolean;
}

export interface NewMaterialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessReceipt?: (data: {
    poNumber: string;
    notes: string;
    items: ReceiptItemRow[];
    isDraft?: boolean;
  }) => void;
}

export function NewMaterialReceiptModal({
  isOpen,
  onClose,
  onProcessReceipt,
}: NewMaterialReceiptModalProps) {
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItemRow[]>([
    {
      id: "row-1",
      sku: "RMP-402-A",
      description: "Polymer Resin Type B",
      quantity: 500,
      uom: "kg",
      batchNo: "B-2023-11-X",
      location: "F1 > R12 > S04",
      qcPass: true,
    },
    {
      id: "row-2",
      sku: "",
      description: "",
      quantity: 0,
      uom: "Select",
      batchNo: "",
      location: "Assign Location",
      qcPass: false,
    },
  ]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    const newRow: ReceiptItemRow = {
      id: `row-${Date.now()}`,
      sku: "",
      description: "",
      quantity: 0,
      uom: "Select",
      batchNo: "",
      location: "Assign Location",
      qcPass: false,
    };
    setItems((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ReceiptItemRow,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = (isDraft = false) => {
    if (onProcessReceipt) {
      onProcessReceipt({
        poNumber,
        notes,
        items,
        isDraft,
      });
    }
    onClose();
  };

  return (
    <div className="wh-receipt-modal-overlay">
      {/* Backdrop */}
      <div className="wh-receipt-backdrop" onClick={onClose} />

      {/* Modal Container Card */}
      <div className="wh-receipt-modal-card">
        {/* Header */}
        <header className="wh-receipt-header">
          <div className="wh-receipt-header-title">
            <h2>New Material Receipt</h2>
            <p>Intake and process new incoming shipments.</p>
          </div>
          <div className="wh-receipt-header-actions">
            <div className="wh-receipt-search-wrapper">
              <span className="material-symbols-outlined wh-receipt-search-icon">
                search
              </span>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Scan PO or Invoice Number"
                className="wh-receipt-search-input"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="wh-receipt-close-btn"
              title="Close Modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="wh-receipt-body">
          {/* Section: Material Entry Table */}
          <section>
            <div className="wh-receipt-section-header">
              <h3 className="wh-receipt-section-title">Material Entry</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="wh-receipt-add-row-btn"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Row
              </button>
            </div>

            <div className="wh-receipt-table-wrapper">
              <table className="wh-receipt-table">
                <thead>
                  <tr>
                    <th style={{ width: "36px", textAlign: "center" }}></th>
                    <th>SKU ID</th>
                    <th>Description</th>
                    <th style={{ width: "96px" }}>Recv Qty</th>
                    <th style={{ width: "96px" }}>UOM</th>
                    <th style={{ width: "160px" }}>Dye Lot / Batch</th>
                    <th style={{ width: "220px" }}>Location Assignment</th>
                    <th style={{ width: "96px", textAlign: "center" }}>QC Pass</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          title="Delete Row"
                          className="wh-receipt-del-btn"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => handleItemChange(row.id, "sku", e.target.value)}
                          placeholder="Enter SKU"
                          className="wh-receipt-table-input mono"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => handleItemChange(row.id, "description", e.target.value)}
                          placeholder="Enter Description"
                          className="wh-receipt-table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(
                              row.id,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          style={{ textAlign: "right" }}
                          className="wh-receipt-table-input mono"
                        />
                      </td>
                      <td>
                        <select
                          value={row.uom}
                          onChange={(e) => handleItemChange(row.id, "uom", e.target.value)}
                          className="wh-receipt-table-select"
                        >
                          <option value="Select">Select</option>
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                          <option value="Rolls">Rolls</option>
                          <option value="Units">Units</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.batchNo}
                          onChange={(e) => handleItemChange(row.id, "batchNo", e.target.value)}
                          placeholder="Batch No."
                          className="wh-receipt-table-input mono"
                        />
                      </td>
                      <td>
                        <div className="wh-receipt-loc-select-wrapper">
                          <select
                            value={row.location}
                            onChange={(e) => handleItemChange(row.id, "location", e.target.value)}
                            className="wh-receipt-loc-select"
                          >
                            <option value="Assign Location">Assign Location</option>
                            <option value="F1 > R12 > S04">F1 &gt; R12 &gt; S04</option>
                            <option value="F1 > R12 > S05">F1 &gt; R12 &gt; S05</option>
                            <option value="F2 > R03 > S01">F2 &gt; R03 &gt; S01</option>
                          </select>
                          <span className="material-symbols-outlined wh-receipt-loc-arrow">
                            expand_more
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <label className="wh-qc-toggle-label">
                          <input
                            type="checkbox"
                            checked={row.qcPass}
                            onChange={(e) => handleItemChange(row.id, "qcPass", e.target.checked)}
                            className="wh-qc-toggle-input"
                          />
                          <span className="wh-qc-toggle-slider" />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Supporting Docs & Notes */}
          <section className="wh-receipt-docs-grid">
            <div>
              <h3 className="wh-receipt-section-title" style={{ marginBottom: "16px" }}>
                Supporting Documentation
              </h3>
              <div className="wh-receipt-upload-box">
                <span className="material-symbols-outlined wh-receipt-upload-icon">
                  upload_file
                </span>
                <p className="wh-receipt-upload-title">Attach Delivery Note / Invoice</p>
                <p className="wh-receipt-upload-desc">
                  Drag and drop files here or click to browse
                </p>
                <p className="wh-receipt-upload-sub">
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>

            <div>
              <h3 className="wh-receipt-section-title" style={{ marginBottom: "16px" }}>
                Receipt Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any specific notes regarding carrier condition, missing items, or exceptions..."
                className="wh-receipt-notes-textarea"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="wh-receipt-footer">
          <button
            type="button"
            onClick={onClose}
            className="wh-receipt-cancel-btn"
          >
            Cancel
          </button>
          <div className="wh-receipt-footer-right">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="wh-receipt-draft-btn"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="wh-receipt-process-btn"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Process Receipt
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
