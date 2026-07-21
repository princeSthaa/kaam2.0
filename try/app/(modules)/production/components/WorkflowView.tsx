"use client";

import React, { useState, useEffect } from 'react';

export default function WorkflowView({ product, onUpdateProduct }: any) {
  const stages = product.stages || [];

  // Track selected stage index in timeline for editing
  const initialActiveIdx = stages.findIndex((s: any) => s.status === "Active");
  const [selectedStageIdx, setSelectedStageIdx] = useState(initialActiveIdx >= 0 ? initialActiveIdx : 0);

  const selectedStage = stages[selectedStageIdx] || {};

  // Form states bound to selected stage
  const [completedQty, setCompletedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [status, setStatus] = useState("Not Started");
  const [remarks, setRemarks] = useState("");

  // Sync form states when selected stage changes
  useEffect(() => {
    if (selectedStage) {
      setCompletedQty(selectedStage.completedQty || 0);
      setRejectedQty(selectedStage.rejectedQty || 0);
      setStatus(selectedStage.status || "Not Started");
      setRemarks(selectedStage.remarks || "");
    }
  }, [selectedStageIdx, product.id, selectedStage]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProduct) return;

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

    const activeStageName = updatedStages.find((s: any) => s.status === "Active")?.name || 
                            updatedStages.find((s: any) => s.status === "On Hold")?.name ||
                            updatedStages.find((s: any) => s.status === "Not Started")?.name ||
                            "Completed";

    const completedCount = updatedStages.filter((s: any) => s.status === "Completed").length;
    const calculatedProgress = Math.round((completedCount / updatedStages.length) * 100);

    onUpdateProduct({
      ...product,
      stage: activeStageName,
      progress: calculatedProgress,
      stages: updatedStages
    });

    alert(`Stage "${selectedStage.name}" progress saved successfully!\nProgress: ${calculatedProgress}%`);
  };

  return (
    <div className="my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest p-5 shadow-sm">
      {/* Left Column: Stepper Timeline */}
      <div className="lg:col-span-5 flex flex-col">
        <h3 className="font-kaam-headline-md text-base leading-7 font-bold text-kaam-on-surface mb-4">Production Workflow</h3>
        
        <div className="relative flex-1">
          {/* Vertical connecting line */}
          <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-kaam-outline-variant"></div>
          
          <div className="flex flex-col gap-4">
            {stages.map((stage: any, idx: number) => {
              const isSelected = idx === selectedStageIdx;
              const isCompleted = stage.status === "Completed";
              const isActive = stage.status === "Active" || stage.status === "In Progress";
              const isOnHold = stage.status === "On Hold";

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
                  className={`flex items-start gap-4 p-2.5 rounded-kaam-DEFAULT cursor-pointer transition-all ${
                    isSelected ? "bg-kaam-surface-container border border-kaam-outline-variant shadow-xs scale-[1.01]" : "hover:bg-kaam-surface-container-low/50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-kaam-full flex items-center justify-center shrink-0 mt-0.5 z-10 transition-transform ${badgeColor}`}>
                    {stepIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-kaam-body-sm text-sm font-semibold leading-5 ${
                      isCompleted ? "line-through decoration-kaam-on-surface-variant/40 text-kaam-on-surface-variant/70" : "text-kaam-on-surface"
                    }`}>
                      {stage.name} {isActive && "(Active)"} {isOnHold && "(On Hold)"}
                    </h4>
                    <p className="font-kaam-label-md text-[10px] text-kaam-on-surface-variant uppercase mt-0.5">
                      {stage.workCenter} • {stage.completedQty} completed
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
      
      {/* Right Column: Update Progress Card */}
      <div className="lg:col-span-7">
        <div className="bg-kaam-surface p-5 rounded-kaam-DEFAULT border border-kaam-outline-variant h-full flex flex-col">
          <h3 className="font-kaam-headline-md text-base leading-7 font-bold text-kaam-on-surface mb-4 border-b border-kaam-outline-variant pb-3 flex justify-between items-center">
            <span>Update Process: {selectedStage.name}</span>
            <span className="font-kaam-label-md text-xs px-2 py-0.5 rounded-kaam-DEFAULT bg-kaam-surface-container-highest text-kaam-on-surface">
              Step {selectedStage.id || "01"}
            </span>
          </h3>
          <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-1" htmlFor="stage-status">Process Status</label>
                <select 
                  id="stage-status"
                  className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary focus:ring-1 focus:ring-kaam-secondary text-sm font-kaam-body-sm"
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
                  <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-1">Completed Qty (Target: {product.qty})</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary focus:ring-1 focus:ring-kaam-secondary text-sm font-kaam-body-sm text-right"
                    value={completedQty}
                    onChange={(e) => setCompletedQty(Number(e.target.value))}
                    max={product.qty}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-1 text-kaam-error">Rejected Qty</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-error focus:ring-1 focus:ring-kaam-error text-sm font-kaam-body-sm text-right"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant mb-1">Remarks / Discrepancy Notes</label>
                <textarea 
                  rows={3} 
                  placeholder="Enter remarks, delays, or quality feedback..." 
                  className="w-full px-3 py-2 rounded-kaam-DEFAULT border border-kaam-outline-variant bg-kaam-surface-container-lowest focus:outline-none focus:border-kaam-secondary focus:ring-1 focus:ring-kaam-secondary text-sm font-kaam-body-sm resize-none"
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
                className="px-4 py-2 rounded-kaam-DEFAULT border border-kaam-outline text-kaam-on-surface font-kaam-label-md hover:bg-kaam-surface-container-low transition-colors"
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-kaam-DEFAULT bg-kaam-primary text-kaam-on-primary font-kaam-label-md hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Stage Progress
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
