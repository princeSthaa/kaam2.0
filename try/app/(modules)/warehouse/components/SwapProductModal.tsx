"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/swap-product-modal.css';

interface SwapProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwapProductModal({ isOpen, onClose }: SwapProductModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] transition-opacity flex items-center justify-center p-4">

            {/* Modal Backdrop - Clicking this closes the modal */}
            <div
                className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container */}
            {/* Note: I added 'bg-white' alongside glass-panel to act as a fallback in case your tailwind config is missing the custom background variables, preventing the transparency bug */}
            <div className="glass-panel bg-white dark:bg-surface-container-lowest w-full max-w-[900px] rounded-xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl relative z-50">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horizontal_circle</span>
                        </div>
                        <div>
                            <h2 className="font-headline-md text-xl font-semibold text-on-surface m-0">Process Product Swap</h2>
                            <p className="font-body-sm text-xs text-on-surface-variant m-0 mt-0.5">RMA-8492-X · Customer: Sarah Jenkins</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body: Split Layout */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-surface">

                    {/* Left Panel: Original Item */}
                    <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-outline-variant/20 p-6 flex flex-col bg-surface-container-lowest overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-headline-sm text-base font-semibold text-on-surface">Original Return Item</h3>
                            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-label-caps uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-on-error-container"></span>
                                Defective
                            </span>
                        </div>
                        <div className="relative w-full aspect-square mb-5 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container-low flex items-center justify-center">
                            <img
                                className="object-cover w-full h-full mix-blend-multiply"
                                data-alt="A high-quality, evenly lit studio photograph of a premium industrial power tool, specifically a heavy-duty drill, rendered in a crisp, clean aesthetic."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY4xitDMKhwgZ_nnUwXtTKxOmgC_qzj9h0c91cvJqYxkiR80fk3TISMuQaGxp9-jxFUVyMQQSYV0Blxj5YwEpdK-FKViravamYlxnQIpR8-sbTdatVGcWvpGJaOvrG2jHyXSqp_SywP_9aLuYtR95stgUQrJJ9bw8drTQcrUZ0F-sKz0Rj02MQcFrt5u1fnspxDFS9ipIXBAe8vhtxgs_wdpcDGoz0K_bCXVXHzjUaLgUxQ0lQwOGbgxm7t_tPFh39JkrHSvjepE4"
                                alt="Defective Hammer Drill"
                            />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-surface-variant uppercase mb-1">SKU</div>
                                <div className="font-data-mono text-data-mono text-on-surface bg-surface-container p-2 rounded">PRD-882-DRL-V2</div>
                            </div>
                            <div>
                                <div className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-surface-variant uppercase mb-1">Product Name</div>
                                <div className="font-body-md text-sm text-on-surface font-medium">Pro-Grade Hammer Drill 18V (Gen 2)</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-surface-variant uppercase mb-1">Condition</div>
                                    <div className="font-body-md text-sm text-on-surface">Damaged Chuck</div>
                                </div>
                                <div>
                                    <div className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-surface-variant uppercase mb-1">Received Date</div>
                                    <div className="font-body-md text-sm text-on-surface">Oct 24, 2023</div>
                                </div>
                            </div>
                            <div className="mt-2 p-3 bg-surface-container-low rounded border border-outline-variant/30">
                                <div className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">chat</span> Customer Note
                                </div>
                                <p className="font-body-sm text-xs text-on-surface italic m-0">"The chuck wobbles significantly when trying to drill precise holes. Needs replacement."</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Replacement Selection */}
                    <div className="w-full md:w-3/5 p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-surface">
                        <h3 className="font-headline-sm text-base font-semibold text-on-surface mb-4">Select Replacement Item</h3>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-container-low border border-outline-variant/60 rounded text-[13px] font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/70"
                                placeholder="Search by SKU, Name, or Category..."
                                type="text"
                                defaultValue="PRD-882"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-surface-variant rounded-sm text-on-surface-variant hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                            <button className="whitespace-nowrap px-3 py-1.5 bg-primary text-on-primary rounded font-body-sm text-xs transition-colors border border-primary">Exact Match</button>
                            <button className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded font-body-sm text-xs hover:bg-gray-100 transition-colors">Same Category</button>
                            <button className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded font-body-sm text-xs hover:bg-gray-100 transition-colors">Upgrades</button>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 space-y-3">

                            {/* Selected Option */}
                            <div className="relative bg-white dark:bg-surface-container-lowest border-2 border-primary rounded-lg p-4 cursor-pointer flex items-start gap-4 shadow-sm">
                                <div className="absolute top-3 right-3 text-primary">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                </div>
                                <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20 overflow-hidden">
                                    <img
                                        className="object-cover w-full h-full mix-blend-multiply"
                                        data-alt="A clean, isolated product shot of a brand new, pristine industrial power drill, identical to the returned item but in perfect condition."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPD0di-LglfvL-FSrznyhX0D9a41K0KhB4GsqG9IXW8zP4htlvk5ZwOY_eXIDBp2OVm2CI32bNEXQqPvGh-LsE7KbEiDkaeq8RBKCkYF10ZdX-P7zLOzM8BOei6fzldFNlNeEr75kFtIlM5mLa_gHWktB0FF2AIfcNaykiTpmNHc9txtkUqpm4eHMOsouuJ3KXYG37UenfkZj2yOBHzojlv1SHHuIb9eEou_YWisYqkr4IZ4P6OaN2XYT_-2z6GxpCaHdaKGUheG4"
                                        alt="Replacement Item Match"
                                    />
                                </div>
                                <div className="flex-1 pr-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">PRD-882-DRL-V2</span>
                                        <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">Exact</span>
                                    </div>
                                    <h4 className="font-body-md text-sm font-semibold text-on-surface mb-2">Pro-Grade Hammer Drill 18V (Gen 2)</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-success"></span>
                                            <span className="font-body-sm text-xs text-on-surface-variant">42 in Stock (Zone A)</span>
                                        </div>
                                        <div className="font-body-sm text-xs text-on-surface-variant border-l border-outline-variant/30 pl-4">$0.00 Difference</div>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2 */}
                            <div className="relative bg-white dark:bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 cursor-pointer flex items-start gap-4 lift-hover opacity-80 hover:opacity-100">
                                <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20 overflow-hidden">
                                    <img
                                        className="object-cover w-full h-full mix-blend-multiply"
                                        data-alt="A clean, isolated product shot of an upgraded model industrial power drill, similar to the original but with visible enhanced features like an extra grip or larger battery pack."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQT8LZ89EHho_4df8iEx813orvnf1SUE7THgZ_HNpTsJY9AU6dOrU5hAio_5F9zQRS-F9lNNezEA3BiqW9O0DDgCDoCjlVSo_DzpMdibYlA1VrAkLJbkvyHqqW3thwt7GT8zh1PXngt0r7fj6FxtcYvtVjokTiIWYjkjiJVYJbJSRj-MwsmwPF-LePqsqLcj-SaIOASeUr-FmKdI5QsWf2b9cGNVzKSpTTbAYkD4f06sEg81KIRK2FU8mC3T8sQLSbfSFJCzEKmTM"
                                        alt="Replacement Item Upgrade"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">PRD-883-DRL-V3</span>
                                        <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">Upgrade</span>
                                    </div>
                                    <h4 className="font-body-md text-sm font-medium text-on-surface mb-2">Pro-Grade Hammer Drill 20V MAX (Gen 3)</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-warning"></span>
                                            <span className="font-body-sm text-xs text-on-surface-variant">8 in Stock (Zone C)</span>
                                        </div>
                                        <div className="font-body-sm text-xs text-warning border-l border-outline-variant/30 pl-4">+$45.00 Difference</div>
                                    </div>
                                </div>
                            </div>

                            {/* Option 3 (Out of Stock) */}
                            <div className="relative bg-gray-50 dark:bg-surface-bg border border-outline-variant/20 rounded-lg p-4 flex items-start gap-4 opacity-50 cursor-not-allowed">
                                <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20 overflow-hidden grayscale">
                                    <img
                                        className="object-cover w-full h-full mix-blend-multiply"
                                        data-alt="A clean, isolated product shot of a basic power drill. The image is visually muted or grayscale to indicate it is unavailable."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIATSvIrWU0BuROl8_Bo-GzFMQ1riTtj623R1P_q-xY7SHYusILixpWj5nrbk-O0tCocpfOax_85dn8lC6-0f9s4dlQt-gggLuzgsS27kNAJ23MEbvPAtpR1unYyR_bOmY8LW56_-SFceo-a1kZzV3fUrAtuiB9N6uSHSkaugV6wLkE76LHVkFY2TJ3D8PqOCj0_wBeRJbYWIActf5EuKiA4K8LfHjBxlK3kGEyx8az2sNVOJ_xWZ3JrDKRs3QnfHpSuA5kRWOg3A"
                                        alt="Out of stock item"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">PRD-880-DRL-V1</span>
                                    </div>
                                    <h4 className="font-body-md text-sm font-medium text-on-surface mb-2 line-through">Pro-Grade Hammer Drill 18V (Gen 1)</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-error"></span>
                                            <span className="font-body-sm text-xs text-on-surface-variant">Out of Stock</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer / Actions */}
                <div className="px-6 py-4 border-t border-outline-variant/20 bg-white dark:bg-surface-container-lowest flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span className="font-body-sm text-xs">Inventory will be automatically adjusted upon confirmation.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded font-headline-sm text-base font-semibold text-on-surface border border-outline-variant/40 hover:bg-surface-container-low transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded bg-primary text-on-primary font-headline-sm text-base font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                            Confirm Swap &amp; Dispatch
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}