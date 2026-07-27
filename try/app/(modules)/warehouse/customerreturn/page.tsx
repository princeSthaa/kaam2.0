/* Path: C:\Code\Kaam2\try\app\(modules)\warehouse\customerreturn\page.tsx */

import React from "react";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { warehouseNavigation } from "../navigation";
import "../styles/customerreturns.css";

export default function CustomerReturnsPage() {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 antialiased overflow-hidden w-full">
            {/* Sidebar (Assuming it handles its own fixed width, e.g., w-64 shrink-0) */}
            <Sidebar section={warehouseNavigation} />

            {/* Main Content Wrapper - Removed the extra left margin to stop squishing */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-50">
                <main className="flex-1 overflow-y-auto py-8">
                    <div className="px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                                    Returns & Quarantine Management
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage reverse logistics, inbound inspections, and quarantined stock.
                                </p>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span className="text-sm font-semibold">Log New Return</span>
                            </button>
                        </div>

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Left Column: KPIs and Table */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* KPI Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Returns</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">cached</span>
                                        </div>
                                        <div>
                                            <span className="text-3xl font-semibold text-gray-900">142</span>
                                            <div className="flex items-center text-green-600 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                <span className="text-sm font-medium ml-1">12% vs last wk</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Awaiting Insp.</span>
                                            <span className="material-symbols-outlined text-yellow-500 text-[18px]">find_in_page</span>
                                        </div>
                                        <div>
                                            <span className="text-3xl font-semibold text-gray-900">38</span>
                                            <div className="flex items-center text-yellow-600 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                                <span className="text-sm font-medium ml-1">SLA At Risk</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Quarantine</span>
                                            <span className="material-symbols-outlined text-gray-700 text-[18px]">block</span>
                                        </div>
                                        <div>
                                            <span className="text-3xl font-semibold text-gray-900">15</span>
                                            <div className="flex items-center text-gray-700 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                                <span className="text-sm font-medium ml-1">High Volume</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved (Today)</span>
                                            <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                        </div>
                                        <div>
                                            <span className="text-3xl font-semibold text-gray-900">89</span>
                                            <div className="flex items-center text-gray-500 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                <span className="text-sm font-medium ml-1">On Track</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Data Table Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full">
                                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Returns Processing Queue</h3>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                                            </button>
                                            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">sort</span> Sort
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left border-collapse min-w-[700px]">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Return ID</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Product</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Qty</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm divide-y divide-gray-100">
                                                <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-mono text-blue-600 font-semibold">RTN-8821</div>
                                                        <div className="text-gray-400 text-xs mt-0.5">Ord: #ORD-992</div>
                                                    </td>
                                                    <td className="py-4 px-4 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                <img alt="Navy Polo" className="w-8 h-8 object-contain mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_U5U6Uh2APWrpjhBtT7Nvl8MEgzc_mY2PdhqJegJc_p3w6DXHyIFhHYMooKAWdD8q0dAn_-0c_RljLmCB4-Gk_9ggbv1YTPON2-NP9muwV2c-kZv2sxDlcmTeaJKMYs2W-NRCoIrc1L2hCnkSZS394WxAch4q6_X9y2Trk3wJcxa7FxHAL2k12WaZlfqrFNcsO0U4e7c3GMOgYQbxqddWrcGWa-iAZdIDuZHCxbzXVvHDCqAFCHEgzQL2Gl-x3gwmnW8FdmB4CL8" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">Navy Polo - L</div>
                                                                <div className="text-gray-500 text-xs mt-0.5">SKU: PLO-NVY-L</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-gray-700">2</td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-200/50">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> In-Inspection
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Process">
                                                            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                                        </button>
                                                    </td>
                                                </tr>

                                                <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-mono text-blue-600 font-semibold">RTN-8822</div>
                                                        <div className="text-gray-400 text-xs mt-0.5">Ord: #ORD-741</div>
                                                    </td>
                                                    <td className="py-4 px-4 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                <img alt="Work Pants" className="w-8 h-8 object-contain mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuAkgBR42LaYlCDlgw6f3TAGY2-xfvMr0gpQwt1RZWT3zPXreo_x0kOQV_vSMaddlHpNkafB0-RjBr5_V0NaQAvUkeO4VpyocZwf_ATxurabVMGMC6eLGhnL4Mum2FqjpMv6GzFouPTzVB1TQNMSL4QFlJ5YUITLQtz9VhhuRIF8ZJrlFDSGT95KECnXReAwWEyWUj6vX26ZbIY9u2o6SHxCZINI7NlNirGAiJ2iVYKDjKRrp0hnQm1wsCJcCA8cXsc3RJ0rB8EYk" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">Work Pants - 32</div>
                                                                <div className="text-gray-500 text-xs mt-0.5">SKU: PNT-KHK-32</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-gray-700">1</td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200/50">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Quarantined
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Details">
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                    </td>
                                                </tr>

                                                <tr className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-mono text-blue-600 font-semibold">RTN-8819</div>
                                                        <div className="text-gray-400 text-xs mt-0.5">Ord: #ORD-302</div>
                                                    </td>
                                                    <td className="py-4 px-4 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                <img alt="Basic T-Shirt" className="w-8 h-8 object-contain mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB2i3TKXm0TNwbhXcebKGhqCj-_a_8JYXBDlIRyqLW1GJ1tAyHEfzHlCi-JTVquB5bTMylKjqOKZaRETD5AEDlQp-1NJNFVUFvJuzczoo5iRxEvTgM1vCPYLdlQJaUHgvhQthgLm3faolgCu6asup2wL9YIY05GjKNTSIF8MwdqxTudh-QrPBxST5noa5wY6oTrVduQskW14mZ7T5EH2EyJ9waAvXeaOHTDxAEmIxUhYh-_dA2hUmyouNLceGDFEKD4sO-0InkxNY" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">Basic T-Shirt - M</div>
                                                                <div className="text-gray-500 text-xs mt-0.5">SKU: TSH-WHT-M</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-gray-700">5</td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Awaiting Arrival
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Receive">
                                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-3 border-t border-gray-100 flex justify-center bg-gray-50/30">
                                        <button className="text-blue-600 text-sm font-medium hover:underline">View All Returns</button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Quarantine Zone & Actions */}
                            <div className="lg:col-span-4 flex flex-col gap-6">

                                {/* Quarantine Zone Section - Structure Fixed */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white rounded-t-xl z-10">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-600 text-[20px]">warning</span> Quarantine Zone
                                        </h3>
                                        <span className="text-gray-500 text-sm font-medium">15 Items</span>
                                    </div>

                                    <div className="p-4 overflow-y-auto max-h-[420px] bg-gray-50/30">
                                        {/* Added explicit mb-4 instead of relying on space-y to guarantee layout separation */}
                                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-mono text-blue-600 font-semibold text-sm">RTN-8822</div>
                                                <span className="text-gray-900 text-xs font-bold bg-gray-100 px-2 py-1 rounded">7 Days Aging</span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 mb-3">Work Pants - 32</div>
                                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-gray-500">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span> Q-Zone Rack A
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="material-symbols-outlined text-[14px]">bug_report</span> Staining
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm">Inspect</button>
                                                <button className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-red-600 text-xs font-medium hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">Scrap</button>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-mono text-blue-600 font-semibold text-sm">RTN-8790</div>
                                                <span className="text-yellow-700 text-xs font-bold bg-yellow-50 px-2 py-1 rounded">2 Days Aging</span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 mb-3">High-Vis Vest - XL</div>
                                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-gray-500">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span> Q-Bin 04
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="material-symbols-outlined text-[14px]">content_cut</span> Fabric Tear
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm">Inspect</button>
                                                <button className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm">Restock</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Panel */}
                                <div className="bg-gray-900 rounded-xl p-5 shadow-sm text-white shrink-0">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Disposition Actions</h3>
                                    <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md flex items-center justify-center gap-2 transition-colors mb-3">
                                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                        <span className="text-sm font-medium">Bulk Restock</span>
                                    </button>
                                    <button className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-100 rounded-md flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        <span className="text-sm font-medium">Bulk Scrap</span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}