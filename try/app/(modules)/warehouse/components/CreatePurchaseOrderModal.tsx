"use client";

import React, { useState } from "react";
import "../styles/warehouse-purchaseorder.css";

export type CreatePurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (poData: any) => void;
};

export function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePurchaseOrderModalProps) {
  const [supplier, setSupplier] = useState("sup_1");
  const [expectedDate, setExpectedDate] = useState("2024-10-20");
  const [shippingMethod, setShippingMethod] = useState("Standard Freight");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");

  // Line items state matching Stitch screen 2b09f42891d44866a446787ccf49fa78
  const [lineItems, setLineItems] = useState([
    {
      id: "item-1",
      materialName: "Heavy Cotton Canvas",
      sku: "SKU-FAB-1029",
      variant: "Navy Blue",
      requiredQty: 500,
      unitPrice: 450.0,
      taxPercent: 18,
      subtotal: "225,000.00",
    },
    {
      id: "item-2",
      materialName: "Industrial Zippers 15cm",
      sku: "SKU-TRM-8821",
      variant: "Brass Finish",
      requiredQty: 1000,
      unitPrice: 25.5,
      taxPercent: 12,
      subtotal: "25,500.00",
    },
  ]);

  if (!isOpen) return null;

  // Add line item handler
  const handleAddLineItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      materialName: "New Material Item",
      sku: "SKU-NEW-000",
      variant: "Standard",
      requiredQty: 100,
      unitPrice: 100.0,
      taxPercent: 18,
      subtotal: "10,000.00",
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  // Delete line item handler
  const handleDeleteItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSendPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess({
        poNumber: "PO-2024-006",
        supplier,
        expectedDate,
        shippingMethod,
        paymentTerms,
        notes,
        lineItems,
      });
    }
    onClose();
  };

  return (
    <div className="wh-cpom-overlay">
      
      {/* ── STITCH DESIGN: CREATE PURCHASE ORDER MODAL CONTAINER ── */}
      <div className="wh-cpom-container">
        
        {/* Modal Header */}
        <div className="wh-cpom-header">
          <div className="wh-cpom-header-title">
            <h2>Create New Purchase Order</h2>
            <span className="wh-cpom-po-badge">PO-2024-006</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="wh-cpom-body">
          
          {/* Section 1: Supplier & General Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Supplier Selection */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="wh-cpom-field-label" htmlFor="supplier-select">
                Supplier
              </label>
              <div className="relative">
                <select
                  id="supplier-select"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="wh-cpom-select pr-10"
                >
                  <option value="">Select Supplier...</option>
                  <option value="sup_1">Apex Textiles Ltd.</option>
                  <option value="sup_2">Global Trims &amp; Accessories</option>
                  <option value="sup_3">Meridian Fabrics Inc.</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Suppliers are filtered based on material requirements.</span>
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Expected Date */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="expected_date">
                  Expected Date
                </label>
                <input
                  id="expected_date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="wh-cpom-input"
                />
              </div>

              {/* Shipping Method */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="shipping_method">
                  Shipping Method
                </label>
                <div className="relative">
                  <select
                    id="shipping_method"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="wh-cpom-select pr-10"
                  >
                    <option>Standard Freight</option>
                    <option>Express Courier</option>
                    <option>Sea Cargo</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="payment_terms">
                  Payment Terms
                </label>
                <div className="relative">
                  <select
                    id="payment_terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="wh-cpom-select pr-10"
                  >
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Due on Receipt</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Line Items Table */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="wh-cpom-section-title m-0">Line Items</h3>
              <button
                onClick={handleAddLineItem}
                type="button"
                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>ADD MATERIAL</span>
              </button>
            </div>

            <div className="wh-cpom-table-container">
              <table className="wh-cpom-table">
                <thead>
                  <tr>
                    <th className="w-10"></th>
                    <th className="w-1/3">Material / SKU</th>
                    <th>Variant / Size</th>
                    <th className="text-right">Required Qty</th>
                    <th className="text-right">Unit Price (Rs)</th>
                    <th className="text-right">Tax %</th>
                    <th className="text-right">Subtotal (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="group">
                      
                      {/* Delete Button */}
                      <td className="text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>

                      {/* Material / SKU */}
                      <td>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={item.materialName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLineItems((prev) =>
                                prev.map((i) => (i.id === item.id ? { ...i, materialName: val } : i))
                              );
                            }}
                            className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-bold text-slate-900 outline-none text-xs"
                          />
                          <div className="font-mono text-[11px] text-slate-500 px-2 font-semibold">
                            {item.sku}
                          </div>
                        </div>
                      </td>

                      {/* Variant */}
                      <td className="pt-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.variant}
                        </span>
                      </td>

                      {/* Required Qty */}
                      <td>
                        <input
                          type="number"
                          value={item.requiredQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, requiredQty: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Unit Price */}
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, unitPrice: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Tax % */}
                      <td>
                        <input
                          type="number"
                          value={item.taxPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, taxPercent: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="pt-3 text-right font-mono font-bold text-slate-900 text-xs">
                        {item.subtotal}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add row state button */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white text-center">
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 w-full transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add another line item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Summary & Notes Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
            
            {/* Notes */}
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <label className="wh-cpom-field-label" htmlFor="internal-notes">
                Internal Notes
              </label>
              <textarea
                id="internal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or internal references..."
                className="wh-cpom-textarea"
              ></textarea>
            </div>

            {/* Financial Summary Card */}
            <div className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Total Items</span>
                <span className="font-mono text-slate-900">{lineItems.length}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900">Rs 250,500.00</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 font-semibold border-b border-slate-200 pb-3">
                <span>Total Tax</span>
                <span className="font-mono text-slate-900">Rs 43,560.00</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-900 text-sm">Grand Total</span>
                <span className="font-mono text-lg font-extrabold text-slate-900">Rs 294,060.00</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="wh-cpom-footer">
          <button
            type="button"
            onClick={onClose}
            className="wh-cpom-btn-draft"
          >
            Save as Draft
          </button>
          
          <button
            type="button"
            onClick={handleSendPO}
            className="wh-cpom-btn-send"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Send Purchase Order</span>
          </button>
        </div>

      </div>
    </div>
  );
}
