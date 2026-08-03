"use client";

import React, { useState } from "react";
import Link from "next/link";
import "./styles/suppliers.css";
import AddNewSupplierModal, { SupplierFormData } from "./components/modals/addnewsupplier";


interface ActivityItem {
  id: string;
  timestamp: string;
  action: string;
  icon: string;
  entity: string;
  status: "APPROVED" | "MAPPED" | "PASSED" | "CRITICAL" | "PENDING";
}

interface AlertItem {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  actionText: string;
  actionType: "po" | "renew" | "contact";
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    timestamp: "24-Oct 14:22",
    action: "PO Approval",
    icon: "task_alt",
    entity: "PO-99120 | Tech-Steel Corp",
    status: "APPROVED",
  },
  {
    id: "act-2",
    timestamp: "24-Oct 11:05",
    action: "New Mapping",
    icon: "person_add",
    entity: "Raw-Sheet-42 -> Tech-Steel",
    status: "MAPPED",
  },
  {
    id: "act-3",
    timestamp: "24-Oct 09:45",
    action: "Quality Inspection",
    icon: "fact_check",
    entity: "Batch #B-202 | Apex Poly",
    status: "PASSED",
  },
  {
    id: "act-4",
    timestamp: "23-Oct 17:30",
    action: "Flag Raised",
    icon: "warning",
    entity: "Inland Logistics Delay",
    status: "CRITICAL",
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alt-1",
    type: "warning",
    title: "Low Stock Alert: Grade-B Steel",
    description: "Inventory below 15%. Recommend immediate reorder from Tech-Steel Corp.",
    actionText: "CREATE PO",
    actionType: "po",
  },
  {
    id: "alt-2",
    type: "error",
    title: "Expiring Contract: Inland Log",
    description: "Contract #SRM-2023-92 ends in 12 days. Compliance review required.",
    actionText: "RENEW NOW",
    actionType: "renew",
  },
  {
    id: "alt-3",
    type: "info",
    title: "Delayed Shipment: PO-77421",
    description: "Apex Polymers shipment delayed by 48h due to customs processing.",
    actionText: "CONTACT VENDOR",
    actionType: "contact",
  },
];

