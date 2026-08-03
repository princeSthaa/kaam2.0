"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../styles/suppliers.css";

interface SupplierStanding {
  id: string;
  name: string;
  otd: string;
  qualityScore: number;
  delta: string;
  isPositive: boolean;
  type: "top" | "under";
}

const ALL_STANDINGS: SupplierStanding[] = [
  // Top Performers
  {
    id: "sup-1",
    name: "Apex Industrial Textiles",
    otd: "99.8%",
    qualityScore: 4.9,
    delta: "+2.4%",
    isPositive: true,
    type: "top",
  },
  {
    id: "sup-2",
    name: "Global Polymer Corp",
    otd: "97.2%",
    qualityScore: 4.7,
    delta: "+1.1%",
    isPositive: true,
    type: "top",
  },
  {
    id: "sup-3",
    name: "Precision Hardware Ltd",
    otd: "96.8%",
    qualityScore: 4.6,
    delta: "+0.8%",
    isPositive: true,
    type: "top",
  },
  {
    id: "sup-4",
    name: "Vanguard Synthetics",
    otd: "96.2%",
    qualityScore: 4.5,
    delta: "+1.5%",
    isPositive: true,
    type: "top",
  },
  // Under Performers
  {
    id: "sup-5",
    name: "Steel Works PVT",
    otd: "94.5%",
    qualityScore: 4.2,
    delta: "-3.4%",
    isPositive: false,
    type: "under",
  },
  {
    id: "sup-6",
    name: "ChemTech Solutions",
    otd: "78.4%",
    qualityScore: 3.1,
    delta: "-12.0%",
    isPositive: false,
    type: "under",
  },
  {
    id: "sup-7",
    name: "Loom & Shuttle Co.",
    otd: "82.1%",
    qualityScore: 3.4,
    delta: "-5.2%",
    isPositive: false,
    type: "under",
  },
];

