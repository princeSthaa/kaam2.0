"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../styles/warehouse-returntosupplier.css"; // Assuming we extract the custom CSS here

export default function ReturnToSupplierPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");
  
  return (
    <div className="wh-rts-page">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-[24px] font-semibold text-[#000000]">Supplier Returns</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-sm">search</span>
            <input
              type="text"
              placeholder="Return ID, SKU, or Supplier..."
              className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-transparent rounded-lg text-[14px] focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/warehouse/supplierproductandinspect" className="bg-[#000000] text-white px-4 py-2 rounded-lg text-[14px] font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Create New Return
          </Link>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm p-5 rounded-xl flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase mb-1">Active Returns</p>
              <h3 className="text-[30px] font-semibold text-[#000000]">42</h3>
              <p className="text-[#166534] text-xs font-medium flex items-center mt-1">
                <span className="material-symbols-outlined text-xs">trending_down</span>
                -12% vs last month
              </p>
            </div>
            <div className="p-2 bg-[#dae2fd] text-[#000000] rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm p-5 rounded-xl flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase mb-1">Pending Credits (Rs)</p>
              <h3 className="text-[30px] font-semibold text-[#000000]">Rs 8.4M</h3>
              <p className="text-[#45464d] text-xs font-medium flex items-center mt-1">
                Across 18 vendors
              </p>
            </div>
            <div className="p-2 bg-[#d5e3fc] text-[#515f74] rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm p-5 rounded-xl flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase mb-1">Quality Returns</p>
              <h3 className="text-[30px] font-semibold text-[#000000]">74%</h3>
              <p className="text-[#ba1a1a] text-xs font-medium flex items-center mt-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +5% material defects
              </p>
            </div>
            <div className="p-2 bg-[#ffdad6] text-[#93000a] rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm p-5 rounded-xl flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase mb-1">Avg. Resolution</p>
              <h3 className="text-[30px] font-semibold text-[#000000]">5.2 Days</h3>
              <p className="text-[#166534] text-xs font-medium flex items-center mt-1">
                Target: 6.0 Days
              </p>
            </div>
            <div className="p-2 bg-[#F0FDF4] text-[#166534] rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm p-4 rounded-xl flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Reason</label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-[#f2f4f6] border-transparent rounded-lg text-[14px] py-1.5 focus:ring-[#000000] focus:border-[#000000]"
            >
              <option>All Reasons</option>
              <option>Defect</option>
              <option>Damage</option>
              <option>Wrong Item</option>
              <option>Excess</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Status</label>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 bg-[#000000] text-white rounded-lg text-xs font-bold transition-all">All</button>
              <button className="px-3 py-1.5 bg-[#e0e3e5]/50 text-[#45464d] hover:bg-[#e0e3e5] rounded-lg text-xs font-medium transition-all">Pending</button>
              <button className="px-3 py-1.5 bg-[#e0e3e5]/50 text-[#45464d] hover:bg-[#e0e3e5] rounded-lg text-xs font-medium transition-all">In Transit</button>
              <button className="px-3 py-1.5 bg-[#e0e3e5]/50 text-[#45464d] hover:bg-[#e0e3e5] rounded-lg text-xs font-medium transition-all">Resolved</button>
            </div>
          </div>
          
          <div className="ml-auto self-end">
            <button className="flex items-center gap-2 px-4 py-1.5 border border-[#c6c6cd]/60 rounded-lg text-[#45464d] hover:bg-[#eceef0] hover:text-[#000000] transition-all">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="text-[14px]">Export Ledger</span>
            </button>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-white/90 backdrop-blur-md border border-[#c6c6cd]/20 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#eceef0] border-b border-[#c6c6cd]/20">
                  <th className="px-6 py-4 text-left text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Return ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Date Initiated</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Supplier</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Material / SKU</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Qty Returned</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Reason</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-[#45464d] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/10">
                {/* Row 1 */}
                <tr className="hover:bg-[#f2f4f6]/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-medium tracking-tight text-[#000000]">#RET-2023-042</td>
                  <td className="px-6 py-4 text-[14px] text-[#45464d]">Oct 24, 2023</td>
                  <td className="px-6 py-4 text-[14px] font-bold">Global Polymer Corp</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium">High-Density Polyethylene</span>
                      <span className="text-[11px] text-[#45464d] uppercase tracking-tight">FAB-COT-NVY-01</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-medium">120.0 m</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span> Defect
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#92400E]"></span> In Transit
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="View Details">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="Download Memo">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-[#f2f4f6]/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-medium tracking-tight text-[#000000]">#RET-2023-041</td>
                  <td className="px-6 py-4 text-[14px] text-[#45464d]">Oct 22, 2023</td>
                  <td className="px-6 py-4 text-[14px] font-bold">Inox Logistics India</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium">Industrial Sealant v4</span>
                      <span className="text-[11px] text-[#45464d] uppercase tracking-tight">SL-IND-400X</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-medium">45.0 units</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#d2e1fa] text-[#556379] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#515f74]"></span> Damage
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#e0e3e5] text-[#45464d] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#76777d]"></span> Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="View Details">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="Download Memo">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-[#f2f4f6]/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-medium tracking-tight text-[#000000]">#RET-2023-040</td>
                  <td className="px-6 py-4 text-[14px] text-[#45464d]">Oct 19, 2023</td>
                  <td className="px-6 py-4 text-[14px] font-bold">Precision Gears Ltd</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium">Stainless Spindle #8</span>
                      <span className="text-[11px] text-[#45464d] uppercase tracking-tight">SS-SPN-08B</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-medium">12.0 pcs</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#e2e2e9] text-[#45474c] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#76777d]"></span> Excess
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded bg-[#F0FDF4] text-[#166534] text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span> Resolved
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="View Details">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button className="p-1.5 text-[#45464d] hover:text-[#000000] hover:bg-[#e0e3e5] rounded transition-all" title="Download Memo">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-[#f2f4f6] px-6 py-3 border-t border-[#c6c6cd]/20 flex items-center justify-between">
            <span className="text-[12px] text-[#45464d]">Showing 1 to 3 of 245 entries</span>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-[#e0e3e5] rounded border border-[#c6c6cd]/40">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="px-3 py-1.5 bg-[#000000] text-white rounded text-xs font-bold">1</button>
              <button className="px-3 py-1.5 hover:bg-[#e0e3e5] rounded text-xs font-medium">2</button>
              <button className="px-3 py-1.5 hover:bg-[#e0e3e5] rounded text-xs font-medium">3</button>
              <button className="p-1.5 hover:bg-[#e0e3e5] rounded border border-[#c6c6cd]/40">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
