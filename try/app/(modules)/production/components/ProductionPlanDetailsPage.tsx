"use client";

import { useSearchParams } from "next/navigation";

const summaryFields = [
  ["Demand Type", "summaryDemandType"],
  ["Source Name", "summarySourceName"],
  ["Product", "summaryProduct"],
  ["Total Quantity", "summaryQuantity"],
  ["Planned Start", "summaryStartDate"],
  ["Planned Completion", "summaryCompletionDate"],
  ["Required Date", "summaryRequiredDate"],
  ["Priority", "summaryPriority"],
];

const overviewFields = [
  ["Plan No", "overviewPlanNo"],
  ["Plan Date", "overviewPlanDate"],
  ["Demand Type", "overviewDemandType"],
  ["Source Name", "overviewSourceName"],
  ["Output Destination", "overviewOutputDestination"],
  ["Status", "overviewStatus"],
];

const sourceFields = [
  ["Code", "sourceCode"],
  ["Name", "sourceDetailName"],
  ["Phone / Contact", "sourcePhone"],
  ["Location", "sourceLocation"],
  ["Extra Info", "sourceExtra"],
];

const dateFields = [
  ["Plan Date", "datePlanDate"],
  ["Planned Start", "dateStartDate"],
  ["Planned Completion", "dateCompletionDate"],
  ["Required Date", "dateRequiredDate"],
  ["Buffer Days", "dateBufferDays"],
];

const tabs = [
  ["Overview", "overviewTab", "grid_view"],
  ["Materials", "materialsTab", "inventory_2"],
  ["Stages", "stagesTab", "route"],
  ["Size Breakdown", "sizesTab", "straighten"],
  ["Activity", "activityTab", "history"],
];

const sizeFields = [
  ["XS", "sizeXS"],
  ["S", "sizeS"],
  ["M", "sizeM"],
  ["L", "sizeL"],
  ["XL", "sizeXL"],
  ["XXL", "sizeXXL"],
];

function SummaryGrid({ fields }: { fields: string[][] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {fields.map(([label, id]) => (
        <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-between min-h-[110px]" key={id}>
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 font-mono text-center break-words w-full">{label}</span>
          <strong className="text-slate-800 text-2xl mt-3 font-semibold block truncate text-center w-full min-w-0" id={id}>-</strong>
        </div>
      ))}
    </div>
  );
}

function SelectedInfoGrid({ fields }: { fields: string[][] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 border border-slate-200 rounded-xl">
      {fields.map(([label, id]) => (
        <div key={id} className="flex flex-col">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono">{label}</span>
          <strong className="text-slate-800 text-sm mt-1.5 font-semibold block truncate" id={id}>-</strong>
        </div>
      ))}
    </div>
  );
}

function ProductWorkspace({
  countId,
  listId,
  detailId,
  emptyText,
}: {
  countId: string;
  listId: string;
  detailId: string;
  emptyText: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="material-symbols-outlined text-[20px] text-blue-600">inventory_2</span>
          <span>Products In Plan</span>
          <strong id={countId} className="px-2 py-0.5 bg-blue-50 text-blue-600 font-mono text-xs rounded-full">0</strong>
        </div>
      </div>

      <div className="relative">
        <div id={listId} className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin" role="listbox">
          <div className="text-slate-400 text-sm py-4">Loading plan products...</div>
        </div>
      </div>

      <section id={detailId} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-4 sm:p-6 lg:p-8 mt-4 min-h-[140px]">
        <div className="text-slate-400 text-sm text-center py-8">{emptyText}</div>
      </section>
    </div>
  );
}

