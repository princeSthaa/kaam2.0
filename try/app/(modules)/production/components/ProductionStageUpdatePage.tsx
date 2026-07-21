"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { TableShell } from "@/app/components/ui/TableShell";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

const summaryFields = [
  ["Demand Type", "stageDemandType"],
  ["Source Name", "stageSourceName"],
  ["Product", "stageProductName"],
  ["Total Quantity", "stageTotalQuantity"],
  ["Planned Start", "stagePlannedStart"],
  ["Planned Completion", "stagePlannedCompletion"],
  ["Required Date", "stageRequiredDate"],
  ["Current Stage", "stageCurrentStage"],
];

const stageStatusOptions = [
  "Select Status",
  "Not Started",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
  "Rejected",
];

type StageSelectField = {
  kind: "select";
  name: string;
  id: string;
  label: string;
  options: string[];
};

type StageInputField = {
  kind: "input";
  name?: string;
  id: string;
  label: string;
  type: string;
  value?: string;
  readOnly?: boolean;
  min?: number;
};

type StageFormField = StageSelectField | StageInputField;

const stageFormFields: StageFormField[] = [
  {
    kind: "select",
    name: "SelectedProductId",
    id: "productDropdown",
    label: "Product",
    options: ["Select Product"],
  },
  {
    kind: "select",
    name: "SelectedStageId",
    id: "stageDropdown",
    label: "Stage Name",
    options: ["Select Stage"],
  },
  {
    kind: "select",
    name: "StageStatus",
    id: "stageStatus",
    label: "Stage Status",
    options: stageStatusOptions,
  },
  {
    kind: "input",
    id: "stagePlannedDateRange",
    label: "Planned Date Range",
    type: "text",
    value: "-",
    readOnly: true,
  },
  {
    kind: "input",
    name: "ActualStartDate",
    id: "actualStartDate",
    label: "Actual Start Date",
    type: "date",
  },
  {
    kind: "input",
    name: "ActualEndDate",
    id: "actualEndDate",
    label: "Actual End Date",
    type: "date",
  },
  {
    kind: "input",
    id: "actualDuration",
    label: "Actual Duration",
    type: "text",
    value: "0 days",
    readOnly: true,
  },
  {
    kind: "input",
    name: "CompletedQty",
    id: "completedQty",
    label: "Completed Qty",
    type: "number",
    min: 0,
  },
  {
    kind: "input",
    name: "RejectedQty",
    id: "rejectedQty",
    label: "Rejected Qty",
    type: "number",
    min: 0,
  },
  {
    kind: "input",
    id: "totalProcessedQty",
    label: "Total Processed",
    type: "text",
    value: "0",
    readOnly: true,
  },
];

