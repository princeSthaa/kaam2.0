"use client";

import React, { useMemo, useEffect, useState } from 'react';

// Mock Database Lists
export const mockMaterials = [
  { id: "MAT-001", materialCode: "RM-FAB-COT-DYED", name: "Dyed Cotton Fabric", type: "Fabric", availableQty: 1800, unit: "meter" },
  { id: "MAT-002", materialCode: "RM-FAB-PIQUE-DYED", name: "Dyed Pique Fabric", type: "Fabric", availableQty: 950, unit: "meter" },
  { id: "MAT-003", materialCode: "RM-FAB-TRS-DYED", name: "Dyed Trouser Fabric", type: "Fabric", availableQty: 700, unit: "meter" },
  { id: "MAT-004", materialCode: "RM-FAB-FLEECE-DYED", name: "Dyed Fleece Fabric", type: "Fabric", availableQty: 420, unit: "meter" },
  { id: "MAT-005", materialCode: "RM-FAB-KURTA-DYED", name: "Dyed Kurta Fabric", type: "Fabric", availableQty: 600, unit: "meter" },
  { id: "MAT-006", materialCode: "RM-THR-DYED", name: "Dyed Sewing Thread", type: "Thread", availableQty: 3000, unit: "tube" },
  { id: "MAT-007", materialCode: "RM-FUS-COLLAR", name: "Collar Fusing", type: "Fusing", availableQty: 500, unit: "meter" },
  { id: "MAT-008", materialCode: "RM-BTN-STD", name: "Buttons", type: "Accessories", availableQty: 80000, unit: "pcs" },
  { id: "MAT-009", materialCode: "RM-ZIP-STD", name: "Zippers", type: "Accessories", availableQty: 1200, unit: "pcs" },
  { id: "MAT-010", materialCode: "RM-LBL-BRAND", name: "Brand Label", type: "Labels", availableQty: 15000, unit: "pcs" },
  { id: "MAT-011", materialCode: "RM-BAG-POLY", name: "Packaging Bag", type: "Packaging", availableQty: 25000, unit: "pcs" },
];

