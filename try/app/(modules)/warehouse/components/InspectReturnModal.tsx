"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/inspect-return-modal.css';

interface InspectReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnId?: string;
}

export default function InspectReturnModal({ isOpen, onClose, returnId = "RMA-8492-V2" }: InspectReturnModalProps) {
    // Prevent hydration mismatch by ensuring portal only renders on client
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        // Added z-[100] to ensure it sits above any nav/sidebar indices
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-body-md text-on-surface">

            {/* Modal Overlay Backdrop - Clicking this closes the modal */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Inspection Modal Container */}
            {/* <div className="relative bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant/20"> */}
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
                {/* Header */}
                {/* <header className="flex items-center justify-between px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/20 shrink-0"> */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant icon-fill">fact_check</span>
                        </div>
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">Return Inspection</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{returnId}</span>
                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                <span className="font-data-mono text-data-mono text-on-surface-variant">Auth: Pending</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>

                {/* Scrollable Content Canvas */}
                {/* <div className="flex-1 overflow-y-auto bg-surface p-6"> */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left Column: Product Context & Imagery */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Product Info Card */}
                            <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/20 shadow-sm">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Item Details</h3>
                                <div className="flex gap-4">
                                    <div className="w-20 h-24 rounded bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/10">
                                        <img
                                            className="w-full h-full object-cover"
                                            data-alt="A clean, minimalist product shot of a folded dark blue technical jacket against a pristine white background. High-key lighting, industrial utilitarian aesthetic, sharp details."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEpt9I8CcHawdIvApPuqxmEQiUZOtnGevevZgrPC2feLzMtCZSVMlzUG8qyOlcPLz9ydh7VxnsMJrR7yMjtrourxJYDqNdBZNISTp14sq4M7bkeQuo7bAuKTkrNqneHYngNOHj98MtChbg0TiBapIdynsYUc-PxRvyBtQuUyBo0N7lwWdoKZdNE75HAScbrarOYli_DT0Kf2P5n-t8SUQ-Zgt3AX2oXZZRBa6YdXC7hGiIJ3T1Cj0BaqkZTAyVC5r4NmUWf98TTnk"
                                            alt="Apex Tech Shell Jacket"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-headline-sm text-headline-sm text-on-surface">Apex Tech Shell Jacket</h4>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">SKU: JKT-APX-NVY-L</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface">SIZE L</span>
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface">NAVY</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Customer Reason</p>
                                        <p className="font-body-sm text-body-sm text-on-surface">"Zipper feels stuck, slight mark on sleeve."</p>
                                    </div>
                                    <div>
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Return Date</p>
                                        <p className="font-data-mono text-data-mono text-on-surface">Oct 24, 2023</p>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Evidence */}
                            <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/20 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Evidence</h3>
                                    <button className="text-primary hover:text-primary-container font-body-sm text-body-sm flex items-center gap-1 transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                                        Add Photo
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="aspect-square rounded border border-outline-variant/20 overflow-hidden relative group">
                                        <img
                                            className="w-full h-full object-cover"
                                            data-alt="A macro close-up photograph of a metallic zipper on a dark blue fabric. The lighting highlights a slight misalignment in the zipper teeth. Industrial, sharp focus."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Tant_qtnYzoXJpZUBrL6vBdFhWSOx78L_m4JHceHT9O9dh6SVJ0QutcUONVD5YJe7BfCSeboC9okcZVgCi5yGNh3Cl7yxNAtapjnxoizr-YTSO1pPx03kZcUimKUEmB-zg-AHm7onJwNNkQ1Q4BHjzEwFG9aORXFwiNLsd8o4TgMc8OEYTyUKJ6cozu6_JmSKRfccyJ4r6MJMakVvjhE1sN9N5h_dx8Js1ffUxomVc27zj5d7d0QPK52JG3YTX7j9eH_fuLXI4A"
                                            alt="Zipper damage evidence"
                                        />
                                        <button className="absolute top-1 right-1 w-6 h-6 bg-inverse-surface/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-on-inverse-surface text-[14px]">delete</span>
                                        </button>
                                    </div>
                                    <div className="aspect-square rounded border border-outline-variant/20 bg-surface-container flex items-center justify-center border-dashed cursor-pointer hover:bg-surface-container-high transition-colors">
                                        <span className="material-symbols-outlined text-on-surface-variant">add</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Inspection Form */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Damage Checklist */}
                            <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/20 shadow-sm relative overflow-hidden">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Condition Assessment</h3>
                                <div className="space-y-3">

                                    {/* Checklist Item 1 */}
                                    <label className="flex items-start gap-3 p-3 rounded-md hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                                        <div className="relative flex items-center mt-0.5">
                                            <input className="w-4 h-4 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container" type="checkbox" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-body-md text-body-md text-on-surface font-medium">Stains or Marks</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Check collars, cuffs, and main panels.</div>
                                        </div>
                                    </label>

                                    {/* Checklist Item 2 (Checked State) */}
                                    <label className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/20">
                                        <div className="relative flex items-center mt-0.5">
                                            <input defaultChecked className="w-4 h-4 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container" type="checkbox" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-body-md text-body-md text-on-surface font-medium">Hardware Damage</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Zippers, snaps, buttons, or drawstrings.</div>
                                            <div className="mt-3">
                                                <input className="w-full h-8 px-3 rounded bg-surface border border-outline/60 text-data-mono font-data-mono text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Specify hardware issue..." type="text" defaultValue="Main zipper catching near bottom." />
                                            </div>
                                        </div>
                                    </label>

                                    {/* Checklist Item 3 */}
                                    <label className="flex items-start gap-3 p-3 rounded-md hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                                        <div className="relative flex items-center mt-0.5">
                                            <input className="w-4 h-4 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container" type="checkbox" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-body-md text-body-md text-on-surface font-medium">Tears or Fraying</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Inspect seams and high-wear areas.</div>
                                        </div>
                                    </label>

                                    {/* Checklist Item 4 */}
                                    <label className="flex items-start gap-3 p-3 rounded-md hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                                        <div className="relative flex items-center mt-0.5">
                                            <input className="w-4 h-4 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container" type="checkbox" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-body-md text-body-md text-on-surface font-medium">Odor</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Smoke, perfume, or wear odors.</div>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/20 shadow-sm">
                                <label className="block font-headline-sm text-headline-sm text-on-surface mb-2" htmlFor="inspector-notes">Inspector Notes</label>
                                <textarea className="w-full p-3 rounded bg-surface border border-outline/60 text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" id="inspector-notes" placeholder="Enter additional observations..." rows={3}></textarea>
                            </div>

                            {/* Disposition */}
                            <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/20 shadow-sm border-l-4 border-l-primary">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Final Disposition</h3>
                                <div className="grid grid-cols-3 gap-3">

                                    {/* Restock */}
                                    <label className="relative cursor-pointer">
                                        <input className="peer sr-only" name="disposition" type="radio" value="restock" />
                                        <div className="h-full flex flex-col items-center justify-center p-4 rounded-md border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors peer-checked:border-success peer-checked:bg-success-container peer-checked:text-success peer-focus:ring-2 peer-focus:ring-success peer-focus:ring-offset-1 text-on-surface-variant text-center">
                                            <span className="material-symbols-outlined mb-2 peer-checked:icon-fill">inventory_2</span>
                                            <span className="font-headline-sm text-headline-sm">Restock</span>
                                            <span className="font-label-caps text-label-caps mt-1 opacity-80">Grade A</span>
                                        </div>
                                    </label>

                                    {/* Repair */}
                                    <label className="relative cursor-pointer">
                                        <input defaultChecked className="peer sr-only" name="disposition" type="radio" value="repair" />
                                        <div className="h-full flex flex-col items-center justify-center p-4 rounded-md border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors peer-checked:border-warning peer-checked:bg-warning-container peer-checked:text-warning peer-focus:ring-2 peer-focus:ring-warning peer-focus:ring-offset-1 text-on-surface-variant text-center shadow-[0_0_0_1px_rgba(146,64,14,1)]">
                                            <span className="material-symbols-outlined mb-2 peer-checked:icon-fill">build</span>
                                            <span className="font-headline-sm text-headline-sm">Repair</span>
                                            <span className="font-label-caps text-label-caps mt-1 opacity-80">Requires Fix</span>
                                        </div>
                                    </label>

                                    {/* Scrap */}
                                    <label className="relative cursor-pointer">
                                        <input className="peer sr-only" name="disposition" type="radio" value="scrap" />
                                        <div className="h-full flex flex-col items-center justify-center p-4 rounded-md border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high transition-colors peer-checked:border-error peer-checked:bg-error-container peer-checked:text-error peer-focus:ring-2 peer-focus:ring-error peer-focus:ring-offset-1 text-on-surface-variant text-center">
                                            <span className="material-symbols-outlined mb-2 peer-checked:icon-fill">delete_forever</span>
                                            <span className="font-headline-sm text-headline-sm">Scrap</span>
                                            <span className="font-label-caps text-label-caps mt-1 opacity-80">Unsalvageable</span>
                                        </div>
                                    </label>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {/* <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0"> */}
                <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded font-headline-sm text-headline-sm text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-inverse-surface transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Submit Inspection
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}