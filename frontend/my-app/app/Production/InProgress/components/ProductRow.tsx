import React from 'react';
import WorkflowView from './WorkflowView';

function adToNepali(adDateStr: string): string {
  if (!adDateStr) return "";
  try {
    const d = new Date(adDateStr);
    if (isNaN(d.getTime())) return adDateStr;
    if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
      const nf = (window as any).NepaliFunctions;
      return nf.AD2BS(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  } catch {
    return adDateStr;
  }
}

export default function ProductRow({ product, isExpanded, onToggle, onUpdateProduct }: any) {
  return (
    <div className="border-b border-kaam-outline-variant bg-kaam-surface-bright last:border-b-0 group">
      {/* Main Row Info */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-4 items-center cursor-pointer hover:bg-kaam-surface-container-low transition-colors"
        onClick={onToggle}
      >
        <div className="col-span-1 lg:col-span-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-kaam-DEFAULT border border-kaam-outline-variant overflow-hidden shrink-0 bg-kaam-surface-container">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface font-bold">{product.id}</div>
            <div className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant truncate">{product.name}</div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-kaam-full text-[10px] font-bold bg-kaam-surface-dim text-kaam-on-surface-variant w-fit">
            {product.source}
          </span>
        </div>

        <div className="col-span-1 lg:col-span-1 lg:text-right font-kaam-body-sm text-kaam-on-surface">
          <span className="lg:hidden text-kaam-on-surface-variant font-kaam-label-md mr-2">Qty:</span>
          {product.qty}
        </div>

        <div className="col-span-1 lg:col-span-2 lg:text-center font-kaam-body-sm text-kaam-on-surface flex items-center lg:justify-center gap-1">
          <span className="lg:hidden text-kaam-on-surface-variant font-kaam-label-md mr-2">Required:</span>
          <span className="material-symbols-outlined text-[16px] text-kaam-error">event</span>
          <span className="text-kaam-error font-bold">{product.requiredDate} {product.requiredDate && `(${adToNepali(product.requiredDate)} BS)`}</span>
        </div>

        <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
          <span className="lg:hidden text-kaam-on-surface-variant font-kaam-label-md mr-2 w-16">Progress:</span>
          <div className="flex-1 h-1.5 bg-kaam-surface-container-highest rounded-kaam-full overflow-hidden">
            <div className="h-full bg-kaam-secondary" style={{ width: `${product.progress}%` }}></div>
          </div>
          <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">{product.progress}%</span>
        </div>

        <div className="col-span-1 lg:col-span-1 flex lg:justify-end items-center gap-4">
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-kaam-DEFAULT bg-kaam-secondary-container text-kaam-on-secondary-container font-kaam-label-md text-[10px] uppercase">
            {product.stage}
          </span>
          <span className={`material-symbols-outlined text-kaam-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded Workflow Content */}
      {isExpanded && (
        <div className="px-4 lg:px-8 pb-4">
            <WorkflowView 
              product={product} 
              onUpdateProduct={onUpdateProduct} 
            />
        </div>
      )}
    </div>
  );
}
