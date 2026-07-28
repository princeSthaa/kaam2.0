"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BulkRestockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkRestockModal({ isOpen, onClose }: BulkRestockModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-body-md text-on-surface transition-opacity">

            {/* Modal Backdrop */}
            <div
                className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white dark:bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-white dark:bg-surface-container-lowest sticky top-0 z-10">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Bulk Restock Confirmation</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Review items passed from quarantine inspection before restocking.</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-container-low"
                    >
                        <span className="material-symbols-outlined" data-icon="close">close</span>
                    </button>
                </div>

                {/* Content Body (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50 dark:bg-surface">

                    {/* Items List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">Cleared Quarantine Items</h3>
                            <span className="bg-success-container text-success font-label-caps text-label-caps px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-success rounded-full inline-block"></span> Passed Inspection
                            </span>
                        </div>
                        <div className="border border-outline-variant/20 rounded-lg bg-white dark:bg-surface-container-lowest overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 dark:bg-surface-container-low">
                                    <tr>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-outline-variant/20 w-2/5">SKU / Item Name</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-outline-variant/20 w-1/5 text-right">Batch ID</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-outline-variant/20 w-1/5 text-right">Qty</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-outline-variant/20 w-1/5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-data-mono text-data-mono text-on-surface">SKU-9823-XYZ</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Industrial Grade Bearing</div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface-variant">BCH-441</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface font-semibold">1,250</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="material-symbols-outlined text-success" data-icon="check_circle">check_circle</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-data-mono text-data-mono text-on-surface">SKU-4412-ABC</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Heavy Duty Actuator</div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface-variant">BCH-442</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface font-semibold">45</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="material-symbols-outlined text-success" data-icon="check_circle">check_circle</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-data-mono text-data-mono text-on-surface">SKU-1190-KLM</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Hydraulic Valve Assembly</div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface-variant">BCH-445</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono text-on-surface font-semibold">320</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="material-symbols-outlined text-success" data-icon="check_circle">check_circle</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Configuration Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Destination Selection */}
                        <div className="space-y-3">
                            <label className="block font-headline-sm text-headline-sm text-on-surface">Destination Warehouse Location</label>
                            <div className="relative">
                                {/* React uses defaultValue on select instead of selected on option */}
                                <select
                                    defaultValue=""
                                    className="w-full bg-white dark:bg-surface-container-low border border-outline/60 text-on-surface font-body-md text-body-md rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                >
                                    <option value="" disabled>Select a storage zone...</option>
                                    <option value="A-Zone">A-Zone (High Bay Storage)</option>
                                    <option value="B-Zone">B-Zone (Climate Controlled)</option>
                                    <option value="C-Zone">C-Zone (Bulk Storage)</option>
                                    <option value="D-Zone">D-Zone (Hazardous Materials)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                                    <span className="material-symbols-outlined" data-icon="expand_more">expand_more</span>
                                </div>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Selected items will be assigned routing tasks to this zone.</p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-white dark:bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 flex flex-col justify-center">
                            <div className="text-on-surface-variant font-label-caps text-label-caps uppercase mb-1">Total Units to Restock</div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">1,615</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">units across 3 SKUs</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-outline-variant/20 bg-white dark:bg-surface-container-lowest flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg font-headline-sm text-headline-sm text-on-surface border border-outline-variant/60 hover:bg-gray-100 dark:hover:bg-surface-container-low transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-headline-sm text-headline-sm text-white bg-success hover:opacity-90 transition-opacity duration-200 shadow-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]" data-icon="inventory_2">inventory_2</span>
                        Process Bulk Restock
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}