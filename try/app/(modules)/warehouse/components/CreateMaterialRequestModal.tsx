"use client";

import React, { useState, useEffect, useRef } from "react";
import "../styles/warehouse-purchaseorder.css";
import { fetchMaterialCategories, MaterialCategoryDto } from "../api/constant";
import { fetchSuppliers, SupplierDto } from "../api/constant";
import { fetchMaterials, MaterialGetDto } from "../api/constant";
import { NepaliDatePicker } from "../../../components/ui/NepaliDatePicker";
import { createMaterialRequest, CreateMaterialRequestDto } from "../api/materialrequest.api";

export type CreateMaterialRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (poData: any) => void;
  planCode?: string;
  materialName?: string;
  shortageQty?: string | number;
};

export function CreateMaterialRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMaterialRequestModalProps) {
  const [supplier, setSupplier] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<MaterialCategoryDto[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<SupplierDto[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialGetDto[]>([]);
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const materialContainerRef = useRef<HTMLDivElement>(null);
  
  const [expectedDate, setExpectedDate] = useState("2024-10-20");
  const [shippingMethod, setShippingMethod] = useState("Standard Freight");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetchMaterialCategories().catch((err) => {
          console.error("Failed to load material categories:", err);
          return [];
        }),
        fetchSuppliers().catch((err) => {
          console.error("Failed to load suppliers:", err);
          return [];
        }),
        fetchMaterials().catch((err) => {
          console.error("Failed to load materials:", err);
          return [];
        })
      ]).then(([catData, supData, matData]) => {
        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(supData)) setAllSuppliers(supData);
        if (Array.isArray(matData)) setAllMaterials(matData);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (materialContainerRef.current && !materialContainerRef.current.contains(event.target as Node)) {
        setIsMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuppliers = allSuppliers.filter((s) => {
    if (selectedCategoryIds.length === 0) return false;
    return s.materialCategories?.some((mc) => {
      const matchId = mc.id || mc.materialCategoryId;
      return matchId && selectedCategoryIds.includes(matchId);
    });
  });

  // Line items state matching Stitch screen 2b09f42891d44866a446787ccf49fa78
  type LineItem = {
    id: string;
    materialId: string;
    materialName: string;
    sku: string;
    units: string;
    requiredQty: number;
    unitPrice: number;
    taxPercent: number;
    subtotal: string;
  };
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  if (!isOpen) return null;

  // Add line item handler
  const handleAddMaterial = (material: MaterialGetDto) => {
    const newItem = {
      id: `item-${Date.now()}`,
      materialId: material.id,
      materialName: material.name,
      sku: material.materialCode || "N/A",
      units: "pcs",
      requiredQty: 1,
      unitPrice: material.costPerUnit || 0,
      taxPercent: 0,
      subtotal: (material.costPerUnit || 0).toFixed(2),
    };
    setLineItems((prev) => [...prev, newItem]);
    setIsMaterialDropdownOpen(false);
    setMaterialSearch("");
  };

  // Delete line item handler
  const handleDeleteItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier) {
      alert("Please select a supplier.");
      return;
    }
    if (lineItems.length === 0) {
      alert("Please add at least one line item.");
      return;
    }

    const payload: CreateMaterialRequestDto = {
      supplierId: supplier,
      requiredDate: new Date(expectedDate).toISOString(),
      notes: notes,
      requestedBy: "Warehouse User",
      items: lineItems.map(item => ({
        materialId: item.materialId,
        requestedQuantity: item.requiredQty
      }))
    };

    try {
      const result = await createMaterialRequest(payload);
      console.log("Created Material Request:", result);
      if (onSuccess) onSuccess({ supplier, lineItems, result });
      onClose();
    } catch (error) {
      console.error("Failed to create Request:", error);
      alert("Failed to create Material Request. Please check the console for details.");
    }
  };

  // Calculations
  const calcSubtotal = lineItems.reduce((sum, item) => sum + item.requiredQty * item.unitPrice, 0);
  const calcTotalTax = lineItems.reduce((sum, item) => sum + item.requiredQty * item.unitPrice * (item.taxPercent / 100), 0);
  const calcGrandTotal = calcSubtotal + calcTotalTax;

  const formatCurrency = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="wh-cpom-overlay">
      
      {/* ── STITCH DESIGN: CREATE PURCHASE ORDER MODAL CONTAINER ── */}
      <div className="wh-cpom-container">
        
        {/* Modal Header */}
        <div className="wh-cpom-header">
          <div className="wh-cpom-header-title">
            <h2>Create New Material Request</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="wh-cpom-body">
          
          {/* Section 1: Supplier & General Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Category and Supplier Selection */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2" ref={categoryContainerRef}>
                <label className="wh-cpom-field-label">
                  Material Categories
                </label>
                <div className="relative">
                  <div
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-within:ring-2 focus-within:ring-slate-900 cursor-pointer flex flex-wrap gap-2 items-center"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    {selectedCategoryIds.length === 0 && <span className="text-slate-400">Select Categories...</span>}
                    {selectedCategoryIds.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return (
                        <span
                          key={id}
                          className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm"
                        >
                          {cat ? cat.name.toUpperCase() : id}
                          <span
                            className="material-symbols-outlined text-[14px] cursor-pointer hover:text-slate-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategoryIds(prev => prev.filter(x => x !== id));
                            }}
                          >
                            close
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 outline-none text-xs focus:ring-1 focus:ring-slate-900"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="overflow-y-auto p-1">
                        {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                          <div
                            key={cat.id}
                            className="px-3 py-2 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedCategoryIds.includes(cat.id)) {
                                setSelectedCategoryIds(prev => prev.filter(x => x !== cat.id));
                              } else {
                                setSelectedCategoryIds(prev => [...prev, cat.id]);
                              }
                            }}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                selectedCategoryIds.includes(cat.id)
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selectedCategoryIds.includes(cat.id) && (
                                <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                              )}
                            </div>
                            <span>{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="supplier-select">
                  Supplier
                </label>
                <div className="relative">
                  <select
                    id="supplier-select"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="wh-cpom-select pr-10"
                    disabled={selectedCategoryIds.length === 0}
                  >
                    <option value="">Select Supplier...</option>
                    {filteredSuppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} {sup.supplierCode ? `(${sup.supplierCode})` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>Select a category first to filter suppliers.</span>
                </p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Expected Date */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="expected_date">
                  Expected Date
                </label>
                <NepaliDatePicker
                  id="expected_date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  onDateChange={setExpectedDate}
                  enableNepaliPicker={true}
                  className="wh-cpom-input"
                />
              </div>

              {/* Shipping Method */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="shipping_method">
                  Shipping Method
                </label>
                <div className="relative">
                  <select
                    id="shipping_method"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="wh-cpom-select pr-10"
                  >
                    <option>Standard Freight</option>
                    <option>Express Courier</option>
                    <option>Sea Cargo</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="flex flex-col gap-2">
                <label className="wh-cpom-field-label" htmlFor="payment_terms">
                  Payment Terms
                </label>
                <div className="relative">
                  <select
                    id="payment_terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="wh-cpom-select pr-10"
                  >
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Due on Receipt</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Line Items Table */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="wh-cpom-section-title m-0">Line Items</h3>
              <div className="relative" ref={materialContainerRef}>
                <button
                  onClick={() => setIsMaterialDropdownOpen(!isMaterialDropdownOpen)}
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>ADD MATERIAL</span>
                </button>
                
                {isMaterialDropdownOpen && (
                  <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                      <input
                        type="text"
                        placeholder="Search materials..."
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 outline-none text-xs focus:ring-1 focus:ring-slate-900"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto p-1">
                      {allMaterials.filter(m => m.name.toLowerCase().includes(materialSearch.toLowerCase()) || (m.materialCode && m.materialCode.toLowerCase().includes(materialSearch.toLowerCase()))).map((mat) => (
                        <div
                          key={mat.id}
                          className="px-3 py-2 hover:bg-slate-100 rounded cursor-pointer flex flex-col gap-0.5"
                          onClick={() => handleAddMaterial(mat)}
                        >
                          <span className="text-xs font-semibold text-slate-800">{mat.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{mat.materialCode}</span>
                        </div>
                      ))}
                      {allMaterials.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs text-slate-500 font-medium">
                          No materials found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="wh-cpom-table-container">
              <table className="wh-cpom-table">
                <thead>
                  <tr>
                    <th className="w-10"></th>
                    <th className="w-1/3">Material / SKU</th>
                    <th>Units</th>
                    <th className="text-right">Required Qty</th>
                    <th className="text-right">Unit Price (Rs)</th>
                    <th className="text-right">Tax %</th>
                    <th className="text-right">Subtotal (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="group">
                      
                      {/* Delete Button */}
                      <td className="text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>

                      {/* Material / SKU */}
                      <td>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={item.materialName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLineItems((prev) =>
                                prev.map((i) => (i.id === item.id ? { ...i, materialName: val } : i))
                              );
                            }}
                            className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-bold text-slate-900 outline-none text-xs"
                          />
                          <div className="font-mono text-[11px] text-slate-500 px-2 font-semibold">
                            {item.sku}
                          </div>
                        </div>
                      </td>

                      {/* Units */}
                      <td className="pt-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.units}
                        </span>
                      </td>

                      {/* Required Qty */}
                      <td>
                        <input
                          type="number"
                          value={item.requiredQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, requiredQty: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Unit Price */}
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, unitPrice: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Tax % */}
                      <td>
                        <input
                          type="number"
                          value={item.taxPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLineItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, taxPercent: val } : i))
                            );
                          }}
                          className="w-full bg-transparent border border-transparent focus:border-slate-300 focus:bg-white rounded px-2 py-1 font-mono font-bold text-slate-900 text-right outline-none text-xs"
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="pt-3 text-right font-mono font-bold text-slate-900 text-xs">
                        {(item.requiredQty * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>

          {/* Section 3: Summary & Notes Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
            
            {/* Notes */}
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <label className="wh-cpom-field-label" htmlFor="internal-notes">
                Internal Notes
              </label>
              <textarea
                id="internal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or internal references..."
                className="wh-cpom-textarea"
              ></textarea>
            </div>

            {/* Financial Summary Card */}
            <div className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Total Items</span>
                <span className="font-mono text-slate-900">{lineItems.reduce((sum, item) => sum + item.requiredQty, 0)} Units ({lineItems.length} SKUs)</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900">Rs {formatCurrency(calcSubtotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 font-semibold border-b border-slate-200 pb-3">
                <span>Total Tax</span>
                <span className="font-mono text-slate-900">Rs {formatCurrency(calcTotalTax)}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-900 text-sm">Grand Total</span>
                <span className="font-mono text-lg font-extrabold text-slate-900">Rs {formatCurrency(calcGrandTotal)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="wh-cpom-footer">
          <button
            type="button"
            onClick={onClose}
            className="wh-cpom-btn-draft"
          >
            Save as Draft
          </button>
          
          <button
            type="button"
            onClick={handleSendRequest}
            className="wh-cpom-btn-send"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Send Material Request</span>
          </button>
        </div>

      </div>
    </div>
  );
}
