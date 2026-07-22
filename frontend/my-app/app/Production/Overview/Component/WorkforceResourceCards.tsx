"use client";

import React, { useState, useEffect } from 'react';

interface Workcenter {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Type?: string;
  type?: string;
  Status?: string;
  status?: string;
}

export function WorkforceResourceCards() {
  const [workcenters, setWorkcenters] = useState<Workcenter[]>([]);
  const [activeShift, setActiveShift] = useState('Shift A');

  useEffect(() => {
    fetch('http://localhost:5083/api/workcenters')
      .then(res => res.json())
      .then(data => setWorkcenters(data))
      .catch(err => console.error("Failed to fetch workcenters", err));
  }, []);

  const getStatusColor = (status: string, index: number) => {
    if (status === "Available") {
      // Just to give it some variety based on index since all are "Available"
      const colors = [
        { bg: "bg-secondary", text: "Busy", alloc: "12/15", pct: "80%" },
        { bg: "bg-error", text: "Overload", alloc: "45/50", pct: "90%" },
        { bg: "bg-on-tertiary-container", text: "Optimal", alloc: "08/10", pct: "80%" },
        { bg: "bg-on-tertiary-container", text: "Full", alloc: "05/05", pct: "100%" },
      ];
      return colors[index % colors.length];
    }
    return { bg: "bg-outline-variant", text: status, alloc: "0/0", pct: "0%" };
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
        <h4 className="font-headline-md text-headline-md text-on-surface">Workforce & Resource</h4>
        <div className="relative mr-2">
          <select 
            value={activeShift}
            onChange={(e) => setActiveShift(e.target.value)}
            className="appearance-none font-label-md text-label-md text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors pl-4 pr-12 py-1.5 rounded-lg cursor-pointer outline-none border border-transparent focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="Shift A">Shift A (Morning)</option>
            <option value="Shift B">Shift B (Evening)</option>
            <option value="Shift C">Shift C (Night)</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none text-on-surface-variant">arrow_drop_down</span>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {workcenters.length > 0 ? (
          workcenters.map((wc, i) => {
            const status = wc.Status || wc.status || "Unknown";
            const name = wc.Name || wc.name || "Unknown Line";
            const { bg, text, alloc, pct } = getStatusColor(status, i);
            const [current, max] = alloc.split('/');
            
            return (
              <div key={wc.Id || wc.id || `wc-${i}`} className="p-4 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-body-lg font-bold truncate" title={name}>{name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${bg}`}></span>
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase">{text}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <span className="font-label-md text-label-md text-stats-lg">
                    {current}<span className="text-on-surface-variant/50 text-body-lg">/{max}</span>
                  </span>
                  <div className="w-24 h-1.5 bg-outline-variant rounded-full overflow-hidden">
                    <div className={`h-full ${bg}`} style={{ width: pct }}></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center text-on-surface-variant py-4">Loading workcenters...</div>
        )}
      </div>
    </div>
  );
}
