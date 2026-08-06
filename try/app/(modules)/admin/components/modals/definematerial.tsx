"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchMaterialTypes, MaterialTypeDto } from "../../api/materialtype.api";
import { fetchMaterialCategories, MaterialCategoryDto } from "../../api/materialcategory.api";
import { createMaterial, uploadMaterialImage } from "../../api/material.api";

export interface MaterialSpecFormData {
    name: string;
    type: string;
    materialTypeId?: string;
    code: string;
    unit: string;
    categories: string[];
    pricePerUnit?: number | string;
    imageUrl?: string;
    weightGsm?: string | number;
    widthInches?: string;
    colorCode?: string;
    composition?: string;
    qualityStandard?: string;
    mandatoryTests: string[];
}

interface DefineMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: MaterialSpecFormData) => void;
    initialData?: MaterialSpecFormData | any | null;
}

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
    fabric: [
        "Cotton",
        "Denim",
        "Organic Cotton",
        "Linen",
        "Polyester",
        "Silk",
        "Knit",
        "Woven",
        "Wool",
        "Spandex / Elastane Blend",
    ],
    trim: [
        "Zippers",
        "Buttons",
        "Rivets",
        "Labels & Patch Tags",
        "Buckles",
        "Elastic Bands",
        "Topstitch Threads",
        "Velcro / Fasteners",
    ],
    chemical: [
        "Indigo Liquid Dye",
        "Reactive Vat Dye",
        "Enzyme Wash",
        "Fabric Softener",
        "Bleaching Agent",
        "Fixing & Coating Agent",
    ],
    packaging: [
        "Polybag Joiner",
        "Master Cartons",
        "Printed Hang Tags",
        "Tissue Wrap Paper",
        "Barcoded Sticker Labels",
    ],
};

