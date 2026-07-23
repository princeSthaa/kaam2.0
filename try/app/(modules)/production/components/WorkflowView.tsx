"use client";

import React, { useState, useEffect } from 'react';

export default function WorkflowView({ product, onUpdateProduct }: any) {
  const stages = product.stages || [];

  // Track selected stage index in timeline for editing
  const initialActiveIdx = stages.findIndex((s: any) => {
    const st = String(s.status || "").toLowerCase();
    return st === "active" || st === "in progress" || st === "2";
  });
  const [selectedStageIdx, setSelectedStageIdx] = useState(initialActiveIdx >= 0 ? initialActiveIdx : 0);

  const selectedStage = stages[selectedStageIdx] || {};

  // Form states bound to selected stage
  const [completedQty, setCompletedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [status, setStatus] = useState("Not Started");
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync form states when selected stage changes
  useEffect(() => {
    if (selectedStage) {
      setCompletedQty(selectedStage.completedQty || 0);
      setRejectedQty(selectedStage.rejectedQty || 0);
      setStatus(selectedStage.status || "Not Started");
      setRemarks(selectedStage.remarks || "");
    }
  }, [selectedStageIdx, product.id, selectedStage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProduct) return;
    setIsSaving(true);

    const updatedStages = stages.map((st: any, idx: number) => {
      if (idx === selectedStageIdx) {
        return {
          ...st,
          completedQty: Number(completedQty),
          rejectedQty: Number(rejectedQty),
          status,
          remarks
        };
      }
      return st;
    });

    const activeStageName = updatedStages.find((s: any) => {
      const st = String(s.status).toLowerCase();
      return st === "active" || st === "in progress" || st === "2";
    })?.name || 
    updatedStages.find((s: any) => String(s.status).toLowerCase() === "on hold")?.name ||
    updatedStages.find((s: any) => String(s.status).toLowerCase() === "not started")?.name ||
    "Completed";

    const completedCount = updatedStages.filter((s: any) => {
      const st = String(s.status).toLowerCase();
      return st === "completed" || st === "5";
    }).length;

    const activeCount = updatedStages.filter((s: any) => {
      const st = String(s.status).toLowerCase();
      return st === "active" || st === "in progress" || st === "2";
    }).length;

    const calculatedProgress = updatedStages.length > 0 
      ? Math.min(100, Math.round(((completedCount + (activeCount * 0.5)) / updatedStages.length) * 100))
      : 0;

    // Backend stage update payload
    // PlanStatus enum: Draft=0, Active=1, Cutting=2, Stitching=3, NotStarted=4, Completed=5, OnHold=6, Blocked=7, Cancelled=8
    if (selectedStage) {
      const nowIso = new Date().toISOString();
      const realStageId = (selectedStage.id && selectedStage.id.length > 5) ? selectedStage.id : null;

      const statusToEnum = (s: string): number => {
        const sl = s.toLowerCase();
        if (sl === "completed" || sl === "5") return 5;
        if (sl === "active" || sl === "in progress" || sl === "1" || sl === "2") return 1;
        if (sl === "on hold" || sl === "onhold" || sl === "6") return 6;
        if (sl === "blocked" || sl === "7") return 7;
        if (sl === "cancelled" || sl === "8") return 8;
        return 4; // NotStarted
      };

      const stagePayload: any = {
        id: realStageId || undefined,
        stageId: selectedStage.stageId || `STG-${String(selectedStageIdx + 1).padStart(2, "0")}`,
        stageName: selectedStage.name || selectedStage.stageName || "Production Stage",
        workCenterId: selectedStage.workCenterId || selectedStage.workCenter || null,
        operatorName: selectedStage.operatorName || "",
        plannedStartDate: selectedStage.plannedStartDate || nowIso,
        plannedEndDate: selectedStage.plannedEndDate || nowIso,
        status: statusToEnum(status),
        completedQty: Number(completedQty),
        rejectedQty: Number(rejectedQty),
        actualStartDate: selectedStage.actualStartDate || (status === "Active" || status === "In Progress" || status === "Completed" ? nowIso : nowIso),
        actualEndDate: status === "Completed" ? nowIso : (selectedStage.actualEndDate || nowIso),
        remarks: remarks || "",
        createdAt: selectedStage.createdAt || nowIso,
        createdBy: selectedStage.createdBy || "",
        updatedAt: nowIso,
        updatedBy: "",
        productionPlanId: product.productionPlanId || selectedStage.productionPlanId || product.planDbId || product.planId || ""
      };

      try {
        let saveRes: Response;
        if (realStageId) {
          saveRes = await fetch(`http://localhost:5083/api/production-plan-stage/${encodeURIComponent(realStageId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stagePayload)
          });

          if (!saveRes.ok) {
            console.warn("PUT failed, falling back to POST. Status:", saveRes.status);
            delete stagePayload.id;
            saveRes = await fetch(`http://localhost:5083/api/production-plan-stage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(stagePayload)
            });
          }
        } else {
          delete stagePayload.id;
          saveRes = await fetch(`http://localhost:5083/api/production-plan-stage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stagePayload)
          });
        }

        if (!saveRes.ok) {
          const errText = await saveRes.text();
          console.error("Stage save failed:", saveRes.status, errText);
        } else {
          console.log("Stage saved successfully:", stagePayload.stageName);
        }
      } catch (err) {
        console.error("Backend stage update failed:", err);
      }
    }

    onUpdateProduct({
      ...product,
      stage: activeStageName,
      progress: calculatedProgress,
      stages: updatedStages
    });

    setIsSaving(false);
  };

  return (
    <div className="my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest p-5 shadow-xs">
      {/* Left Column: Stepper Timeline matching selected Routing Stages */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-kaam-headline-md text-base leading-7 font-bold text-kaam-on-surface">Production Workflow</h3>
          <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
            {stages.length} Operational Stages
          </span>
        </div>
        
        <div className="relative flex-1">
          {/* Vertical connecting line */}
          <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-kaam-outline-variant"></div>
          
          <div className="flex flex-col gap-3">
            {stages.map((stage: any, idx: number) => {
              const isSelected = idx === selectedStageIdx;
              const stLower = String(stage.status || "").toLowerCase();
              const isCompleted = stLower === "completed" || stLower === "5";
              const isActive = stLower === "active" || stLower === "in progress" || stLower === "2";
              const isOnHold = stLower === "on hold" || stLower === "onhold" || stLower === "3";

              let stepIcon = <span className="w-1.5 h-1.5 rounded-kaam-full bg-kaam-outline-variant"></span>;
              let badgeColor = "bg-kaam-surface-container border-2 border-kaam-outline-variant";

              if (isCompleted) {
                stepIcon = <span className="material-symbols-outlined text-[10px] text-kaam-on-tertiary-fixed font-bold">check</span>;
                badgeColor = "bg-kaam-tertiary-fixed border-2 border-kaam-tertiary-fixed-dim";
              } else if (isActive) {
                stepIcon = <span className="material-symbols-outlined text-[10px] text-kaam-on-secondary animate-spin font-bold">sync</span>;
                badgeColor = "bg-kaam-secondary border-2 border-kaam-secondary ring-4 ring-kaam-secondary/20";
              } else if (isOnHold) {
                stepIcon = <span className="material-symbols-outlined text-[10px] text-kaam-on-error-container font-bold">warning</span>;
                badgeColor = "bg-kaam-error-container border-2 border-kaam-error/30";
              }

              return (
                <div 
                  key={stage.id || idx} 
                  onClick={() => setSelectedStageIdx(idx)}
                  className={`flex items-start gap-3 p-3 rounded-kaam-DEFAULT cursor-pointer transition-all ${
                    isSelected ? "bg-kaam-surface-container border border-kaam-outline-variant shadow-xs scale-[1.01]" : "hover:bg-kaam-surface-container-low/50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-kaam-full flex items-center justify-center shrink-0 mt-0.5 z-10 transition-transform ${badgeColor}`}>
                    {stepIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-kaam-body-sm text-xs font-bold leading-5 ${
                        isCompleted ? "line-through text-kaam-on-surface-variant/70" : "text-kaam-on-surface"
                      }`}>
                        {stage.name || stage.stageName} {isActive && "(Active)"} {isOnHold && "(On Hold)"}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{stage.completedQty || 0} pcs</span>
                    </div>
                    <p className="font-kaam-label-md text-[10px] text-kaam-on-surface-variant uppercase mt-0.5">
                      Work Center: <strong className="text-slate-700">{stage.workCenter || "Assembly"}</strong>
                    </p>
                    {stage.remarks && (
                      <p className="font-kaam-body-sm text-[11px] text-kaam-error/80 italic mt-1 bg-kaam-surface-bright px-2 py-0.5 rounded-kaam-DEFAULT w-fit">
                        Remarks: {stage.remarks}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Right Column: Update Process Card & Backend Backend Synchronization */}
      <div className="lg:col-span-7">
        <div className="bg-kaam-surface p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant h-full flex flex-col">
          <h3 className="font-kaam-headline-md text-base leading-7 font-bold text-kaam-on-surface mb-4 border-b border-kaam-outline-variant pb-3 flex justify-between items-center">
            <span>Update Process: {selectedStage.name || selectedStage.stageName || 'Stage'}</span>
            <span className="font-kaam-label-md text-xs px-2 py-0.5 rounded-kaam-DEFAULT bg-kaam-surface-container-highest text-kaam-on-surface font-mono">
              Step {selectedStage.id || (selectedStageIdx + 1)}
            </span>
          </h3>
          <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Process Status */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-1" htmlFor="stage-status">Process Status</label>
                <select 
                  id="stage-status"
                  className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary text-xs font-bold"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Active">Active / In Progress</option>
                  <option value="On Hold">On Hold / Blocked</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-kaam-label-md text-xs text-kaam-on-surface-variant mb-1">Completed Qty (Target: {product.qty})</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary text-xs font-bold font-mono text-right"
                    value={completedQty}
                    onChange={(e) => setCompletedQty(Number(e.target.value))}
                    max={product.qty}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block font-kaam-label-md text-xs text-kaam-on-surface-variant mb-1 text-kaam-error">Rejected Qty</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-error text-xs font-bold font-mono text-right"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-kaam-label-md text-xs text-kaam-on-surface-variant mb-1">Remarks / Quality Feedback</label>
                <textarea 
                  rows={3} 
                  placeholder="Enter stage progress feedback, delays, or quality inspection notes..." 
                  className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary text-xs font-kaam-body-sm resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-kaam-outline-variant">
              <button 
                type="button" 
                onClick={() => {
                  setSelectedStageIdx(initialActiveIdx >= 0 ? initialActiveIdx : 0);
                }}
                className="px-4 py-2 rounded-kaam-DEFAULT border border-kaam-outline text-kaam-on-surface font-kaam-label-md text-xs font-bold hover:bg-kaam-surface-container-low transition-colors"
              >
                Reset
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-4 py-2 rounded-kaam-DEFAULT bg-kaam-primary text-kaam-on-primary font-kaam-label-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSaving ? "Saving..." : "Save Process Stage Progress"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
