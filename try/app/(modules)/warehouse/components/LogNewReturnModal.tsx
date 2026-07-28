/* Path: C:\Code\Kaam2\try\app\(modules)\warehouse\components\LogNewReturnModal.tsx */

"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function LogReturnModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

            {/* Backdrop */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal Container */}
            <div className="relative z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">assignment_return</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 leading-tight">Log Customer Return</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Record a new incoming item return to the facility.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 bg-white">

                    {/* Return Context Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Return Context</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Order ID */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-800 font-semibold" htmlFor="order-id">
                                    Order ID / Return ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[18px] pointer-events-none">tag</span>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-mono text-sm rounded-md py-2.5 pr-3 pl-10 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                                        id="order-id"
                                        placeholder="e.g., ORD-7829-1X"
                                        required
                                        type="text"
                                    />
                                </div>
                            </div>

                            {/* Customer Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-800 font-semibold" htmlFor="customer-name">Customer Name</label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[18px] pointer-events-none">person</span>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md py-2.5 pr-3 pl-10 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                                        id="customer-name"
                                        placeholder="Search customer records..."
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Item Information Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Item Information</h3>

                        {/* Select Product */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-sm text-gray-800 font-semibold" htmlFor="product-select">
                                Select Product <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[18px] pointer-events-none">inventory_2</span>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md py-2.5 pr-8 pl-10 appearance-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                                    id="product-select"
                                    required
                                    defaultValue=""
                                >
                                    <option disabled value="">Search by SKU or Name...</option>
                                    <option value="sku-1">SKU-A102 - Heavy Duty Pallet Jack</option>
                                    <option value="sku-2">SKU-B404 - Industrial Shelving Unit (5-Tier)</option>
                                    <option value="sku-3">SKU-C991 - Packaging Tape Dispenser (Bulk)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 text-gray-400 pointer-events-none text-[18px]">arrow_drop_down</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Quantity */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-800 font-semibold" htmlFor="quantity">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[18px] pointer-events-none">123</span>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-mono text-sm rounded-md py-2.5 pr-3 pl-10 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                                        id="quantity"
                                        min="1"
                                        required
                                        type="number"
                                        defaultValue="1"
                                    />
                                </div>
                            </div>

                            {/* Return Reason */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-800 font-semibold" htmlFor="reason-select">
                                    Return Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[18px] pointer-events-none">psychology_alt</span>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md py-2.5 pr-8 pl-10 appearance-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                                        id="reason-select"
                                        required
                                        defaultValue=""
                                    >
                                        <option disabled value="">Select reason...</option>
                                        <option value="defective">Defective / Damaged in Transit</option>
                                        <option value="wrong_item">Wrong Item Shipped</option>
                                        <option value="not_needed">No Longer Needed</option>
                                        <option value="quality">Quality Not As Expected</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 text-gray-400 pointer-events-none text-[18px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inspector Notes */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-800 font-semibold" htmlFor="notes">Inspector Notes (Optional)</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md p-3 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all resize-none"
                            id="notes"
                            placeholder="Condition details, packaging state, or special handling instructions..."
                            rows={3}
                        ></textarea>
                    </div>

                    {/* Info Callout */}
                    <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3.5 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">info</span>
                        <p className="text-sm text-gray-700 leading-relaxed">Ensure items marked as "Defective" are routed to the QA quarantine zone after logging.</p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 items-center shrink-0">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button className="px-5 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2" type="submit">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Create Return Record
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="text-sm font-semibold">Log New Return</span>
            </button>

            {isOpen && mounted ? createPortal(modalContent, document.body) : null}
        </>
    );
}