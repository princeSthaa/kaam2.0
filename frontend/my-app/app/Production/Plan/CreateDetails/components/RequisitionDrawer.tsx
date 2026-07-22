"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { mockMaterials, mockBoms } from './StockModal';

export default function RequisitionDrawer({ tempData, onClose }: any) {
  const [requiredDate, setRequiredDate] = useState("2026-07-20");
  const [urgency, setUrgency] = useState("high");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Lock background scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const firstItemName = tempData?.basket?.[0]?.productName || "Garments";

  const shortages = useMemo(() => {
    if (!tempData || !tempData.basket) return [];

    const calculated: { [key: string]: any } = {};

    tempData.basket.forEach((item: any) => {
      let boms = mockBoms.filter(b => b.productId === item.productId);
      
      // Dynamic fallback BOM generation if not found in mock list
      if (!boms.length) {
        let fabricName = "Dyed Cotton Fabric";
        if (item.variant) {
          const mainPart = item.variant.split("/")[0].trim();
          if (mainPart && mainPart !== "Standard" && mainPart !== "None") {
            fabricName = mainPart;
          }
        }
        
        let fabricCode = `RM-FAB-${fabricName.toUpperCase().replace(/\s+/g, '-')}`;
        let fabricMat = mockMaterials.find(m => m.materialCode === fabricCode);
        if (!fabricMat) {
          fabricMat = {
            id: `MAT-DYN-${fabricName}`,
            materialCode: fabricCode,
            name: fabricName,
            type: "Fabric",
            availableQty: 1200,
            unit: "meter"
          };
        }

        boms = [
          { productId: item.productId, materialId: fabricMat.id, qtyPerUnit: 1.6, wastagePercent: 5 },
          { productId: item.productId, materialId: "MAT-006", qtyPerUnit: 0.2, wastagePercent: 2 }, // Thread
          { productId: item.productId, materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 }, // Brand Label
          { productId: item.productId, materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 }, // Poly Bag
        ];

        if (item.productName.toLowerCase().includes("polo") || item.productName.toLowerCase().includes("shirt")) {
          boms.push({ productId: item.productId, materialId: "MAT-008", qtyPerUnit: 4, wastagePercent: 2 });
          boms.push({ productId: item.productId, materialId: "MAT-007", qtyPerUnit: 0.15, wastagePercent: 5 });
        }
        if (item.productName.toLowerCase().includes("jacket") || item.productName.toLowerCase().includes("trouser") || item.productName.toLowerCase().includes("zipper")) {
          boms.push({ productId: item.productId, materialId: "MAT-009", qtyPerUnit: 1, wastagePercent: 2 });
        }
      }

      boms.forEach(bom => {
        let material = mockMaterials.find(m => m.id === bom.materialId);
        if (!material && bom.materialId.startsWith("MAT-DYN-")) {
          const fName = bom.materialId.replace("MAT-DYN-", "");
          material = {
            id: bom.materialId,
            materialCode: `RM-FAB-${fName.toUpperCase().replace(/\s+/g, '-')}`,
            name: fName,
            type: "Fabric",
            availableQty: 1200,
            unit: "meter"
          };
        }
        if (!material) return;

        const baseQty = item.quantity * bom.qtyPerUnit;
        const requiredQty = baseQty + (baseQty * bom.wastagePercent) / 100;
        const key = material.materialCode;

        if (calculated[key]) {
          calculated[key].requiredQty += requiredQty;
        } else {
          calculated[key] = {
            materialCode: material.materialCode,
            materialName: material.name,
            materialType: material.type,
            requiredQty,
            availableQty: material.availableQty,
            unit: material.unit
          };
        }
      });
    });

    return Object.values(calculated)
      .map(mat => {
        const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
        return {
          name: mat.materialName,
          desc: mat.materialCode,
          shortage: `${Math.ceil(shortageQty)} ${mat.unit}`,
          shortageQty: Math.ceil(shortageQty)
        };
      })
      .filter(mat => mat.shortageQty > 0);
  }, [tempData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Purchase requisition submitted successfully!\nRequired By: ${requiredDate}\nUrgency: ${urgency}\n\nProduction status will be updated to 'On Hold - Awaiting Materials'.`);
    onClose();
  };

  return (
    <>
      {/* Modal Overlay with Blur */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
        {/* Modal Container */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-950 tracking-tight">Create Purchase Requisition</h2>
              <p className="text-sm text-slate-500 mt-1">
                Auto-generated shortages for plan:{' '}
                <span className="font-semibold text-indigo-650">({firstItemName})</span>
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-lg p-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 min-h-0">
            {/* Shortage List Card */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identified Material Shortages</h3>
              <div className="rounded-lg overflow-hidden border border-slate-150">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Material Item</th>
                      <th className="py-2.5 px-4 text-right">Shortage Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {shortages.length > 0 ? (
                      shortages.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{st.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{st.desc}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-200/50">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              {st.shortage}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-6 text-center text-slate-400 text-sm font-medium">
                          No material shortages calculated.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Requisition Form Fields */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requisition Details</h3>
              
              {/* Required By Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="required-date">
                  Required By Date <span className="text-red-500">*</span>
                </label>
                <input 
                  className="w-full border border-slate-250 rounded-lg bg-white py-2 px-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                  id="required-date" 
                  name="required-date" 
                  type="date" 
                  value={requiredDate}
                  onChange={e => setRequiredDate(e.target.value)}
                  required
                />
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="urgency">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-slate-250 rounded-lg bg-white py-2 px-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all h-10" 
                  id="urgency" 
                  name="urgency"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                >
                  <option value="standard">Standard Procurement</option>
                  <option value="high">High Priority (Expedite)</option>
                  <option value="critical">Critical / Line-Down Risk</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="notes">
                  Notes for Purchasing Dept.
                </label>
                <textarea 
                  className="w-full border border-slate-250 rounded-lg bg-white py-2 px-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y placeholder:text-slate-400" 
                  id="notes" 
                  name="notes" 
                  placeholder="Enter vendor instructions or details..." 
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </section>
            
            {/* Status Impact Alert */}
            <section className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-4 flex gap-3 items-start shadow-sm">
              <span className="material-symbols-outlined text-amber-600 mt-0.5">info</span>
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-0.5">Production Plan Status Impact</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Submitting this request will automatically place the production plan into an <strong>'On Hold - Awaiting Materials'</strong> status until receiving confirms inventory intake.
                </p>
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Requisition
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
