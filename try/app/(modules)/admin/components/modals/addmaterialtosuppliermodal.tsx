"use client";

import React, { useState } from "react";

export type AddMaterialToSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supplierName?: string;
  onSuccess?: (materialData: any) => void;
};

export function AddMaterialToSupplierModal({
  isOpen,
  onClose,
  supplierName = "Indigo Textiles Co.",
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 my-auto text-slate-900">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Map Material to Supplier</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Linking material specs to <span className="font-bold text-slate-900">{supplierName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Search / Select Product SKU Section */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="material-search">
              SEARCH / SELECT PRODUCT SKU
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                search
              </span>
              <input
                id="material-search"
                type="text"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                placeholder="e.g. FAB-COT-BLK-01"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Material Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center font-bold text-xl">
              <span className="material-symbols-outlined text-lg">texture</span>
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <h3 className="font-extrabold text-slate-900 text-sm m-0">Black Premium Cotton Blend</h3>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-blue-200 font-mono">
                  FABRIC
                </span>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-slate-500">
                <span className="font-mono text-slate-700">SKU: {productSku}</span>
                <span>•</span>
                <span>Weight: 220 GSM</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supplier SKU */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between" htmlFor="supplier-sku">
                <span>SUPPLIER SKU</span>
                <span className="text-slate-400 font-normal lowercase text-[10px]">(Optional)</span>
              </label>
              <input
                id="supplier-sku"
                type="text"
                value={supplierSku}
                onChange={(e) => setSupplierSku(e.target.value)}
                placeholder="GT-BLK-COT-X"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Unit Price */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="unit-price">
                UNIT PRICE (RS) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs font-bold pointer-events-none">Rs</span>
                <input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs text-right focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* MOQ */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="moq">
                MOQ (UNITS/METERS) <span className="text-red-600">*</span>
              </label>
              <input
                id="moq"
                type="number"
                step="1"
                min="1"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs text-right focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            {/* Lead Time */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="lead-time">
                LEAD TIME (DAYS) <span className="text-red-600">*</span>
              </label>
              <input
                id="lead-time"
                type="number"
                step="1"
                min="1"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="14"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs text-right focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_link</span>
              <span>Map Material</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
