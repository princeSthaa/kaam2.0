"use client";

import React, { useState } from "react";
import "../styles/warehouse-supplier.css";

export type AddMaterialToSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supplierName?: string;
  onSuccess?: (materialData: any) => void;
};

export function AddMaterialToSupplierModal({
  isOpen,
  onClose,
  supplierName = "Global Textiles Ltd.",
  onSuccess,
}: AddMaterialToSupplierModalProps) {
  const [productSku, setProductSku] = useState("FAB-COT-BLK-01");
  const [supplierSku, setSupplierSku] = useState("GT-BLK-COT-X");
  const [unitPrice, setUnitPrice] = useState("450.00");
  const [moq, setMoq] = useState("1000");
  const [leadTime, setLeadTime] = useState("14");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess({
        sku: productSku,
        supplierSku,
        unitPrice,
        moq,
        leadTime,
        materialName: "Black Premium Cotton Blend",
      });
    }
    onClose();
  };

  return (
    <div className="wh-am-modal-overlay">
      
      {/* ── STITCH DESIGN: ADD MATERIAL TO SUPPLIER MODAL CONTAINER ── */}
      <div className="wh-am-modal-container">
        
        {/* Header */}
        <div className="wh-am-modal-header">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg m-0">Map New Material to Supplier</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1 m-0">
              Linking materials to <span className="font-bold text-slate-900">{supplierName}</span>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="wh-am-modal-form">
          <div className="wh-am-modal-body">
            
            {/* Search / Select Product SKU Section */}
            <div className="flex flex-col gap-2">
              <label className="wh-am-modal-field-label" htmlFor="material-search">
                SEARCH / SELECT PRODUCT SKU
              </label>
              <div className="wh-am-modal-input-wrapper">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  search
                </span>
                <input
                  id="material-search"
                  type="text"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  placeholder="e.g. FAB-COT-BLK-01"
                  className="wh-am-modal-input wh-am-modal-input-search font-mono"
                  required
                />
              </div>
            </div>

            {/* Material Preview Card (Simulated Active State) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center font-bold text-xl">
                <span className="material-symbols-outlined">texture</span>
              </div>
              <div className="flex-grow flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-extrabold text-slate-900 text-base m-0">Black Premium Cotton Blend</h3>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-blue-200">
                    FABRIC
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="font-mono text-slate-700">SKU: {productSku}</span>
                  <span>•</span>
                  <span>Weight: 220 GSM</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-1" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Supplier SKU */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="wh-am-modal-field-label flex justify-between" htmlFor="supplier-sku">
                  <span>SUPPLIER SKU</span>
                  <span className="text-slate-400 font-normal lowercase text-[10px]">(Optional)</span>
                </label>
                <input
                  id="supplier-sku"
                  type="text"
                  value={supplierSku}
                  onChange={(e) => setSupplierSku(e.target.value)}
                  placeholder="GT-BLK-COT-X"
                  className="wh-am-modal-input font-mono"
                />
              </div>

              {/* Unit Price */}
              <div className="flex flex-col gap-2">
                <label className="wh-am-modal-field-label" htmlFor="unit-price">
                  UNIT PRICE (RS) <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="wh-am-modal-input-wrapper border-l-4 border-blue-600 rounded-lg">
                  <span className="absolute left-3 text-slate-500 font-mono text-sm font-bold pointer-events-none">₹</span>
                  <input
                    id="unit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className="wh-am-modal-input pl-8 font-mono text-right"
                    required
                  />
                </div>
              </div>

              {/* MOQ */}
              <div className="flex flex-col gap-2">
                <label className="wh-am-modal-field-label" htmlFor="moq">
                  MOQ (METERS) <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="wh-am-modal-input-wrapper border-l-4 border-blue-600 rounded-lg">
                  <input
                    id="moq"
                    type="number"
                    step="1"
                    min="1"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    placeholder="1000"
                    className="wh-am-modal-input font-mono text-right"
                    required
                  />
                </div>
              </div>

              {/* Lead Time */}
              <div className="flex flex-col gap-2">
                <label className="wh-am-modal-field-label" htmlFor="lead-time">
                  LEAD TIME (DAYS) <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="wh-am-modal-input-wrapper border-l-4 border-blue-600 rounded-lg">
                  <input
                    id="lead-time"
                    type="number"
                    step="1"
                    min="1"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    placeholder="14"
                    className="wh-am-modal-input font-mono text-right"
                    required
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Footer Actions */}
          <div className="wh-am-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="wh-am-modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wh-am-modal-btn-submit"
            >
              <span className="material-symbols-outlined text-[18px]">add_link</span>
              <span>Add to Map</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