export default function SrmPerformanceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"6M" | "12M" | "YTD">("6M");
  const [standingTab, setStandingTab] = useState<"top" | "under">("top");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedSupplierCard, setSelectedSupplierCard] = useState<SupplierStanding | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportReport = () => {
    showToast("Exporting SRM Performance Analytics report (PDF / Excel)...");
  };

  const filteredStandings = ALL_STANDINGS.filter((s) => s.type === standingTab);

  return (
    <div className="space-y-6 text-[#191c1e] font-sans pb-16">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3 transition-all animate-bounce">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              SRM Performance Analytics
            </h1>
            <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              V3.42 Analytics
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive insights into supply chain reliability, lead times, quality scores, and risk exposure across active suppliers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeRange("6M")}
              className={`px-3 py-1.5 font-semibold rounded transition-all flex items-center ${
                timeRange === "6M" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] mr-1">calendar_today</span>
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange("12M")}
              className={`px-3 py-1.5 font-semibold rounded transition-all ${
                timeRange === "12M" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeRange("YTD")}
              className={`px-3 py-1.5 font-semibold rounded transition-all ${
                timeRange === "YTD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              YTD
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS (4-GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Overall Supplier Rating
            </span>
            <div className="w-9 h-9 bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">
              4.2<span className="text-slate-400 text-base font-normal">/5.0</span>
            </div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +0.4 score increase vs Q3
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              On-Time Delivery Rate
            </span>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">94.2%</div>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              Target benchmark: 95.0%
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Quality Compliance
            </span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">98.1%</div>
            <div className="flex items-center text-rose-700 font-mono text-[11px] mt-2 font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
              -0.2% variance vs target
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Avg Lead Time
            </span>
            <div className="w-9 h-9 bg-amber-50 text-amber-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 leading-none">
              14.2 <span className="text-base font-normal text-slate-500">Days</span>
            </div>
            <div className="flex items-center text-slate-500 font-mono text-[11px] mt-2 font-medium">
              <span className="material-symbols-outlined text-sm mr-1">history</span>
              Historical Avg: 15.5 Days
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRENDS & CATEGORY PERFORMANCE GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* Supplier Performance Trends (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 srm-glass-card p-6 rounded-xl border border-slate-200 bg-white/95 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Supplier Performance Trends</h3>
                <p className="text-xs text-slate-500">Comparative analysis of Quality vs. Delivery Performance over time</p>
              </div>
              <div className="flex space-x-4 font-mono text-[11px] font-semibold">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-slate-900 mr-2"></span>
                  Quality %
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-indigo-200 border border-indigo-600 mr-2"></span>
                  Delivery %
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="h-64 relative w-full border-l border-b border-slate-200 px-2 py-4">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" x2="800" y1="40" y2="40" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" x2="800" y1="90" y2="90" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" x2="800" y1="140" y2="140" stroke="#f1f5f9" strokeDasharray="4" />

                {/* Quality Area Fill */}
                <path
                  d="M 0,160 Q 150,120 300,90 T 500,70 T 800,30 L 800,200 L 0,200 Z"
                  fill="rgba(15, 23, 42, 0.04)"
                />

                {/* Quality Line */}
                <path
                  d="M 0,160 Q 150,120 300,90 T 500,70 T 800,30"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3"
                />

                {/* Delivery Line (Dashed) */}
                <path
                  d="M 0,140 Q 200,140 400,120 T 800,80"
                  fill="none"
                  stroke="#4f46e5"
                  strokeDasharray="6 4"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                <circle cx="150" cy="135" r="4.5" fill="#0f172a" />
                <circle cx="300" cy="90" r="4.5" fill="#0f172a" />
                <circle cx="500" cy="70" r="4.5" fill="#0f172a" />
                <circle cx="800" cy="30" r="4.5" fill="#0f172a" />

                <circle cx="200" cy="140" r="3.5" fill="#4f46e5" />
                <circle cx="400" cy="120" r="3.5" fill="#4f46e5" />
                <circle cx="800" cy="80" r="3.5" fill="#4f46e5" />
              </svg>

              {/* X-Axis Month Labels */}
              <div className="absolute bottom-[-24px] left-0 w-full flex justify-between font-mono text-[10px] text-slate-400 font-bold px-2">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Peak performance recorded in June (+4.8% Quality Index)</span>
            <span className="font-mono text-[11px] font-bold text-slate-700">Updated 10m ago</span>
          </div>
        </div>

        {/* Category Performance (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 srm-glass-card p-6 rounded-xl border border-slate-200 bg-white/95 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Category Performance</h3>
            <p className="text-xs text-slate-500 mb-6">Efficiency across material supplier groups</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-mono text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Fabric & Textiles</span>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full w-[92%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Trims & Thread</span>
                  <span className="font-bold text-slate-900">88%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full w-[88%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Hardware & Zippers</span>
                  <span className="font-bold text-slate-900">96%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full w-[96%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Chemicals & Dyes</span>
                  <span className="font-bold text-rose-700">74%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full w-[74%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-amber-50/80 rounded-lg border border-amber-200">
            <div className="flex items-center text-amber-900 font-mono text-xs font-bold mb-1">
              <span className="material-symbols-outlined text-base mr-1.5 text-amber-700">report_problem</span>
              Action Required
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Chemical suppliers show a 12% drop in compliance this month. Audit scheduled for Friday.
            </p>
          </div>
        </div>
      </div>

      {/* 3. SUPPLIER STANDINGS & RISK HEATMAP GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* Supplier Standings Table (7 Cols) */}
        <div className="col-span-12 lg:col-span-7 srm-glass-card rounded-xl border border-slate-200 bg-white/95 overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Supplier Standings</h3>
                <p className="text-xs text-slate-500">Ranking by OTD and Quality Scores</p>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setStandingTab("top")}
                  className={`px-3 py-1 font-mono text-xs font-bold rounded transition-all ${
                    standingTab === "top" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Top Performers
                </button>
                <button
                  onClick={() => setStandingTab("under")}
                  className={`px-3 py-1 font-mono text-xs font-bold rounded transition-all ${
                    standingTab === "under" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Under Performers
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3">Supplier Name</th>
                    <th className="px-5 py-3">OTD %</th>
                    <th className="px-5 py-3">Quality Score</th>
                    <th className="px-5 py-3">Delta</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredStandings.map((s) => (
                    <tr key={s.id} className="srm-table-row hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-800 font-medium">{s.otd}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center">
                          <span className="font-bold text-slate-900 mr-1.5">{s.qualityScore}</span>
                          <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 font-mono font-bold ${s.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-sm mr-0.5">
                            {s.isPositive ? "arrow_upward" : "arrow_downward"}
                          </span>
                          {s.delta}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedSupplierCard(s)}
                          className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600 underline"
                        >
                          View Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right text-xs text-slate-400 font-mono">
            Displaying {filteredStandings.length} suppliers in {standingTab} tab
          </div>
        </div>

        {/* Risk Heatmap (5 Cols) */}
        <div className="col-span-12 lg:col-span-5 srm-glass-card p-6 rounded-xl border border-slate-200 bg-white/95 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Supply Chain Risk Heatmap</h3>
            <p className="text-xs text-slate-500 mb-6">Probability vs. Financial Impact Matrix (Rs Lakhs)</p>

            {/* 3x3 Grid */}
            <div className="relative border-l border-b border-slate-300 ml-6 mb-6">
              {/* Y Axis label */}
              <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                PROBABILITY
              </div>

              <div className="grid grid-cols-3 grid-rows-3 gap-1.5 p-1 h-52">
                <div className="bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center text-[10px] font-mono text-emerald-800">Low</div>
                <div className="bg-amber-50 rounded border border-amber-200 flex items-center justify-center text-[10px] font-mono text-amber-800">Med</div>
                <div className="bg-rose-100 rounded border border-rose-300 relative group cursor-pointer flex items-center justify-center">
                  <span className="w-3.5 h-3.5 bg-rose-600 rounded-full animate-ping"></span>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded shadow-lg hidden group-hover:block whitespace-nowrap z-20 font-mono">
                    Raw Material Shortage: Rs 42.5L
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded border border-emerald-100"></div>
                <div className="bg-emerald-50 rounded border border-emerald-200"></div>
                <div className="bg-amber-100 rounded border border-amber-200"></div>

                <div className="bg-emerald-50/30 rounded border border-slate-100"></div>
                <div className="bg-emerald-50/50 rounded border border-emerald-100"></div>
                <div className="bg-emerald-50 rounded border border-emerald-200"></div>
              </div>

              {/* X Axis label */}
              <div className="text-center font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                FINANCIAL IMPACT →
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-slate-900">Rs 14.2M</div>
              <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Total Exposure</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
              <div className="text-xl font-bold text-rose-700">4 High</div>
              <div className="text-[10px] font-mono font-semibold text-rose-800 uppercase">Risk Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPLIER CARD MODAL */}
      {selectedSupplierCard && (
        <div className="fixed inset-0 srm-modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 srm-modal-content space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="material-symbols-outlined text-slate-900 mr-2">badge</span>
                {selectedSupplierCard.name}
              </h3>
              <button
                onClick={() => setSelectedSupplierCard(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">On-Time Delivery Rate:</span>
                <span className="font-mono font-bold text-slate-900">{selectedSupplierCard.otd}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Quality Rating:</span>
                <span className="font-mono font-bold text-slate-900">{selectedSupplierCard.qualityScore} / 5.0 ⭐</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Performance Delta:</span>
                <span className={`font-mono font-bold ${selectedSupplierCard.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                  {selectedSupplierCard.delta}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Standing Category:</span>
                <span className="font-mono uppercase font-bold text-slate-800">{selectedSupplierCard.type} performer</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedSupplierCard(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded font-medium hover:bg-slate-200 text-xs"
              >
                Close
              </button>
              <Link
                href="/srm/suppliers"
                className="px-4 py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 text-xs inline-flex items-center"
              >
                Go to Supplier Directory
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
