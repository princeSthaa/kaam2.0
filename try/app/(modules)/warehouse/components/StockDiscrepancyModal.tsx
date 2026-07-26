"use client";

import React, { useState, useEffect } from "react";
import "../styles/stock-discrepancy-modal.css";

export interface StockDiscrepancyItem {
  id: string;
  sku: string;
  name: string;
  location: string;
  systemExpected: number;
  physicalCount: number;
  variance: number;
  action: string; // "Select...", "Confirm Count", "Report Lost", "Re-route"
}

export interface StockDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatchResolutions?: (resolutions: Record<string, string>, notes: string) => void;
}

const DEFAULT_DISCREPANCY_ITEMS: StockDiscrepancyItem[] = [
  { id: "disc-1", sku: "TWL-NAV-100C", name: "100% Cotton Twill - Navy", location: "A4 • 02", systemExpected: 450, physicalCount: 410, variance: -40, action: "" },
  { id: "disc-2", sku: "BTN-PLST-50MM", name: "Plastic Buttons 50mm", location: "B1 • 12", systemExpected: 1200, physicalCount: 800, variance: -400, action: "" },
  { id: "disc-3", sku: "THD-COT-WHT-500", name: "Cotton Thread Spool - White", location: "C3 • 01", systemExpected: 500, physicalCount: 480, variance: -20, action: "" },
  { id: "disc-4", sku: "ZIP-MET-BLK-18", name: "Metal Zipper 18\" - Black", location: "D2 • 05", systemExpected: 300, physicalCount: 250, variance: -50, action: "" },
  { id: "disc-5", sku: "FAB-DEN-IND-14", name: "Indigo Denim Fabric 14oz", location: "A1 • 04", systemExpected: 650, physicalCount: 600, variance: -50, action: "" },
  { id: "disc-6", sku: "LBL-WVN-SIZ-M", name: "Woven Size Label - Medium", location: "E1 • 09", systemExpected: 2500, physicalCount: 2400, variance: -100, action: "" },
  { id: "disc-7", sku: "ELAS-WHT-25MM", name: "Elastic Band 25mm - White", location: "B4 • 03", systemExpected: 800, physicalCount: 750, variance: -50, action: "" },
  { id: "disc-8", sku: "LIN-POLY-BLK-01", name: "Poly Lining Fabric - Black", location: "A3 • 07", systemExpected: 400, physicalCount: 380, variance: -20, action: "" },
  { id: "disc-9", sku: "RVT-BRS-05MM", name: "Brass Rivets 5mm", location: "D1 • 11", systemExpected: 5000, physicalCount: 4700, variance: -300, action: "" },
  { id: "disc-10", sku: "TAP-BIAS-BEG-12", name: "Bias Tape 12mm - Beige", location: "C2 • 06", systemExpected: 1500, physicalCount: 1420, variance: -80, action: "" },
  { id: "disc-11", sku: "THD-POLY-NAV-1000", name: "Poly Thread 1000m - Navy", location: "C3 • 04", systemExpected: 350, physicalCount: 310, variance: -40, action: "" },
  { id: "disc-12", sku: "BTN-WOOD-20MM", name: "Wooden Coat Buttons 20mm", location: "B2 • 08", systemExpected: 900, physicalCount: 850, variance: -50, action: "" },
];

