"use client";

import React, { useMemo } from 'react';

export default function StockModal({ tempData, onClose, onRequestProcurement }: any) {
  
  const materialList = useMemo(() => {
    if (!tempData || !tempData.basket) return [];

    let totalNavy = 0;
    let totalBlack = 0;
    let totalQty = 0;

    tempData.basket.forEach((item: any) => {
      const qty = Number(item.quantity) || 0;
      totalQty += qty;
      if (item.variant && item.variant.includes("Navy")) {
        totalNavy += qty;
      } else if (item.variant && item.variant.includes("Black")) {
        totalBlack += qty;
      } else {
        totalNavy += qty; // default
      }
    });

    const navyReq = Math.ceil(totalNavy * 1.8);
    const blackReq = Math.ceil(totalBlack * 1.6);
    const zipperReq = totalQty;
    const threadReq = Math.ceil(totalQty * 0.03); // spools/tubes

    return [
      {
        name: "Cotton-Blend Fabric (Navy)",
        icon: "category",
        required: `${navyReq}m`,
        available: "120m",
        shortage: navyReq > 120,
        location: "Hub B"
      },
      {
        name: "Polyester Fabric (Black)",
        icon: "category",
        required: `${blackReq}m`,
        available: "500m",
        shortage: blackReq > 500,
        location: "Hub B"
      },
      {
        name: "YKK Zippers (Black)",
        icon: "hardware",
        required: `${zipperReq} pcs`,
        available: "800 pcs",
        shortage: zipperReq > 800,
        location: "Trim Room A"
      },
      {
        name: "Cotton Thread (White)",
        icon: "thread",
        required: `${threadReq} spools`,
        available: "8 spools",
        shortage: threadReq > 8,
        location: "Trim Room A"
      }
    ];
  }, [tempData]);

  const totalRequired = materialList.length;
  const totalShortages = materialList.filter(m => m.shortage).length;

  const firstItemName = tempData?.basket?.[0]?.productName || "Garments";

  return (
    <>
      {/*  Modal Overlay  */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-kaam-inverse-surface/40 backdrop-blur-sm p-4">
        {/*  Modal Container  */}
        <div className="bg-kaam-surface-container-lowest rounded-kaam-DEFAULT border border-kaam-outline-variant w-full max-w-4xl shadow-lg flex flex-col max-h-[90vh]">
          {/*  Header  */}
          <div className="flex items-start justify-between p-6 border-b border-kaam-outline-variant shrink-0">
            <div>
              <h2 className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface">Material Stock Verification</h2>
              <p className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant mt-1">Review inventory availability for: {firstItemName}</p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-kaam-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-kaam-DEFAULT transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/*  Scrollable Content  */}
          <div className="p-6 overflow-y-auto flex-1 bg-kaam-surface flex flex-col gap-kaam-row-gap">
            {/*  Summary Bar  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-kaam-column-gap">
              <div className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT p-4 flex items-center gap-4">
                <div className="bg-kaam-surface-container p-3 rounded-kaam-DEFAULT text-kaam-on-surface-variant">
                  <span className="material-symbols-outlined">format_list_bulleted</span>
                </div>
                <div>
                  <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider">Total Required Materials</p>
                  <p className="font-kaam-stats-lg text-kaam-stats-lg text-kaam-on-surface">{totalRequired} Items</p>
                </div>
              </div>
              <div className={`border rounded-kaam-DEFAULT p-4 flex items-center gap-4 ${totalShortages > 0 ? "bg-kaam-error-container/20 border-kaam-error/30" : "bg-kaam-success-container/20 border-kaam-success/30"}`}>
                <div className={`p-3 rounded-kaam-DEFAULT ${totalShortages > 0 ? "bg-kaam-error-container text-kaam-on-error-container" : "bg-kaam-success-container text-kaam-on-success-container"}`}>
                  <span className="material-symbols-outlined">{totalShortages > 0 ? "warning" : "check_circle"}</span>
                </div>
                <div>
                  <p className={`font-kaam-label-md text-kaam-label-md uppercase tracking-wider ${totalShortages > 0 ? "text-kaam-error" : "text-green-700"}`}>
                    {totalShortages > 0 ? "Shortages Detected" : "Fully Stocked"}
                  </p>
                  <p className={`font-kaam-stats-lg text-kaam-stats-lg ${totalShortages > 0 ? "text-kaam-error" : "text-green-700"}`}>
                    {totalShortages} {totalShortages === 1 ? "Item" : "Items"}
                  </p>
                </div>
              </div>
            </div>

            {/*  Inventory Table  */}
            <div className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-DEFAULT overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-kaam-surface-container-low border-b border-kaam-outline-variant">
                      <th className="py-3 px-4 font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase whitespace-nowrap">Material Name</th>
                      <th className="py-3 px-4 font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase whitespace-nowrap text-right">Required Qty</th>
                      <th className="py-3 px-4 font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase whitespace-nowrap text-right">Current Stock</th>
                      <th className="py-3 px-4 font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase whitespace-nowrap text-center">Status</th>
                      <th className="py-3 px-4 font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase whitespace-nowrap">Warehouse Location</th>
                    </tr>
                  </thead>
                  <tbody className="font-kaam-body-sm text-kaam-body-sm">
                    {materialList.map((mat, idx) => (
                      <tr key={idx} className="border-b border-kaam-outline-variant hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4 font-medium text-kaam-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-kaam-outline text-[18px]">{mat.icon}</span>
                          {mat.name}
                        </td>
                        <td className="py-3 px-4 text-right text-kaam-on-surface-variant">{mat.required}</td>
                        <td className={`py-3 px-4 text-right font-medium ${mat.shortage ? "text-kaam-error" : "text-kaam-on-tertiary-container"}`}>{mat.available}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-kaam-DEFAULT font-kaam-label-md text-[10px] uppercase ${mat.shortage ? "bg-kaam-error-container text-kaam-on-error-container" : "bg-kaam-tertiary-fixed-dim/20 text-kaam-on-tertiary-container"}`}>
                            {mat.shortage ? "Shortage" : "Available"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-kaam-on-surface-variant">{mat.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/*  Footer Actions  */}
          <div className="p-6 border-t border-kaam-outline-variant bg-kaam-surface-container-lowest flex justify-end gap-4 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-kaam-outline text-kaam-on-surface font-kaam-label-md text-kaam-label-md rounded-kaam-DEFAULT hover:bg-surface-container-low transition-colors active:scale-95 uppercase"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={onRequestProcurement}
              className="px-6 py-2 bg-kaam-primary text-kaam-on-primary font-kaam-label-md text-kaam-label-md rounded-kaam-DEFAULT hover:bg-primary/90 transition-colors active:scale-95 uppercase flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Request Procurement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
