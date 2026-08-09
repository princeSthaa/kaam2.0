import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/warehouse-purchaseorder.css";

export type POStatus =
  | "Sent"
  | "Draft"
  | "Partially Received"
  | "Completed"
  | "Cancelled"
  | "Pending"
  | "Delivered";

export type PurchaseOrderActionsMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
  id: string;
  poId: string;
  status: POStatus;
  onViewDetails?: (id: string) => void;
  onEditDraft?: (id: string) => void;
  onSendToSupplier?: (id: string) => void;
  onMarkReceived?: (id: string) => void;
  onDuplicatePO?: (id: string) => void;
  onCancelPO?: (id: string) => void;
  onDownloadPDF?: (id: string) => void;
};

export function PurchaseOrderActionsMenu({
  isOpen,
  onClose,
  anchorRef,
  id,
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
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Check if clicked on the trigger button to avoid immediate toggle off
      if (anchorRef?.current && anchorRef.current.contains(e.target as Node)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use capture phase to handle it before bubbling
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle scroll to reposition or close
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
      onClose(); // Alternatively, recalculate coords
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Status-aware actions visibility
  const canEdit = status === "Draft" || status === "Pending";
  const canSend = status === "Draft" || status === "Pending";
  const canMarkReceived = status === "Sent" || status === "Partially Received" || status === "Pending";
  const canCancel = status === "Draft" || status === "Sent" || status === "Pending";

  const handleAction = (e: React.MouseEvent, fn?: (id: string) => void) => {
    e.stopPropagation();
    if (fn) fn(id);
    onClose();
  };

  const menuContent = (
    /* ── STITCH DESIGN: PURCHASE ORDER ACTIONS MENU (.wh-poam-*) ── */
    <div ref={menuRef} className="wh-poam-menu" style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}>

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
        onClick={(e) => handleAction(e, onViewDetails)}
        title="View purchase order details"
      >
        <span className="material-symbols-outlined wh-poam-item-icon">visibility</span>
        <span className="wh-poam-item-label">View Details</span>
      </button>

      {/* Action: Edit Draft (only for Draft POs) */}
      {canEdit && (
        <button
          className="wh-poam-item"
          onClick={(e) => handleAction(e, onEditDraft)}
          title="Edit this draft purchase order"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">edit</span>
          <span className="wh-poam-item-label">Edit Draft</span>
        </button>
      )}

      {/* Action: Send to Supplier (only for Draft POs) */}
      {canSend && (
        <button
          className="wh-poam-item"
          onClick={(e) => handleAction(e, onSendToSupplier)}
          title="Mark PO as sent to supplier"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">send</span>
          <span className="wh-poam-item-label">Mark as Sent</span>
        </button>
      )}

      {/* Action: Mark as Received */}
      {canMarkReceived && (
        <button
          className="wh-poam-item"
          onClick={(e) => handleAction(e, onMarkReceived)}
          title="Log items received for this PO"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">inventory_2</span>
          <span className="wh-poam-item-label">Mark as Delivered/Completed</span>
        </button>
      )}

      {/* Action: Download PDF (always visible) */}
      <button
        className="wh-poam-item"
        onClick={(e) => handleAction(e, onDownloadPDF)}
        title="Download PO as PDF"
      >
        <span className="material-symbols-outlined wh-poam-item-icon">download</span>
        <span className="wh-poam-item-label">Download PDF</span>
      </button>

      {/* Action: Duplicate PO (always visible) */}
      <button
        className="wh-poam-item"
        onClick={(e) => handleAction(e, onDuplicatePO)}
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
          onClick={(e) => handleAction(e, onCancelPO)}
          title="Cancel this purchase order"
        >
          <span className="material-symbols-outlined wh-poam-item-icon">cancel</span>
          <span className="wh-poam-item-label">Cancel PO</span>
        </button>
      )}

    </div>
  );

  return typeof document !== "undefined" ? createPortal(menuContent, document.body) : null;
}
