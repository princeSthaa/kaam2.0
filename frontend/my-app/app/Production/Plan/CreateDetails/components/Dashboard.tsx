"use client";

import React, { useEffect } from 'react';
import { NepaliDatePicker } from '@/app/components/ui/NepaliDatePicker';

declare global {
  interface Window {
    NepaliFunctions?: any;
  }
}

export default function Dashboard({
  tempData,
  fieldValues,
  setFieldValues,
  stages,
  setStages,
  onVerifyStock,
  onReviewPlan,
  onCancel
}: any) {

  const safelyConvertAD2BS = (adDateStr: string) => {
    if (!adDateStr || typeof window === 'undefined' || !window.NepaliFunctions) return "";
    try {
      const [y, m, d] = adDateStr.split("-").map(Number);
      if (!y || !m || !d) return "";
      const bsObj = window.NepaliFunctions.AD2BS({ year: y, month: m, day: d });
      if (!bsObj) return "";
      const yy = bsObj.year;
      const mm = String(bsObj.month).padStart(2, '0');
      const dd = String(bsObj.day).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const safelyConvertBS2AD = (bsDateStr: string) => {
    if (!bsDateStr || typeof window === 'undefined' || !window.NepaliFunctions) return "";
    try {
      const [y, m, d] = bsDateStr.split("-").map(Number);
      if (!y || !m || !d) return "";
      const adObj = window.NepaliFunctions.BS2AD({ year: y, month: m, day: d });
      if (!adObj) return "";
      if (adObj instanceof Date) {
         return adObj.toISOString().split("T")[0];
      }
      const yy = adObj.year;
      const mm = String(adObj.month).padStart(2, '0');
      const dd = String(adObj.day).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const handleFieldChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFieldValues((currentValues: any) => {
      const newValues = { ...currentValues, [field]: value };
      
      if (field === 'planStartDate') {
        newValues.planStartDateNp = safelyConvertAD2BS(value);
      } else if (field === 'planStartDateNp') {
        newValues.planStartDate = safelyConvertBS2AD(value);
      } else if (field === 'planEndDate') {
        newValues.planEndDateNp = safelyConvertAD2BS(value);
      } else if (field === 'planEndDateNp') {
        newValues.planEndDate = safelyConvertBS2AD(value);
      }

      return newValues;
    });
  };

  const handleStageChange = (idx: number, field: string, value: any) => {
    setStages((prev: any[]) => {
      const updated = [...prev];
      const stage = { ...updated[idx], [field]: value };
      
      if (field === 'date') {
        stage.dateNp = safelyConvertAD2BS(value);
      } else if (field === 'dateNp') {
        stage.date = safelyConvertBS2AD(value);
      }

      updated[idx] = stage;
      return updated;
    });
  };

  const handleDeleteStage = (idx: number) => {
    setStages((prev: any[]) => prev.filter((_, i) => i !== idx));
  };

  const handleAddStage = () => {
    setStages((prev: any[]) => {
      const nextId = String(prev.length + 1).padStart(2, "0");
      return [
        ...prev,
        { id: nextId, name: "Quality Check", workCenter: "QC Table", leadHours: "8", date: fieldValues.planStartDate }
      ];
    });
  };

  const sourceDetail = tempData.sourceDetail || {};
  const isCustomer = tempData.kind === "customer";

  return (
    <>
      <div className="max-w-7xl mx-auto flex flex-col gap-kaam-row-gap pb-24">
        {/*  Header Section  */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-kaam-headline-lg text-kaam-primary">Configure Plan Details</h1>
            <p className="font-kaam-body-sm text-kaam-on-surface-variant mt-1">Review and configure operational routing for requested products.</p>
          </div>
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-kaam-outline rounded-kaam-DEFAULT text-kaam-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 font-kaam-body-sm font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Basket
          </button>
        </div>

        {/*  Customer & Global Info Bento Grid  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-kaam-column-gap">
          {/*  Customer Card  */}
          <div className="col-span-1 bg-kaam-surface border border-kaam-outline-variant rounded-kaam-xl p-4 flex flex-col shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-kaam-DEFAULT bg-kaam-surface-container-highest flex items-center justify-center text-kaam-secondary border border-kaam-outline-variant">
                  <span className="material-symbols-outlined text-[24px]">{isCustomer ? "storefront" : "corporate_fare"}</span>
                </div>
                <div>
                  <h2 className="font-kaam-headline-md text-kaam-on-surface text-base">{sourceDetail.customerName || sourceDetail.name || "Default Account"}</h2>
                  <span className="font-kaam-label-md text-kaam-on-surface-variant">#{sourceDetail.customerCode || sourceDetail.outletCode || "CODE-000"}</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-kaam-tertiary-fixed text-kaam-on-tertiary-fixed font-kaam-label-md rounded-kaam-DEFAULT text-[10px]">
                {sourceDetail.paymentTerms || "Standard Net"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div>
                <p className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase">Location</p>
                <p className="font-kaam-body-sm text-kaam-on-surface flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {sourceDetail.address || "Kathmandu"}
                </p>
              </div>
              <div>
                <p className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase">Contact</p>
                <p className="font-kaam-body-sm text-kaam-on-surface flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  {sourceDetail.phone || "+977-1-XXXXXX"}
                </p>
              </div>
            </div>
          </div>

          {/*  Global Logistics & Plan Details  */}
          <div className="col-span-1 lg:col-span-2 bg-kaam-surface border border-kaam-outline-variant rounded-kaam-xl p-4 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-kaam-outline-variant pb-3 gap-3">
              <div className="flex items-center gap-4">
                <h2 className="font-kaam-headline-md text-kaam-on-surface text-base">Plan Header Config</h2>
                <span className="px-2 py-1 bg-kaam-error-container text-kaam-on-error-container font-kaam-label-md rounded-kaam-DEFAULT text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] fill-icon">warning</span> Urgent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase whitespace-nowrap">Supervisor</label>
                <select 
                  className="border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 pl-2 pr-8 focus:border-secondary focus:ring-1 focus:ring-secondary h-8"
                  value={fieldValues.supervisor}
                  onChange={handleFieldChange("supervisor")}
                >
                  <option value="A. Sharma (Shift 1)">A. Sharma (Shift 1)</option>
                  <option value="B. Thapa (Shift 2)">B. Thapa (Shift 2)</option>
                  <option value="R. Maharjan (Shift 3)">R. Maharjan (Shift 3)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-2">
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">Assembly Line</label>
                <select 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright"
                  value={fieldValues.productionLine}
                  onChange={handleFieldChange("productionLine")}
                >
                  <option value="Line 4">Line 4</option>
                  <option value="Line 1">Line 1</option>
                  <option value="Line 2">Line 2</option>
                </select>
              </div>
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">Raw Material</label>
                <select 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright"
                  value={fieldValues.materialWarehouse}
                  onChange={handleFieldChange("materialWarehouse")}
                >
                  <option value="Hub B">Hub B</option>
                  <option value="Hub A">Hub A</option>
                </select>
              </div>
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">Start Date (AD)</label>
                <input 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright" 
                  type="date" 
                  value={fieldValues.planStartDate} 
                  onChange={handleFieldChange("planStartDate")}
                />
              </div>
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">Start Date (BS)</label>
                <NepaliDatePicker 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright px-2" 
                  placeholder="YYYY-MM-DD"
                  value={fieldValues.planStartDateNp || ""} 
                  onChange={handleFieldChange("planStartDateNp")}
                />
              </div>
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">End Date (AD)</label>
                <input 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright" 
                  type="date" 
                  value={fieldValues.planEndDate} 
                  onChange={handleFieldChange("planEndDate")}
                />
              </div>
              <div>
                <label className="font-kaam-label-md text-kaam-on-surface-variant text-[10px] uppercase block mb-1">End Date (BS)</label>
                <NepaliDatePicker 
                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary h-9 bg-kaam-surface-bright px-2" 
                  placeholder="YYYY-MM-DD"
                  value={fieldValues.planEndDateNp || ""} 
                  onChange={handleFieldChange("planEndDateNp")}
                />
              </div>
            </div>
          </div>
        </div>

        {/*  Product Basket & Configuration  */}
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h3 className="font-kaam-headline-md text-kaam-on-surface">Product Basket Configurations</h3>
            <div className="flex items-center gap-2">
              <span className="font-kaam-label-md text-kaam-on-surface-variant whitespace-nowrap">Apply to all products:</span>
              <select className="border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 focus:border-secondary focus:ring-1 focus:ring-secondary bg-kaam-surface-bright h-8">
                <option>Standard Routing Profile</option>
                <option>Expedited Routing</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {tempData.basket.map((item: any, basketIdx: number) => {
              const sizesObj = item.sizes || {};
              const sizesKeys = ["XS", "S", "M", "L", "XL", "XXL"];
              const totalSizes = Object.values(sizesObj).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

              return (
                <div key={item.id || basketIdx} className="bg-kaam-surface border border-kaam-outline-variant rounded-kaam-xl overflow-hidden shadow-sm group">
                  {/*  Accordion Header  */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-kaam-surface border-b border-kaam-outline-variant gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-kaam-surface-container-highest rounded-kaam-DEFAULT overflow-hidden border border-kaam-outline-variant shrink-0">
                        <img 
                          alt={item.productName} 
                          className="w-full h-full object-cover object-top" 
                          src={item.productImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg"}
                        />
                      </div>
                      <div>
                        <h4 className="font-kaam-headline-md text-kaam-on-surface text-lg">{item.productName}</h4>
                        <p className="font-kaam-body-sm text-kaam-on-surface-variant">SKU: {item.productCode || item.productId} • Qty: {item.quantity || totalSizes} units ({item.variant})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:ml-auto">
                      <button 
                        type="button"
                        onClick={onVerifyStock}
                        className="w-full sm:w-auto px-3 py-1.5 border border-kaam-outline-variant rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-1 bg-kaam-surface-bright"
                      >
                        <span className="material-symbols-outlined text-[16px]">inventory</span>
                        Verify Stock
                      </button>
                    </div>
                  </div>

                  {/*  Accordion Body  */}
                  <div className="p-4 bg-kaam-background border-b border-kaam-outline-variant last:border-b-0 flex flex-col gap-6">
                    {/*  Size/Variant Matrix  */}
                    <div className="bg-kaam-surface border border-kaam-outline-variant rounded-kaam-lg p-3">
                      <h5 className="font-kaam-label-md text-kaam-on-surface-variant mb-2 uppercase text-[10px]">Production Matrix Request</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-kaam-outline-variant">
                              <th className="py-2 pr-4 font-kaam-label-md text-kaam-on-surface text-[11px] font-bold w-1/4">Variant / Size</th>
                              {sizesKeys.map(k => <th key={k} className="py-2 px-2 font-kaam-label-md text-kaam-on-surface text-[11px]">{k}</th>)}
                              <th className="py-2 pl-2 font-kaam-label-md text-kaam-on-surface text-[11px] text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="font-kaam-body-sm text-kaam-on-surface-variant">
                            <tr className="hover:bg-surface-container-lowest transition-colors">
                              <td className="py-2 pr-4 font-bold text-kaam-on-surface text-xs">{item.variant || "Standard"}</td>
                              {sizesKeys.map(k => (
                                <td key={k} className="py-2 px-2">{sizesObj[k] || 0}</td>
                              ))}
                              <td className="py-2 pl-2 text-right font-bold text-kaam-on-surface">{totalSizes || item.quantity}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/*  Dynamic Routing Stages  */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-kaam-label-md text-kaam-on-surface-variant uppercase text-[10px]">Operational Routing Stages</h5>
                        <button 
                          type="button"
                          onClick={handleAddStage}
                          className="text-kaam-secondary font-kaam-label-md hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Stage
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {stages.map((stage: any, idx: number) => (
                          <div key={stage.id || idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-kaam-surface border border-kaam-outline-variant rounded-kaam-DEFAULT p-3 sm:p-2 hover:border-secondary transition-colors group/stage relative">
                            <span className="material-symbols-outlined text-kaam-outline-variant cursor-grab active:cursor-grabbing text-[18px] hidden sm:block">drag_indicator</span>
                            <div className="w-6 h-6 rounded-kaam-DEFAULT bg-kaam-primary-container text-kaam-on-primary-container flex items-center justify-center font-kaam-label-md text-[10px] shrink-0 absolute top-3 right-10 sm:static sm:top-auto sm:right-auto">
                              {stage.id}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-grow items-center">
                              <select 
                                className="border-none bg-transparent font-kaam-body-sm text-kaam-on-surface focus:ring-0 p-0 text-sm font-bold"
                                value={stage.name}
                                onChange={e => handleStageChange(idx, "name", e.target.value)}
                              >
                                <option value="Material Check">Material Check</option>
                                <option value="Cutting">Cutting</option>
                                <option value="Stitching">Stitching</option>
                                <option value="Finishing">Finishing</option>
                                <option value="Quality Check">Quality Check</option>
                                <option value="Packing">Packing</option>
                              </select>
                              <select 
                                className="border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 text-xs focus:border-secondary focus:ring-1 focus:ring-secondary h-7"
                                value={stage.workCenter}
                                onChange={e => handleStageChange(idx, "workCenter", e.target.value)}
                              >
                                <option value="QC Station 1">QC Station 1</option>
                                <option value="Cutter Auto-B">Cutter Auto-B</option>
                                <option value="Line 4A">Line 4A</option>
                                <option value="Sewing Floor">Sewing Floor</option>
                                <option value="QC Table">QC Table</option>
                                <option value="Packing Area">Packing Area</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <input 
                                  className="w-16 border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 text-xs text-center focus:border-secondary focus:ring-1 focus:ring-secondary h-7" 
                                  type="number" 
                                  value={stage.leadHours} 
                                  onChange={e => handleStageChange(idx, "leadHours", e.target.value)}
                                />
                                <span className="font-kaam-label-md text-kaam-on-surface-variant text-[10px]">hrs lead</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="font-kaam-label-md text-kaam-on-surface-variant text-[9px] uppercase">AD Date</span>
                                <input 
                                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 text-xs focus:border-secondary focus:ring-1 focus:ring-secondary h-7" 
                                  type="date" 
                                  value={stage.date} 
                                  onChange={e => handleStageChange(idx, "date", e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="font-kaam-label-md text-kaam-on-surface-variant text-[9px] uppercase">BS Date</span>
                                <NepaliDatePicker 
                                  className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT font-kaam-body-sm text-kaam-on-surface py-1 px-2 text-xs focus:border-secondary focus:ring-1 focus:ring-secondary h-7" 
                                  placeholder="YYYY-MM-DD"
                                  value={stage.dateNp || ""} 
                                  onChange={e => handleStageChange(idx, "dateNp", e.target.value)}
                                />
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleDeleteStage(idx)}
                              className="text-kaam-outline-variant hover:text-error transition-colors p-1 absolute top-2 right-2 sm:static sm:top-auto sm:right-auto"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*  Global Instructions  */}
        <div className="bg-kaam-surface border border-kaam-outline-variant rounded-kaam-xl p-4 shadow-sm mt-4">
          <label className="font-kaam-headline-md text-kaam-on-surface text-base block mb-2">Global Production Notes</label>
          <textarea 
            className="w-full border-kaam-outline-variant rounded-kaam-DEFAULT bg-kaam-surface-bright font-kaam-body-sm text-kaam-on-surface p-3 focus:border-secondary focus:ring-1 focus:ring-secondary min-h-[100px] resize-y" 
            placeholder="Enter instructions applicable to all items in this plan..."
            value={fieldValues.globalNotes}
            onChange={handleFieldChange("globalNotes")}
          />
        </div>
      </div>

      {/*  Sticky Footer  */}
      <footer className="bg-kaam-surface border border-kaam-outline-variant p-4 px-kaam-gutter sticky bottom-0 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-kaam-xl">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-kaam-outline rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md font-bold hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={onReviewPlan}
          className="px-6 py-2 bg-kaam-primary text-kaam-on-primary rounded-kaam-DEFAULT font-kaam-label-md font-bold hover:bg-[#222] transition-colors shadow-sm"
        >
          Review Plan Summary
        </button>
      </footer>
    </>
  );
}
