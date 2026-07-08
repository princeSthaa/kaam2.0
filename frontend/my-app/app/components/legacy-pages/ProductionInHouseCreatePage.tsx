"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "../legacy-ui/ActionButton";
import { MaterialIcon } from "../ui/MaterialIcon";

// Mock Database Lists
const mockWarehouses = [
  { id: "WH-001", code: "WH-FG-001", name: "Central Finished Goods Warehouse", location: "Balaju Industrial Area, Kathmandu" },
  { id: "WH-002", code: "WH-RM-001", name: "Central Raw Material Hub", location: "Koteshwor, Kathmandu" },
  { id: "WH-003", code: "WH-TR-001", name: "Pokhara Transit Store", location: "Lakeside, Pokhara" },
];

const mockProducts = [
  { id: "PRD-001", productCode: "PRD-001", productName: "School Uniform Set", category: "Uniform", productImage: "/images/products/school-uniform.jpg", colors: ["White / Navy", "Elegant Palette", "Classic Blue"] },
  { id: "PRD-002", productCode: "PRD-002", productName: "School Tracksuit Set", category: "Sports Uniform", productImage: "/images/products/tracksuit.jpg", colors: ["Grey / Royal Blue", "Red / Black", "Navy / Yellow"] },
  { id: "PRD-003", productCode: "PRD-003", productName: "Men Casual Shirt", category: "Retail Garment", productImage: "/images/products/casual-shirt.jpg", colors: ["White", "Sky Blue", "Black"] },
  { id: "PRD-004", productCode: "PRD-004", productName: "Corporate Polo T-Shirt", category: "Corporate Wear", productImage: "/images/products/polo-shirt.jpg", colors: ["Black", "Navy", "Charcoal"] },
  { id: "PRD-005", productCode: "PRD-005", productName: "Hotel Staff Uniform", category: "Hospitality Uniform", productImage: "/images/products/place-holder.png", colors: ["Cream / Brown", "Black / Gold"] },
];

const mockMaterials = [
  { id: "MAT-001", materialCode: "RM-FAB-COT-DYED", name: "Dyed Cotton Fabric", type: "Fabric", availableQty: 1800, unit: "meter", costPerUnit: 250 },
  { id: "MAT-002", materialCode: "RM-FAB-PIQUE-DYED", name: "Dyed Pique Fabric", type: "Fabric", availableQty: 950, unit: "meter", costPerUnit: 320 },
  { id: "MAT-003", materialCode: "RM-FAB-TRS-DYED", name: "Dyed Trouser Fabric", type: "Fabric", availableQty: 700, unit: "meter", costPerUnit: 380 },
  { id: "MAT-004", materialCode: "RM-FAB-FLEECE-DYED", name: "Dyed Fleece Fabric", type: "Fabric", availableQty: 420, unit: "meter", costPerUnit: 450 },
  { id: "MAT-005", materialCode: "RM-FAB-KURTA-DYED", name: "Dyed Kurta Fabric", type: "Fabric", availableQty: 600, unit: "meter", costPerUnit: 280 },
  { id: "MAT-006", materialCode: "RM-THR-DYED", name: "Dyed Sewing Thread", type: "Thread", availableQty: 3000, unit: "tube", costPerUnit: 45 },
  { id: "MAT-007", materialCode: "RM-FUS-COLLAR", name: "Collar Fusing", type: "Fusing", availableQty: 500, unit: "meter", costPerUnit: 60 },
  { id: "MAT-008", materialCode: "RM-BTN-STD", name: "Buttons", type: "Accessories", availableQty: 80000, unit: "pcs", costPerUnit: 1.5 },
  { id: "MAT-009", materialCode: "RM-ZIP-STD", name: "Zippers", type: "Accessories", availableQty: 1200, unit: "pcs", costPerUnit: 18 },
  { id: "MAT-010", materialCode: "RM-LBL-BRAND", name: "Brand Label", type: "Labels", availableQty: 15000, unit: "pcs", costPerUnit: 3 },
  { id: "MAT-011", materialCode: "RM-BAG-POLY", name: "Packaging Bag", type: "Packaging", availableQty: 25000, unit: "pcs", costPerUnit: 5 },
];

