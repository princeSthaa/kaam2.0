import React, { useState } from 'react';
import Link from 'next/link';
import ProductRow from './ProductRow';
import { StatusBadge } from './StatusBadge';

export default function PlanRow({ plan, isExpanded, onToggle, onUpdatePlan }: any) {
  const firstProductId = plan.products?.[0]?.id || null;
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const activeProductId = expandedProductId === "closed" ? null : (expandedProductId ?? firstProductId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleStatusChange = (newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onUpdatePlan({
      ...plan,
      status: newStatus
    });
  };

  const totalQuantity = (plan.products || []).reduce(
    (sum: number, p: any) => sum + (Number(p.qty) || 0),
    0
  );

  return (
    <div className="border-b border-kaam-outline-variant bg-kaam-surface-bright last:border-b-0">
      {/* Plan Header Row */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-kaam-surface-container-low transition-colors relative gap-3"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-kaam-DEFAULT bg-kaam-surface-container flex items-center justify-center shrink-0 border border-kaam-outline-variant">
            <span className="material-symbols-outlined text-kaam-secondary">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-kaam-label-md text-sm font-black font-mono text-kaam-on-surface">
                {plan.id}
              </span>
              <span className="text-xs font-semibold text-kaam-on-surface-variant">
                • {plan.client}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-kaam-on-surface-variant mt-1 flex-wrap">
              <span>Qty: <strong className="text-kaam-on-surface font-mono font-bold">{totalQuantity.toLocaleString()} pcs</strong></span>
              <span>•</span>
              <span>Products: <strong className="text-kaam-on-surface font-bold">{plan.products?.length || 0} items</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={plan.status} size="sm" />
            {(plan.priority === 'Urgent' || plan.priority === 'Critical' || plan.priority === 'High') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-kaam-full text-[10px] font-bold bg-kaam-error-container text-kaam-on-error-container w-fit">
                {plan.priority}
              </span>
            )}
            
            <div className="flex items-center gap-2 w-28 sm:w-32">
              <div className="flex-1 h-2 bg-kaam-surface-container-highest rounded-kaam-full overflow-hidden">
                <div className="h-full bg-kaam-secondary transition-all" style={{ width: `${plan.progress}%` }}></div>
              </div>
              <span className="font-kaam-label-md text-xs font-mono text-kaam-on-surface-variant font-bold">{plan.progress}%</span>
            </div>
          </div>

          {/* Action Dropdown Button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              className="px-2.5 py-1 text-xs font-bold bg-kaam-surface-container border border-kaam-outline-variant rounded-kaam-DEFAULT hover:bg-kaam-surface-container-high transition-colors flex items-center gap-1 text-kaam-on-surface"
            >
              Actions
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                />
                <div 
                  className="absolute right-0 mt-1 w-44 bg-white border border-kaam-outline-variant rounded-kaam-DEFAULT shadow-lg z-50 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/production/plans/${encodeURIComponent(plan.id)}`}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                  </Link>
                  {!(String(plan.status || "").toLowerCase() === "completed" || String(plan.status || "") === "5") && (
                    <Link
                      href={`/production/plans/${encodeURIComponent(plan.planNo || plan.planId || plan.id)}/edit`}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit Plan
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange(plan.status === 'On Hold' ? 'Active' : 'On Hold', e)}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">pause_circle</span> 
                    {plan.status === 'On Hold' ? 'Resume Plan' : 'Hold / Pause Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange('Completed', e)}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Mark Completed
                  </button>
                </div>
              </>
            )}
          </div>
          
          <span className={`material-symbols-outlined text-kaam-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded Products Area */}
      {isExpanded && (
        <div className="bg-kaam-surface-container-lowest border-t border-kaam-outline-variant">
          <div className="grid grid-cols-12 gap-4 px-8 py-3 border-b border-kaam-outline-variant bg-kaam-surface-container-low font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase tracking-wider hidden lg:grid">
            <div className="col-span-4">Product Details</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-1 text-right">Target Qty</div>
            <div className="col-span-2 text-center">Required Date (BS)</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-center">Active Stage</div>
          </div>

          <div className="flex flex-col">
            {plan.products.map((product: any) => (
              <ProductRow 
                key={product.id} 
                product={product} 
                isExpanded={activeProductId === product.id}
                onToggle={() => setExpandedProductId(activeProductId === product.id ? "closed" : product.id)}
                onUpdateProduct={(updatedProduct: any) => {
                  const updatedProducts = plan.products.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
                  
                  // Aggregate stages across ALL products
                  const allProdStages = updatedProducts.flatMap((p: any) => p.stages || []);
                  const completedCount = allProdStages.filter((s: any) => {
                    const st = String(s.status).toLowerCase();
                    return st === "completed" || st === "5";
                  }).length;
                  const activeCount = allProdStages.filter((s: any) => {
                    const st = String(s.status).toLowerCase();
                    return st === "active" || st === "in progress" || st === "2";
                  }).length;

                  const planCalculatedProgress = allProdStages.length > 0 
                    ? Math.min(100, Math.round(((completedCount + (activeCount * 0.5)) / allProdStages.length) * 100))
                    : 0;

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
