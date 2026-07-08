"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "../legacy-ui/ActionButton";
import { MaterialIcon } from "../ui/MaterialIcon";

// Mock Database Lists
const mockMaterials = [
  { id: "MAT-001", materialCode: "RM-FAB-COT-DYED", name: "Dyed Cotton Fabric", type: "Fabric", availableQty: 1800, unit: "meter" },
  { id: "MAT-002", materialCode: "RM-FAB-PIQUE-DYED", name: "Dyed Pique Fabric", type: "Fabric", availableQty: 950, unit: "meter" },
  { id: "MAT-003", materialCode: "RM-FAB-TRS-DYED", name: "Dyed Trouser Fabric", type: "Fabric", availableQty: 700, unit: "meter" },
  { id: "MAT-004", materialCode: "RM-FAB-FLEECE-DYED", name: "Dyed Fleece Fabric", type: "Fabric", availableQty: 420, unit: "meter" },
  { id: "MAT-005", materialCode: "RM-FAB-KURTA-DYED", name: "Dyed Kurta Fabric", type: "Fabric", availableQty: 600, unit: "meter" },
  { id: "MAT-006", materialCode: "RM-THR-DYED", name: "Dyed Sewing Thread", type: "Thread", availableQty: 3000, unit: "tube" },
  { id: "MAT-007", materialCode: "RM-FUS-COLLAR", name: "Collar Fusing", type: "Fusing", availableQty: 500, unit: "meter" },
  { id: "MAT-008", materialCode: "RM-BTN-STD", name: "Buttons", type: "Accessories", availableQty: 80000, unit: "pcs" },
  { id: "MAT-009", materialCode: "RM-ZIP-STD", name: "Zippers", type: "Accessories", availableQty: 1200, unit: "pcs" },
  { id: "MAT-010", materialCode: "RM-LBL-BRAND", name: "Brand Label", type: "Labels", availableQty: 15000, unit: "pcs" },
  { id: "MAT-011", materialCode: "RM-BAG-POLY", name: "Packaging Bag", type: "Packaging", availableQty: 25000, unit: "pcs" },
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

export function ProductionPlanCreateDetailsPage() {
  const router = useRouter();

  // Load state from localStorage
  const [tempData, setTempData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [planNo, setPlanNo] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [leadPlanner, setLeadPlanner] = useState("");
  const [outputDestination, setOutputDestination] = useState("Finished Goods Warehouse");
  const [productionLine, setProductionLine] = useState("Sewing Line 1");
  const [materialWarehouse, setMaterialWarehouse] = useState("Central Raw Material Hub");
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedCompletionDate, setPlannedCompletionDate] = useState("");
  const [productionNotes, setProductionNotes] = useState("");

  // Stage details configuration state
  const [stages, setStages] = useState<any[]>([
    { stageId: "STG-001", stageName: "Material Check", workCenter: "Raw Material Store", startOffset: 0, endOffset: 1, operator: "Ram Bahadur" },
    { stageId: "STG-002", stageName: "Cutting", workCenter: "Cutting Section", startOffset: 2, endOffset: 4, operator: "Sita Kumari" },
    { stageId: "STG-003", stageName: "Stitching / Sewing", workCenter: "Sewing Line 1", startOffset: 5, endOffset: 12, operator: "Gopal Shrestha" },
    { stageId: "STG-004", stageName: "Finishing", workCenter: "Finishing Section", startOffset: 13, endOffset: 14, operator: "Nabina Thapa" },
    { stageId: "STG-005", stageName: "Quality Check", workCenter: "QC Table", startOffset: 15, endOffset: 15, operator: "Bimal Gurung" },
  ]);

  // Bulk Material Status Check
  const [materialChecked, setMaterialChecked] = useState(false);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Recalculate stages absolute dates when plannedStartDate changes
  const computedStages = useMemo(() => {
    if (!plannedStartDate) return stages;
    return stages.map(stage => {
      const start = new Date(plannedStartDate);
      start.setDate(start.getDate() + stage.startOffset);
      const end = new Date(plannedStartDate);
      end.setDate(end.getDate() + stage.endOffset);
      return {
        ...stage,
        plannedStartDate: start.toISOString().split("T")[0],
        plannedEndDate: end.toISOString().split("T")[0],
      };
    });
  }, [plannedStartDate, stages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dataStr = localStorage.getItem("temp_plan_basket");
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          setTempData(parsed);

          // Pre-fill fields
          const today = new Date();
          const dateStr = today.toISOString().split("T")[0];
          const rand = Math.floor(100 + Math.random() * 900);
          const generatedPlanNo = `PP-${dateStr.replaceAll("-", "")}-${rand}`;

          setPlanNo(generatedPlanNo);
          setPlanDate(dateStr);

          // Default planned dates: start tomorrow, end in 16 days
          const start = new Date();
          start.setDate(today.getDate() + 1);
          const startStr = start.toISOString().split("T")[0];

          const end = new Date();
          end.setDate(today.getDate() + 16);
          const endStr = end.toISOString().split("T")[0];

          setPlannedStartDate(startStr);
          setPlannedCompletionDate(endStr);

          const sourceName = parsed.kind === "customer" 
            ? parsed.sourceDetail?.customerName 
            : parsed.sourceDetail?.name;
          setPlanName(`Production Plan - ${sourceName || "Stock"} (${dateStr})`);

          // Pre-fill destination based on kind
          if (parsed.kind === "customer") {
            setOutputDestination("Customer Dispatch");
          } else {
            setOutputDestination("Outlet Transfer");
          }
        } catch (e) {
          console.error("Failed to parse temp_plan_basket", e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Convert AD (Gregorian) date string "YYYY-MM-DD" to BS (Nepali) date string "YYYY-MM-DD"
  const adToBs = (adStr: string): string => {
    if (!adStr || typeof window === "undefined" || !(window as any).NepaliFunctions) return adStr;
    try {
      const bsVal = (window as any).NepaliFunctions.AD2BS(adStr, "YYYY-MM-DD", "YYYY-MM-DD");
      return typeof bsVal === "string" ? bsVal : `${bsVal.year}-${String(bsVal.month).padStart(2, '0')}-${String(bsVal.day).padStart(2, '0')}`;
    } catch (e) {
      return adStr;
    }
  };

  // Convert BS (Nepali) date string "YYYY-MM-DD" to AD (Gregorian) date string "YYYY-MM-DD"
  const bsToAd = (bsStr: string): string => {
    if (!bsStr || typeof window === "undefined" || !(window as any).NepaliFunctions) return bsStr;
    try {
      const adVal = (window as any).NepaliFunctions.BS2AD(bsStr, "YYYY-MM-DD", "YYYY-MM-DD");
      return typeof adVal === "string" ? adVal : `${adVal.year}-${String(adVal.month).padStart(2, '0')}-${String(adVal.day).padStart(2, '0')}`;
    } catch (e) {
      return bsStr;
    }
  };

  // Initialize Sajan Maharjan's Nepali DatePicker on React component mounting/state changes
  useEffect(() => {
    const initPicker = () => {
      const inputs = document.querySelectorAll(".nepali-date");
      if (inputs.length > 0 && typeof (window as any).NepaliFunctions !== "undefined") {
        inputs.forEach((input: any) => {
          if (typeof input.nepaliDatePicker === "function") {
            if (input.dataset.datepickerInitialized) return;
            input.dataset.datepickerInitialized = "true";

            input.nepaliDatePicker({
              dateFormat: "YYYY-MM-DD",
              miniEnglishDates: true,
              onChange: () => {
                // Dispatch native change event so React registers state change
                input.dispatchEvent(new Event("change", { bubbles: true }));
              }
            });
          }
        });
      }
    };

    initPicker();
    const timer = setTimeout(initPicker, 400);
    return () => clearTimeout(timer);
  }, [isLoading, computedStages]);


  // Check Materials Availability
  const handleCheckMaterials = () => {
    if (!tempData || !tempData.basket.length) return;

    const calculated: { [key: string]: any } = {};

    tempData.basket.forEach((item: any) => {
      const boms = mockBoms.filter(b => b.productId === item.productId);
      boms.forEach(bom => {
        const material = mockMaterials.find(m => m.id === bom.materialId);
        if (!material) return;

        const baseQty = item.quantity * bom.qtyPerUnit;
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
            unit: material.unit,
          };
        }
      });
    });

    const finalMaterials = Object.values(calculated).map(mat => {
      const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
      return {
        ...mat,
        shortageQty,
        status: shortageQty > 0 ? "Shortage" : "Available",
      };
    });

    setMaterialsList(finalMaterials);
    setMaterialChecked(true);
  };

  // Stage update handler
  const handleStageFieldChange = (index: number, field: string, value: any) => {
    setStages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempData || !tempData.basket.length) return;

    if (!planName.trim()) {
      setValidationError("Plan Name is required.");
      return;
    }
    if (!leadPlanner.trim()) {
      setValidationError("Lead Planner / Supervisor Name is required.");
      return;
    }
    if (!plannedStartDate || !plannedCompletionDate) {
      setValidationError("Please select both planned start and completion dates.");
      return;
    }
    if (new Date(plannedCompletionDate) < new Date(plannedStartDate)) {
      setValidationError("Planned Completion Date cannot be earlier than Planned Start Date.");
      return;
    }

    setIsSubmitting(true);
    setValidationError("");

    // Calculate details for the plan
    const sourceName = tempData.kind === "customer" 
      ? tempData.sourceDetail?.customerName 
      : tempData.sourceDetail?.name;

    const basketItems = tempData.basket;
    const firstItem = basketItems[0];
    const totalQuantity = basketItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Aggregate size split for all products
    const sizeMap: { [key: string]: number } = {};
    basketItems.forEach((item: any) => {
      Object.entries(item.sizes || {}).forEach(([size, qty]) => {
        sizeMap[size] = (sizeMap[size] || 0) + Number(qty);
      });
    });
    const aggregateSizes = Object.entries(sizeMap).map(([size, quantity]) => ({ size, quantity }));

    // Find earliest required date among basket items
    const requiredDates = basketItems
      .map((item: any) => item.deliveryDate || item.requiredDate)
      .filter(Boolean)
      .sort();
    const earliestRequiredDate = requiredDates[0] || plannedCompletionDate;

    // Construct the stages with actual calculated dates
    const finalStages = computedStages.map((stage, idx) => ({
      stageId: stage.stageId,
      stageName: stage.stageName,
      workCenter: stage.workCenter === "Sewing Line 1" ? productionLine : stage.workCenter,
      plannedStartDate: stage.plannedStartDate,
      plannedEndDate: stage.plannedEndDate,
      status: "Not Started",
      completedQty: 0,
      rejectedQty: 0,
      operator: stage.operator,
    }));

    // Create new plan object
    const newPlan = {
      id: planNo,
      planId: planNo,
      planNo,
      planDate,
      demandType: tempData.kind === "customer" ? "Customer Order" : "Outlet Replenishment",
      planName,
      sourceId: tempData.selectedSourceId,
      sourceName,
      productId: firstItem?.productId,
      productName: firstItem?.productName,
      variant: basketItems.map((bi: any) => bi.variant).join(" / "),
      color: basketItems.map((bi: any) => bi.variant).join(" / "),
      quantity: totalQuantity,
      totalQuantity,
      priority,
      outputDestination,
      plannedStartDate,
      plannedCompletionDate,
      requiredDate: earliestRequiredDate,
      status: "Draft",
      sizes: aggregateSizes,
      products: basketItems.map((item: any, idx: number) => ({
        lineId: `${planNo}-L${idx + 1}`,
        orderNo: item.orderNo || item.demandNo,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        category: item.category,
        variant: item.variant,
        quantity: item.quantity,
        sourceName,
        requiredDate: item.deliveryDate || item.requiredDate,
        plannedStartDate,
        plannedCompletionDate,
        status: "Draft",
        priority,
        productImage: item.productImage,
        productionNotes: item.productionNotes || productionNotes || "Created from planning basket.",
        sizes: Object.entries(item.sizes || {}).map(([size, quantity]) => ({ size, quantity: Number(quantity) })),
      })),
      stages: finalStages,
      activities: [
        {
          title: "Plan created from basket",
          text: `Production plan created with ${basketItems.length} items. Lead Planner: ${leadPlanner}. Assigned to ${productionLine}.`
        }
      ]
    };

    // Save to localStorage
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
      
      // Clean temp basket
      localStorage.removeItem("temp_plan_basket");
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/Production/Plan/PlansDetails");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="pp-page text-center py-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-16 text-muted">Retrieving plan parameters...</p>
      </div>
    );
  }

  if (!tempData || !tempData.basket.length) {
    return (
      <div className="pp-page">
        <div className="alert alert-warning max-w-600 mx-auto mt-50 text-center p-30 rounded-20 shadow-sm border bg-red-soft text-danger">
          <span style={{ fontSize: "40px", marginBottom: "16px", display: "inline-block" }}>
            <MaterialIcon name="warning" />
          </span>
          <h3>Planning Session Expired</h3>
          <p className="mt-8 mb-20 text-muted">No items were found in your planning basket. Please return to the catalog and select items.</p>
          <div className="d-flex justify-content-center gap-12">
            <Link href="/Production/Customer/Customers" className="btn btn-primary">
              Customer Catalog
            </Link>
            <Link href="/Production/Outlet/Outlets" className="btn btn-outline">
              Outlet Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalQuantity = tempData.basket.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="pp-page">
      <style>{`
        .desktop-only-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .mobile-only-list {
          display: none;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stage-num-badge {
          background-color: #2563eb;
          color: #ffffff;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .customer-profile-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-header-icon {
          background-color: #eff6ff;
          color: #2563eb;
          border-radius: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 12px;
          border-bottom: 1px dashed #f1f5f9;
        }
        .profile-info-row:last-child {
          border-bottom: none;
        }
        .profile-info-label {
          color: #64748b;
          font-weight: 500;
        }
        .profile-info-value {
          color: #0f172a;
          font-weight: 600;
          text-align: right;
          max-width: 170px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .desktop-only-table {
            display: none !important;
          }
          .mobile-only-list {
            display: flex !important;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 16px;
          }
          .mobile-stage-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .mobile-stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .mobile-stage-inputs {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mobile-stage-dates {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }
      `}</style>
      <div className="pp-page-header">
        <div>
          <h1>Configure Plan Details</h1>
          <p>Provide schedule dates, work center assignments, and stage deadlines to finalize the production run.</p>
        </div>
        <div className="pp-header-actions">
          <ActionButton href={tempData.kind === "customer" ? `/Production/Customer/CreateCustomer?customerId=${tempData.selectedSourceId}` : `/Production/Outlet/CreateOutlet?outletId=${tempData.selectedSourceId}`} variant="light">
            <MaterialIcon name="arrow_back" />
            Back to Basket
          </ActionButton>
        </div>
      </div>

      {validationError && (
        <div className="alert alert-danger p-16 rounded-12 mb-20 d-flex align-items-center gap-12">
          <MaterialIcon name="error" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="catalog-layout">
          {/* Configuration Form */}
          <main className="catalog-main d-flex flex-column gap-24">
            {/* General Settings */}
            <section className="pp-card p-24">
              <div className="pp-card-header mb-16">
                <div>
                  <h2 className="fs-18">1. General Production Information</h2>
                  <p>Define identification details and priority for this plan.</p>
                </div>
              </div>
              
              <div className="form-grid two-col">
                <div className="form-group">
                  <label htmlFor="planNo">Plan Code / No</label>
                  <input type="text" id="planNo" className="form-control bg-light" value={planNo} readOnly />
                </div>
                <div className="form-group">
                  <label htmlFor="planDate">Plan Date</label>
                  <input type="text" id="planDate" className="form-control bg-light" value={planDate} readOnly />
                </div>
                <div className="form-group full">
                  <label htmlFor="planName">Production Plan Name <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="planName" 
                    className="form-control font-bold" 
                    placeholder="Enter descriptive name for the production plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="leadPlanner">Lead Planner / Supervisor <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="leadPlanner" 
                    className="form-control" 
                    placeholder="E.g. Ramesh Shrestha"
                    value={leadPlanner}
                    onChange={(e) => setLeadPlanner(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Production Priority</label>
                  <select 
                    id="priority" 
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                    <option value="Seasonal">Seasonal Buffer</option>
                    <option value="Critical">Critical (ASAP)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Allocation & Logistics */}
            <section className="pp-card p-24">
              <div className="pp-card-header mb-16">
                <div>
                  <h2 className="fs-18">2. Facilities & Logistics</h2>
                  <p>Assign assembly line, inventory sources, and output storage locations.</p>
                </div>
              </div>
              
              <div className="form-grid two-col">
                <div className="form-group">
                  <label htmlFor="productionLine">Primary Assembly Line</label>
                  <select 
                    id="productionLine" 
                    className="form-control"
                    value={productionLine}
                    onChange={(e) => setProductionLine(e.target.value)}
                  >
                    <option value="Sewing Line 1">Sewing Line 1 (Balaju Floor)</option>
                    <option value="Sewing Line 2">Sewing Line 2 (Balaju Floor)</option>
                    <option value="Sports Uniform Line">Sports Uniform Line (Line 3)</option>
                    <option value="Jacket Section">Special Jacket Line 4</option>
                    <option value="External Workshop">Subcontractor - Kathmandu Apparel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="materialWarehouse">Raw Material Hub</label>
                  <select 
                    id="materialWarehouse" 
                    className="form-control"
                    value={materialWarehouse}
                    onChange={(e) => setMaterialWarehouse(e.target.value)}
                  >
                    <option value="Central Raw Material Hub">Central Raw Material Hub (Balaju)</option>
                    <option value="Transit Accessories Store">Transit Accessories Store (Koteshwor)</option>
                    <option value="Pokhara Local Store">Pokhara Local Store (Lakeside)</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="outputDestination">Finished Output Destination</label>
                  <select 
                    id="outputDestination" 
                    className="form-control"
                    value={outputDestination}
                    onChange={(e) => setOutputDestination(e.target.value)}
                  >
                    <option value="Finished Goods Warehouse">Finished Goods Warehouse (WH-FG-001)</option>
                    <option value="Customer Dispatch">Direct Customer Dispatch (KTM Area)</option>
                    <option value="Outlet Transfer">Outlet Transfer Store (New Road Branch)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Schedule & Stages */}
            <section className="pp-card p-24">
              <div className="pp-card-header mb-16">
                <div>
                  <h2 className="fs-18">3. Production Timeline & Stage Schedule</h2>
                  <p>Define dates for overall plan and adjust deadlines for individual stages.</p>
                </div>
              </div>

              <div className="form-grid two-col mb-24">
                <div className="form-group">
                  <label htmlFor="plannedStartDate">Planned Start Date (BS) <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="plannedStartDate" 
                    className="form-control font-bold nepali-date"
                    placeholder="YYYY-MM-DD"
                    value={adToBs(plannedStartDate)}
                    onChange={(e) => {
                      const bsVal = e.target.value;
                      const adVal = bsToAd(bsVal);
                      setPlannedStartDate(adVal);
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="plannedCompletionDate">Planned Completion Date (BS) <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="plannedCompletionDate" 
                    className="form-control font-bold nepali-date"
                    placeholder="YYYY-MM-DD"
                    value={adToBs(plannedCompletionDate)}
                    onChange={(e) => {
                      const bsVal = e.target.value;
                      const adVal = bsToAd(bsVal);
                      setPlannedCompletionDate(adVal);
                    }}
                    required
                  />
                </div>
              </div>

              <h3 className="fs-14 font-bold text-muted uppercase tracking-wider mb-12">Dynamic Stage Schedules (Adjustable)</h3>
              
              {/* Desktop view: Table */}
              <div className="desktop-only-table pp-table-wrapper border rounded-12 mb-16">
                <table className="pp-table compact-table m-0">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: "22%" }}>Stage Name</th>
                      <th style={{ width: "22%" }}>Work Center</th>
                      <th style={{ width: "18%" }}>Start Date</th>
                      <th style={{ width: "18%" }}>End Date</th>
                      <th style={{ width: "20%" }}>Stage Lead / Op</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedStages.map((stage, idx) => (
                      <tr key={stage.stageId}>
                        <td>
                          <div className="d-flex align-items-center gap-8">
                            <span className="stage-num-badge">
                              {idx + 1}
                            </span>
                            <strong>{stage.stageName}</strong>
                          </div>
                        </td>
                        <td>
                          {stage.stageName === "Stitching / Sewing" ? (
                            <span className="text-dark font-medium">{productionLine}</span>
                          ) : (
                            <span className="text-muted">{stage.workCenter}</span>
                          )}
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm text-center nepali-date" 
                            style={{ minWidth: "130px" }}
                            placeholder="YYYY-MM-DD"
                            value={adToBs(stage.plannedStartDate)}
                            onChange={(e) => {
                              const bsVal = e.target.value;
                              const adVal = bsToAd(bsVal);
                              const base = new Date(plannedStartDate);
                              const target = new Date(adVal);
                              const diffTime = target.getTime() - base.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              handleStageFieldChange(idx, "startOffset", diffDays);
                            }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm text-center nepali-date" 
                            style={{ minWidth: "130px" }}
                            placeholder="YYYY-MM-DD"
                            value={adToBs(stage.plannedEndDate)}
                            onChange={(e) => {
                              const bsVal = e.target.value;
                              const adVal = bsToAd(bsVal);
                              const base = new Date(plannedStartDate);
                              const target = new Date(adVal);
                              const diffTime = target.getTime() - base.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              handleStageFieldChange(idx, "endOffset", diffDays);
                            }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            style={{ minWidth: "120px" }}
                            value={stage.operator}
                            placeholder="Operator name"
                            onChange={(e) => handleStageFieldChange(idx, "operator", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view: Stacked stage cards */}
              <div className="mobile-only-list">
                {computedStages.map((stage, idx) => (
                  <div key={stage.stageId} className="mobile-stage-card">
                    <div className="mobile-stage-header">
                      <div className="d-flex align-items-center gap-8">
                        <span className="stage-num-badge">
                          {idx + 1}
                        </span>
                        <strong className="fs-14 text-dark">{stage.stageName}</strong>
                      </div>
                      <span className="text-xs text-muted font-medium bg-light px-8 py-2 rounded-6">
                        {stage.stageName === "Stitching / Sewing" ? productionLine : stage.workCenter}
                      </span>
                    </div>

                    <div className="mobile-stage-inputs">
                      <div className="mobile-stage-dates">
                        <div>
                          <label className="text-2xs font-bold text-muted uppercase d-block mb-4" style={{ fontSize: "10px" }}>Start Date</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm nepali-date" 
                            placeholder="YYYY-MM-DD"
                            value={adToBs(stage.plannedStartDate)}
                            onChange={(e) => {
                              const bsVal = e.target.value;
                              const adVal = bsToAd(bsVal);
                              const base = new Date(plannedStartDate);
                              const target = new Date(adVal);
                              const diffTime = target.getTime() - base.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              handleStageFieldChange(idx, "startOffset", diffDays);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-2xs font-bold text-muted uppercase d-block mb-4" style={{ fontSize: "10px" }}>End Date</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm nepali-date" 
                            placeholder="YYYY-MM-DD"
                            value={adToBs(stage.plannedEndDate)}
                            onChange={(e) => {
                              const bsVal = e.target.value;
                              const adVal = bsToAd(bsVal);
                              const base = new Date(plannedStartDate);
                              const target = new Date(adVal);
                              const diffTime = target.getTime() - base.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              handleStageFieldChange(idx, "endOffset", diffDays);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-2xs font-bold text-muted uppercase d-block mb-4" style={{ fontSize: "10px" }}>Stage Lead / Operator</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={stage.operator}
                          placeholder="Operator name"
                          onChange={(e) => handleStageFieldChange(idx, "operator", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Production Notes */}
            <section className="pp-card p-24">
              <div className="pp-card-header mb-12">
                <div>
                  <h2 className="fs-18">4. Production Instructions / Notes</h2>
                  <p>Add special instructions for cutting, packing, or tailoring departments.</p>
                </div>
              </div>
              <textarea 
                className="form-control" 
                rows={3} 
                placeholder="E.g. Pack sizes individually. Ensure double stitches on all stress points."
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
              />
            </section>
          </main>

          {/* Sidebar: Summary Panels */}
          <aside className="plan-basket-panel">
            {/* Account / Source summary */}
            <div className="plan-basket-header">
              <div>
                <h2>Source Account</h2>
                <p>{tempData.kind === "customer" ? "Customer Profile" : "Outlet Profile"}</p>
              </div>
            </div>
            
            <div className="customer-profile-card">
              <div className="d-flex align-items-center gap-12">
                <div className="profile-header-icon">
                  <MaterialIcon name={tempData.kind === "customer" ? "person" : "storefront"} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong className="fs-14 text-dark d-block truncate" style={{ lineHeight: "1.2" }}>
                    {tempData.sourceDetail?.customerName || tempData.sourceDetail?.name}
                  </strong>
                  <span className="text-xs text-muted d-block mt-2">
                    {tempData.sourceDetail?.customerCode || tempData.sourceDetail?.outletCode}
                  </span>
                </div>
              </div>
              <div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Location:</span>
                  <span className="profile-info-value" title={tempData.sourceDetail?.address || tempData.sourceDetail?.location}>
                    {tempData.sourceDetail?.address || tempData.sourceDetail?.location}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    {tempData.kind === "customer" ? "Payment terms:" : "Manager:"}
                  </span>
                  <span className="profile-info-value">
                    {tempData.sourceDetail?.paymentTerms || tempData.sourceDetail?.manager}
                  </span>
                </div>
                {tempData.sourceDetail?.phone && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Contact:</span>
                    <span className="profile-info-value">{tempData.sourceDetail?.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Content Summary */}
            <div className="plan-basket-header">
              <div>
                <h2>Basket Items ({tempData.basket.length})</h2>
                <p>Garments sent to production</p>
              </div>
            </div>

            <div className="plan-basket-items mb-20" style={{ maxHeight: "300px", overflowY: "auto" }}>
              {tempData.basket.map((item: any) => (
                <div key={item.id} className="p-12 mb-8 border rounded-12 bg-white d-flex align-items-center gap-12">
                  <img src={item.productImage} alt={item.productName} className="rounded-8" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <strong className="fs-12 text-dark d-block truncate">{item.productName}</strong>
                    <span className="text-xs text-muted d-block">{item.variant} | {item.quantity} pcs</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan summary info */}
            <div className="plan-basket-summary border-top pt-16 mt-16">
              <div className="d-flex justify-content-between mb-8 fs-12">
                <span>Total Items:</span>
                <strong className="text-dark">{tempData.basket.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-16 fs-12">
                <span>Total Quantity:</span>
                <strong className="text-dark fs-14">{totalQuantity.toLocaleString()} pcs</strong>
              </div>
            </div>

            {/* Materials Preview Check */}
            <div className="border rounded-12 p-16 bg-light d-flex flex-column gap-12">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-12 font-bold text-dark">Material Checklist</span>
                <button 
                  type="button" 
                  className="btn btn-outline btn-xs py-2 px-8 text-xs font-bold"
                  onClick={handleCheckMaterials}
                >
                  Verify Stock
                </button>
              </div>
              
              {materialChecked ? (
                <div className="d-flex flex-column gap-6" style={{ maxHeight: "160px", overflowY: "auto" }}>
                  {materialsList.map(mat => (
                    <div key={mat.materialCode} className="d-flex justify-content-between align-items-center fs-11">
                      <span className="truncate pr-8" style={{ maxWidth: "130px" }}>{mat.materialName}</span>
                      <div className="d-flex align-items-center gap-4">
                        <span className="text-muted">{Math.ceil(mat.requiredQty)} {mat.unit}</span>
                        <span className={`badge py-2 px-6 rounded-8 text-2xs ${mat.status === "Shortage" ? "bg-red text-white" : "bg-green text-white"}`}>
                          {mat.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted my-10">Click Verify Stock to check material shortages.</p>
              )}
            </div>

            {/* Submission Actions */}
            <div className="d-flex flex-column gap-10 mt-20">
              <button
                type="submit"
                className="btn btn-primary full-width font-bold py-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Saving Plan..."
                ) : (
                  <>
                    <MaterialIcon name="check_circle" />
                    Confirm & Create Plan
                  </>
                )}
              </button>
              
              <Link 
                href={tempData.kind === "customer" ? `/Production/Customer/CreateCustomer?customerId=${tempData.selectedSourceId}` : `/Production/Outlet/CreateOutlet?outletId=${tempData.selectedSourceId}`}
                className="btn btn-outline full-width text-center"
              >
                Cancel Configuration
              </Link>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
