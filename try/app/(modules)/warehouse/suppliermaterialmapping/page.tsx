"use client";

import React, { useState, useMemo } from "react";
import "../styles/warehouse-supplier.css";
import { AddMaterialToSupplierModal } from "../components/AddMaterialToSupplierModal";
import { EditSupplierModal } from "../components/EditSupplierModal";
import { ManageMaterialTermsModal } from "../components/ManageMaterialTermsModal";
import { AddNewSupplierModal } from "../components/AddNewSupplierModal";
import { MapMaterialSkuCodeModal } from "../components/MapMaterialSkuCodeModal";

export type Supplier = {
    id: string;
    name: string;
    code?: string;
    contactPerson: string;
    location: string;
    categories: string[];
    rating: string;
    status: "Active" | "Pending" | "Suspended" | "Inactive";
    onTimeDelivery: string;
    defectRate: string;
    materials: {
        sku: string;
        leadTime: string;
        name: string;
        moq: string;
        unitPrice: string;
    }[];
};

export default function WarehouseSupplierMaterialMappingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMapSkuModalOpen, setIsMapSkuModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);

    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

    // Master Suppliers List matching Stitch screen 13343194fa1a473084b280844863bccb
    const [suppliers, setSuppliers] = useState<Supplier[]>([
        {
            id: "sup-1",
            name: "Global Textiles Ltd.",
            code: "SUP-9204",
            contactPerson: "Sarah Jenkins",
            location: "Shenzhen, CN",
            categories: ["Fabric", "Trims"],
            rating: "4.92",
            status: "Active",
            onTimeDelivery: "98.4%",
            defectRate: "0.12%",
            materials: [
                {
                    sku: "FAB-COT-NVY-10",
                    leadTime: "14d",
                    name: "100% Cotton Twill - Heavyweight Navy",
                    moq: "500 yds",
                    unitPrice: "Rs 350.00/yd",
                },
                {
                    sku: "TRM-ZIP-MTL-8",
                    leadTime: "21d",
                    name: "Metal Zippers 8\" - Silver/Brass finish",
                    moq: "1000 pcs",
                    unitPrice: "Rs 70.00/pc",
                },
                {
                    sku: "FAB-LIN-NAT-05",
                    leadTime: "18d",
                    name: "Organic Linen Blend - Natural Unbleached",
                    moq: "200 yds",
                    unitPrice: "Rs 710.00/yd",
                },
            ],
        },
        {
            id: "sup-2",
            name: "Apex Metalworks & Hardware",
            code: "SUP-8812",
            contactPerson: "David Chen",
            location: "Dongguan, CN",
            categories: ["Hardware", "Zippers"],
            rating: "4.65",
            status: "Active",
            onTimeDelivery: "95.2%",
            defectRate: "0.45%",
            materials: [
                {
                    sku: "HDW-BTN-BRS-15",
                    leadTime: "10d",
                    name: "Brass Press Buttons 15mm",
                    moq: "5000 pcs",
                    unitPrice: "Rs 10.00/pc",
                },
            ],
        },
        {
            id: "sup-3",
            name: "Sustainable Threads Co.",
            code: "SUP-7410",
            contactPerson: "Maria Gomez",
            location: "Porto, PT",
            categories: ["Organic Fabric"],
            rating: "--",
            status: "Pending",
            onTimeDelivery: "92.0%",
            defectRate: "0.80%",
            materials: [],
        },
        {
            id: "sup-4",
            name: "Nylon Synthetics Inc.",
            code: "SUP-6120",
            contactPerson: "Robert Chang",
            location: "Taipei, TW",
            categories: ["Synthetics", "Padding"],
            rating: "4.10",
            status: "Active",
            onTimeDelivery: "89.5%",
            defectRate: "1.10%",
            materials: [],
        },
    ]);

    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>("sup-1");

    // Active Selected Supplier
    const selectedSupplier = useMemo(() => {
        if (!selectedSupplierId) return null;
        return suppliers.find((s) => s.id === selectedSupplierId) || null;
    }, [suppliers, selectedSupplierId]);

    // Handle creating new supplier from Add New Supplier Modal
    const handleSupplierCreated = (newSup: any) => {
        const created: Supplier = {
            id: `sup-${Date.now()}`,
            name: newSup.name,
            code: newSup.code,
            contactPerson: newSup.contactPerson,
            location: newSup.location,
            categories: newSup.categories,
            rating: "--",
            status: newSup.status || "Pending",
            onTimeDelivery: "100%",
            defectRate: "0.00%",
            materials: [],
        };
        setSuppliers((prev) => [created, ...prev]);
        setSelectedSupplierId(created.id);
    };

    // Handle adding new material to supplier map
    const handleMaterialMapped = (data: any) => {
        if (!selectedSupplierId) return;

        const newMaterial = {
            sku: data.sku || "FAB-COT-BLK-01",
            leadTime: `${data.leadTime || 14}d`,
            name: data.materialName || "Black Premium Cotton Blend",
            moq: `${data.moq || 1000} yds`,
            unitPrice: `Rs ${data.unitPrice || "450.00"}/yd`,
        };

        setSuppliers((prev) =>
            prev.map((sup) =>
                sup.id === selectedSupplierId
                    ? { ...sup, materials: [newMaterial, ...sup.materials] }
                    : sup
            )
        );
    };

    // Handle updating supplier details from Edit modal
    const handleSupplierUpdated = (updatedData: any) => {
        setSuppliers((prev) =>
            prev.map((sup) =>
                sup.id === updatedData.id
                    ? {
                        ...sup,
                        contactPerson: updatedData.contactPerson,
                        status: updatedData.status,
                        categories: updatedData.categories,
                    }
                    : sup
            )
        );
    };

    // Handle updating material terms from Terms modal
    const handleTermsUpdated = (updatedTerms: any) => {
        if (!selectedSupplierId) return;
        setSuppliers((prev) =>
            prev.map((sup) =>
                sup.id === selectedSupplierId
                    ? {
                        ...sup,
                        materials: sup.materials.map((m) =>
                            m.sku === updatedTerms.sku
                                ? {
                                    ...m,
                                    unitPrice: updatedTerms.unitPrice,
                                    leadTime: updatedTerms.leadTime,
                                    moq: updatedTerms.moq,
                                }
                                : m
                        ),
                    }
                    : sup
            )
        );
    };

    // Handle removing material mapping from Terms modal
    const handleTermsRemoved = (skuToRemove: string) => {
        if (!selectedSupplierId) return;
        setSuppliers((prev) =>
            prev.map((sup) =>
                sup.id === selectedSupplierId
                    ? {
                        ...sup,
                        materials: sup.materials.filter((m) => m.sku !== skuToRemove),
                    }
                    : sup
            )
        );
    };

    // Filtered Suppliers List
    const filteredSuppliers = useMemo(() => {
        if (!searchTerm.trim()) return suppliers;
        const lower = searchTerm.toLowerCase();
        return suppliers.filter(
            (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.contactPerson.toLowerCase().includes(lower) ||
                s.categories.some((c) => c.toLowerCase().includes(lower))
        );
    }, [suppliers, searchTerm]);

    return (
        <div className="wh-sup-page">

            {/* ── STITCH DESIGN: HEADER ── */}
            <header className="wh-sup-header">
                <div className="wh-sup-header-title">
                    <h2>Supplier Directory</h2>
                    <span className="wh-sup-badge-total">{suppliers.length} TOTAL</span>
                </div>

                <div className="wh-sup-header-actions">
                    <div className="wh-sup-search-wrapper">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search suppliers, SKUs..."
                            className="wh-sup-search-input"
                        />
                    </div>

                    <button
                        onClick={() => setIsNewSupplierModalOpen(true)}
                        className="wh-sup-btn-new"
                        title="Create New Supplier"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>New Supplier</span>
                    </button>
                </div>
            </header>

            {/* ── STITCH DESIGN: SPLIT MAIN CONTAINER ── */}
            <div className="wh-sup-main-container">

                {/* Left Side: Supplier Table */}
                <div className="wh-sup-table-wrapper">
                    <table className="wh-sup-table">
                        <thead>
                            <tr>
                                <th className="w-8">
                                    <div className="w-4 h-4 border border-slate-300 rounded bg-white"></div>
                                </th>
                                <th>Supplier Name</th>
                                <th>Contact Person</th>
                                <th>Product Categories</th>
                                <th className="text-right">Rating</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((sup) => (
                                <tr
                                    key={sup.id}
                                    onClick={() => setSelectedSupplierId(sup.id)}
                                    className={selectedSupplierId === sup.id ? "wh-sup-row-selected" : ""}
                                >
                                    {/* Checkbox */}
                                    <td>
                                        <div
                                            className={`w-4 h-4 rounded border flex items-center justify-center ${selectedSupplierId === sup.id
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "bg-white border-slate-300"
                                                }`}
                                        >
                                            {selectedSupplierId === sup.id && (
                                                <span className="material-symbols-outlined text-[12px]">check</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Supplier Name */}
                                    <td className="font-bold text-slate-900">{sup.name}</td>

                                    {/* Contact Person */}
                                    <td className="text-slate-600">{sup.contactPerson}</td>

                                    {/* Product Categories */}
                                    <td>
                                        {sup.categories.map((cat, idx) => (
                                            <span key={idx} className="wh-sup-tag">
                                                {cat}
                                            </span>
                                        ))}
                                    </td>

                                    {/* Rating */}
                                    <td className="text-right font-mono font-bold text-slate-900">
                                        {sup.rating}
                                    </td>

                                    {/* Status */}
                                    <td>
                                        <span
                                            className={`wh-sup-status-pill ${sup.status === "Active" ? "wh-sup-status-active" : "wh-sup-status-pending"
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${sup.status === "Active" ? "bg-emerald-700" : "bg-orange-700"
                                                    }`}
                                            ></span>
                                            <span>{sup.status}</span>
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingSupplier(sup);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="text-slate-400 hover:text-slate-900 transition-colors p-1 cursor-pointer"
                                            title="Edit Supplier Details"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSupplierId(sup.id);
                                            }}
                                            className="text-slate-400 hover:text-slate-900 transition-colors p-1 ml-2 cursor-pointer"
                                            title="Open Supplier Profile"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Side: Supplier Details & Supplied Materials Map Panel */}
                {selectedSupplier && (
                    <aside className="wh-sup-side-panel">

                        {/* Panel Top Header */}
                        <div className="wh-sup-side-header">
                            <div className="wh-sup-side-header-top">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-900 text-white shadow-xs">
                                        <span className="material-symbols-outlined text-[22px]">factory</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 m-0">{selectedSupplier.name}</h3>
                                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5 m-0">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            <span>{selectedSupplier.location}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button Handler */}
                                <button
                                    onClick={() => setSelectedSupplierId(null)}
                                    className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                                    title="Close Supplier Panel"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            {/* Performance Metrics */}
                            <div className="wh-sup-side-metrics">
                                <div className="wh-sup-metric-card">
                                    <span className="wh-sup-metric-title">On-Time Delivery</span>
                                    <span className="wh-sup-metric-val">{selectedSupplier.onTimeDelivery}</span>
                                </div>
                                <div className="wh-sup-metric-card">
                                    <span className="wh-sup-metric-title">Defect Rate</span>
                                    <span className="wh-sup-metric-val text-emerald-700">{selectedSupplier.defectRate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Supplied Materials Map Header & Clean Action Grid */}
                        <div className="wh-sup-map-header">
                            <div className="wh-sup-map-header-top">
                                <h4 className="wh-sup-map-title">Supplied Materials Map</h4>
                                <span className="wh-sup-map-count-badge" title="Total Mapped Materials">
                                    {selectedSupplier.materials.length} Mapped
                                </span>
                            </div>

                            <div className="wh-sup-map-actions-grid">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="wh-sup-btn-action-primary"
                                    title="Add New Material to Supplier"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    <span>Add Material</span>
                                </button>

                                <button
                                    onClick={() => setIsMapSkuModalOpen(true)}
                                    className="wh-sup-btn-action-secondary"
                                    title="Map Material SKU Code"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add_link</span>
                                    <span>Map SKU</span>
                                </button>
                            </div>
                        </div>

                        {/* Supplied Materials List with Redesigned Cards */}
                        <div className="wh-sup-map-list">
                            {selectedSupplier.materials.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-xs font-semibold flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-[32px] text-slate-300">inventory_2</span>
                                    <span>No material SKUs mapped to this supplier yet.</span>
                                </div>
                            ) : (
                                selectedSupplier.materials.map((mat, idx) => (
                                    <div key={idx} className="wh-sup-material-card">
                                        <div className="flex justify-between items-start mb-2.5">
                                            <span className="wh-sup-sku-chip" title="Material SKU Code">{mat.sku}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="Delivery Lead Time">
                                                    Lead: <span className="font-mono font-bold text-slate-900">{mat.leadTime}</span>
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingMaterial(mat);
                                                        setIsTermsModalOpen(true);
                                                    }}
                                                    className="text-slate-400 hover:text-slate-900 transition-colors p-0.5 cursor-pointer"
                                                    title="Manage Material Terms"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-bold text-slate-900 m-0 mb-3 leading-snug">
                                            {mat.name}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase text-slate-400 font-sans font-extrabold">MOQ</span>
                                                <span className="font-bold text-slate-800">{mat.moq}</span>
                                            </div>
                                            <div className="flex flex-col border-l border-slate-200 pl-2">
                                                <span className="text-[9px] uppercase text-slate-400 font-sans font-extrabold">Unit Price</span>
                                                <span className="font-bold text-slate-900">{mat.unitPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </aside>
                )}

            </div>

            {/* ── STITCH DESIGN: ADD NEW SUPPLIER MODAL ── */}
            <AddNewSupplierModal
                isOpen={isNewSupplierModalOpen}
                onClose={() => setIsNewSupplierModalOpen(false)}
                onSuccess={handleSupplierCreated}
            />

            {/* ── STITCH DESIGN: ADD MATERIAL TO SUPPLIER MODAL ── */}
            <AddMaterialToSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                supplierName={selectedSupplier?.name}
                onSuccess={handleMaterialMapped}
            />

            {/* ── STITCH DESIGN: MAP MATERIAL SKU CODE MODAL ── */}
            <MapMaterialSkuCodeModal
                isOpen={isMapSkuModalOpen}
                onClose={() => setIsMapSkuModalOpen(false)}
                supplierName={selectedSupplier?.name}
                onSuccess={handleMaterialMapped}
            />

            {/* ── STITCH DESIGN: EDIT SUPPLIER DETAILS MODAL ── */}
            <EditSupplierModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                supplier={editingSupplier}
                onSave={handleSupplierUpdated}
            />

            {/* ── STITCH DESIGN: MANAGE MATERIAL TERMS MODAL ── */}
            <ManageMaterialTermsModal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                material={editingMaterial}
                onUpdate={handleTermsUpdated}
                onRemove={handleTermsRemoved}
            />

        </div>
    );
}
