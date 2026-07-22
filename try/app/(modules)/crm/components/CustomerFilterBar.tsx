import React from "react";
import { CUSTOMER_TYPES } from "../constants/crm.constants";

export interface CustomerFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  onReset?: () => void;
}

export function CustomerFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  onReset,
}: CustomerFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input
          type="text"
          placeholder="Search name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white"
        >
          <option value="all">All Customer Types</option>
          {CUSTOMER_TYPES.map((t) => (
            <option key={t} value={t.toLowerCase()}>{t}</option>
          ))}
        </select>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