const mockBoms = [
  { productId: "PRD-001", materialId: "MAT-001", qtyPerUnit: 1.8, wastagePercent: 5 },
  { productId: "PRD-001", materialId: "MAT-006", qtyPerUnit: 0.2, wastagePercent: 2 },
  { productId: "PRD-001", materialId: "MAT-007", qtyPerUnit: 0.15, wastagePercent: 5 },
  { productId: "PRD-001", materialId: "MAT-008", qtyPerUnit: 8, wastagePercent: 2 },
  { productId: "PRD-001", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-001", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-002", materialId: "MAT-004", qtyPerUnit: 2.2, wastagePercent: 4 },
  { productId: "PRD-002", materialId: "MAT-006", qtyPerUnit: 0.3, wastagePercent: 2 },
  { productId: "PRD-002", materialId: "MAT-009", qtyPerUnit: 2, wastagePercent: 2 },
  { productId: "PRD-002", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-002", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-003", materialId: "MAT-001", qtyPerUnit: 1.6, wastagePercent: 4 },
  { productId: "PRD-003", materialId: "MAT-006", qtyPerUnit: 0.15, wastagePercent: 2 },
  { productId: "PRD-003", materialId: "MAT-007", qtyPerUnit: 0.12, wastagePercent: 5 },
  { productId: "PRD-003", materialId: "MAT-008", qtyPerUnit: 7, wastagePercent: 2 },
  { productId: "PRD-003", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-003", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },

  { productId: "PRD-004", materialId: "MAT-002", qtyPerUnit: 1.4, wastagePercent: 4 },
  { productId: "PRD-004", materialId: "MAT-006", qtyPerUnit: 0.15, wastagePercent: 2 },
  { productId: "PRD-004", materialId: "MAT-008", qtyPerUnit: 3, wastagePercent: 2 },
  { productId: "PRD-004", materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
  { productId: "PRD-004", materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 },
];

const formatRs = (value: number) => `Rs. ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type SelectedProductConfig = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  variant: string;
  plannedStartDate: string;
  plannedCompletionDate: string;
  requiredDate: string;
  sizes: { [key: string]: number };
  productionNotes: string;
  isExpanded: boolean;
};

type MaterialConfig = {
  materialCode: string;
  materialName: string;
  materialType: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  unit: string;
  cost: number;
};

type StageConfig = {
  stageName: string;
  workCenter: string;
  plannedStartDate: string;
  plannedEndDate: string;
  status: string;
  completedQty: number;
  rejectedQty: number;
};

export function ProductionInHouseCreatePage() {
  const router = useRouter();

  // General fields
  const [planId, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [inHouseReason, setInHouseReason] = useState("Seasonal Buffer Stock");
  const [targetWarehouseId, setTargetWarehouseId] = useState("WH-001");

  // Product Selection Autocomplete state
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductConfig[]>([]);

  // Material Requirement State
  const [materials, setMaterials] = useState<MaterialConfig[]>([]);
  const [showAddMaterialDropdown, setShowAddMaterialDropdown] = useState(false);

  // Production Stages Routing State
  const [stages, setStages] = useState<StageConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize dates and plan ID
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const rand = Math.floor(100 + Math.random() * 900);
    const generatedPlanNo = `PP-INHOUSE-${dateStr.replaceAll("-", "")}-${rand}`;
    setPlanId(generatedPlanNo);
    setPlanDate(dateStr);
    setPlanName(`Inhouse Buffer Run - ${today.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`);
  }, []);

  // Filtered Products for Autocomplete
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return mockProducts;
    return mockProducts.filter(p =>
      p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.productCode.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  // Add Product Action
  const handleSelectProduct = (prod: typeof mockProducts[0]) => {
    const today = new Date();
    const startStr = today.toISOString().split("T")[0];
    const end = new Date();
    end.setDate(end.getDate() + 14);
    const endStr = end.toISOString().split("T")[0];
    const req = new Date();
    req.setDate(req.getDate() + 21);
    const reqStr = req.toISOString().split("T")[0];

    const newProdConfig: SelectedProductConfig = {
      productId: prod.id,
      productCode: prod.productCode,
      productName: prod.productName,
      quantity: 100,
      variant: prod.colors[0] || "Standard Color",
      plannedStartDate: startStr,
      plannedCompletionDate: endStr,
      requiredDate: reqStr,
      sizes: { XS: 0, S: 20, M: 40, L: 30, XL: 10, XXL: 0 },
      productionNotes: "",
      isExpanded: true,
    };

    setSelectedProducts(prev => {
      if (prev.some(p => p.productId === prod.id)) return prev;
      return prev.map(p => ({ ...p, isExpanded: false })).concat(newProdConfig);
    });

    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const updateProductField = (productId: string, field: keyof SelectedProductConfig, value: any) => {
    setSelectedProducts(prev =>
      prev.map(p => (p.productId === productId ? { ...p, [field]: value } : p))
    );
  };

  const updateSizeField = (productId: string, size: string, value: number) => {
    setSelectedProducts(prev =>
      prev.map(p => {
        if (p.productId === productId) {
          return {
            ...p,
            sizes: { ...p.sizes, [size]: value },
          };
        }
        return p;
      })
    );
  };

  const sizeValidation = (prod: SelectedProductConfig) => {
    const totalSizes = Object.values(prod.sizes).reduce((sum, val) => sum + val, 0);
    const difference = prod.quantity - totalSizes;
    return {
      total: totalSizes,
      difference,
      isValid: difference === 0,
    };
  };

  // Auto-calculate materials based on added products
  useEffect(() => {
    const calculated: { [key: string]: MaterialConfig } = {};

    selectedProducts.forEach(prod => {
      const boms = mockBoms.filter(b => b.productId === prod.productId);
      boms.forEach(bom => {
        const material = mockMaterials.find(m => m.id === bom.materialId);
        if (!material) return;

        const baseQty = prod.quantity * bom.qtyPerUnit;
        const requiredQty = baseQty + (baseQty * bom.wastagePercent) / 100;
        const key = material.materialCode;

        if (calculated[key]) {
          calculated[key].requiredQty += requiredQty;
        } else {
          calculated[key] = {
            materialCode: material.materialCode,
            materialName: material.name,
            materialType: material.type,
            requiredQty,
            availableQty: material.availableQty,
            shortageQty: 0,
            unit: material.unit,
            cost: material.costPerUnit,
          };
        }
      });
    });

    const finalMaterials = Object.values(calculated).map(mat => {
      const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
      return { ...mat, shortageQty };
    });

    setMaterials(finalMaterials);
  }, [selectedProducts]);

  // Handle manual raw material addition
  const handleAddMaterial = (materialId: string) => {
    const mat = mockMaterials.find(m => m.id === materialId);
    if (!mat) return;

    if (materials.some(m => m.materialCode === mat.materialCode)) return;

    const newMat: MaterialConfig = {
      materialCode: mat.materialCode,
      materialName: mat.name,
      materialType: mat.type,
      requiredQty: 10,
      availableQty: mat.availableQty,
      shortageQty: Math.max(10 - mat.availableQty, 0),
      unit: mat.unit,
      cost: mat.costPerUnit,
    };

    setMaterials(prev => prev.concat(newMat));
    setShowAddMaterialDropdown(false);
  };

  const handleUpdateMaterialQty = (code: string, qty: number) => {
    setMaterials(prev =>
      prev.map(m => {
        if (m.materialCode === code) {
          const shortageQty = Math.max(qty - m.availableQty, 0);
          return { ...m, requiredQty: qty, shortageQty };
        }
        return m;
      })
    );
  };

  const handleRemoveMaterial = (code: string) => {
    setMaterials(prev => prev.filter(m => m.materialCode !== code));
  };

  // Estimate total material run cost
  const estimatedCost = useMemo(() => {
    return materials.reduce((sum, mat) => sum + mat.requiredQty * mat.cost, 0);
  }, [materials]);

  // Auto-generate routing stages based on product dates
  useEffect(() => {
    const startDates = selectedProducts.map(p => p.plannedStartDate).filter(Boolean).sort();
    const endDates = selectedProducts.map(p => p.plannedCompletionDate).filter(Boolean).sort();

    const planStart = startDates[0] || planDate;
    const planEnd = endDates[endDates.length - 1] || planDate;

    const defaultStages: StageConfig[] = [
      { stageName: "Material Check", workCenter: "Raw Material Store", plannedStartDate: planStart, plannedEndDate: planStart, status: "Not Started", completedQty: 0, rejectedQty: 0 },
      { stageName: "Cutting", workCenter: "Cutting Section", plannedStartDate: planStart, plannedEndDate: planStart, status: "Not Started", completedQty: 0, rejectedQty: 0 },
      { stageName: "Stitching / Sewing", workCenter: "Sewing Line 1", plannedStartDate: planStart, plannedEndDate: planEnd, status: "Not Started", completedQty: 0, rejectedQty: 0 },
      { stageName: "Finishing", workCenter: "Finishing Section", plannedStartDate: planEnd, plannedEndDate: planEnd, status: "Not Started", completedQty: 0, rejectedQty: 0 },
      { stageName: "Quality Check", workCenter: "QC Table", plannedStartDate: planEnd, plannedEndDate: planEnd, status: "Not Started", completedQty: 0, rejectedQty: 0 },
    ];

    setStages(defaultStages);
  }, [selectedProducts, planDate]);

  const updateStageField = (index: number, field: keyof StageConfig, value: any) => {
    setStages(prev =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveStage = (index: number) => {
    setStages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddStage = () => {
    const newStage: StageConfig = {
      stageName: "Custom Production Stage",
      workCenter: "General Workshop",
      plannedStartDate: planDate,
      plannedEndDate: planDate,
      status: "Not Started",
      completedQty: 0,
      rejectedQty: 0,
    };
    setStages(prev => prev.concat(newStage));
  };

  // Submit / Save Logic
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProducts.length) return;
    setIsSubmitting(true);

    const newPlan = {
      id: planId,
      planId,
      planNo: planId,
      planDate,
      demandType: "In-house Stock",
      planName,
      sourceId: targetWarehouseId,
      sourceName: mockWarehouses.find(w => w.id === targetWarehouseId)?.name || "Central Warehouse",
      products: selectedProducts.map(p => ({
        productId: p.productId,
        productCode: p.productCode,
        productName: p.productName,
        quantity: p.quantity,
        variant: p.variant,
        plannedStartDate: p.plannedStartDate,
        plannedCompletionDate: p.plannedCompletionDate,
        requiredDate: p.requiredDate,
        sizes: Object.entries(p.sizes).map(([size, quantity]) => ({ size, quantity })),
        productionNotes: p.productionNotes,
      })),
      stages: stages,
      status: "Material Check",
    };

    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem("productionPlans") || "[]";
      let existing = [];
      try {
        existing = JSON.parse(existingStr);
      } catch (err) {
        existing = [];
      }
      existing.unshift(newPlan);
      localStorage.setItem("productionPlans", JSON.stringify(existing));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/Production/Plan/PlansDetails");
    }, 1200);
  };

  return (
    <div className="pp-page max-w-1000 mx-auto">
      <div className="pp-page-header">
        <div>
          <h1>Create In-house Production Plan</h1>
          <p>Schedule garment runs for warehouse replenishment stock buffer.</p>
        </div>
        <div className="pp-header-actions">
          <Link href="/Production/Create" className="btn btn-light">
            Change Demand Type
          </Link>
          <Link href="/Production/Plan/PlansDetails" className="btn btn-primary">
            Back to Plans
          </Link>
        </div>
      </div>

      <form onSubmit={handleSavePlan}>
        {/* Step 1: General configuration card */}
        <section className="pp-card p-24 mb-24">
          <h2 className="fs-16 fw-800 mb-16">1. General Configuration</h2>
          <div className="form-grid two-col p-0 m-0">
            <div className="form-group">
              <label>Plan ID (Editable Reference)</label>
              <input type="text" className="form-control" value={planId} onChange={e => setPlanId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Plan Name</label>
              <input type="text" className="form-control" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. Q3 Hoodie Stock Run" required />
            </div>
            <div className="form-group">
              <label>Select Target Warehouse</label>
              <select className="form-control" value={targetWarehouseId} onChange={e => setTargetWarehouseId(e.target.value)}>
                {mockWarehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Stock Replenishment Reason</label>
              <select className="form-control" value={inHouseReason} onChange={e => setInHouseReason(e.target.value)}>
                <option>Seasonal Buffer Stock</option>
                <option>Standard Stock Replenishment</option>
                <option>Festival Demand Buffer</option>
                <option>Raw Material Conversion Run</option>
              </select>
            </div>
          </div>
        </section>

        {/* Step 2: Add garments selection accordion card */}
        <section className="pp-card p-24 mb-24">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <div>
              <h2 className="fs-16 fw-800">2. Configure Products</h2>
              <p className="text-muted fs-12 mt-4">Add products from catalog, split quantities by size, and add notes.</p>
            </div>
          </div>

          <div className="form-group relative mb-20">
            <label className="fw-700 fs-13 mb-8">Search & Add Product</label>
            <div className="autocomplete-input-wrapper">
              <input
                type="text"
                className="form-control search-field-box"
                placeholder="Search catalog garments (e.g. Shirt, Polo)..."
                value={productSearch}
                onChange={e => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
              />
              {showProductDropdown && (
                <div className="autocomplete-dropdown-list">
                  {filteredProducts.length ? (
                    filteredProducts.map(prod => (
                      <div key={prod.id} className="dropdown-item" onClick={() => handleSelectProduct(prod)}>
                        <strong>{prod.productName}</strong>
                        <span>Code: {prod.productCode} | {prod.category}</span>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-empty">No matching products found.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="added-products-list">
            {selectedProducts.length ? (
              selectedProducts.map((prod, index) => {
                const validation = sizeValidation(prod);
                return (
                  <div className="product-accordion-card mb-16" key={prod.productId}>
                    <div
                      className="accordion-header p-16 d-flex align-items-center justify-content-between cursor-pointer"
                      onClick={() => {
                        setSelectedProducts(prev =>
                          prev.map(p => (p.productId === prod.productId ? { ...p, isExpanded: !p.isExpanded } : p))
                        );
                      }}
                    >
                      <div className="d-flex align-items-center gap-12">
                        <span className="count-badge">{index + 1}</span>
                        <div>
                          <strong className="fs-14 d-block">{prod.productName}</strong>
                          <span className="fs-11 text-muted">{prod.productCode} | Qty: {prod.quantity} pcs</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-12">
                        {validation.isValid ? (
                          <span className="status-badge status-completed text-xs">Size Match</span>
                        ) : (
                          <span className="status-badge status-risk text-xs">Mismatch: {validation.difference} pcs</span>
                        )}
                        <button
                          type="button"
                          className="btn-link text-danger border-0 bg-transparent p-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProduct(prod.productId);
                          }}
                        >
                          <MaterialIcon name="delete" />
                        </button>
                        <MaterialIcon name={prod.isExpanded ? "expand_less" : "expand_more"} />
                      </div>
                    </div>

                    {prod.isExpanded && (
                      <div className="accordion-body p-20 border-top">
                        <div className="form-grid three-col p-0 mb-16">
                          <div className="form-group">
                            <label>Product Qty (pcs)</label>
                            <input
                              type="number"
                              className="form-control"
                              min="1"
                              value={prod.quantity}
                              onChange={e => updateProductField(prod.productId, "quantity", parseInt(e.target.value, 10) || 0)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Color Variant</label>
                            <input
                              type="text"
                              className="form-control"
                              value={prod.variant}
                              onChange={e => updateProductField(prod.productId, "variant", e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Required Completion Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={prod.requiredDate}
                              onChange={e => updateProductField(prod.productId, "requiredDate", e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Planned Start Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={prod.plannedStartDate}
                              onChange={e => updateProductField(prod.productId, "plannedStartDate", e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Planned End Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={prod.plannedCompletionDate}
                              onChange={e => updateProductField(prod.productId, "plannedCompletionDate", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="size-breakdown-section mt-16">
                          <h4 className="fs-13 fw-700 mb-12">Sizes distribution</h4>
                          <div className="size-inputs-grid mb-12">
                            {["XS", "S", "M", "L", "XL", "XXL"].map(sz => (
                              <div className="size-input-field" key={sz}>
                                <span>{sz}</span>
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control text-center"
                                  value={prod.sizes[sz] || 0}
                                  onChange={e => updateSizeField(prod.productId, sz, parseInt(e.target.value, 10) || 0)}
                                />
                              </div>
                            ))}
                          </div>

                          <div className={`validation-strip rounded-12 p-10 d-flex justify-content-between align-items-center ${validation.isValid ? "bg-green-soft text-green" : "bg-red-soft text-danger"}`}>
                            <span className="fs-12 fw-700">Total size sum: {validation.total} pcs</span>
                            <span className="fs-12 fw-700">
                              {validation.isValid ? "Sizes match planned target." : `Diff: ${validation.difference > 0 ? "+" : ""}${validation.difference} pcs`}
                            </span>
                          </div>
                        </div>

                        <div className="form-group mt-16">
                          <label>Production Notes</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Add sizing variants, stitching instructions, or packaging notes..."
                            value={prod.productionNotes}
                            onChange={e => updateProductField(prod.productId, "productionNotes", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="product-editor-empty detail min-h-120 d-grid place-items-center">
                <span>Please search and select at least one garment from the catalog input above.</span>
              </div>
            )}
          </div>
        </section>

        {/* Step 3: Material Requirements & BOM */}
        <section className="pp-card p-24 mb-24">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <div>
              <h2 className="fs-16 fw-800">3. Material Requirements & BOM Estimator</h2>
              <p className="text-muted fs-12 mt-4">Required materials auto-calculated from selected products and standard ratios.</p>
            </div>
            <div className="relative">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddMaterialDropdown(!showAddMaterialDropdown)}>
                <MaterialIcon name="add" />
                Add Raw Material
              </button>
              {showAddMaterialDropdown && (
                <div className="autocomplete-dropdown-list absolute right-0 mt-8" style={{ width: "240px", zIndex: 100 }}>
                  {mockMaterials.map(m => (
                    <div key={m.id} className="dropdown-item" onClick={() => handleAddMaterial(m.id)}>
                      <strong>{m.name}</strong>
                      <span className="fs-11 text-muted">{m.materialCode} ({m.unit})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pp-table-wrapper border rounded-12 mb-20">
            <table className="pp-table m-0">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Material Name</th>
                  <th>Type</th>
                  <th>Required Qty</th>
                  <th>Available Qty</th>
                  <th>Shortage</th>
                  <th>Cost/Unit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.length ? (
                  materials.map(mat => {
                    const hasShortage = mat.shortageQty > 0;
                    return (
                      <tr key={mat.materialCode}>
                        <td><code>{mat.materialCode}</code></td>
                        <td><strong>{mat.materialName}</strong></td>
                        <td>{mat.materialType}</td>
                        <td style={{ width: "110px" }}>
                          <input
                            type="number"
                            min="0"
                            className="form-control text-sm py-4 px-8 min-h-30"
                            value={Number(mat.requiredQty.toFixed(1))}
                            onChange={e => handleUpdateMaterialQty(mat.materialCode, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>{mat.availableQty} {mat.unit}</td>
                        <td className={hasShortage ? "text-danger fw-700" : "text-green"}>
                          {hasShortage ? `${Number(mat.shortageQty.toFixed(1))} ${mat.unit}` : "-"}
                        </td>
                        <td>{formatRs(mat.cost)}</td>
                        <td>
                          {hasShortage ? (
                            <span className="status-badge status-shortage text-xs">Shortage</span>
                          ) : (
                            <span className="status-badge status-completed text-xs">OK</span>
                          )}
                        </td>
                        <td>
                          <button type="button" className="btn-link text-danger border-0 bg-transparent" onClick={() => handleRemoveMaterial(mat.materialCode)}>
                            <MaterialIcon name="delete" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="empty-cell text-center">No materials calculated yet. Add a product above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end mb-10">
            <div className="bg-primary-soft text-primary-dark border border-primary px-20 py-12 rounded-12 d-flex align-items-center gap-16 shadow-sm">
              <span className="fw-700 fs-13">Estimated Run Material Cost:</span>
              <strong className="fs-18 fw-900">{formatRs(estimatedCost)}</strong>
            </div>
          </div>
        </section>

        {/* Step 4: Configure Production Routings */}
        <section className="pp-card p-24 mb-24">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <div>
              <h2 className="fs-16 fw-800">4. Configure Production Stages Routing</h2>
              <p className="text-muted fs-12 mt-4">Verify dates and line assignments for each process stage.</p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddStage}>
              <MaterialIcon name="add" />
              Add Custom Stage
            </button>
          </div>

          <div className="pp-table-wrapper border rounded-12 mb-24">
            <table className="pp-table m-0">
              <thead>
                <tr>
                  <th>Stage Name</th>
                  <th>Work Center</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stg, index) => (
                  <tr key={index}>
                    <td style={{ width: "240px" }}>
                      <input
                        type="text"
                        className="form-control py-4 px-8 min-h-30"
                        value={stg.stageName}
                        onChange={e => updateStageField(index, "stageName", e.target.value)}
                      />
                    </td>
                    <td style={{ width: "220px" }}>
                      <select
                        className="form-control py-4 px-8 min-h-30"
                        value={stg.workCenter}
                        onChange={e => updateStageField(index, "workCenter", e.target.value)}
                      >
                        <option>Raw Material Store</option>
                        <option>Cutting Section</option>
                        <option>Sewing Line 1</option>
                        <option>Sewing Line 2</option>
                        <option>Finishing Section</option>
                        <option>QC Table</option>
                        <option>Packing Station</option>
                        <option>General Workshop</option>
                      </select>
                    </td>
                    <td style={{ width: "160px" }}>
                      <input
                        type="date"
                        className="form-control py-4 px-8 min-h-30"
                        value={stg.plannedStartDate}
                        onChange={e => updateStageField(index, "plannedStartDate", e.target.value)}
                      />
                    </td>
                    <td style={{ width: "160px" }}>
                      <input
                        type="date"
                        className="form-control py-4 px-8 min-h-30"
                        value={stg.plannedEndDate}
                        onChange={e => updateStageField(index, "plannedEndDate", e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="status-badge status-draft text-xs">{stg.status}</span>
                    </td>
                    <td>
                      <button type="button" className="btn-link text-danger border-0 bg-transparent" onClick={() => handleRemoveStage(index)}>
                        <MaterialIcon name="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="d-flex justify-content-end gap-12 mt-20 mb-50 border-top pt-20">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => router.push("/Production/Create")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !selectedProducts.length || selectedProducts.some(p => !sizeValidation(p).isValid)}
          >
            {isSubmitting ? (
              "Saving Production Plan..."
            ) : (
              <>
                <MaterialIcon name="save" />
                Save Production Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
