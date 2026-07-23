"use client";

import React, { useState, useEffect } from "react";
import "../styles/warehouse-supplier.css";

export type ManageMaterialTermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  material?: {
    sku?: string;
    name?: string;
    leadTime?: string;
    moq?: string;
    unitPrice?: string;
  } | null;
  onUpdate?: (updatedTerms: any) => void;
  onRemove?: (sku: string) => void;
};

export function ManageMaterialTermsModal({
  isOpen,
  onClose,
  material,
  onUpdate,
  onRemove,
}: ManageMaterialTermsModalProps) {
  const [unitPrice, setUnitPrice] = useState("450.00");
  const [leadTime, setLeadTime] = useState("14");
  const [moq, setMoq] = useState("500");

  useEffect(() => {
    if (material) {
      if (material.unitPrice) {
        // Clean currency string to get raw number
        const rawPrice = material.unitPrice.replace(/[^0-9.]/g, "");
        setUnitPrice(rawPrice || "450.00");
      }
      if (material.leadTime) {
        const rawLead = material.leadTime.replace(/[^0-9]/g, "");
        setLeadTime(rawLead || "14");
      }
      if (material.moq) {
        const rawMoq = material.moq.replace(/[^0-9]/g, "");
        setMoq(rawMoq || "500");
      }
    }
  }, [material]);

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({
        sku: material?.sku || "FAB-COT-NVY-10",
        unitPrice: `Rs ${parseFloat(unitPrice || "0").toFixed(2)}/yd`,
        leadTime: `${leadTime}d`,
        moq: `${moq} yds`,
      });
    }
    onClose();
  };

  const handleRemove = () => {
    if (onRemove && material?.sku) {
      onRemove(material.sku);
    }
    onClose();
  };

  return (
    <div className="wh-mmt-modal-overlay">
      
      {/* ── STITCH DESIGN: MANAGE MATERIAL TERMS MODAL CONTAINER ── */}
      <div className="wh-mmt-modal-container">
        
        {/* Modal Header */}
        <div className="wh-mmt-modal-header">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg m-0">Manage Material Terms</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">
              {material?.name || "100% Cotton Twill - Heavyweight Navy"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 text-xl font-bold cursor-pointer"
            title="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body / High Density Form */}
        <form onSubmit={handleUpdate} className="wh-mmt-modal-form">
          <div className="wh-mmt-modal-body">
            
            {/* Unit Price Field */}
            <div className="flex flex-col">
              <label className="wh-mmt-modal-label" htmlFor="mmt-unit-price">
                Unit Price (Rs)
              </label>
              <div className="wh-mmt-modal-input-wrapper">
                <div className="wh-mmt-modal-accent-bar"></div>
                <input
                  id="mmt-unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="wh-mmt-modal-input pl-4"
                  required
                />
              </div>
            </div>

            {/* Lead Time Field */}
            <div className="flex flex-col">
              <label className="wh-mmt-modal-label" htmlFor="mmt-lead-time">
                Lead Time (Days)
              </label>
              <div className="wh-mmt-modal-input-wrapper">
                <div className="wh-mmt-modal-accent-bar"></div>
                <input
                  id="mmt-lead-time"
                  type="number"
                  step="1"
                  min="1"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  className="wh-mmt-modal-input pl-4"
                  required
                />
              </div>
            </div>

            {/* MOQ Field */}
            <div className="flex flex-col">
              <label className="wh-mmt-modal-label" htmlFor="mmt-moq">
                MOQ (Units)
              </label>
              <div className="wh-mmt-modal-input-wrapper">
                <div className="wh-mmt-modal-accent-bar"></div>
                <input
                  id="mmt-moq"
                  type="number"
                  step="1"
                  min="1"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  className="wh-mmt-modal-input pl-4"
                  required
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="wh-mmt-modal-footer">
            <button
              type="submit"
              className="wh-mmt-modal-btn-update"
            >
              Update Terms
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="wh-mmt-modal-btn-remove"
            >
              Remove Mapping
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