export function StockDiscrepancyModal({
  isOpen,
  onClose,
  onSaveBatchResolutions,
}: StockDiscrepancyModalProps) {
  const [items, setItems] = useState<StockDiscrepancyItem[]>(DEFAULT_DISCREPANCY_ITEMS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [checkedRequirements, setCheckedRequirements] = useState<string[]>(["req-1"]);
  const [batchNotes, setBatchNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setItems(DEFAULT_DISCREPANCY_ITEMS);
      setSelectedIds([]);
      setBulkAction("");
      setBatchNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it.id));
    }
  };

  // Individual item action update
  const handleItemActionChange = (id: string, actionVal: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, action: actionVal } : it))
    );
  };

  // Bulk action update
  const handleApplyBulkAction = (actionVal: string) => {
    setBulkAction(actionVal);
    if (!actionVal) return;
    setItems((prev) =>
      prev.map((it) =>
        selectedIds.length === 0 || selectedIds.includes(it.id)
          ? { ...it, action: actionVal }
          : it
      )
    );
  };

  // Check Requirement toggle
  const toggleRequirement = (reqId: string) => {
    setCheckedRequirements((prev) =>
      prev.includes(reqId)
        ? prev.filter((r) => r !== reqId)
        : [...prev, reqId]
    );
  };

  // Resolved count
  const resolvedCount = items.filter((it) => it.action && it.action !== "Select...").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBatchResolutions) {
      const resMap: Record<string, string> = {};
      items.forEach((it) => {
        resMap[it.id] = it.action || "Pending";
      });
      onSaveBatchResolutions(resMap, batchNotes);
    }
    onClose();
  };

  return (
    <div className="wh-discrepancy-modal-overlay">
      <div className="wh-modal-backdrop" onClick={onClose} />

      <div className="wh-discrepancy-multi-card">
        {/* Header */}
        <header className="wh-multi-header">
          <div className="wh-multi-header-left">
            <div className="wh-warning-badge">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <div>
              <h2>Review Immediately</h2>
              <p>Multiple Stock Discrepancies Detected ({items.length} Items)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="wh-close-btn" title="Close Modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Main Two-Column View */}
          <main className="wh-multi-main">

            {/* Left Column: Discrepancy List */}
            <div className="wh-multi-left-col">
              {/* Toolbar */}
              <div className="wh-list-toolbar">
                <h3>Discrepancy List</h3>
                <div className="wh-bulk-action-wrapper">
                  <span>Bulk Action:</span>
                  <select
                    value={bulkAction}
                    onChange={(e) => handleApplyBulkAction(e.target.value)}
                    className="wh-bulk-select"
                  >
                    <option value="">Select action...</option>
                    <option value="Confirm Count">Confirm Physical Count</option>
                    <option value="Report Lost">Report as Lost/Damaged</option>
                    <option value="Re-route">Re-route from Surplus</option>
                  </select>
                </div>
              </div>

              {/* Table Container */}
              <div className="wh-table-container">
                <table className="wh-multi-table">
                  <thead>
                    <tr>
                      <th style={{ width: "36px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === items.length && items.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th>SKU &amp; Product</th>
                      <th>Location</th>
                      <th>Sys vs Phys</th>
                      <th>Variance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isAlert = Math.abs(item.variance) >= 100;
                      return (
                        <tr key={item.id} className={isAlert ? "wh-row-alert" : ""}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td>
                            <div className="wh-sku-code">{item.sku}</div>
                            <div className="wh-product-name-sub" title={item.name}>
                              {item.name}
                            </div>
                          </td>
                          <td>
                            <div className="wh-loc-tag">
                              <span className="material-symbols-outlined text-[16px]">shelves</span>
                              <span>{item.location}</span>
                            </div>
                          </td>
                          <td>
                            <div className="wh-count-comparison">
                              <span className="wh-sys-count">{item.systemExpected}</span>
                              <span className="material-symbols-outlined text-[14px] text-slate-400">
                                arrow_forward
                              </span>
                              <span className="wh-phys-count">{item.physicalCount}</span>
                            </div>
                          </td>
                          <td>
                            <span className="wh-variance-badge">
                              {item.variance > 0 ? `+${item.variance}` : item.variance}
                            </span>
                          </td>
                          <td>
                            <select
                              value={item.action}
                              onChange={(e) => handleItemActionChange(item.id, e.target.value)}
                              className="wh-row-action-select"
                            >
                              <option value="">Select...</option>
                              <option value="Confirm Count">Confirm Count</option>
                              <option value="Report Lost">Report Lost</option>
                              <option value="Re-route">Re-route</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: General Requirements & Notes */}
            <div className="wh-multi-right-col">
              <section>
                <div className="wh-req-header">
                  <span className="material-symbols-outlined">task_alt</span>
                  <h3>Batch Requirements</h3>
                </div>
                <div className="wh-req-list">
                  <label className="wh-req-item">
                    <input
                      type="checkbox"
                      checked={checkedRequirements.includes("req-1")}
                      onChange={() => toggleRequirement("req-1")}
                    />
                    <div>
                      <p className="wh-req-title">Verify Floor Locations</p>
                      <p className="wh-req-desc">Check adjacent bins for all flagged SKUs.</p>
                    </div>
                  </label>

                  <label className="wh-req-item">
                    <input
                      type="checkbox"
                      checked={checkedRequirements.includes("req-2")}
                      onChange={() => toggleRequirement("req-2")}
                    />
                    <div>
                      <p className="wh-req-title">Check Shift Logs</p>
                      <p className="wh-req-desc">Ensure no unrecorded batch picks occurred.</p>
                    </div>
                  </label>
                </div>
              </section>

              <section className="wh-batch-notes-section">
                <h3>Batch Notes</h3>
                <div className="wh-batch-textarea-wrapper">
                  <label>NOTES</label>
                  <textarea
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="Enter batch findings or exceptions here..."
                  />
                </div>
              </section>
            </div>
          </main>

          {/* Footer Actions */}
          <footer className="wh-multi-footer">
            <div className="wh-resolved-counter">
              <strong>{resolvedCount}/{items.length}</strong> items resolved
            </div>
            <div className="wh-footer-btns">
              <button type="button" onClick={onClose} className="wh-multi-cancel-btn">
                Cancel
              </button>
              <button
                type="submit"
                className="wh-multi-save-btn"
                disabled={resolvedCount === 0}
              >
                <span className="material-symbols-outlined">save_as</span>
                Save Batch Resolutions
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}