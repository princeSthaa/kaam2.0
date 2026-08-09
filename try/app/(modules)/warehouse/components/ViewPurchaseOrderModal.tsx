"use client";

import React, { useEffect } from "react";
import "../styles/warehouse-purchaseorder.css";
import { PurchaseOrderGetDto } from "../api/purchaseorder.api";
import { adToBs } from "../../../components/ui/NepaliDatePicker";

export type ViewPurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderGetDto | null;
};

export function ViewPurchaseOrderModal({
  isOpen,
  onClose,
  purchaseOrder,
}: ViewPurchaseOrderModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !purchaseOrder) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Purchase Order: {purchaseOrder.orderNumber}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Created on {adToBs(purchaseOrder.createdAt)} &bull; Expected {adToBs(purchaseOrder.expectedDeliveryDate)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
              ${purchaseOrder.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 
                purchaseOrder.status === 'Draft' ? 'bg-slate-200 text-slate-700' :
                purchaseOrder.status === 'Partially Received' ? 'bg-orange-100 text-orange-700' :
                purchaseOrder.status === 'Completed' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'}`}
            >
              {purchaseOrder.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Supplier Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">factory</span>
                Supplier Details
              </h3>
              <p className="text-base font-bold text-slate-800">{purchaseOrder.supplierName}</p>
              <p className="text-sm text-slate-600 font-mono mt-1">{purchaseOrder.supplierCode}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Material Category</span>
                  <span className="text-sm font-medium text-slate-700">{purchaseOrder.materialCategoryName}</span>
                </div>
              </div>
            </div>

            {/* Logistics Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Logistics & Payment
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Shipping Method</span>
                  <span className="text-sm font-medium text-slate-700">{purchaseOrder.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Payment Terms</span>
                  <span className="text-sm font-medium text-slate-700">{purchaseOrder.paymentTerms}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Total Amount</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">Rs {purchaseOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                Line Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">SKU / Item</th>
                    <th className="px-5 py-3 font-semibold text-right">Ordered Qty</th>
                    <th className="px-5 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-5 py-3 font-semibold text-right">Tax (%)</th>
                    <th className="px-5 py-3 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrder.items?.length > 0 ? purchaseOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 text-sm">{item.materialName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.materialCode}</div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-700">{item.orderedQuantity}</td>
                      <td className="px-5 py-4 text-right text-sm text-slate-700 font-mono">{item.unitPrice}</td>
                      <td className="px-5 py-4 text-right text-sm text-slate-700">13%</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                        {(item.orderedQuantity * item.unitPrice * 1.13).toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipts Table */}
          {purchaseOrder.receipts && purchaseOrder.receipts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">inventory</span>
                  Receipt History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Receipt Number</th>
                      <th className="px-5 py-3 font-semibold">Received Date</th>
                      <th className="px-5 py-3 font-semibold text-right">Items Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchaseOrder.receipts.map((receipt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-sm font-medium text-slate-800">{receipt.receiptNumber}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{adToBs(receipt.receivedDate)}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {receipt.items?.map(ri => (
                            <div key={ri.materialId} className="flex justify-end gap-2 text-xs">
                              <span className="font-medium">{ri.receivedQuantity} units</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
