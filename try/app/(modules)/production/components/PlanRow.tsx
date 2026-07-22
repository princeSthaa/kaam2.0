import React, { useState } from 'react';
import Link from 'next/link';
import ProductRow from './ProductRow';
import { StatusBadge } from './StatusBadge';

function formatCleanNepaliDate(dateVal: any): string {
  if (!dateVal) return "N/A";
  let dateStr = String(dateVal).trim();
  if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
  if (dateStr.includes(" ")) dateStr = dateStr.split(" ")[0];

  if (dateStr.startsWith("208") || dateStr.startsWith("207") || dateStr.startsWith("209")) {
    return dateStr.includes("BS") ? dateStr : `${dateStr} BS`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return `${dateStr} BS`;

  const adYear = d.getFullYear();
  const adMonth = d.getMonth();
  const adDay = d.getDate();

  const bsYear = adYear + (adMonth > 3 || (adMonth === 3 && adDay >= 14) ? 57 : 56);
  const bsMonthNum = ((adMonth + 8) % 12) + 1;
  const mStr = String(bsMonthNum).padStart(2, "0");
  const dStr = String(adDay).padStart(2, "0");

  return `${bsYear}-${mStr}-${dStr} BS`;
}

export default function PlanRow({ plan, isExpanded, onToggle, onUpdatePlan }: any) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleStatusChange = (newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onUpdatePlan({
      ...plan,
      status: newStatus
    });
  };

  return (
    <div className="border-b border-kaam-outline-variant bg-kaam-surface-bright last:border-b-0">
      {/* Plan Header Row */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-kaam-surface-container-low transition-colors relative"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-kaam-DEFAULT bg-kaam-surface-container flex items-center justify-center shrink-0 mt-0.5 border border-kaam-outline-variant">
            <span className="material-symbols-outlined text-kaam-secondary">assignment</span>
          </div>
          <div>
            <div className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface font-bold font-mono">
              Plan: {plan.id}
            </div>
            <div className="font-kaam-body-sm text-xs text-kaam-on-surface-variant truncate mt-0.5">
              Client/Source: <strong className="text-kaam-on-surface">{plan.client}</strong> &bull; Due: <strong className="text-kaam-on-surface font-mono">{formatCleanNepaliDate(plan.dueDate)}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            <StatusBadge status={plan.status} size="sm" />
            {(plan.priority === 'Urgent' || plan.priority === 'Critical' || plan.priority === 'High') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-kaam-full text-[10px] font-bold bg-kaam-error-container text-kaam-on-error-container w-fit">
                {plan.priority}
              </span>
            )}
            
            <div className="flex items-center gap-2 w-32">
              <div className="flex-1 h-1.5 bg-kaam-surface-container-highest rounded-kaam-full overflow-hidden">
                <div className="h-full bg-kaam-secondary transition-all" style={{ width: `${plan.progress}%` }}></div>
              </div>
              <span className="font-kaam-label-md text-xs font-mono text-kaam-on-surface-variant">{plan.progress}%</span>
            </div>
          </div>

          {/* Action Dropdown Button (Isolated per row) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2.5 py-1 text-xs font-bold bg-kaam-surface-container border border-kaam-outline-variant rounded-kaam-DEFAULT hover:bg-kaam-surface-container-high transition-colors flex items-center gap-1 text-kaam-on-surface"
            >
              Actions
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {isDropdownOpen && (
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
                <Link
                  href={`/production/plans/new?id=${encodeURIComponent(plan.id)}`}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit Plan
                </Link>
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
                isExpanded={expandedProductId === product.id}
                onToggle={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                onUpdateProduct={(updatedProduct: any) => {
                  const updatedProducts = plan.products.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
                  const activeProdStages = updatedProducts[0]?.stages || [];
                  const completedCount = activeProdStages.filter((s: any) => {
                    const st = String(s.status).toLowerCase();
                    return st === "completed" || st === "5";
                  }).length;
                  const activeCount = activeProdStages.filter((s: any) => {
                    const st = String(s.status).toLowerCase();
                    return st === "active" || st === "in progress" || st === "2";
                  }).length;

                  const planCalculatedProgress = activeProdStages.length > 0 
                    ? Math.min(100, Math.round(((completedCount + (activeCount * 0.5)) / activeProdStages.length) * 100))
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