const safelyConvertAD2BS = (adDateStr: string) => {
  if (!adDateStr || typeof window === 'undefined' || !(window as any).NepaliFunctions) return "";
  try {
    const [y, m, d] = adDateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    const bsObj = (window as any).NepaliFunctions.AD2BS({ year: y, month: m, day: d });
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
  if (!bsDateStr || typeof window === 'undefined' || !(window as any).NepaliFunctions) return "";
  try {
    const [y, m, d] = bsDateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    const adObj = (window as any).NepaliFunctions.BS2AD({ year: y, month: m, day: d });
    if (!adObj) return "";
    const yy = adObj.year;
    const mm = String(adObj.month).padStart(2, '0');
    const dd = String(adObj.day).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  } catch (e) {
    console.error(e);
    return "";
  }
};

function StageFormControl({ field }: { field: StageFormField }) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-2 ml-1 block">{field.label}</label>
      {field.kind === "select" ? (
        <select name={field.name} id={field.id} className="w-full border border-slate-200 rounded-xl px-6 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm h-12 cursor-pointer" defaultValue="">
          {field.options.map((option) => (
            <option value={option.startsWith("Select ") ? "" : option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "date" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-slate-400 font-mono mb-1 block uppercase">AD</label>
            <input
              name={"name" in field ? field.name : undefined}
              type="date"
              id={field.id}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none text-xs h-10 transition-all bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              onChange={(e) => {
                const val = e.target.value;
                const npInput = document.getElementById(field.id + "Np") as HTMLInputElement;
                if (npInput) {
                  npInput.value = safelyConvertAD2BS(val);
                }
              }}
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 font-mono mb-1 block uppercase">BS</label>
            <NepaliDatePicker
              id={field.id + "Np"}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none text-xs h-10 transition-all bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 px-2"
              placeholder="YYYY-MM-DD"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                const adInput = document.getElementById(field.id) as HTMLInputElement;
                if (adInput) {
                  adInput.value = safelyConvertBS2AD(val);
                  adInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
              }}
            />
          </div>
        </div>
      ) : (
        <input
          name={"name" in field ? field.name : undefined}
          type={field.type}
          min={field.min}
          id={field.id}
          className={`w-full border border-slate-200 rounded-xl px-6 py-3 outline-none text-sm h-12 transition-all ${field.readOnly ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600'}`}
          defaultValue={field.value}
          readOnly={field.readOnly}
        />
      )}
      {field.name ? <span className="field-error text-xs text-red-500 mt-1" /> : null}
    </div>
  );
}

export function ProductionStageUpdatePage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-20260529-001";

  useEffect(() => {
    let lastStart = "";
    let lastEnd = "";
    const interval = setInterval(() => {
      const startEl = document.getElementById("actualStartDate") as HTMLInputElement;
      const endEl = document.getElementById("actualEndDate") as HTMLInputElement;
      
      if (startEl && startEl.value !== lastStart) {
        lastStart = startEl.value;
        const startNpEl = document.getElementById("actualStartDateNp") as HTMLInputElement;
        if (startNpEl) {
          startNpEl.value = safelyConvertAD2BS(startEl.value);
        }
      }
      
      if (endEl && endEl.value !== lastEnd) {
        lastEnd = endEl.value;
        const endNpEl = document.getElementById("actualEndDateNp") as HTMLInputElement;
        if (endNpEl) {
          endNpEl.value = safelyConvertAD2BS(endEl.value);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-24">
      {/* Hero Header Section */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/5 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>
        
        <div className="z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] text-blue-700 font-mono tracking-wider font-semibold uppercase mb-3">
            <span className="material-symbols-outlined text-[12px] text-blue-600">update</span> Stage Controller
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Update Production Stage</h1>
          <p className="text-sm text-slate-500 mt-1">Update actual progress for cutting, stitching, finishing, quality check, and packing.</p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10">
          <a href={`/production/plans/${planId}`} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">visibility</span> View Details
          </a>
          <a href="/production" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Plans
          </a>
        </div>
      </div>

      <input type="hidden" id="selectedPlanId" value={planId} />

      {/* Summary Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h2 id="stagePlanNo" className="text-xl font-bold text-slate-800">Loading...</h2>
            <p id="stagePlanSubtitle" className="text-xs text-slate-400 mt-0.5">Loading production plan stage information...</p>
          </div>
          <span id="stagePlanStatusBadge" className="status-badge">Loading</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {summaryFields.map(([label, id]) => (
            <div className="bg-slate-50/60 p-4 sm:p-6 lg:p-8 border border-slate-200 rounded-2xl flex flex-col items-center justify-between min-h-[110px]" key={id}>
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono text-center break-words w-full">{label}</span>
              <strong className="text-slate-800 text-2xl font-semibold mt-3 font-mono text-center w-full truncate min-w-0" id={id}>0</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Stage Progress Timeline */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-6">
        <div className="border-b border-slate-50 pb-4">
          <h2 className="text-lg font-bold text-slate-800">Stage Progress</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track the current progress of the production plan.</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin stage-progress-strip" id="stageProgressStrip">
          Loading stage progress...
        </div>
      </section>

      <form method="post" id="stageUpdateForm" className="flex flex-col gap-6">
        <input name="PlanId" type="hidden" />
        <input name="PlanNo" type="hidden" id="planNoInput" />
        <input name="SelectedStageName" type="hidden" id="selectedStageNameInput" />

        {/* Update Stage Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-50 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Update Stage Progress</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a product and stage, then enter actual progress details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stageFormFields.map((field) => (
              <StageFormControl field={field} key={field.id} />
            ))}

            <div className="flex flex-col md:col-span-3">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-2 ml-1 block">Remarks</label>
              <textarea
                name="Remarks"
                id="remarks"
                className="w-full border border-slate-200 rounded-xl px-6 py-4 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm min-h-[110px]"
                rows={4}
                placeholder="Example: Cutting completed for all M and L sizes. 5 pieces rejected due to fabric defect."
              />
            </div>
          </div>

          <div id="stageValidationMessage" className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 w-fit mt-4">
            Select a stage to update progress.
          </div>
        </section>

        {/* Production Stage List */}
        <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-50 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Production Stage List</h2>
            <p className="text-xs text-slate-400 mt-0.5">Review each stage and select Update to fill the form automatically.</p>
          </div>

          <div className="pp-table-wrapper">
            <TableShell
              bodyId="stageUpdateTableBody"
              headers={[
                "Stage Name",
                "Work Center / Department",
                "Planned Start",
                "Planned End",
                "Actual Start",
                "Actual End",
                "Completed Qty",
                "Rejected Qty",
                "Status",
                "Action",
              ]}
            >
              <tr>
                <td colSpan={10} className="text-center text-slate-400">Production stages will appear here.</td>
              </tr>
            </TableShell>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[15px] font-bold transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            Save Progress
          </button>
          <button type="button" id="clearStageFormBtn" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors">
            Clear Form
          </button>
          <a href={`/production/plans/${planId}`} className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
