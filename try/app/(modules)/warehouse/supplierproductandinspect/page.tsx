"use client";

import React, { useState } from "react";
import "../styles/supplier-inspect.css";

/* ─── Types ─────────────────────────────────────────────── */
type POStatus = "AT DOCK" | "IN TRANSIT";

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

type RollStatus = "accepted" | "active" | "pending";

type Roll = {
  id: string;
  rollId: string;
  supplierTag: string;
  length: string;
  shadeMatch: string;
  defects: number;
  status: RollStatus;
};

/* ─── Mock Data ─────────────────────────────────────────── */
const PENDING_POS: PendingPO[] = [
  { id: "po-1", poNumber: "PO-9923", supplier: "Loom & Co. Textiles", status: "AT DOCK", date: "Today, 08:30 AM", quantity: "42 Rolls" },
  { id: "po-2", poNumber: "PO-9928", supplier: "Apex Trims Ltd", status: "IN TRANSIT", date: "Tomorrow", quantity: "120 Boxes" },
  { id: "po-3", poNumber: "PO-9915", supplier: "Global Threads", status: "IN TRANSIT", date: "Oct 24", quantity: "15 Pallets" },
];

const SHADE_OPTIONS = ["Pass (A Grade)", "Pass (B Grade)", "Fail (Variance)"];

const INITIAL_ROLLS: Roll[] = [
  { id: "r1", rollId: "R-001", supplierTag: "SUP-992-A1", length: "50.5", shadeMatch: "Pass (A Grade)", defects: 0, status: "accepted" },
  { id: "r2", rollId: "R-002", supplierTag: "SUP-992-A2", length: "49.8", shadeMatch: "Pass (A Grade)", defects: 1, status: "active" },
  { id: "r3", rollId: "R-003", supplierTag: "SUP-992-A3", length: "", shadeMatch: "Pending Scan", defects: 0, status: "pending" },
];

const MATERIALS: MaterialRow[] = [
  { sku: "FAB-COT-NAVY-01", description: "100% Cotton Twill - Navy Blue", expectedQty: 24, inspectedQty: 12 },
  { sku: "FAB-LIN-WHT-02", description: "Organic Linen - Off White", expectedQty: 18, inspectedQty: 0 },
];

