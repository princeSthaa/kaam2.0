"use client";

import React, { useMemo, useEffect, useState } from 'react';

export default function SummaryReview({
  tempData,
  fieldValues,
  stages,
  onClose,
  onConfirm
}: any) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setAnimateIn(true));
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const totalQuantity = useMemo(() => {
    if (!tempData || !tempData.basket) return 0;
    return tempData.basket.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
  }, [tempData]);

  const sourceDetail = tempData?.sourceDetail || {};
  const isCustomer = tempData?.kind === "customer";

  const totalDays = useMemo(() => {
    const start = new Date(fieldValues.planStartDate);
    const end = new Date(fieldValues.planEndDate);
    const diffTime = Math.max(end.getTime() - start.getTime(), 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 14;
  }, [fieldValues.planStartDate, fieldValues.planEndDate]);

  const bomData = useMemo(() => {
    if (!tempData || !tempData.basket) return [];

    let totalFabricMeters = 0;
    let totalButtons = 0;
    let totalThread = 0;
    let totalPackaging = 0;
    
    let primaryFabric = "Cotton Twill";
    let primaryColor = "Classic Blue";

    tempData.basket.forEach((item: any) => {
      const qty = Number(item.quantity) || 0;
      totalFabricMeters += qty * 1.5;
      totalButtons += qty * 8;
      totalThread += qty * 0.2;
      totalPackaging += qty * 1;
      
      if (item.fabricName) primaryFabric = item.fabricName;
      if (item.variant && item.variant !== "Standard") primaryColor = item.variant;
    });

    const fabricCost = totalFabricMeters * 350;
    const buttonCost = totalButtons * 5;
    const threadCost = totalThread * 120;
    const packCost = totalPackaging * 30;

    return [
      {
        category: "Fabric",
        details: `${primaryFabric}, ${primaryColor}, 180 GSM, 58" Width`,
        qty: `${totalFabricMeters.toFixed(1)} meters`,
        unitPrice: "Rs. 350 / m",
        totalCost: fabricCost
      },
      {
        category: "Trims & Accessories",
        details: "Standard Buttons (18L), Zippers, Brand Labels",
        qty: `${totalButtons.toLocaleString()} pcs`,
        unitPrice: "Rs. 5 / pc",
        totalCost: buttonCost
      },
      {
        category: "Thread",
        details: "Polyester Core Spun, Color Match",
        qty: `${Math.ceil(totalThread)} spools`,
        unitPrice: "Rs. 120 / spool",
        totalCost: threadCost
      },
      {
        category: "Packaging",
        details: "Standard Polybags, Carton Boxes, Size Stickers",
        qty: `${totalPackaging.toLocaleString()} units`,
        unitPrice: "Rs. 30 / unit",
        totalCost: packCost
      }
    ];
  }, [tempData]);

  const grandTotalCost = useMemo(() => bomData.reduce((sum, item) => sum + item.totalCost, 0), [bomData]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .modal-content {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      ` }} />

      <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 md:p-8">
        <main 
          className="modal-content w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <header className="modal-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Final Verification</h1>
                <p className="text-sm font-medium text-slate-500">Review plan details before deployment</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-xs font-bold uppercase tracking-wide">System Ready</span>
            </div>
          </header>

          {/* Scrollable Body */}
          <div className="modal-body flex-1 overflow-y-auto p-4 bg-white flex flex-col gap-6 custom-scrollbar">
            
            {/* Top Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Expected Output</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{totalQuantity.toLocaleString()}</span>
                  <span className="text-sm font-medium text-slate-500">units</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Across {tempData.basket.length} unique SKUs</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Production Timeline</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{totalDays}</span>
                  <span className="text-sm font-medium text-slate-500">Days</span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {fieldValues.planStartDate} to {fieldValues.planEndDate}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{isCustomer ? "Client Account" : "Outlet Target"}</p>
                <p className="text-lg font-bold text-slate-900 leading-tight line-clamp-2">
                  {sourceDetail.customerName || sourceDetail.name || "N/A"}
                </p>
                <p className="text-xs font-mono font-medium text-slate-500 mt-1">Ref: #{tempData.selectedSourceId || "N/A"}</p>
              </div>
            </section>

            {/* Routing Settings */}
            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Routing & Supervisors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Line Assignment</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5">{fieldValues.productionLine}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">precision_manufacturing</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supervising Officer</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5">{fieldValues.supervisor}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">badge</span>
                </div>
              </div>
            </section>

            {/* Products & Size Breakdown */}
            <section className="flex flex-col shrink-0">
              <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Products & Size Breakdown</h2>
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Size Matrix</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tempData.basket.map((item: any, idx: number) => {
                      const sizesObj: Record<string, string | number> = item.sizes || {};
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <p className="text-sm font-bold text-slate-900">{item.productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono rounded">
                                {item.productCode || item.productId}
                              </span>
                              <span className="text-xs font-medium text-slate-500">{item.fabricName || item.variant || "Standard Fabric"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(sizesObj).map(([size, quantity]) => {
                                if (Number(quantity) === 0) return null;
                                return (
                                  <div key={size} className="flex items-center border border-slate-200 rounded text-xs overflow-hidden">
                                    <span className="px-2 py-1 bg-slate-50 text-slate-600 font-medium border-r border-slate-200">{size}</span>
                                    <span className="px-2 py-1 bg-white text-slate-900 font-bold">{quantity}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top text-right">
                            <span className="text-base font-bold text-slate-900">{Number(item.quantity).toLocaleString()}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Bill of Materials & Costing */}
            <section className="flex flex-col shrink-0">
              <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Comprehensive Bill of Materials & Costing</h2>
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Material Details</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Required Qty</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Price</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Extended Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-bold text-slate-900">{item.category}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{item.details}</td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.qty}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{item.unitPrice}</td>
                        <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right">Rs. {item.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="px-5 py-4 text-sm font-bold text-slate-600 text-right uppercase tracking-wider">Grand Total Estimated Cost</td>
                      <td className="px-5 py-4 text-lg font-black text-blue-600 text-right">Rs. {grandTotalCost.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="modal-footer p-4 border-t border-gray-200 bg-gray-50 shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              Cancel & Edit
            </button>
            <button 
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Deploy Production Plan
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}
