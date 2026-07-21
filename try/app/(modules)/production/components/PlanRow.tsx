import React, { useState } from 'react';
import ProductRow from './ProductRow';

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

export default function PlanRow({ plan, isExpanded, onToggle, onUpdatePlan }: any) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  return (
    <div className="border-b border-kaam-outline-variant bg-kaam-surface-bright last:border-b-0">
      {/* Plan Header Row */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-kaam-surface-container-low transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-kaam-DEFAULT bg-kaam-surface-container flex items-center justify-center shrink-0 mt-0.5 border border-kaam-outline-variant">
            <span className="material-symbols-outlined text-kaam-secondary">assignment</span>
          </div>
          <div>
            <div className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface font-bold">Plan: {plan.id}</div>
            <div className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant truncate">
              Client: {plan.client} | Due: {plan.dueDate} {plan.dueDate && `(${adToNepali(plan.dueDate)} BS)`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-kaam-full text-[10px] font-bold w-fit ${
              plan.status === 'Active' ? 'bg-kaam-tertiary-fixed text-kaam-on-tertiary-fixed' : 'bg-kaam-surface-dim text-kaam-on-surface-variant'
            }`}>
              {plan.status}
            </span>
            {(plan.priority === 'Urgent' || plan.priority === 'High') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-kaam-full text-[10px] font-bold bg-kaam-error-container text-kaam-on-error-container w-fit">
                Urgent
              </span>
            )}
            
            <div className="flex items-center gap-2 w-32">
              <div className="flex-1 h-1.5 bg-kaam-surface-container-highest rounded-kaam-full overflow-hidden">
                <div className="h-full bg-kaam-secondary" style={{ width: `${plan.progress}%` }}></div>
              </div>
              <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant">{plan.progress}%</span>
            </div>
          </div>
          
          <span className={`material-symbols-outlined text-kaam-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded Products Area */}
      {isExpanded && (
        <div className="bg-kaam-surface-container-lowest border-t border-kaam-outline-variant">
          {/* Pinned Header for Products */}
          <div className="grid grid-cols-12 gap-4 px-8 py-3 border-b border-kaam-outline-variant bg-kaam-surface-container-low font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider hidden lg:grid">
            <div className="col-span-4">Product Details</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-1 text-right">Target Qty</div>
            <div className="col-span-2 text-center">Required Date</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-center">Stage</div>
          </div>

          <div className="flex flex-col">
            {plan.products.map((product: any) => (
              <ProductRow 
                key={product.id} 
                product={product} 
                isExpanded={expandedProductId === product.id}
                onToggle={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                onUpdateProduct={(updatedProduct: any) => {
                  const updatedProducts = plan.products.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
                  const activeProdStages = updatedProducts[0]?.stages || [];
                  const planCompletedCount = activeProdStages.filter((s: any) => s.status === "Completed").length;
                  const planCalculatedProgress = activeProdStages.length ? Math.round((planCompletedCount / activeProdStages.length) * 100) : 0;
                  onUpdatePlan({
                    ...plan,
                    progress: planCalculatedProgress,
                    products: updatedProducts
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