export default function SrmOverviewPage() {
  const [timePeriod, setTimePeriod] = useState<"MONTH" | "QUARTER">("MONTH");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Supplier Form state
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierCategory, setNewSupplierCategory] = useState("FABRIC");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierLocation, setNewSupplierLocation] = useState("");

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExport = () => {
    showToast("Generating SRM Overview report PDF/Excel export...");
  };

  const handleAddSupplierSubmit = (data: SupplierFormData) => {
    if (!data.name.trim()) return;
    setIsAddModalOpen(false);
    showToast(`Supplier "${data.name}" successfully onboarded!`);
  };

  const handleAlertAction = (alert: AlertItem) => {
    if (alert.actionType === "po") {
      showToast("Initiated Purchase Order creation workflow for Grade-B Steel.");
    } else if (alert.actionType === "renew") {
      showToast("Opened Contract Renewal portal for Inland Logistics.");
    } else {
      showToast("Opening vendor communications window for Apex Polymers...");
    }
  };

  // Bar height data based on time period
  const spendData = timePeriod === "MONTH"
    ? [
        { name: "Tech-Steel Corp", val: "1.2M", pct: 90, subPct: 85 },
        { name: "Inland Logistics", val: "950K", pct: 75, subPct: 80 },
        { name: "Apex Polymers", val: "720K", pct: 60, subPct: 75 },
        { name: "Global Casting", val: "1.0M", pct: 80, subPct: 90 },
        { name: "Precision Tools", val: "540K", pct: 50, subPct: 65 },
      ]
    : [
        { name: "Tech-Steel Corp", val: "3.8M", pct: 95, subPct: 90 },
        { name: "Inland Logistics", val: "2.9M", pct: 82, subPct: 85 },
        { name: "Apex Polymers", val: "2.1M", pct: 68, subPct: 72 },
        { name: "Global Casting", val: "3.2M", pct: 88, subPct: 82 },
        { name: "Precision Tools", val: "1.6M", pct: 58, subPct: 60 },
      ];

  return (
    <div className="space-y-6 text-[#191c1e] font-sans pb-12">
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
              Supplier Management Overview
            </h1>
            <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              SRM v3.42
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Command center for industrial vendor relations, compliance tracking, and procurement monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white border border-slate-300 px-4 py-2 rounded text-slate-800 font-medium text-sm hover:bg-slate-100 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="uppercase tracking-wider text-xs">Add New Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS (4-GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-950 rounded-lg">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <span className="text-emerald-700 text-xs font-mono font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded">
              +4.2% <span className="material-symbols-outlined text-xs ml-0.5">trending_up</span>
            </span>
          </div>
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">Total Suppliers</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">124</h3>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
            8 new added since last month
          </p>
        </div>

        {/* Card 2 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-900 bg-white/90 shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-indigo-50 text-indigo-900 rounded-lg">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px] font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">Active PO Value</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">Rs 4.2M</h3>
          <p className="text-[11px] text-slate-500 mt-2">Across 42 open purchase orders</p>
        </div>

        {/* Card 3 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-lg">
              <span className="material-symbols-outlined text-xl">timer</span>
            </div>
            <span className="text-rose-700 text-xs font-mono font-bold flex items-center bg-rose-50 px-2 py-0.5 rounded">
              -1.5d <span className="material-symbols-outlined text-xs ml-0.5">trending_down</span>
            </span>
          </div>
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">Avg Lead Time</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">
            18.5 <span className="text-base font-normal text-slate-500">days</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">Improved from 20.0 days (Q3 baseline)</p>
        </div>

        {/* Card 4 */}
        <div className="srm-glass-card p-5 rounded-xl border border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
              <span className="font-mono text-[10px] font-bold">STABLE</span>
            </div>
          </div>
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">Compliance Rate</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">98.2%</h3>
          <p className="text-[11px] text-slate-500 mt-2">Industry benchmark: 94.0%</p>
        </div>
      </div>

      {/* CHARTS & DISTRIBUTION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="srm-glass-card p-6 rounded-xl border border-slate-200 bg-white/95 col-span-1 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Supplier Status</h4>
              <p className="text-xs text-slate-500">Active status distribution</p>
            </div>
            <button className="text-slate-400 hover:text-slate-700 p-1">
              <span className="material-symbols-outlined text-xl">more_horiz</span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="88" cy="88" r="72" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                {/* Active segment (104/124 = ~83.8%) */}
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  fill="transparent"
                  stroke="#0f172a"
                  strokeWidth="14"
                  strokeDasharray="378 452"
                  strokeLinecap="round"
                />
                {/* Probation segment (16/124 = ~12.9%) */}
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  fill="transparent"
                  stroke="#515f74"
                  strokeWidth="14"
                  strokeDasharray="58 452"
                  strokeDashoffset="-378"
                  strokeLinecap="round"
                />
                {/* Blocked segment (4/124 = ~3.2%) */}
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  fill="transparent"
                  stroke="#ba1a1a"
                  strokeWidth="14"
                  strokeDasharray="16 452"
                  strokeDashoffset="-436"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-bold text-slate-900 block leading-none">124</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  TOTAL
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 w-full space-y-2.5 px-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-slate-900"></span>
                  <span className="text-slate-600 font-medium">Active Vendors</span>
                </div>
                <span className="font-mono font-bold text-slate-900">104 (83.8%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                  <span className="text-slate-600 font-medium">Probation / Review</span>
                </div>
                <span className="font-mono font-bold text-slate-900">16 (12.9%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                  <span className="text-slate-600 font-medium">Blocked</span>
                </div>
                <span className="font-mono font-bold text-slate-900">4 (3.2%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Suppliers by Spend Bar Chart */}
        <div className="srm-glass-card p-6 rounded-xl border border-slate-200 bg-white/95 col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900">Top Suppliers by Spend</h4>
              <p className="text-xs text-slate-500">Procurement financial volume analytics</p>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
              <button
                onClick={() => setTimePeriod("MONTH")}
                className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${
                  timePeriod === "MONTH" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                MONTH
              </button>
              <button
                onClick={() => setTimePeriod("QUARTER")}
                className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${
                  timePeriod === "QUARTER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                QUARTER
              </button>
            </div>
          </div>

          {/* Bar chart container */}
          <div className="h-64 flex items-end space-x-4 sm:space-x-6 pb-2 px-2 border-b border-slate-200">
            {spendData.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t h-full flex items-end justify-center relative overflow-hidden group-hover:bg-slate-200 transition-colors">
                  <div
                    className="w-[70%] bg-slate-900 rounded-t group-hover:bg-blue-600 transition-all duration-300"
                    style={{ height: `${bar.pct}%` }}
                  >
                    <div
                      className="w-full bg-slate-700 rounded-t transition-all duration-300"
                      style={{ height: `${bar.subPct}%` }}
                    ></div>
                  </div>

                  {/* Value Tooltip on hover */}
                  <div className="absolute -top-8 bg-slate-900 text-white text-[11px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none z-10">
                    Rs {bar.val}
                  </div>
                </div>
                <span className="text-[10px] font-mono mt-3 text-slate-600 font-semibold truncate w-full text-center">
                  {bar.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-slate-900 inline-block mr-1.5 rounded-sm"></span> Direct Materials
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-slate-700 inline-block mr-1.5 rounded-sm"></span> Logistics & Services
              </span>
            </div>
            <span>Calculated live from approved POs</span>
          </div>
        </div>
      </div>

      {/* ALERTS & RECENT SRM ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operational Alerts Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-base font-bold text-slate-900 flex items-center">
              <span className="material-symbols-outlined text-amber-600 mr-2">report</span>
              Operational Alerts
            </h4>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              3 Pending
            </span>
          </div>

          {INITIAL_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className={`srm-glass-card p-4 rounded-xl border-l-4 ${
                alert.type === "warning"
                  ? "border-l-amber-500 bg-amber-50/40"
                  : alert.type === "error"
                  ? "border-l-rose-500 bg-rose-50/40"
                  : "border-l-slate-900 bg-slate-50/60"
              } border-slate-200 shadow-sm flex items-start space-x-3 transition-all`}
            >
              <div className="mt-0.5">
                <span
                  className={`material-symbols-outlined text-xl ${
                    alert.type === "warning"
                      ? "text-amber-600"
                      : alert.type === "error"
                      ? "text-rose-600"
                      : "text-slate-800"
                  }`}
                >
                  {alert.type === "warning" ? "inventory_2" : alert.type === "error" ? "assignment_late" : "schedule"}
                </span>
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-xs ${
                    alert.type === "warning"
                      ? "text-amber-900"
                      : alert.type === "error"
                      ? "text-rose-900"
                      : "text-slate-900"
                  }`}
                >
                  {alert.title}
                </p>
                <p className="text-xs text-slate-600 leading-snug mt-1">{alert.description}</p>
                <button
                  onClick={() => handleAlertAction(alert)}
                  className="mt-2 text-xs font-mono font-bold text-slate-900 hover:text-blue-600 underline tracking-wider uppercase"
                >
                  {alert.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent SRM Activity Table Column */}
        <div className="lg:col-span-8 srm-glass-card rounded-xl border border-slate-200 bg-white/95 overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-base font-bold text-slate-900">Recent SRM Activity</h4>
                <p className="text-xs text-slate-500">Real-time audit log of procurement transactions</p>
              </div>
              <Link
                href="/srm/suppliers"
                className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center"
              >
                <span>View All Activity</span>
                <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Entity / Reference</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {INITIAL_ACTIVITIES.map((act) => (
                    <tr key={act.id} className="srm-table-row hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">{act.timestamp}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-base text-slate-400">{act.icon}</span>
                          <span>{act.action}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{act.entity}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            act.status === "APPROVED" || act.status === "PASSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : act.status === "MAPPED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              act.status === "APPROVED" || act.status === "PASSED"
                                ? "bg-emerald-600"
                                : act.status === "MAPPED"
                                ? "bg-blue-600"
                                : "bg-rose-600"
                            }`}
                          ></span>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right text-xs text-slate-400 font-mono">
            Showing last 4 activity entries
          </div>
        </div>
      </div>

      {/* NAVIGATION SHORTCUTS BENTO GRID */}
      <div className="pt-2">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
          SRM Quick Navigation
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/srm/suppliers"
            className="srm-glass-card p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center space-x-4 hover:bg-slate-900 hover:text-white transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <div>
              <p className="font-bold text-sm">Supplier Directory</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                Full Vendor Roster & Contacts
              </p>
            </div>
          </Link>

          <Link
            href="/srm/suppliers"
            className="srm-glass-card p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center space-x-4 hover:bg-slate-900 hover:text-white transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <div>
              <p className="font-bold text-sm">Performance Analytics</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                Scorecards & Compliance
              </p>
            </div>
          </Link>

          <Link
            href="/srm/suppliers"
            className="srm-glass-card p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center space-x-4 hover:bg-slate-900 hover:text-white transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">schema</span>
            </div>
            <div>
              <p className="font-bold text-sm">Material Mapping</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                SKU to Vendor Matrix
              </p>
            </div>
          </Link>

          <Link
            href="/srm/suppliers"
            className="srm-glass-card p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center space-x-4 hover:bg-slate-900 hover:text-white transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <div>
              <p className="font-bold text-sm">Contracts & Terms</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                Legal & Expiry Archive
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ADD SUPPLIER MODAL */}
      <AddNewSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSupplierSubmit}
      />
    </div>
  );
}
