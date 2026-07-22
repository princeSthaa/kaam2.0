import React from "react";
import { Customer } from "../dto/customer.dto";

export interface CustomerRowProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
}

export function CustomerRow({ customer, onEdit }: CustomerRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="font-mono text-xs text-slate-500 font-bold">{customer.id}</td>
      <td>
        <div className="font-bold text-slate-900 text-sm">{customer.name}</div>
      </td>
      <td>
        <div className="text-xs text-slate-700">{customer.email}</div>
        <div className="text-[11px] text-slate-400 font-mono">{customer.phone}</div>
      </td>
      <td className="text-xs text-slate-600">{customer.address || "N/A"}</td>
      <td className="text-xs text-slate-600 font-semibold">{customer.company || "Individual"}</td>
      <td className="text-end">
        {onEdit && (
          <button
            type="button"
            className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-bold transition-all shadow-2xs"
            onClick={() => onEdit(customer)}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}