export function DefineMaterialModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: DefineMaterialModalProps) {
    const [formData, setFormData] = useState<MaterialSpecFormData>({
        name: "",
        type: "fabric",
        code: "",
        unit: "meters",
        categories: [],
        pricePerUnit: "",
        weightGsm: "",
        widthInches: "",
        colorCode: "",
        composition: "",
        qualityStandard: "",
        mandatoryTests: [],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [apiMaterialTypes, setApiMaterialTypes] = useState<MaterialTypeDto[]>([]);
    const [apiMaterialCategories, setApiMaterialCategories] = useState<MaterialCategoryDto[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const INITIAL_FORM_DATA: MaterialSpecFormData = {
        name: "",
        type: "fabric",
        code: "",
        unit: "meters",
        categories: [],
        pricePerUnit: "",
        weightGsm: "",
        widthInches: "",
        colorCode: "",
        composition: "",
        qualityStandard: "",
        mandatoryTests: [],
    };

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                name: initialData.name || "",
                type: initialData.type || "fabric",
                code: initialData.code || initialData.materialCode || "",
                unit: initialData.unit || "meters",
                categories: initialData.categories || [],
                pricePerUnit: initialData.pricePerUnit !== undefined ? initialData.pricePerUnit : "",
                weightGsm: initialData.weightGsm || "",
                widthInches: initialData.widthInches || "",
                colorCode: initialData.colorCode || "",
                composition: initialData.composition || "",
                qualityStandard: initialData.qualityStandard || "",
                mandatoryTests: initialData.mandatoryTests || [],
            });
            setImagePreview(initialData.imageUrl || null);
        } else {
            setFormData(INITIAL_FORM_DATA);
            setImagePreview(null);
        }
        setSelectedImageFile(null);
        setIsSubmitting(false);

        fetchMaterialTypes()
            .then((types) => {
                if (Array.isArray(types) && types.length > 0) {
                    setApiMaterialTypes(types);
                    if (!initialData) {
                        setFormData((prev) => ({
                            ...prev,
                            materialTypeId: types[0].id || "",
                            type: types[0].name || "fabric",
                            unit: types[0].unit || types[0].defaultUom || "meters",
                        }));
                    }
                }
            })
            .catch((err) => console.warn("Failed to load material types from API:", err));

        fetchMaterialCategories()
            .then((cats) => {
                if (Array.isArray(cats) && cats.length > 0) {
                    setApiMaterialCategories(cats);
                }
            })
            .catch((err) => console.warn("Failed to load material categories from API:", err));
    }, [isOpen, initialData]);

    const availableCategories = useMemo(() => {
        if (apiMaterialCategories.length > 0) {
            const currentTypeId = formData.materialTypeId;
            const matched = apiMaterialCategories.filter((cat) => {
                if (!currentTypeId) return true;
                return !cat.materialTypeId || cat.materialTypeId === currentTypeId;
            });
            const catNames = matched.map((c) => c.name);
            return catNames.length > 0 ? catNames : apiMaterialCategories.map((c) => c.name);
        }
        return CATEGORIES_BY_TYPE[formData.type.toLowerCase()] || CATEGORIES_BY_TYPE["fabric"] || [];
    }, [apiMaterialCategories, formData.materialTypeId, formData.type]);

    if (!isOpen) return null;

    const handleTypeChange = (selectedVal: string) => {
        const matchedType = apiMaterialTypes.find((t) => t.id === selectedVal || t.name === selectedVal);
        const typeName = matchedType ? matchedType.name : selectedVal;
        const typeId = matchedType ? matchedType.id : selectedVal;

        setFormData((prev) => ({
            ...prev,
            materialTypeId: typeId,
            type: typeName,
            unit: matchedType?.unit || matchedType?.defaultUom || prev.unit,
        }));
    };

    const handleRemoveCategory = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((c) => c !== tagToRemove),
        }));
    };

    const handleToggleTest = (testName: string) => {
        setFormData((prev) => {
            const exists = prev.mandatoryTests.includes(testName);
            const updated = exists
                ? prev.mandatoryTests.filter((t) => t !== testName)
                : [...prev.mandatoryTests, testName];
            return { ...prev, mandatoryTests: updated };
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            setFormData((prev) => ({ ...prev, imageUrl: url }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.type) return;

        setIsSubmitting(true);
        try {
            let uploadedImagePath = "";
            if (selectedImageFile) {
                try {
                    const uploadRes = await uploadMaterialImage(
                        selectedImageFile,
                        formData.type || "Fabric",
                        formData.categories[0] || "General"
                    );
                    uploadedImagePath = uploadRes.relativePath || uploadRes.fullUrl;
                } catch (imgErr) {
                    console.warn("Failed to upload material image:", imgErr);
                }
            }

            const targetTypeId = formData.materialTypeId || apiMaterialTypes[0]?.id || "00000000-0000-0000-0000-000000000000";
            const matchedCategory = apiMaterialCategories.find((c) =>
                formData.categories.includes(c.name)
            );
            const targetCategoryId = matchedCategory?.id || apiMaterialCategories[0]?.id || "00000000-0000-0000-0000-000000000000";

            await createMaterial({
                name: formData.name.trim(),
                materialCode: formData.code.trim() || undefined,
                materialTypeId: targetTypeId,
                materialCategoryId: targetCategoryId,
                costPerUnit: parseFloat(String(formData.pricePerUnit)) || 0,
                availableQty: 0,
                imagePath: uploadedImagePath || formData.imageUrl || "",
            });
        } catch (err) {
            console.warn("Create material API failed, proceeding with local handler:", err);
        } finally {
            setIsSubmitting(false);
        }

        if (onSave) {
            onSave(formData);
        }
        onClose();
    };

    const ALL_TEST_OPTIONS = [
        "Color Fastness to Washing",
        "Shrinkage Test",
        "Tensile Strength",
        "Pilling Resistance",
        "Tear Resistance",
        "Formaldehyde & Chemical Safety",
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 my-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-900">precision_manufacturing</span>
                            {initialData ? "Edit Material Spec" : "Define Material Spec"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Create or update material specifications for procurement and quality control.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs bg-slate-50">
                    {/* Section 1: Identification */}
                    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                            Identification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Material Name */}
                            <div className="flex flex-col space-y-1">
                                <label className="font-semibold text-slate-700" htmlFor="mat-name">
                                    Material Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="mat-name"
                                    type="text"
                                    required
                                    placeholder="e.g., 100% Cotton Fabric, 150GSM"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                />
                            </div>

                            {/* Material Type */}
                            <div className="flex flex-col space-y-1">
                                <label className="font-semibold text-slate-700" htmlFor="mat-type">
                                    Material Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="mat-type"
                                    required
                                    value={formData.materialTypeId || formData.type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Select type...</option>
                                    {apiMaterialTypes.length > 0 ? (
                                        apiMaterialTypes.map((mt) => (
                                            <option key={mt.id || mt.name} value={mt.id || mt.name}>
                                                {mt.name} {mt.materialCode ? `(${mt.materialCode})` : ""}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="fabric">Fabric</option>
                                            <option value="trim">Trim / Hardware</option>
                                            <option value="chemical">Chemical / Wash</option>
                                            <option value="packaging">Packaging</option>
                                        </>
                                    )}
                                </select>
                            </div>



                            {/* Product Unit */}
                            <div className="flex flex-col space-y-1">
                                <label className="font-semibold text-slate-700" htmlFor="prod-unit">
                                    Product Unit
                                </label>
                                <select
                                    id="prod-unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                                >
                                    <option value="meters">Meters (m)</option>
                                    <option value="rolls">Rolls</option>
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="kg">Kilograms (kg)</option>
                                </select>
                            </div>

                            {/* Dynamic Categories Dropdown Menu based on Material Type */}
                            <div className="flex flex-col space-y-1">
                                <label className="font-semibold text-slate-700">
                                    Categories ({formData.type ? formData.type.toUpperCase() : "MATERIAL"})
                                </label>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        if (selected && !formData.categories.includes(selected)) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                categories: [...prev.categories, selected],
                                            }));
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                                >
                                    <option value="" disabled>
                                        + Select category for {formData.type || "material"}...
                                    </option>
                                    {availableCategories.map((catOpt) => {
                                        const catName = typeof catOpt === "string" ? catOpt : (catOpt as any).name;
                                        const isAdded = formData.categories.includes(catName);
                                        return (
                                            <option
                                                key={catName}
                                                value={catName}
                                                disabled={isAdded}
                                            >
                                                {catName} {isAdded ? "(Added)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>

                                {/* Selected Category Tag Chips */}
                                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[38px] mt-1">
                                    {formData.categories.length === 0 ? (
                                        <span className="text-slate-400 font-mono text-[11px]">No categories selected</span>
                                    ) : (
                                        formData.categories.map((cat) => (
                                            <span
                                                key={cat}
                                                className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-mono"
                                            >
                                                {cat}
                                                <span
                                                    className="material-symbols-outlined text-[12px] cursor-pointer hover:text-slate-300"
                                                    onClick={() => handleRemoveCategory(cat)}
                                                >
                                                    close
                                                </span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Price per Unit */}
                            <div className="flex flex-col space-y-1">
                                <label className="font-semibold text-slate-700" htmlFor="mat-price">
                                    Price per Unit (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                                        Rs
                                    </span>
                                    <input
                                        id="mat-price"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.pricePerUnit}
                                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Material Image Upload */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Material Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-xl">image</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold text-slate-700">Material Image</label>
                                <label className="text-[11px] font-bold text-slate-900 hover:underline cursor-pointer">
                                    <span>Upload Thumbnail</span>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleImageUpload}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Technical Specifications (Optional) */}
                    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Technical Specifications
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                                Optional
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col space-y-1 col-span-1">
                                <label className="font-semibold text-slate-700" htmlFor="spec-gsm">
                                    Weight (GSM) <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="spec-gsm"
                                    type="number"
                                    placeholder="e.g., 220"
                                    value={formData.weightGsm}
                                    onChange={(e) => setFormData({ ...formData, weightGsm: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col space-y-1 col-span-1">
                                <label className="font-semibold text-slate-700" htmlFor="spec-width">
                                    Width (Inches) <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="spec-width"
                                    type="text"
                                    placeholder='e.g., 58/60"'
                                    value={formData.widthInches}
                                    onChange={(e) => setFormData({ ...formData, widthInches: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col space-y-1 col-span-1">
                                <label className="font-semibold text-slate-700" htmlFor="spec-color">
                                    Color Code/Pantone <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="spec-color"
                                    type="text"
                                    placeholder="e.g., TCX 19-4052"
                                    value={formData.colorCode}
                                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col space-y-1 md:col-span-3">
                                <label className="font-semibold text-slate-700" htmlFor="spec-comp">
                                    Detailed Composition <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="spec-comp"
                                    type="text"
                                    placeholder="e.g., 95% Organic Cotton, 5% Elastane"
                                    value={formData.composition}
                                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Quality & Testing Requirements (Optional) */}
                    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Quality &amp; Testing Requirements
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                                Optional
                            </span>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="font-semibold text-slate-700" htmlFor="qual-std">
                                Primary Quality Standard <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="qual-std"
                                type="text"
                                placeholder="e.g., ISO 9001, Oeko-Tex Standard 100"
                                value={formData.qualityStandard}
                                onChange={(e) => setFormData({ ...formData, qualityStandard: e.target.value })}
                                className="w-full md:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                            />
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 text-xs">Quality &amp; Compliance Tests</p>
                                <span className="text-[10px] font-mono text-slate-400">(Select if required)</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ALL_TEST_OPTIONS.map((testName) => {
                                    const isChecked = formData.mandatoryTests.includes(testName);
                                    return (
                                        <button
                                            key={testName}
                                            type="button"
                                            onClick={() => handleToggleTest(testName)}
                                            className="flex items-center space-x-3 text-left group transition-colors"
                                        >
                                            <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300"
                                                    }`}
                                            >
                                                {isChecked && (
                                                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                                                )}
                                            </div>
                                            <span className="text-slate-700 font-semibold text-xs group-hover:text-slate-900">{testName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors border border-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">save</span>
                            Save Specification
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DefineMaterialModal;
