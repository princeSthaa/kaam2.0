"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductionPlan } from './ProductionTimeline';

export function ProductionTable() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5083/api/production-plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch production plans", err);
        setLoading(false);
      });
  }, []);

  const filteredPlans = plans.filter(plan => {
    const status = plan.Status || plan.status || "Draft";
    const name = (plan.PlanName || plan.planName || "Untitled").toLowerCase();
    const planId = (plan.PlanId || plan.planId || "").toLowerCase();
    const batchId = (plan.BatchId || plan.batchId || "").toLowerCase();
    
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      name.includes(searchTerm.toLowerCase()) || 
      planId.includes(searchTerm.toLowerCase()) || 
      batchId.includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden w-full flex items-center justify-center p-8">
        <span className="text-on-surface-variant">Loading production data...</span>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden w-full">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
          Detailed Operations View
          <span className="bg-surface-container-highest text-primary font-label-md text-[11px] px-2 py-0.5 rounded-full">
            {filteredPlans.length} Records
          </span>
        </h4>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 border border-outline font-label-md text-label-md px-3 py-1.5 rounded shadow-sm transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex gap-4 items-center">
          <div className="flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Search ID, Batch, or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-body-sm px-3 py-1.5 border border-outline-variant rounded focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-md text-on-surface-variant">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-body-sm px-3 py-1.5 border border-outline-variant rounded focus:outline-none focus:border-primary bg-white cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Planned">Planned</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {(searchTerm || statusFilter !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
              className="text-label-md text-error hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-surface-container-lowest shadow-sm z-10">
            <tr className="border-b border-outline-variant text-on-surface-variant font-label-md uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Plan ID</th>
              <th className="px-6 py-3 font-medium">Batch</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Start Date</th>
              <th className="px-6 py-3 font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                  No matching operations found.
                </td>
              </tr>
            ) : (
              filteredPlans.map(plan => {
                const planId = plan.PlanId || plan.planId || "Unknown";
                const batchId = plan.BatchId || plan.batchId || "-";
                const name = plan.PlanName || plan.planName || "Untitled";
                const status = plan.Status || plan.status || "Draft";
                const startStr = plan.PlannedStartDate || plan.plannedStartDate;
                const qty = plan.Quantity || plan.quantity || 0;

                return (
                  <tr key={planId} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-3 font-label-md text-primary font-medium">{planId}</td>
                    <td className="px-6 py-3 font-label-md">
                      {batchId !== "-" ? (
                        <Link href={`/Production/Batch/${batchId}`} className="text-secondary hover:underline inline-flex items-center gap-1">
                          {batchId}
                        </Link>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-3 font-body-sm text-on-surface font-medium truncate max-w-[200px]" title={name}>
                      {name}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 font-label-md text-[11px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-tertiary-fixed' : status === 'Cutting' || status === 'Stitching' ? 'bg-secondary' : 'bg-outline-variant'}`}></span>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-label-md text-on-surface-variant">
                      {startStr ? new Date(startStr).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-3 font-label-md font-medium text-on-surface">
                      {qty.toLocaleString()} <span className="text-on-surface-variant font-normal">units</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
