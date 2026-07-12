"use client";

import React, { useMemo } from 'react';

export default function SummaryReview({
  tempData,
  fieldValues,
  stages,
  onClose,
  onConfirm
}: any) {

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

  return (
    <>
      {/*  Modal/Full-Page Summary Overlay  */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-kaam-inverse-surface/40 backdrop-blur-sm p-4">
        {/*  Modal/Full-Page Summary Container  */}
        <main className="bg-kaam-surface w-full max-w-6xl rounded-kaam-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-kaam-outline-variant flex flex-col overflow-hidden max-h-[90vh]">
          {/*  Header  */}
          <header className="px-6 py-5 border-b border-kaam-outline-variant bg-kaam-surface-container-lowest flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-kaam-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
                <h1 className="font-kaam-headline-lg text-kaam-headline-lg text-kaam-on-surface">Plan Summary Review</h1>
              </div>
              <p className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant">Review sequence and allocations before final execution.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-kaam-surface-container text-kaam-on-surface font-kaam-label-md text-kaam-label-md rounded-kaam-DEFAULT border border-kaam-outline-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-kaam-full bg-kaam-secondary animate-pulse"></span>
                Draft Plan Verification
              </div>
            </div>
          </header>

          {/*  Scrollable Content Canvas  */}
          <div className="flex-1 overflow-y-auto p-6 bg-kaam-surface-bright">
            {/*  Macro Timeline Visualization  */}
            <section className="mb-8 p-6 bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-lg">
              <h2 className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider mb-6">Production Lifecycle Projection</h2>
              <div className="relative flex justify-between items-center w-full">
                {/*  Connecting Line  */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-kaam-outline-variant z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-[2px] bg-kaam-secondary z-0"></div>
                {/*  Nodes  */}
                <div className="relative z-10 flex flex-col items-center gap-2 bg-kaam-surface-container-lowest px-2">
                  <div className="w-8 h-8 rounded-kaam-full bg-kaam-secondary text-kaam-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface">Intake</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2 bg-kaam-surface-container-lowest px-2">
                  <div className="w-8 h-8 rounded-kaam-full border-2 border-kaam-secondary bg-kaam-surface text-kaam-secondary flex items-center justify-center">
                    <span className="w-2 h-2 rounded-kaam-full bg-kaam-secondary"></span>
                  </div>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-secondary font-bold">Review</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2 bg-kaam-surface-container-lowest px-2">
                  <div className="w-8 h-8 rounded-kaam-full border-2 border-kaam-outline-variant bg-kaam-surface text-kaam-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">factory</span>
                  </div>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-outline-variant">Allocation</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2 bg-kaam-surface-container-lowest px-2">
                  <div className="w-8 h-8 rounded-kaam-full border-2 border-kaam-outline-variant bg-kaam-surface text-kaam-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">conveyor_belt</span>
                  </div>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-outline-variant">Assembly</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2 bg-kaam-surface-container-lowest px-2">
                  <div className="w-8 h-8 rounded-kaam-full border-2 border-kaam-outline-variant bg-kaam-surface text-kaam-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  </div>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-outline-variant">Dispatch</span>
                </div>
              </div>
            </section>

            {/*  Bento Grid Summary  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/*  Customer & Global Info  */}
              <section className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-lg p-5">
                <div className="flex items-center gap-2 border-b border-kaam-outline-variant pb-3 mb-4">
                  <span className="material-symbols-outlined text-kaam-on-surface-variant text-[20px]">{isCustomer ? "corporate_fare" : "storefront"}</span>
                  <h2 className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface">{isCustomer ? "Client Dossier" : "Outlet Details"}</h2>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Account Name</p>
                    <p className="font-kaam-body-lg text-kaam-body-lg text-kaam-on-surface font-semibold mt-1">
                      {sourceDetail.customerName || sourceDetail.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Source ID</p>
                    <p className="font-kaam-body-lg text-kaam-body-lg text-kaam-on-surface font-semibold mt-1">
                      #{tempData.selectedSourceId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Priority Level</p>
                    <span className="inline-flex items-center gap-1 bg-kaam-error-container text-kaam-on-error-container font-kaam-label-md text-kaam-label-md px-2 py-0.5 rounded-kaam-DEFAULT mt-1">
                      <span className="material-symbols-outlined text-[14px]">priority_high</span> High Priority
                    </span>
                  </div>
                  <div>
                    <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Lead Planner / Supervisor</p>
                    <p className="font-kaam-body-lg text-kaam-body-lg text-kaam-on-surface font-semibold mt-1">{fieldValues.supervisor}</p>
                  </div>
                </div>
              </section>

              {/*  Logistics & Routing  */}
              <section className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-lg p-5">
                <div className="flex items-center gap-2 border-b border-kaam-outline-variant pb-3 mb-4">
                  <span className="material-symbols-outlined text-kaam-on-surface-variant text-[20px]">route</span>
                  <h2 className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface">Logistics Routing</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Target Completion</p>
                      <p className="font-kaam-body-lg text-kaam-body-lg text-kaam-on-surface font-semibold mt-1">{fieldValues.planEndDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">Estimated Duration</p>
                      <p className="font-kaam-body-lg text-kaam-body-lg text-kaam-on-surface font-semibold mt-1">{totalDays} Days</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-2">Assigned Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="border border-kaam-outline-variant bg-kaam-surface px-3 py-1.5 rounded-kaam-DEFAULT flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-kaam-secondary">factory</span>
                        <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface">{fieldValues.productionLine}</span>
                      </div>
                      <div className="border border-kaam-outline-variant bg-kaam-surface px-3 py-1.5 rounded-kaam-DEFAULT flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-kaam-on-surface-variant">warehouse</span>
                        <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface">{fieldValues.materialWarehouse}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/*  Itemized Summary (Data Dense)  */}
            <section className="bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-kaam-outline-variant flex justify-between items-center bg-kaam-surface">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-kaam-on-surface-variant text-[20px]">inventory_2</span>
                  <h2 className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface">Bill of Materials / Output</h2>
                </div>
                <div className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">
                  Total Units: <span className="font-bold text-kaam-on-surface">{totalQuantity.toLocaleString()}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-kaam-surface-container-low border-b border-kaam-outline-variant">
                      <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant px-5 py-3 font-medium">SKU / Item code</th>
                      <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant px-5 py-3 font-medium">Description</th>
                      <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant px-5 py-3 font-medium">Size Breakdown</th>
                      <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant px-5 py-3 font-medium text-right">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface divide-y divide-outline-variant/50">
                    {tempData.basket.map((item: any, idx: number) => {
                      const sizesObj: Record<string, string | number> = item.sizes || {};
                      return (
                        <tr key={item.id || idx} className="hover:bg-surface-variant transition-colors group">
                          <td className="px-5 py-3 font-kaam-label-md text-kaam-label-md">{item.productCode || item.productId}</td>
                          <td className="px-5 py-3">{item.productName} ({item.variant})</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(sizesObj).map(([size, quantity]) => {
                                if (Number(quantity) === 0) return null;
                                return (
                                  <span key={size} className="bg-kaam-surface border border-kaam-outline-variant px-2 py-0.5 rounded-kaam-DEFAULT text-[11px]">
                                    {size}: {quantity}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold">{Number(item.quantity).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/*  Footer Actions  */}
          <footer className="px-6 py-4 border-t border-kaam-outline-variant bg-kaam-surface-container-lowest flex justify-end gap-4 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="font-kaam-label-md text-kaam-label-md text-kaam-primary bg-kaam-surface border border-kaam-outline px-6 py-2.5 rounded-kaam-DEFAULT hover:bg-surface-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Details
            </button>
            <button 
              type="button"
              onClick={onConfirm}
              className="font-kaam-label-md text-kaam-label-md text-kaam-on-primary bg-kaam-primary px-6 py-2.5 rounded-kaam-DEFAULT hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Create and Assign Teams
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}