export const mockBoms = [
  { productId: "PRD-001", materialId: "MAT-001", qtyPerUnit: 1.8, wastagePercent: 5 },
  { productId: "PRD-001", materialId: "MAT-006", qtyPerUnit: 0.2, wastagePercent: 2 },
  { productId: "PRD-001", materialId: "MAT-007", qtyPerUnit: 0.15, wastagePercent: 5 },
  { productId: "PRD-001", materialId: "MAT-008", qtyPerUnit: 8, wastagePercent: 2 },
  { productId: "PRD-001", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-001", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-002", materialId: "MAT-004", qtyPerUnit: 2.2, wastagePercent: 4 },
  { productId: "PRD-002", materialId: "MAT-006", qtyPerUnit: 0.3, wastagePercent: 2 },
  { productId: "PRD-002", materialId: "MAT-009", qtyPerUnit: 2, wastagePercent: 2 },
  { productId: "PRD-002", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-002", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-003", materialId: "MAT-001", qtyPerUnit: 1.6, wastagePercent: 4 },
  { productId: "PRD-003", materialId: "MAT-006", qtyPerUnit: 0.15, wastagePercent: 2 },
  { productId: "PRD-003", materialId: "MAT-007", qtyPerUnit: 0.12, wastagePercent: 5 },
  { productId: "PRD-003", materialId: "MAT-008", qtyPerUnit: 7, wastagePercent: 2 },
  { productId: "PRD-003", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-003", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-004", materialId: "MAT-002", qtyPerUnit: 1.4, wastagePercent: 4 },
  { productId: "PRD-004", materialId: "MAT-006", qtyPerUnit: 0.15, wastagePercent: 2 },
  { productId: "PRD-004", materialId: "MAT-008", qtyPerUnit: 3, wastagePercent: 2 },
  { productId: "PRD-004", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-004", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },
];

function typeIcon(type: string) {
  switch (type) {
    case "Fabric": return "texture";
    case "Thread": return "draw";
    case "Fusing": return "layers";
    case "Accessories": return "settings";
    case "Labels": return "label";
    case "Packaging": return "inventory_2";
    default: return "category";
  }
}

export default function StockModal({ tempData, onClose, onRequestProcurement }: any) {
  const [animateIn, setAnimateIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setAnimateIn(true));
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for slide-out animation
  };

  const materialList = useMemo(() => {
    if (!tempData || !tempData.basket) return [];

    const calculated: { [key: string]: any } = {};

    tempData.basket.forEach((item: any) => {
      let boms = mockBoms.filter(b => b.productId === item.productId);
      
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
          { productId: item.productId, materialId: "MAT-006", qtyPerUnit: 0.2, wastagePercent: 2 },
          { productId: item.productId, materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
          { productId: item.productId, materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },
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
            unit: material.unit,
            location: material.materialCode.includes("FAB") ? "Hub B" : (material.materialCode.includes("THR") || material.materialCode.includes("ZIP") || material.materialCode.includes("BTN") ? "Trim Room A" : "Accessories WH")
          };
        }
      });
    });

    return Object.values(calculated).map(mat => {
      const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
      const fulfillment = mat.requiredQty > 0 ? Math.min((mat.availableQty / mat.requiredQty) * 100, 100) : 100;
      return {
        name: mat.materialName,
        code: mat.materialCode,
        requiredRaw: Math.ceil(mat.requiredQty),
        availableRaw: mat.availableQty,
        required: `${Math.ceil(mat.requiredQty).toLocaleString()} ${mat.unit}`,
        available: `${mat.availableQty.toLocaleString()} ${mat.unit}`,
        shortage: shortageQty > 0,
        shortageQty: Math.ceil(shortageQty),
        fulfillment: Math.round(fulfillment),
        location: mat.location,
        type: mat.materialType,
        unit: mat.unit
      };
    });
  }, [tempData]);

  const totalRequired = materialList.length;
  const totalShortages = materialList.filter(m => m.shortage).length;
  const healthPercent = totalRequired > 0 ? Math.round(((totalRequired - totalShortages) / totalRequired) * 100) : 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOverlayOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes modalAnimateIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalAnimateOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(20px); }
        }
        .overlay-animate-in { animation: fadeOverlayIn 0.3s ease-out forwards; }
        .overlay-animate-out { animation: fadeOverlayOut 0.2s ease-in forwards; }
        .modal-animate-in { animation: modalAnimateIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-animate-out { animation: modalAnimateOut 0.2s ease-in forwards; }
        
        .prog-bar { transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
      ` }} />

      {/* Centered Modal Container */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12 ${isClosing ? 'overlay-animate-out' : 'overlay-animate-in'}`}>
        
        {/* Overlay Background */}
        <div 
          className="absolute inset-0 bg-slate-900/60"
          onClick={handleClose}
        />

        {/* Modal Card */}
        <div 
          className={`relative w-full max-w-4xl bg-white rounded-2xl md:rounded-[2rem] shadow-2xl z-[210] flex flex-col overflow-hidden ${isClosing ? 'modal-animate-out' : 'modal-animate-in'}`}
          style={{ maxHeight: '90vh', overscrollBehavior: 'contain' }}
        >
          
          {/* Header */}
          <header className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center text-indigo-600 shadow-sm">
              <span className="material-symbols-outlined text-2xl">inventory</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Material Verification</h2>
              <p className="text-sm text-slate-500 font-medium">BOM matching & stock availability</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 custom-scrollbar relative">
          
          {/* Health Overview */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-6 md:mb-8 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Readiness</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-slate-900">{healthPercent}%</span>
                  {totalShortages > 0 ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Action Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready for Prod
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`prog-bar h-full ${healthPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'}`}
                style={{ width: animateIn ? `${healthPercent}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-3">
              {totalShortages} out of {totalRequired} required materials have insufficient stock.
            </p>
          </div>

          {/* List of Materials */}
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Bill of Materials Requirement</h3>
          <div className="space-y-3">
            {materialList.map((mat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 hover:border-slate-300 transition-colors rounded-2xl p-5 shadow-sm group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                      <span className="material-symbols-outlined">{typeIcon(mat.type)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{mat.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{mat.code}</span>
                        <span className="text-[10px] font-medium text-slate-400">{mat.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Warning Indicator */}
                  {mat.shortage && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span className="text-xs font-bold uppercase">Shortage</span>
                    </div>
                  )}
                </div>

                {/* Sub Progress */}
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-500">Available: <strong className="text-slate-900">{mat.available}</strong></span>
                      <span className="text-slate-500">Required: <strong className="text-slate-900">{mat.required}</strong></span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`prog-bar h-full ${mat.shortage ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: animateIn ? `${mat.fulfillment}%` : '0%' }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {mat.shortage && (
                      <p className="text-xs font-medium text-rose-600">Missing {mat.shortageQty} {mat.unit}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-slate-100 bg-white shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10">
          <button 
            onClick={handleClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          {totalShortages > 0 ? (
            <button 
              onClick={() => {
                onRequestProcurement();
                handleClose();
              }}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
              Raise Procurement Request
            </button>
          ) : (
            <button 
              onClick={handleClose}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              All Clear - Continue
            </button>
          )}
        </div>

      </div>
    </div>
    </>
  );
}
