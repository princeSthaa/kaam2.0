"use client";

import React, { useState } from 'react';
import { ProductionTimeline } from './ProductionTimeline';
import { ProductionTable } from './ProductionTable';
import { WorkforceResourceCards } from './WorkforceResourceCards';

export function ProductionDashboard() {
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [isMasterSchedule, setIsMasterSchedule] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-row-gap">
        {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Production Overview</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Monitoring plant-wide efficiency and workforce metrics.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant">
                {(['Today', 'Week', 'Month'] as const).map(range => (
                  <button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-label-md font-label-md rounded-md transition-all ${
                      timeRange === range 
                        ? 'bg-surface-container-lowest shadow-sm text-on-surface' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div 
                className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg cursor-pointer"
                onClick={() => setIsMasterSchedule(!isMasterSchedule)}
              >
                <span className="font-label-md text-label-md text-on-surface-variant">Master Schedule</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isMasterSchedule ? 'bg-secondary' : 'bg-outline-variant'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMasterSchedule ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </section>

          {/* KPI Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-column-gap">
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg flex flex-col justify-between" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Active Plans</span>
                <span className="material-symbols-outlined text-secondary">factory</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-stats-lg text-stats-lg text-on-surface">14</span>
                <span className="font-label-md text-label-md text-on-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded">+2 New</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg flex flex-col justify-between" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">On-Time Completion</span>
                <span className="material-symbols-outlined text-on-tertiary-container">speed</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-stats-lg text-stats-lg text-on-surface">94.2%</span>
                <span className="font-label-md text-label-md text-on-tertiary-container flex items-center">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 1.5%
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg flex flex-col justify-between" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Workforce Allocation</span>
                <span className="material-symbols-outlined text-on-primary-container">engineering</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-stats-lg text-stats-lg text-on-surface">85%</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Active</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg flex flex-col justify-between border-l-4 border-l-error" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Critical Alerts</span>
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-stats-lg text-stats-lg text-on-surface">03</span>
                <span className="font-label-md text-label-md text-error">Action Req.</span>
              </div>
            </div>
          </section>

          {/* Master Schedule Visualization (Dynamic Component) */}
          {isMasterSchedule ? <ProductionTimeline /> : <ProductionTable />}

          {/* Bottom Sections: Workforce & Real-time Tracking */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-column-gap mb-16">
            <WorkforceResourceCards />

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-headline-md text-headline-md text-on-surface">Live Feed</h4>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-tertiary-container opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-on-tertiary-container"></span>
                  </span>
                  <span className="font-label-md text-label-md text-on-tertiary-container">Live</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[350px]">
                <ul className="divide-y divide-outline-variant">
                  <li className="p-4 hover:bg-surface-container-low transition-colors flex gap-4">
                    <div className="w-10 h-10 rounded bg-secondary-container/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">inventory_2</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-body-lg font-semibold">Batch #BT-99042 Moved</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">09:42 AM</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">Production Stage: <span className="text-secondary font-medium">Stitching</span> to <span className="text-secondary font-medium">QC Check</span></p>
                    </div>
                  </li>
                  <li className="p-4 hover:bg-surface-container-low transition-colors flex gap-4">
                    <div className="w-10 h-10 rounded bg-on-tertiary-container/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-body-lg font-semibold">Line 4A Target Reached</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">09:15 AM</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">Completed <span className="font-bold">150 units</span> for Trekker Jacket collection.</p>
                    </div>
                  </li>
                  <li className="p-4 hover:bg-surface-container-low transition-colors flex gap-4 bg-error-container/10">
                    <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-error">error</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-body-lg font-semibold text-error">Material Shortage</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">08:50 AM</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">Line 2B halted: Black Polyester thread depleted. Stock replenishment requested.</p>
                    </div>
                  </li>
                  <li className="p-4 hover:bg-surface-container-low transition-colors flex gap-4">
                    <div className="w-10 h-10 rounded bg-secondary-container/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">person_add</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-body-lg font-semibold">Operator Reassigned</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">08:30 AM</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">Ahmed R. moved from <span className="font-medium">Finishing</span> to <span className="font-medium">Cutting</span>.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-surface-container-low border-t border-outline-variant text-center">
                <button onClick={() => setShowLogModal(true)} className="text-label-md font-label-md text-secondary hover:underline">View Full Activity Log</button>
              </div>
            </div>
          </section>
        </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-6 bg-white py-2.5 rounded-xl border border-slate-200 mt-4 w-full shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>System Health: Optimal</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm border-l border-slate-200 pl-6">
            <span className="material-symbols-outlined text-[18px]">update</span>
            <span>Last Sync: 12s ago</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-amber-700 font-medium text-sm bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
          <span>3 Active Alerts</span>
        </div>
      </div>

      {/* Activity Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowLogModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Full Activity Log</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {[
                  { time: '10:45 AM', action: 'System Backup Completed', desc: 'Daily automated backup of production data successful.', icon: 'cloud_done', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { time: '09:12 AM', action: 'Machine Error Flagged', desc: 'CNC Router #4 reported a temperature warning.', icon: 'warning', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { time: '08:30 AM', action: 'Operator Reassigned', desc: 'Ahmed R. moved from Finishing to Cutting.', icon: 'person_add', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { time: 'Yesterday', action: 'Plan PP-20260714-890 Updated', desc: 'Priority changed from Normal to High by Admin.', icon: 'edit_document', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { time: 'Yesterday', action: 'Shift C Handover', desc: 'Handover checklist completed with 0 pending issues.', icon: 'assignment_turned_in', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.bg} ${log.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{log.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{log.action}</span>
                        <span className="text-xs font-medium text-slate-400">{log.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{log.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button onClick={() => setShowLogModal(false)} className="px-5 py-2 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