export function ProductionPlanDetailsPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-20260529-001";

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-24">
      {/* Hero Header Section */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/5 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>
        
        <div className="z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] text-blue-700 font-mono tracking-wider font-semibold uppercase mb-3">
            <span className="material-symbols-outlined text-[12px] text-blue-600">visibility</span> Plan Summary
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Production Plan Details</h1>
          <p className="text-sm text-slate-500 mt-1">View production plan summary, materials, stages, size breakdown, and activity.</p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10">
          <a href="/production/plans" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Plans
          </a>
          <a id="editPlanBtn" href={`/production/plans/${planId}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-900/10">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Plan
          </a>
          <a id="stageUpdateBtn" href={`/production/plans/${planId}/stage`} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">update</span> Update Stage
          </a>
        </div>
      </div>

      <input type="hidden" id="selectedPlanId" value={planId} />

      {/* Summary Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h2 id="detailsPlanNo" className="text-xl font-bold text-slate-800">Loading...</h2>
            <p id="detailsPlanSubtitle" className="text-xs text-slate-400 mt-0.5">Loading production plan information...</p>
          </div>
          <span id="detailsStatusBadge" className="status-badge">Loading</span>
        </div>

        <SummaryGrid fields={summaryFields} />
      </section>

      {/* Tabs Control & Panel */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col">
        <div className="flex border-b border-slate-100 pb-2 mb-8 overflow-x-auto gap-2">
          {tabs.map(([label, target, icon]) => (
            <button
              type="button"
              className="pp-tab flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent font-semibold text-slate-400 hover:text-slate-600 [&.active]:border-blue-600 [&.active]:text-blue-600 transition-all text-sm cursor-pointer"
              data-tab={target}
              key={target}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Panel */}
        <div id="overviewTab" className="pp-tab-panel hidden [&.active]:flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-800 text-base">Demand Information</h3>
            <SelectedInfoGrid fields={overviewFields} />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <h3 className="font-bold text-slate-800 text-base">Products In This Plan</h3>
            <ProductWorkspace
              countId="detailsProductCount"
              listId="detailsProductList"
              detailId="activeProductDetail"
              emptyText="Select a product from the list to view details."
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <h3 id="sourceDetailTitle" className="font-bold text-slate-800 text-base">Source Details</h3>
            <SelectedInfoGrid fields={sourceFields} />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <h3 className="font-bold text-slate-800 text-base">Planning Dates</h3>
            <SummaryGrid fields={dateFields} />
          </div>
        </div>

        {/* Materials Panel */}
        <div id="materialsTab" className="pp-tab-panel hidden [&.active]:block">
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Material Requirements</h3>
              <p className="text-xs text-slate-400 mt-0.5">Materials are calculated from BOM and material master mock data.</p>
            </div>
            
            <div className="pp-table-wrapper">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Material Name</th>
                    <th>Material Type</th>
                    <th>Required Qty</th>
                    <th>Available Qty</th>
                    <th>Shortage Qty</th>
                    <th>Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="detailsMaterialBody">
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400">Loading material requirements...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stages Panel */}
        <div id="stagesTab" className="pp-tab-panel hidden [&.active]:flex flex-col gap-6">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Production Stage Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Dynamic stage-by-stage workflow status and timeline details.</p>
          </div>

          {/* Product selector for stages */}
          <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 border border-slate-100 rounded-3xl mt-4">
            <h4 className="font-bold text-slate-700 text-sm mb-4">Select Product to View Stages</h4>
            <div id="detailsStagesProductList" className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin" role="listbox">
              <div className="text-slate-400 text-xs py-2">Loading products...</div>
            </div>
          </div>

          <div id="detailsStagesSplitLayout" className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 mt-6 items-start">
            {/* Left Column: Vertical Connecting Stepper */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-4 sm:p-6 lg:p-8">
              <div className="stages-timeline-container relative flex flex-col gap-4" id="detailsStageTimeline">
                <div className="text-slate-400 text-sm py-4 text-center">Loading stages...</div>
              </div>
            </div>

            {/* Right Column: Stage Details Panel */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-4 sm:p-6 lg:p-8" id="detailsStagePanel">
              <div className="text-slate-400 text-sm py-6 text-center">Select a stage to view progress.</div>
            </div>
          </div>
        </div>

        {/* Size Breakdown Panel */}
        <div id="sizesTab" className="pp-tab-panel hidden [&.active]:flex flex-col gap-6">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Size Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quantity distribution by garment size.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {sizeFields.map(([label, id]) => (
              <div className="bg-slate-50/60 p-6 border border-slate-200 rounded-xl flex flex-col items-center justify-between min-h-[90px]" key={id}>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono">{label}</span>
                <strong className="text-slate-800 text-xl font-semibold mt-2 font-mono" id={id}>0</strong>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-4 sm:p-6 lg:p-8 mt-6">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-slate-400 font-mono">Total Size Qty</span>
                <strong className="text-slate-800 text-xl font-semibold font-mono" id="detailsSizeTotal">0</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-slate-400 font-mono">Plan Quantity</span>
                <strong className="text-slate-800 text-xl font-semibold font-mono" id="detailsPlanQuantity">0</strong>
              </div>
            </div>
            <div id="detailsSizeMessage" className="px-4 py-2 rounded-xl text-xs font-semibold [&.success]:bg-green-50 [&.success]:text-green-700 [&.danger]:bg-red-50 [&.danger]:text-red-700">
              Loading size validation...
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <h3 className="font-bold text-slate-800 text-base">Product Wise Size And Fabric Variants</h3>
            <ProductWorkspace
              countId="detailsSizeProductCount"
              listId="detailsSizeProductList"
              detailId="activeSizeProductDetail"
              emptyText="Select a product from the list to view its size breakdown."
            />
          </div>
        </div>

        {/* Activity Panel */}
        <div id="activityTab" className="pp-tab-panel hidden [&.active]:block">
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Activity Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">Mock activity timeline for this production plan.</p>
            </div>

            <div className="activity-timeline relative pl-6 border-l border-slate-100 ml-3 flex flex-col gap-6 py-4" id="activityTimeline">
              <div className="activity-item flex gap-4">
                <span className="activity-dot w-2.5 h-2.5 bg-blue-500 rounded-full border border-white shadow-sm ring-4 ring-blue-50/50 absolute left-px -translate-x-1.5 mt-1.5" />
                <div>
                  <strong className="text-slate-800 text-sm block">Plan created</strong>
                  <p className="text-xs text-slate-500 mt-0.5">Production plan was created.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
