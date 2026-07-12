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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4 md:p-6 transition-all">
        <main className="bg-slate-50 w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/40 flex flex-col overflow-hidden max-h-[95vh] md:max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <header className="px-5 py-4 sm:px-8 sm:py-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-violet-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl">assignment_turned_in</span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Plan Summary Review</h1>
              </div>
              <p className="text-slate-500 ml-0 sm:ml-12 text-xs sm:text-sm font-medium mt-2 sm:mt-0">Verify production sequences and allocations before execution.</p>
            </div>
            <div className="relative self-start md:self-auto">
              <div className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold text-xs sm:text-sm rounded-full shadow-md shadow-blue-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Draft Plan Verification
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 font-sans">
            
            {/* Timeline */}
            <section className="mb-6 md:mb-8 p-4 md:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 md:mb-8">Production Lifecycle Projection</h2>
              
              {/* Desktop Horizontal Timeline */}
              <div className="hidden sm:flex relative justify-between items-center w-full px-4">
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px] bg-slate-100 z-0"></div>
                <div className="absolute left-4 w-1/4 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-blue-500 to-violet-500 z-0"></div>
                
                {[
                  { label: "Intake", icon: "check", state: "done" },
                  { label: "Review", icon: "radio_button_checked", state: "active" },
                  { label: "Allocation", icon: "factory", state: "pending" },
                  { label: "Assembly", icon: "conveyor_belt", state: "pending" },
                  { label: "Dispatch", icon: "local_shipping", state: "pending" }
                ].map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-3 bg-white px-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${
                      step.state === "done" ? "bg-blue-600 text-white" :
                      step.state === "active" ? "bg-violet-100 text-violet-600 border-2 border-violet-500" :
                      "bg-slate-50 border-2 border-slate-200 text-slate-400"
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                    </div>
                    <span className={`text-xs font-bold ${
                      step.state === "done" ? "text-blue-600" :
                      step.state === "active" ? "text-violet-600" :
                      "text-slate-400"
                    }`}>{step.label}</span>
                  </div>
                ))}
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="flex sm:hidden flex-col gap-6 relative pl-4">
                <div className="absolute left-9 top-4 bottom-4 w-[3px] bg-slate-100 z-0"></div>
                <div className="absolute left-9 top-4 h-1/4 w-[3px] bg-gradient-to-b from-blue-500 to-violet-500 z-0"></div>

                {[
                  { label: "Intake", icon: "check", state: "done" },
                  { label: "Review", icon: "radio_button_checked", state: "active" },
                  { label: "Allocation", icon: "factory", state: "pending" },
                  { label: "Assembly", icon: "conveyor_belt", state: "pending" },
                  { label: "Dispatch", icon: "local_shipping", state: "pending" }
                ].map((step, idx) => (
                  <div key={idx} className="relative z-10 flex items-center gap-4 bg-white">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                      step.state === "done" ? "bg-blue-600 text-white" :
                      step.state === "active" ? "bg-violet-100 text-violet-600 border-2 border-violet-500" :
                      "bg-slate-50 border-2 border-slate-200 text-slate-400"
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      step.state === "done" ? "text-blue-600" :
                      step.state === "active" ? "text-violet-600" :
                      "text-slate-400"
                    }`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bento Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Account Info */}
              <section className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 md:mb-5">
                  <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg shrink-0">{isCustomer ? "corporate_fare" : "storefront"}</span>
                  <h2 className="text-base md:text-lg font-bold text-slate-800">{isCustomer ? "Client Dossier" : "Outlet Details"}</h2>
                </div>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Account Name</p>
                    <p className="text-sm md:text-base text-slate-800 font-bold mt-1 truncate" title={sourceDetail.customerName || sourceDetail.name || "N/A"}>{sourceDetail.customerName || sourceDetail.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Source ID</p>
                    <p className="text-sm md:text-base text-slate-800 font-bold mt-1 truncate">#{tempData.selectedSourceId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md mt-1">
                      <span className="material-symbols-outlined text-[12px] md:text-[14px]">priority_high</span> High
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Planner</p>
                    <p className="text-sm md:text-base text-slate-800 font-bold mt-1 truncate" title={fieldValues.supervisor}>{fieldValues.supervisor}</p>
                  </div>
                </div>
              </section>

              {/* Logistics */}
              <section className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 md:mb-5">
                  <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-2 rounded-lg shrink-0">route</span>
                  <h2 className="text-base md:text-lg font-bold text-slate-800">Logistics Routing</h2>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Target Date</p>
                      <p className="text-sm md:text-base text-slate-800 font-bold mt-1">{fieldValues.planEndDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Duration</p>
                      <p className="text-sm md:text-base text-blue-600 font-bold mt-1">{totalDays} Days</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facilities</p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                      <div className="border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px] text-violet-500">factory</span>
                        <span className="text-xs md:text-sm font-semibold text-slate-700 truncate">{fieldValues.productionLine}</span>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px] text-emerald-500">warehouse</span>
                        <span className="text-xs md:text-sm font-semibold text-slate-700 truncate">{fieldValues.materialWarehouse}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Bill of Materials / Output */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
              <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-lg shrink-0">inventory_2</span>
                  <h2 className="text-base md:text-lg font-bold text-slate-800">Bill of Materials / Output</h2>
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium bg-white px-3 py-1.5 rounded-md border border-slate-200 sm:border-transparent sm:bg-transparent sm:p-0">
                  Total Units: <span className="font-bold text-slate-800 text-sm md:text-lg ml-1">{totalQuantity.toLocaleString()}</span>
                </div>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider px-4 md:px-6 py-3 md:py-4">SKU / Code</th>
                      <th className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider px-4 md:px-6 py-3 md:py-4">Description</th>
                      <th className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider px-4 md:px-6 py-3 md:py-4">Size Breakdown</th>
                      <th className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider px-4 md:px-6 py-3 md:py-4 text-right">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tempData.basket.map((item: any, idx: number) => {
                      const sizesObj: Record<string, string | number> = item.sizes || {};
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-700">{item.productCode || item.productId}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600 font-medium">{item.productName} <span className="text-slate-400 block md:inline text-[10px] md:text-sm">({item.variant})</span></td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="flex gap-1 md:gap-2 flex-wrap">
                              {Object.entries(sizesObj).map(([size, quantity]) => {
                                if (Number(quantity) === 0) return null;
                                return (
                                  <span key={size} className="bg-white border border-slate-200 px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[10px] md:text-xs font-semibold text-slate-600 shadow-sm">
                                    {size}: <span className="text-blue-600">{quantity}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-right font-bold text-slate-800 text-xs md:text-sm">{Number(item.quantity).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <footer className="px-4 py-4 md:px-8 md:py-5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[18px] md:text-[20px]">edit</span>
              Edit Details
            </button>
            <button 
              type="button"
              onClick={onConfirm}
              className="text-sm font-bold text-white bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] md:text-[20px]">play_arrow</span>
              Create & Assign Teams
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}
