"use client";

import React from "react";
import { Customer } from "../dto/customer.dto";
import { PermissionGuard } from "@/app/components/auth/PermissionGuard";

export interface CustomerRowProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function CustomerRow({ customer, onEdit, onDelete }: CustomerRowProps) {
  const getTypeBadgeClass = (type?: string) => {
    switch ((type || "").toLowerCase()) {
      case "wholesale":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "distributor":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "export":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "corporate":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
      {/* Customer ID */}
      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-semibold">
        {customer.id ? customer.id.substring(0, 8) : "N/A"}
      </td>

      {/* Customer Name & Type */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
            {(customer.name || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
              {customer.name}
            </div>
            <div className="mt-0.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${getTypeBadgeClass(
                  customer.type
                )}`}
              >
                {customer.type || "Retail"}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="py-3.5 px-4">
        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px] text-slate-400">mail</span>
          {customer.email}
        </div>
        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
          <span className="material-symbols-outlined text-[13px] text-slate-400">call</span>
          {customer.phone}
        </div>
      </td>

      {/* Address */}
      <td className="py-3.5 px-4">
        <div className="text-xs text-slate-700 max-w-[220px] truncate" title={customer.address}>
          {customer.address || <span className="text-slate-400 italic">No address provided</span>}
        </div>
      </td>

      {/* Company / PAN */}
      <td className="py-3.5 px-4">
        <div className="text-xs font-semibold text-slate-800">
          {customer.company || <span className="text-slate-400 italic font-normal">Individual</span>}
        </div>
        {customer.panVat && (
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            PAN/VAT: {customer.panVat}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-end">
        <div className="flex items-center justify-end gap-1.5">
          <PermissionGuard route="/crm/customers" action="PUT">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(customer)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95"
                title="Edit Customer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit</span>
              </button>
            )}
          </PermissionGuard>
          <PermissionGuard route="/crm/customers" action="DELETE">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(customer)}
                className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                title="Delete Customer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
          </PermissionGuard>
        </div>
      </td>
    </tr>
  );
}