/* ─── Component ─────────────────────────────────────────── */
export default function SupplierProductAndInspectPage() {
  const [selectedPO, setSelectedPO] = useState<PendingPO>(PENDING_POS[0]);
  const [rolls, setRolls] = useState<Roll[]>(INITIAL_ROLLS);

  const acceptedCount = rolls.filter((r) => r.status === "accepted").length;
  const rejectedCount = rolls.filter((r) => r.status === "rejected" as unknown as RollStatus).length;

  // Initiate Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
  ]);

  function updateRoll(id: string, patch: Partial<Roll>) {
    setRolls((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function acceptRoll(id: string) {
    updateRoll(id, { status: "accepted" });
    // Activate next pending roll
    setRolls((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const next = prev.find((r, i) => i > idx && r.status === "pending");
      if (!next) return prev;
      return prev.map((r) => (r.id === next.id ? { ...r, status: "active" } : r));
    });
  }

  function rejectRoll(id: string) {
    updateRoll(id, { status: "rejected" as unknown as RollStatus });
  }

  return (
    <main className="wh-si-main">

      {/* ── Left: Pending Receipts Queue ── */}
      <section className="wh-si-queue-panel">
        <div className="wh-si-queue-header">
          <h3 className="wh-si-queue-title">Pending Receipts</h3>
          <button className="wh-si-icon-btn" title="Filter">
            <span className="wh-si-icon">filter_list</span>
          </button>
        </div>

        <div className="wh-si-queue-list">
          {PENDING_POS.map((po) => (
            <div
              key={po.id}
              className={`wh-si-queue-item ${selectedPO.id === po.id ? "wh-si-queue-item-active" : ""}`}
              onClick={() => setSelectedPO(po)}
            >
              {selectedPO.id === po.id && <div className="wh-si-queue-active-bar" />}
              <div className={`wh-si-queue-item-top ${selectedPO.id === po.id ? "wh-si-queue-item-top-selected" : ""}`}>
                <div>
                  <div className={`wh-si-po-number ${selectedPO.id === po.id ? "wh-si-po-number-active" : "wh-si-po-number-muted"}`}>
                    {po.poNumber}
                  </div>
                  <div className="wh-si-supplier-name">{po.supplier}</div>
                </div>
                <div className={`wh-si-status-chip ${po.status === "AT DOCK" ? "wh-si-status-dock" : "wh-si-status-transit"}`}>
                  <span className={`wh-si-status-dot ${po.status === "AT DOCK" ? "wh-si-dot-dock" : "wh-si-dot-transit"}`} />
                  {po.status}
                </div>
              </div>
              <div className={`wh-si-queue-item-bottom ${selectedPO.id === po.id ? "wh-si-queue-item-top-selected" : ""}`}>
                <div className="wh-si-date-label">
                  <span className="wh-si-icon wh-si-icon-sm">calendar_today</span>
                  {po.date}
                </div>
                <div className="wh-si-qty-label">{po.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Right: Active Inspection Workspace ── */}
      <section className="wh-si-workspace">

        {/* Workspace Header */}
        <div className="wh-si-workspace-header">
          <div>
            <div className="wh-si-workspace-title-row">
              <h2 className="wh-si-workspace-po">{selectedPO.poNumber}</h2>
              <div className="wh-si-inspecting-badge">
                <span className="wh-si-pulse-dot" />
                <span className="wh-si-inspecting-label">INSPECTING</span>
              </div>
            </div>
            <p className="wh-si-workspace-subtitle">
              {selectedPO.supplier} &bull; Carrier: FastTrack Logistics &bull; Ref: BOL-44829
            </p>
          </div>
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
                  {MATERIALS.map((mat, idx) => (
                    <tr key={mat.sku} className={`wh-si-table-row ${idx < MATERIALS.length - 1 ? "wh-si-table-row-border" : ""}`}>
                      <td className="wh-si-td wh-si-td-mono">{mat.sku}</td>
                      <td className="wh-si-td">{mat.description}</td>
                      <td className="wh-si-td wh-si-td-mono wh-si-td-right">{mat.expectedQty} Rolls</td>
                      <td className={`wh-si-td wh-si-td-mono wh-si-td-right ${mat.inspectedQty > 0 ? "wh-si-inspected-active" : "wh-si-inspected-zero"}`}>
                        {mat.inspectedQty} / {mat.expectedQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roll-Level QC Grid */}
          <div className="wh-si-section">
            <div className="wh-si-roll-header">
              <h3 className="wh-si-section-title">
                Roll-Level Inspection:{" "}
                <span className="wh-si-roll-sku">FAB-COT-NAVY-01</span>
              </h3>
              <div className="wh-si-scan-chip">SCAN ROLL BARCODE</div>
            </div>

            <div className="wh-si-qc-grid-card">
              {/* Grid header */}
              <div className="wh-si-qc-grid-head">
                <div className="wh-si-col-label">Roll ID</div>
                <div className="wh-si-col-label">Supplier Tag</div>
                <div className="wh-si-col-label">Length (Meters)</div>
                <div className="wh-si-col-label">Shade Match</div>
                <div className="wh-si-col-label">Defects</div>
                <div className="wh-si-col-label wh-si-col-label-right">Action</div>
              </div>

              {/* Grid rows */}
              {rolls.map((roll) => (
                <div
                  key={roll.id}
                  className={`wh-si-qc-row
                    ${roll.status === "accepted" ? "wh-si-qc-row-accepted" : ""}
                    ${roll.status === "active" ? "wh-si-qc-row-active" : ""}
                    ${roll.status === "pending" ? "wh-si-qc-row-pending" : ""}
                    ${"rejected" === (roll.status as string) ? "wh-si-qc-row-rejected" : ""}
                  `}
                >
                  {/* Roll ID */}
                  <div className={`wh-si-td-mono
                    ${roll.status === "accepted" ? "wh-si-roll-id-accepted" : ""}
                    ${roll.status === "active" ? "wh-si-roll-id-active" : ""}
                    ${roll.status === "pending" ? "wh-si-roll-id-muted" : ""}
                  `}>
                    {roll.rollId}
                  </div>

                  {/* Supplier Tag */}
                  <div className="wh-si-supplier-tag">{roll.supplierTag}</div>

                  {/* Length input */}
                  <div>
                    <input
                      type="number"
                      className={`wh-si-cell-input ${roll.status === "active" ? "wh-si-cell-input-active" : "wh-si-cell-input-disabled"}`}
                      value={roll.length}
                      placeholder={roll.status === "pending" ? "--" : "0.0"}
                      disabled={roll.status !== "active"}
                      onChange={(e) => updateRoll(roll.id, { length: e.target.value })}
                    />
                  </div>

                  {/* Shade Match select */}
                  <div>
                    {roll.status === "active" ? (
                      <select
                        className="wh-si-cell-select wh-si-cell-select-active"
                        value={roll.shadeMatch}
                        onChange={(e) => updateRoll(roll.id, { shadeMatch: e.target.value })}
                      >
                        {SHADE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <select className="wh-si-cell-select wh-si-cell-select-disabled" disabled>
                        <option>{roll.status === "pending" ? "Pending Scan" : roll.shadeMatch}</option>
                      </select>
                    )}
                  </div>

                  {/* Defects counter */}
                  <div>
                    {roll.status === "active" ? (
                      <div className="wh-si-defect-counter">
                        <button
                          className="wh-si-defect-btn"
                          onClick={() => updateRoll(roll.id, { defects: Math.max(0, roll.defects - 1) })}
                        >−</button>
                        <input
                          type="text"
                          className="wh-si-defect-input"
                          value={roll.defects}
                          readOnly
                        />
                        <button
                          className="wh-si-defect-btn"
                          onClick={() => updateRoll(roll.id, { defects: roll.defects + 1 })}
                        >+</button>
                      </div>
                    ) : (
                      <div className="wh-si-defect-static">
                        <span className={`wh-si-td-mono ${roll.status === "pending" ? "wh-si-defect-muted" : ""}`}>
                          {roll.status === "pending" ? "--" : roll.defects}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="wh-si-action-col">
                    {roll.status === "accepted" && (
                      <span className="wh-si-accepted-tag">
                        <span className="wh-si-icon wh-si-icon-xs">check_circle</span>
                        ACCEPTED
                      </span>
                    )}
                    {(roll.status as string) === "rejected" && (
                      <span className="wh-si-rejected-tag">
                        <span className="wh-si-icon wh-si-icon-xs">cancel</span>
                        REJECTED
                      </span>
                    )}
                    {roll.status === "active" && (
                      <div className="wh-si-row-btns">
                        <button
                          className="wh-si-reject-btn"
                          title="Reject Roll"
                          onClick={() => rejectRoll(roll.id)}
                        >
                          <span className="wh-si-icon wh-si-icon-sm">close</span>
                        </button>
                        <button
                          className="wh-si-accept-btn"
                          title="Accept Roll"
                          onClick={() => acceptRoll(roll.id)}
                        >
                          <span className="wh-si-icon wh-si-icon-sm">check</span>
                        </button>
                      </div>
                    )}
                    {roll.status === "pending" && (
                      <span className="wh-si-waiting-tag">WAITING</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="wh-si-bottom-bar">
          <div className="wh-si-bottom-stats">
            <div className="wh-si-stat-text">
              Total Accepted:{" "}
              <span className="wh-si-stat-value wh-si-stat-primary">{acceptedCount}</span>
              {" "}/ {rolls.length}
            </div>
            <div className="wh-si-stat-divider" />
            <div className="wh-si-stat-text wh-si-stat-error">
              Total Rejected:{" "}
              <span className="wh-si-stat-value">{rejectedCount}</span>
            </div>
          </div>
          <div className="wh-si-bottom-btns">
            <button className="wh-si-btn-secondary">Save Progress</button>
            <button
              className="wh-si-btn-danger"
              onClick={() => setIsReturnModalOpen(true)}
            >
              Initiate Return ({rejectedCount})
            </button>
            <button className="wh-si-btn-primary">
              Complete Receipt
              <span className="wh-si-icon wh-si-icon-sm">arrow_forward</span>
            </button>
          </div>
        </div>
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
                      Record inspection failure for shipment {selectedPO.poNumber}
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

