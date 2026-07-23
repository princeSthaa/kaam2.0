"use client";

import React, { useEffect, useRef } from "react";
import "../styles/warehouse-purchaseorder.css";

export type POStatus =
  | "Sent"
  | "Draft"
  | "Partially Received"
  | "Completed"
  | "Cancelled";

export type PurchaseOrderActionsMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
  poId: string;
  status: POStatus;
  onViewDetails?: (poId: string) => void;
  onEditDraft?: (poId: string) => void;
  onSendToSupplier?: (poId: string) => void;
  onMarkReceived?: (poId: string) => void;
  onDuplicatePO?: (poId: string) => void;
  onCancelPO?: (poId: string) => void;
  onDownloadPDF?: (poId: string) => void;
};

export function PurchaseOrderActionsMenu({
  isOpen,
  onClose,
  poId,
  status,
  onViewDetails,
  onEditDraft,
  onSendToSupplier,
  onMarkReceived,
  onDuplicatePO,
  onCancelPO,
  onDownloadPDF,
}: PurchaseOrderActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Status-aware actions visibility
  const canEdit = status === "Draft";
  const canSend = status === "Draft";
  const canMarkReceived = status === "Sent" || status === "Partially Received";
  const canCancel = status === "Draft" || status === "Sent";

  const handleAction = (fn?: (poId: string) => void) => {
    if (fn) fn(poId);
    onClose();
  };

  return (
    /* ── STITCH DESIGN: PURCHASE ORDER ACTIONS MENU (.wh-poam-*) ── */
    <div ref={menuRef} className="wh-poam-menu">

      {/* Menu Header: PO Identifier */}
      <div className="wh-poam-menu-header">
        <span className="material-symbols-outlined text-[16px] text-slate-400">receipt_long</span>
        <span className="wh-poam-menu-po-id">{poId}</span>
      </div>

      {/* Divider */}
      <div className="wh-poam-divider" />

      {/* Action: View Details (always visible) */}
      <button
        className="wh-poam-item"
        onClick={() => handleAction(onViewDetails)}
        title="View purchase order details"
      >
        <span className="material-symbols-outlined wh-poam-item-icon">visibility</span>
        <span className="wh-poam-item-label">View Details</span>
      </button>

      {/* Action: Edit Draft (only for Draft POs) */}
      {canEdit && (
        <button
          className="wh-poam-item"
          onClick={() => handleAction(onEditDraft)}
          title="Edit this draft purchase order"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">edit</span>
          <span className="wh-poam-item-label">Edit Draft</span>
        </button>
      )}

      {/* Action: Send to Supplier (only for Draft POs) */}
      {canSend && (
        <button
          className="wh-poam-item wh-poam-item-primary"
          onClick={() => handleAction(onSendToSupplier)}
          title="Send this PO to the supplier"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">send</span>
          <span className="wh-poam-item-label">Send to Supplier</span>
        </button>
      )}

      {/* Action: Mark as Received (for Sent or Partially Received) */}
      {canMarkReceived && (
        <button
          className="wh-poam-item wh-poam-item-success"
          onClick={() => handleAction(onMarkReceived)}
          title="Mark this PO as fully received"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">inventory</span>
          <span className="wh-poam-item-label">Mark as Received</span>
        </button>
      )}

      {/* Action: Download PDF (always visible) */}
      <button
        className="wh-poam-item"
        onClick={() => handleAction(onDownloadPDF)}
        title="Download PO as PDF"
      >
        <span className="material-symbols-outlined wh-poam-item-icon">download</span>
        <span className="wh-poam-item-label">Download PDF</span>
      </button>

      {/* Action: Duplicate PO (always visible) */}
      <button
        className="wh-poam-item"
        onClick={() => handleAction(onDuplicatePO)}
        title="Duplicate this purchase order"
      >
        <span className="material-symbols-outlined wh-poam-item-icon">content_copy</span>
        <span className="wh-poam-item-label">Duplicate PO</span>
      </button>

      {/* Divider before destructive action */}
      {canCancel && <div className="wh-poam-divider" />}

      {/* Action: Cancel PO (for Draft or Sent POs) */}
      {canCancel && (
        <button
          className="wh-poam-item wh-poam-item-danger"
          onClick={() => handleAction(onCancelPO)}
          title="Cancel this purchase order"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">cancel</span>
          <span className="wh-poam-item-label">Cancel PO</span>
        </button>
      )}

    </div>
  );
}
