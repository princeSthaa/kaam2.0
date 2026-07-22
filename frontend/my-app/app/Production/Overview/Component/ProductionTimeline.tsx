"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./ProductionTimeline.module.css";

interface Plan {
  PlanId?: string;
  PlanName?: string;
  BatchId?: string;
  Quantity?: number;
  PlannedStartDate?: string;
  PlannedCompletionDate?: string;
  Status?: string;
  Stages?: any[];
  
  planId?: string;
  planName?: string;
  batchId?: string;
  quantity?: number;
  plannedStartDate?: string;
  plannedCompletionDate?: string;
  status?: string;
  stages?: any[];
}

export function ProductionTimeline() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch plans", err);
        setLoading(false);
      });
  }, []);

  // Compute Monday of the current week
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  
  // Apply week offset
  const weekStart = new Date(monday);
  weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const getWeekNumber = (d: Date) => {
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getProgress = (p: Plan) => {
    const stages = p.Stages || p.stages || [];
    if (!stages.length) return p.Status === "Completed" || p.status === "Completed" ? 100 : 0;
    const completed = stages.filter(s => s.Status === "Completed" || s.status === "Completed").length;
    return Math.round((completed / stages.length) * 100);
  };

  const activePlans = plans.filter(p => {
    const startStr = p.PlannedStartDate || p.plannedStartDate;
    const endStr = p.PlannedCompletionDate || p.plannedCompletionDate;
    if (!startStr) return false;
    
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(startStr);
    
    return start <= weekEnd && end >= weekStart;
  });

  return (
    <section className={`bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden ${styles.customShadow} w-full`}>
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
          Production Timeline (Week {getWeekNumber(weekStart)})
          {!loading && (
            <span className="bg-surface-container-highest text-primary font-label-md text-[11px] px-2 py-0.5 rounded-full">
              {activePlans.length} Projects
            </span>
          )}
        </h4>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 hover:bg-surface-container rounded transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-label-md text-label-md">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </span>
          <button 
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1 hover:bg-surface-container rounded transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Gantt Header */}
          <div className="grid grid-cols-[240px_1fr] border-b border-outline-variant">
            <div className="p-4 bg-surface-container-low border-r border-outline-variant font-label-md text-on-surface-variant uppercase">Project Name</div>
            <div className={`grid grid-cols-7 ${styles.ganttGrid}`}>
              {days.map((d, i) => (
                <div key={i} className={`p-4 text-center font-label-md ${i === 3 ? "bg-secondary-container/10 border-x border-secondary/20" : i > 4 ? "text-on-surface-variant/50" : ""}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          
          {/* Gantt Rows */}
          <div className="max-h-[320px] overflow-y-auto overflow-x-hidden">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant">Loading timeline...</div>
            ) : activePlans.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">No active production plans this week.</div>
            ) : (
              activePlans.map(plan => {
              const startStr = plan.PlannedStartDate || plan.plannedStartDate;
              const endStr = plan.PlannedCompletionDate || plan.plannedCompletionDate;
              const start = new Date(startStr!);
              const end = endStr ? new Date(endStr) : new Date(startStr!);
              
              // Calculate col-start and col-span (1-indexed for CSS grid)
              let colStart = 1;
              if (start > weekStart) {
                const diffTime = Math.abs(start.getTime() - weekStart.getTime());
                colStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              }
              
              let colSpan = 7;
              const effectiveStart = start < weekStart ? weekStart : start;
              const effectiveEnd = end > weekEnd ? weekEnd : end;
              
              const durationTime = Math.abs(effectiveEnd.getTime() - effectiveStart.getTime());
              colSpan = Math.ceil(durationTime / (1000 * 60 * 60 * 24)) + 1;
              
              // Ensure we don't overflow the 7-day grid
              if (colStart + colSpan > 8) colSpan = 8 - colStart;

              const progress = getProgress(plan);
              const isComplete = progress === 100;
              const batchId = plan.BatchId || plan.batchId || "No Batch";
              const qty = plan.Quantity || plan.quantity || 0;
              const name = plan.PlanName || plan.planName || plan.PlanId || plan.planId;

              return (
                <div key={plan.PlanId || plan.planId} className="grid grid-cols-[240px_1fr] border-b border-outline-variant group hover:bg-surface-container-low/50">
                  <div className="p-4 border-r border-outline-variant truncate">
                    <div className="font-body-lg font-semibold truncate" title={name}>{name}</div>
                    <div className="font-label-md text-on-surface-variant truncate">
                      Batch: <Link href={`/Production/Batch/${batchId}`} className="text-secondary hover:underline inline-flex items-center gap-1 font-medium">{batchId} <span className="material-symbols-outlined text-[14px]">open_in_new</span></Link>
                    </div>
                    <div className="font-label-md text-on-surface-variant truncate mt-0.5">
                      {qty.toLocaleString()} Units
                    </div>
                  </div>
                  <div className={`grid grid-cols-7 relative p-4 items-center ${styles.ganttGrid}`}>
                    <Link 
                      href={`/Production/Batch/${batchId}`}
                      className={`h-8 rounded-full relative overflow-hidden group/bar cursor-pointer block ${isComplete ? "bg-tertiary-fixed" : "bg-secondary-container"}`}
                      style={{ gridColumnStart: colStart, gridColumnEnd: colStart + colSpan }}
                    >
                      <div 
                        className={`h-full transition-all duration-700 group-hover/bar:brightness-110 ${isComplete ? "bg-on-tertiary-container" : "bg-secondary"}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter mix-blend-difference">
                        {isComplete ? "100% Completed" : `${progress}% Progress`}
                      </span>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-white/20 px-2 py-0.5 rounded text-[10px] text-white border border-white/30 backdrop-blur-sm">View Details</div>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
