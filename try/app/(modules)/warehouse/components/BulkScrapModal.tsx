"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BulkScrapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkScrapModal({ isOpen, onClose }: BulkScrapModalProps) {
    const [mounted, setMounted] = useState(false);

    // React state to handle the form validation logic
    const [scrapReason, setScrapReason] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset state when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setScrapReason("");
            setIsConfirmed(false);
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // Derived state to determine if the button should be enabled
    const isButtonEnabled = scrapReason !== "" && isConfirmed;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-body-md text-on-surface transition-opacity">

            {/* Modal Backdrop */}
            <div
                className="absolute inset-0 bg-tertiary/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container */}
            {/* Replaced .glass-card with Tailwind utility classes (bg-white/95 + backdrop-blur) to avoid needing a separate CSS file */}
            <div className="bg-white/95 dark:bg-surface-container-lowest/95 backdrop-blur-md w-full max-w-2xl rounded-xl border border-error-container/50 shadow-2xl relative z-50 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-error-container/10 rounded-t-xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
                        </div>
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface m-0">Bulk Scrap Confirmation</h2>
                            <p className="font-body-sm text-body-sm text-error font-medium mt-1 m-0">Warning: This action is irreversible.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">

                    {/* Items List */}
                    <div className="space-y-3">
                        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Items Marked Unsalvageable (4)</h3>
                        <div className="border border-outline-variant/20 rounded-lg overflow-hidden bg-white dark:bg-surface-container-lowest">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-surface-container-low border-b border-outline-variant/20">
                                    <tr>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/4">SKU</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/2">Description</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/4 text-right">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10 font-data-mono text-data-mono">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="p-3 text-on-surface">DRM-204-A</td>
                                        <td className="p-3 text-on-surface-variant font-body-sm">Industrial Solvent (Damaged Seal)</td>
                                        <td className="p-3 text-on-surface text-right text-error font-bold">-12</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="p-3 text-on-surface">PLT-890-X</td>
                                        <td className="p-3 text-on-surface-variant font-body-sm">Fragile Electronics Batch (Water Damage)</td>
                                        <td className="p-3 text-on-surface text-right text-error font-bold">-1</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="p-3 text-on-surface">BXB-112-C</td>
                                        <td className="p-3 text-on-surface-variant font-body-sm">Corrugated Packaging (Crushed)</td>
                                        <td className="p-3 text-on-surface text-right text-error font-bold">-450</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-surface-container-low/50 transition-colors">
                                        <td className="p-3 text-on-surface">CHM-551-R</td>
                                        <td className="p-3 text-on-surface-variant font-body-sm">Reagent Grade X (Contaminated)</td>
                                        <td className="p-3 text-on-surface text-right text-error font-bold">-5</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Scrap Reason Form */}
                    <div className="space-y-4 bg-gray-50 dark:bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
                        <div className="space-y-2">
                            <label className="block font-headline-sm text-headline-sm text-on-surface" htmlFor="scrap-reason">Scrap Reason</label>
                            <div className="relative">
                                <select
                                    id="scrap-reason"
                                    value={scrapReason}
                                    onChange={(e) => setScrapReason(e.target.value)}
                                    className="w-full bg-white dark:bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-3 text-data-mono font-data-mono text-on-surface focus:ring-2 focus:ring-primary focus:border-primary appearance-none outline-none"
                                >
                                    <option disabled value="">Select Primary Reason...</option>
                                    <option value="severe_damage">Severe Physical Damage</option>
                                    <option value="chemical_contamination">Chemical Contamination</option>
                                    <option value="expired">Expired Shelf Life</option>
                                    <option value="water_damage">Water/Moisture Damage</option>
                                    <option value="manufacturing_defect">Manufacturing Defect</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block font-headline-sm text-headline-sm text-on-surface" htmlFor="scrap-notes">Additional Notes (Optional)</label>
                            <textarea
                                id="scrap-notes"
                                className="w-full bg-white dark:bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-3 text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                                placeholder="Enter specific details regarding the disposal..."
                                rows={2}
                            ></textarea>
                        </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start gap-3 p-4 bg-error-container/20 border border-error-container rounded-lg">
                        <div className="flex items-center h-5 mt-0.5">
                            <input
                                id="confirm-disposal"
                                type="checkbox"
                                checked={isConfirmed}
                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                className="w-4 h-4 text-error bg-white dark:bg-surface-container-lowest border-outline-variant rounded focus:ring-error focus:ring-2 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-headline-sm text-headline-sm text-on-surface cursor-pointer select-none m-0" htmlFor="confirm-disposal">
                                Confirm Destruction/Disposal
                            </label>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 m-0">
                                I acknowledge that these items will be permanently removed from inventory and logged as scrapped. This action will trigger disposal workflows for hazardous materials if applicable.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-outline-variant/20 bg-white dark:bg-surface-container-lowest rounded-b-xl flex justify-end gap-3 items-center shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg font-headline-sm text-headline-sm text-on-surface-variant hover:bg-gray-100 dark:hover:bg-surface-container-high transition-colors border border-outline-variant/30"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!isButtonEnabled}
                        className={`px-5 py-2.5 rounded-lg font-headline-sm text-headline-sm bg-error text-on-error transition-colors shadow-sm flex items-center gap-2 
                            ${!isButtonEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-error/90'}
                        `}
                    >
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        Finalize Scrap
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}