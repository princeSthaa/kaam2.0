"use client";

const S_stage = {
  flexBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  btnAddStage: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1.5px dashed #86efac", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  stageHeaderRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", marginBottom: 4, border: "1px solid #e2e8f0" },
  stageHeaderLabel: { fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: "JetBrains Mono, monospace" },
  stageRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", transition: "border-color 0.2s, box-shadow 0.2s" },
  stageIndex: { width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  stageInputs: { display: "grid", gridTemplateColumns: "1.8fr 1.2fr 120px 120px", gap: 8, flex: 1 },
  stageThinInput: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const },
  stageThinSelect: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const, cursor: "pointer" },
  btnDanger: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px", borderRadius: 7, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", transition: "all 0.18s" },
};

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import { checkMaterials } from "../../api/production.api";
import "./styles/create-customer-plan.css";

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

const defaultWorkCentersList = [
  { id: "wc-001", name: "Line 1 - Automated Cutting", type: "Cutting", productionLine: "Sewing Line 1", status: "Available" },
  { id: "wc-002", name: "Line 1 - Main Sewing Floor A", type: "Sewing", productionLine: "Sewing Line 1", status: "Available" },
  { id: "wc-003", name: "Line 1 - Assembly & Stitching", type: "Assembly", productionLine: "Sewing Line 1", status: "Available" },
  { id: "wc-004", name: "Line 1 - QC & Steam Finishing", type: "Finishing", productionLine: "Sewing Line 1", status: "Available" },
  { id: "wc-005", name: "Line 2 - Heavy Fabric Cutting", type: "Cutting", productionLine: "Sewing Line 2", status: "Available" },
  { id: "wc-006", name: "Line 2 - Main Sewing Floor B", type: "Sewing", productionLine: "Sewing Line 2", status: "Available" },
  { id: "wc-007", name: "Line 2 - Zipper & Pocket Assembly", type: "Assembly", productionLine: "Sewing Line 2", status: "Available" },
  { id: "wc-008", name: "Line 2 - QC & Final Packing", type: "Finishing", productionLine: "Sewing Line 2", status: "Available" },
  { id: "wc-009", name: "Sports Line - Sublimation & Pattern Cut", type: "Cutting", productionLine: "Sports Uniform Line", status: "Available" },
  { id: "wc-010", name: "Sports Line - Elastic & Overlock Sewing", type: "Sewing", productionLine: "Sports Uniform Line", status: "Available" },
  { id: "wc-011", name: "Sports Line - Logo & Number Assembly", type: "Assembly", productionLine: "Sports Uniform Line", status: "Available" },
  { id: "wc-012", name: "Sports Line - Quality Inspection & Tagging", type: "Finishing", productionLine: "Sports Uniform Line", status: "Available" },
  { id: "wc-013", name: "Jacket Line - Leather/Fleece Precision Cut", type: "Cutting", productionLine: "Jacket Section", status: "Available" },
  { id: "wc-014", name: "Jacket Line - Padding & Lining Stitching", type: "Sewing", productionLine: "Jacket Section", status: "Available" },
  { id: "wc-015", name: "Jacket Line - Heavy Zip & Hardware Assembly", type: "Assembly", productionLine: "Jacket Section", status: "Available" },
  { id: "wc-016", name: "Jacket Line - Thermal Press & Quality Audit", type: "Finishing", productionLine: "Jacket Section", status: "Available" },
  { id: "wc-017", name: "Subcontract - External Cutting Workshop", type: "Cutting", productionLine: "External Workshop", status: "Available" },
  { id: "wc-018", name: "Subcontract - Outer Workshop Stitching", type: "Sewing", productionLine: "External Workshop", status: "Available" },
  { id: "wc-019", name: "Subcontract - Assembly & Packing Station", type: "Assembly", productionLine: "External Workshop", status: "Available" },
  { id: "cdc188c0-4efa-46d6-a5e6-7598e7d8c62f", name: "Cutter Auto-B", type: "Cutting", productionLine: "General", status: "Available" },
  { id: "c8542ad2-0bbd-42cf-a17c-4d073babd8fe", name: "QC Station 1", type: "QC Station", productionLine: "General", status: "Available" },
  { id: "150a0fb1-2eb1-4576-b743-83beb121d65f", name: "Finishing Station", type: "Finishing", productionLine: "General", status: "Available" }
];

export default function CreateCustomerPlanPage() {
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
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [productDates, setProductDates] = useState<Record<string, { start: string, end: string, required: string }>>({});
  const [productStages, setProductStages] = useState<Record<string, any[]>>({});
  const [productionNotes, setProductionNotes] = useState("");
  const [materialChecked, setMaterialChecked] = useState(false);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [isCheckingMaterials, setIsCheckingMaterials] = useState(false);
  const [stockCheckSummary, setStockCheckSummary] = useState<{ total: number; shortages: number; status: "success" | "warning" | "idle" }>({ total: 0, shortages: 0, status: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [backendWorkCenters, setBackendWorkCenters] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5083/api/work-center")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBackendWorkCenters(data);
        }
      })
      .catch(err => {
        console.warn("Backend API work centers fetch failed, using default workcenters.json store:", err);
      });
  }, []);

  const primaryAssemblyLines = useMemo(() => {
    const list = backendWorkCenters.length > 0 ? backendWorkCenters : defaultWorkCentersList;
    const linesSet = new Set<string>();
    list.forEach(wc => {
      if (wc.productionLine && wc.productionLine !== "General") {
        linesSet.add(wc.productionLine);
      }
    });
    if (linesSet.size === 0) {
      return ["Sewing Line 1", "Sewing Line 2", "Sports Uniform Line", "Jacket Section", "External Workshop"];
    }
    return Array.from(linesSet);
  }, [backendWorkCenters]);

  const availableWorkCenters = useMemo(() => {
    const rawList = backendWorkCenters.length > 0 ? backendWorkCenters : defaultWorkCentersList;
    const list = rawList.filter(wc => !(wc.name || "").startsWith("Work Center "));

    if (!productionLine) return list;

    const filtered = list.filter(wc => {
      if (wc.productionLine === productionLine) return true;
      if (wc.productionLine === "General") return true;

      const pLine = productionLine.toLowerCase();
      const wcLine = (wc.productionLine || "").toLowerCase();
      const wcName = (wc.name || "").toLowerCase();

      if (pLine.includes("line 1") && (wcName.includes("line 1") || wcLine.includes("line 1"))) return true;
      if (pLine.includes("line 2") && (wcName.includes("line 2") || wcLine.includes("line 2"))) return true;
      if (pLine.includes("sports") && (wcName.includes("sports") || wcLine.includes("sports"))) return true;
      if (pLine.includes("jacket") && (wcName.includes("jacket") || wcLine.includes("jacket"))) return true;
      if (pLine.includes("external") && (wcName.includes("subcontract") || wcName.includes("external") || wcLine.includes("external"))) return true;

      return false;
    });

    return filtered.length > 0 ? filtered : list;
  }, [backendWorkCenters, productionLine]);

  const addStage = (productId: string) => {
    setProductStages(prev => {
      const stages = prev[productId] || [];
      const defaultWc = availableWorkCenters[0]?.name || "Line 1 - Automated Cutting";
      const newStage = {
        stageId: `STG-00${stages.length + 1}`,
        stageName: "New Stage",
        workCenter: defaultWc,
        plannedStartDate: new Date().toISOString().split("T")[0],
        plannedEndDate: new Date().toISOString().split("T")[0]
      };
      return { ...prev, [productId]: [...stages, newStage] };
    });
  };

  const removeStage = (productId: string, idx: number) => {
    setProductStages(prev => {
      const stages = prev[productId] || [];
      return { ...prev, [productId]: stages.filter((_, i) => i !== idx) };
    });
  };

  const updateStage = (productId: string, idx: number, field: string, value: any) => {
    setProductStages(prev => {
      const stages = prev[productId] || [];
      const newStages = stages.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      return { ...prev, [productId]: newStages };
    });
  };

  const adToBs = (adStr: string): string => {
    if (!adStr) return "";
    const datePart = String(adStr).split("T")[0].trim();
    if (!datePart) return "";

    const year = parseInt(datePart.split("-")[0], 10);
    if (!isNaN(year) && year >= 2070 && year <= 2100) return datePart;

    if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
      try {
        const bsVal = (window as any).NepaliFunctions.AD2BS(datePart, "YYYY-MM-DD", "YYYY-MM-DD");
        if (bsVal) return typeof bsVal === "string" ? bsVal : `${bsVal.year}-${String(bsVal.month).padStart(2, '0')}-${String(bsVal.day).padStart(2, '0')}`;
      } catch (e) { }
    }

    const parts = datePart.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const bsYear = y + (m > 3 || (m === 3 && d >= 14) ? 57 : 56);
        const bsMonthNum = ((m + 8) % 12) + 1;
        const mStr = String(bsMonthNum).padStart(2, "0");
        const dStr = String(d).padStart(2, "0");
        return `${bsYear}-${mStr}-${dStr}`;
      }
    }
    return datePart;
  };

  const bsToAd = (bsStr: string): string => {
    if (!bsStr) return "";
    const datePart = String(bsStr).split("T")[0].trim();
    if (!datePart) return "";

    const year = parseInt(datePart.split("-")[0], 10);
    if (!isNaN(year) && year >= 1940 && year <= 2050) return datePart;

    if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
      try {
        const adVal = (window as any).NepaliFunctions.BS2AD(datePart, "YYYY-MM-DD", "YYYY-MM-DD");
        if (adVal) return typeof adVal === "string" ? adVal : `${adVal.year}-${String(adVal.month).padStart(2, '0')}-${String(adVal.day).padStart(2, '0')}`;
      } catch (e) { }
    }

    const parts = datePart.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const adYear = y - (m > 8 || (m === 8 && d >= 1) ? 57 : 56);
        const adMonthNum = ((m + 3) % 12) + 1;
        const mStr = String(adMonthNum).padStart(2, "0");
        const dStr = String(d).padStart(2, "0");
        return `${adYear}-${mStr}-${dStr}`;
      }
    }
    return datePart;
  };

  useEffect(() => {
    if (tempData?.basket && Object.keys(productStages).length === 0) {
      const initialStages: Record<string, any[]> = {};
      const initialDates: Record<string, any> = {};

      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() + 1);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setDate(defaultEnd.getDate() + 14);

      tempData.basket.forEach((item: any) => {
        const rawReq = item.deliveryDate || item.requiredDate || defaultEnd.toISOString().split("T")[0];
        const cleanReq = String(rawReq).split("T")[0];
        initialDates[item.id] = {
          start: adToBs(defaultStart.toISOString().split("T")[0]),
          end: adToBs(defaultEnd.toISOString().split("T")[0]),
          required: adToBs(cleanReq)
        };

        initialStages[item.id] = [
          { stageId: "STG-001", stageName: "Material Check", workCenter: "Line 1 - Automated Cutting", workCenterId: "wc-001", operator: "Ram Bahadur", startOffset: 0, endOffset: 1 },
          { stageId: "STG-002", stageName: "Cutting", workCenter: "Line 1 - Automated Cutting", workCenterId: "wc-001", operator: "Sita Kumari", startOffset: 2, endOffset: 4 },
          { stageId: "STG-003", stageName: "Stitching / Sewing", workCenter: "Line 1 - Main Sewing Floor A", workCenterId: "wc-002", operator: "Gopal Shrestha", startOffset: 5, endOffset: 12 },
          { stageId: "STG-004", stageName: "Finishing", workCenter: "Line 1 - QC & Steam Finishing", workCenterId: "wc-004", operator: "Nabina Thapa", startOffset: 13, endOffset: 14 }
        ].map(s => {
          const start = new Date(defaultStart);
          start.setDate(start.getDate() + s.startOffset);
          const end = new Date(defaultStart);
          end.setDate(end.getDate() + s.endOffset);
          return { ...s, plannedStartDate: adToBs(start.toISOString().split("T")[0]), plannedEndDate: adToBs(end.toISOString().split("T")[0]) };
        });
      });
      setProductDates(initialDates);
      setProductStages(initialStages);
    }
  }, [tempData, productStages]);

  const searchParams = useSearchParams();
  const editPlanId = searchParams.get("editPlanId");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (editPlanId) {
        Promise.all([
          fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(editPlanId)}`).then((res) => (res.ok ? res.json() : null)),
          fetch("http://localhost:5083/api/production-plan-product").then((res) => (res.ok ? res.json() : [])),
        ])
          .then(([data, allProducts]) => {
            if (data) {
              setPlanNo(data.planId || data.planNo || editPlanId);
              setPlanName(data.planName || "");
              setPlanDate(data.planDate ? data.planDate.split("T")[0] : "");
              setPriority(data.priority || "Normal");
              setLeadPlanner(data.supervisor || "");
              setOutputDestination(data.outputDestination || "Finished Goods Warehouse");
              setProductionLine(data.productionLine || "Sewing Line 1");
              setMaterialWarehouse(data.materialWarehouse || "Central Raw Material Hub");
              setProductionNotes(data.productionNotes || "");

              const prods = data.productionPlanProducts?.length
                ? data.productionPlanProducts
                : allProducts.filter((product: any) => String(product.productionPlanId) === String(data.id));
              const mappedBasket = prods.map((p: any, i: number) => ({
                id: p.id || `edit-prod-${i}`,
                productId: p.productId || "PRD-001",
                productName: p.productName || "Garment Item",
                variant: p.variant || "Standard",
                quantity: Number(p.quantity) || 1,
                productImage: p.productImage || "/images/products/polo-shirt.jpg",
                deliveryDate: p.requiredDate || p.plannedCompletionDate,
              }));

              setTempData({
                kind: data.demandType === "Customer Order" ? "customer" : "outlet",
                selectedSourceId: data.sourceId || "",
                sourceDetail: {
                  customerName: data.sourceName || "Customer",
                  name: data.sourceName || "Customer",
                  address: "Kathmandu Valley Hub",
                  paymentTerms: "Net 30",
                },
                basket: mappedBasket,
              });
            }
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Error loading plan to edit:", err);
            setIsLoading(false);
          });
        return;
      }

      const dataStr = localStorage.getItem("temp_plan_basket");
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          setTempData(parsed);

          const today = new Date();
          const dateStr = today.toISOString().split("T")[0];
          const bsDateStr = adToBs(dateStr);
          const rand = Math.floor(100 + Math.random() * 900);
          const generatedPlanNo = `PP-${dateStr.replaceAll("-", "")}-${rand}`;

          setPlanNo(generatedPlanNo);
          setPlanDate(bsDateStr);

          const sourceName = parsed.kind === "customer"
            ? parsed.sourceDetail?.customerName
            : parsed.sourceDetail?.name;
          setPlanName(`Production Plan - ${sourceName || "Stock"} (${bsDateStr})`);

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
  }, [editPlanId]);

  const handleCheckMaterials = async () => {
    if (!tempData || !tempData.basket.length) return;
    setIsCheckingMaterials(true);

    try {
      const productsPayload = tempData.basket.map((item: any) => ({
        productId: item.productId || "PRD-001",
        quantity: Number(item.quantity) || 1
      }));

      let finalMaterials: any[] = [];

      try {
        const res = await checkMaterials(productsPayload);
        if (res && Array.isArray(res.materials) && res.materials.length > 0) {
          finalMaterials = res.materials.map((m: any) => ({
            materialCode: m.materialCode || m.materialId,
            materialName: m.materialName || "Material",
            requiredQty: Number(m.requiredQty) || 0,
            availableQty: Number(m.availableQty) || 0,
            unit: m.unit || "pcs",
            shortageQty: Math.max((Number(m.requiredQty) || 0) - (Number(m.availableQty) || 0), 0),
            status: m.status || ((Number(m.requiredQty) || 0) > (Number(m.availableQty) || 0) ? "Shortage" : "Available")
          }));
        }
      } catch (err) {
        console.warn("Backend stock check failed or unmapped product, using fallback BOM calculation:", err);
      }

      if (finalMaterials.length === 0) {
        const calculated: { [key: string]: any } = {};

        tempData.basket.forEach((item: any) => {
          let boms = mockBoms.filter(b => b.productId === item.productId);
          if (boms.length === 0) {
            boms = [
              { productId: item.productId, materialId: "MAT-001", qtyPerUnit: 1.8, wastagePercent: 5 },
              { productId: item.productId, materialId: "MAT-006", qtyPerUnit: 0.2, wastagePercent: 2 },
              { productId: item.productId, materialId: "MAT-008", qtyPerUnit: 6, wastagePercent: 2 },
              { productId: item.productId, materialId: "MAT-010", qtyPerUnit: 1, wastagePercent: 0 },
              { productId: item.productId, materialId: "MAT-011", qtyPerUnit: 1, wastagePercent: 0 }
            ];
          }
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

        finalMaterials = Object.values(calculated).map(mat => {
          const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
          return {
            ...mat,
            shortageQty,
            status: shortageQty > 0 ? "Shortage" : "Available",
          };
        });
      }

      const shortageCount = finalMaterials.filter(m => m.status === "Shortage" || m.shortageQty > 0).length;
      setMaterialsList(finalMaterials);
      setMaterialChecked(true);
      setStockCheckSummary({
        total: finalMaterials.length,
        shortages: shortageCount,
        status: shortageCount > 0 ? "warning" : "success"
      });
    } catch (e) {
      console.error("Stock verification failed:", e);
    } finally {
      setIsCheckingMaterials(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
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
    setIsSubmitting(true);
    setValidationError("");

    const sourceName = tempData.kind === "customer"
      ? tempData.sourceDetail?.customerName
      : tempData.sourceDetail?.name;

    const basketItems = tempData.basket;
    const totalQuantity = basketItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    const requiredDates = basketItems
      .map((item: any) => item.deliveryDate || item.requiredDate)
      .filter(Boolean)
      .sort();
    const earliestRequiredDate = requiredDates[0] || new Date().toISOString();
    const globalStartDate = Object.values(productDates).map(d => new Date(d.start).getTime()).sort()[0] || Date.now();
    const globalEndDate = Object.values(productDates).map(d => new Date(d.end).getTime()).sort((a, b) => b - a)[0] || Date.now();

    const userPlanNo = planNo || `PP-${Date.now()}`;
    // The API stores plans, stages, and plan-products as Guid keys.
    const planDbId = crypto.randomUUID();

    const isGuid = (value: unknown): value is string =>
      typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

    const finalStages = basketItems.flatMap((prod: any) => {
      const pStages = productStages[prod.id] || [];
      return pStages.flatMap((stage: any, sIdx: number) => {
        let wcId = stage.workCenterId;
        // Only persisted work centers can be used in a production-plan stage.
        // `availableWorkCenters` also contains UI fallbacks, which do not exist
        // in the database and would violate the stage foreign-key constraint.
        const matchedWc = backendWorkCenters.find((w: any) =>
          w.id === wcId || w.name === stage.workCenter || w.id === stage.workCenter
        );
        if (matchedWc) {
          wcId = matchedWc.id;
        } else {
          wcId = "";
        }

        // The backend has no work centers seeded yet. Do not send the UI's
        // placeholder IDs (for example, "wc-001") to a Guid field.
        if (!isGuid(wcId)) return [];

        const startISO = stage.plannedStartDate ? new Date(bsToAd(stage.plannedStartDate)).toISOString() : new Date().toISOString();
        const endISO = stage.plannedEndDate ? new Date(bsToAd(stage.plannedEndDate)).toISOString() : new Date().toISOString();
        const serialNo = String(sIdx + 1).padStart(2, "0");

        return [{
          id: crypto.randomUUID(),
          stageId: `STG-${serialNo}`,
          stageName: stage.stageName ? stage.stageName : `${prod.productName || 'Product'} - Stage ${sIdx + 1}`,
          workCenterId: wcId,
          productionPlanId: planDbId,
          plannedStartDate: startISO,
          plannedEndDate: endISO,
          status: "NotStarted",
          completedQty: 0,
          rejectedQty: 0,
          operatorName: stage.operator || "",
          createdAt: new Date(Date.now() + sIdx * 100).toISOString()
        }];
      });
    });

    const validPriority = priority === "Critical" ? "Critical"
      : priority === "High" ? "High"
        : priority === "Low" ? "Low"
          : priority === "Urgent" ? "Urgent"
            : "Medium";

    const mapSizeEnum = (s: string) => {
      const u = (s || "").toUpperCase().trim();
      return ["XS", "S", "M", "L", "XL", "XXL"].includes(u) ? u : "M";
    };

    const newPlan = {
      id: planDbId,
      planId: userPlanNo,
      batchId: `BATCH-${Date.now()}`,
      planName,
      demandType: tempData.kind === "customer" ? "Customer Order" : "Outlet Replenishment",
      sourceId: tempData.selectedSourceId || "",
      sourceName: sourceName || "Internal",
      priority: validPriority,
      status: isDraft ? "Draft" : "Active",
      plannedStartDate: new Date(globalStartDate).toISOString(),
      plannedCompletionDate: new Date(globalEndDate).toISOString(),
      quantity: totalQuantity,
      supervisor: leadPlanner,
      productionLine,
      materialWarehouse,
      productionNotes: productionNotes || "Created from planning basket",
      planDate: planDate ? new Date(bsToAd(planDate)).toISOString() : new Date().toISOString(),
      outputDestination,
      requiredDate: earliestRequiredDate ? new Date(bsToAd(earliestRequiredDate)).toISOString() : new Date().toISOString(),
      progress: 0,
      blocked: false,
      createdAt: new Date().toISOString(),
      sourceOrderIds: [...new Set(basketItems.map((item: any) => item.orderId).filter(isGuid))],
      productionPlanProducts: basketItems.map((item: any, idx: number) => {
        const prodDbId = crypto.randomUUID();
        const itemStart = productDates[item.id]?.start ? new Date(bsToAd(productDates[item.id].start)).toISOString() : new Date(globalStartDate).toISOString();
        const itemEnd = productDates[item.id]?.end ? new Date(bsToAd(productDates[item.id].end)).toISOString() : new Date(globalEndDate).toISOString();
        const itemReq = productDates[item.id]?.required ? new Date(bsToAd(productDates[item.id].required)).toISOString() : new Date().toISOString();

        return {
          id: prodDbId,
          productionPlanId: planDbId,
          lineId: `${planDbId}-L${idx + 1}`,
          orderNo: item.orderNo || item.demandNo || "ORD-001",
          productId: item.productId || "PRD-001",
          productCode: item.productCode || "PRD-001",
          productName: item.productName || "Product",
          category: item.category || "Garment",
          variant: item.variant || "Standard",
          quantity: Number(item.quantity) || 1,
          requiredDate: itemReq,
          status: isDraft ? "Draft" : "Active",
          productImage: item.productImage || "",
          plannedStartDate: itemStart,
          plannedCompletionDate: itemEnd,
          priority: validPriority,
          productionNotes: item.productionNotes || productionNotes || "Created from planning basket.",
          createdAt: new Date().toISOString(),
          productionPlanProductSizes: Object.entries(item.sizes || {}).map(([size, quantity], sIdx) => ({
            id: crypto.randomUUID(),
            productionPlanProductId: prodDbId,
            size: mapSizeEnum(size),
            quantity: Number(quantity),
            createdAt: new Date().toISOString()
          }))
        };
      }),
      productionPlanStages: finalStages
    };

    try {
      const response = await fetch("http://localhost:5083/api/production-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan)
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error when saving plan:", response.status, errText);
        throw new Error(`Failed to save plan: ${errText || response.statusText}`);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("temp_plan_basket");
      }
      setIsSubmitting(false);
      router.push(isDraft ? "/production/drafts" : "/production/plans");
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || "Failed to save to backend.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ccp-container text-center py-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-16 text-muted">Retrieving plan parameters...</p>
      </div>
    );
  }

  if (!tempData || !tempData.basket.length) {
    return (
      <div className="ccp-container">
        <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "16px", padding: "32px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
          <span className="ccp-icon" style={{ fontSize: "48px", marginBottom: "16px", color: "#dc2626" }}>
            warning
          </span>
          <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>Planning Session Expired</h3>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>No items were found in your planning basket. Please return to the catalog and select items.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/production/demands/catalog/customer" className="ccp-btn ccp-btn-primary">
              Customer Catalog
            </Link>
            <Link href="/production/demands/catalog/outlet" className="ccp-btn ccp-btn-outline">
              Outlet Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalQuantity = tempData.basket.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="ccp-container">
      {/* Page Header */}
      <div className="ccp-header-card">
        <div className="ccp-header-title-group">
          <h1>Configure Plan Details</h1>
          <p>Provide schedule dates, work center assignments, and stage deadlines to finalize the production run.</p>
        </div>
        <div>
          <Link
            href={tempData.kind === "customer" ? `/production/demands/customer?customerId=${tempData.selectedSourceId}` : `/production/demands/outlet?outletId=${tempData.selectedSourceId}`}
            className="ccp-btn ccp-btn-outline"
          >
            <span className="ccp-icon">arrow_back</span>
            Back to Basket
          </Link>
        </div>
      </div>

      {validationError && (
        <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
          <span className="ccp-icon">error</span>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="ccp-layout-grid">
          {/* Main Content Area */}
          <main className="ccp-main-content">
            {/* 1. General Production Information */}
            <section className="ccp-card">
              <div className="ccp-card-header">
                <h2>1. General Production Information</h2>
                <p>Define identification details and priority for this plan.</p>
              </div>

              <div className="ccp-form-grid-2">
                <div className="ccp-form-group">
                  <label htmlFor="planNo" className="ccp-label">Plan Code / No</label>
                  <input type="text" id="planNo" className="ccp-input readonly" value={planNo} readOnly />
                </div>
                <div className="ccp-form-group">
                  <label htmlFor="planDate" className="ccp-label">Plan Date (BS)</label>
                  <input type="text" id="planDate" className="ccp-input readonly" value={adToBs(planDate)} readOnly />
                </div>
                <div className="ccp-form-group full">
                  <label htmlFor="planName" className="ccp-label">Production Plan Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    id="planName"
                    className="ccp-input"
                    placeholder="Enter descriptive name for the production plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                  />
                </div>
                <div className="ccp-form-group">
                  <label htmlFor="leadPlanner" className="ccp-label">Lead Planner / Supervisor <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    id="leadPlanner"
                    className="ccp-input"
                    placeholder="E.g. Ramesh Shrestha"
                    value={leadPlanner}
                    onChange={(e) => setLeadPlanner(e.target.value)}
                    required
                  />
                </div>
                <div className="ccp-form-group">
                  <label htmlFor="priority" className="ccp-label">Production Priority</label>
                  <select
                    id="priority"
                    className="ccp-select"
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

            {/* 2. Facilities & Logistics */}
            <section className="ccp-card">
              <div className="ccp-card-header">
                <h2>2. Facilities & Logistics</h2>
                <p>Assign assembly line, inventory sources, and output storage locations.</p>
              </div>

              <div className="ccp-form-grid-2">
                <div className="ccp-form-group">
                  <label htmlFor="productionLine" className="ccp-label">Primary Assembly Line</label>
                  <select
                    id="productionLine"
                    className="ccp-select"
                    value={productionLine}
                    onChange={(e) => setProductionLine(e.target.value)}
                  >
                    {primaryAssemblyLines.map((lineName: string) => (
                      <option key={lineName} value={lineName}>
                        {lineName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ccp-form-group">
                  <label htmlFor="materialWarehouse" className="ccp-label">Raw Material Hub</label>
                  <select
                    id="materialWarehouse"
                    className="ccp-select"
                    value={materialWarehouse}
                    onChange={(e) => setMaterialWarehouse(e.target.value)}
                  >
                    <option value="Central Raw Material Hub">Central Raw Material Hub (Balaju)</option>
                    <option value="Transit Accessories Store">Transit Accessories Store (Koteshwor)</option>
                    <option value="Pokhara Local Store">Pokhara Local Store (Lakeside)</option>
                  </select>
                </div>
                <div className="ccp-form-group full">
                  <label htmlFor="outputDestination" className="ccp-label">Finished Output Destination</label>
                  <select
                    id="outputDestination"
                    className="ccp-select"
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

            {/* 3. Product-Specific Timelines & Stages */}
            <section className="ccp-card">
              <div className="ccp-card-header">
                <h2>3. Product-Specific Timelines & Stages</h2>
                <p>Adjust dates and stage schedules individually for each product.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {tempData.basket.map((item: any, pIdx: number) => {
                  const isExpanded = expandedProductId === item.id;
                  const pd = productDates[item.id] || { start: new Date().toISOString().split("T")[0], end: new Date().toISOString().split("T")[0], required: new Date().toISOString().split("T")[0] };
                  const pStages = productStages[item.id] || [];

                  return (
                    <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", backgroundColor: isExpanded ? "#f8fafc" : "#ffffff", transition: "all 0.2s" }}>
                      <div
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: "pointer", borderBottom: isExpanded ? "1px solid #e2e8f0" : "none" }}
                        onClick={() => setExpandedProductId(isExpanded ? null : item.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 12 }}>{pIdx + 1}</div>
                          <img src={item.productImage} alt={item.productName} style={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover" }} />
                          <div>
                            <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "#0f172a" }}>{item.productName}</h4>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{item.variant} &bull; {item.quantity} pcs</div>
                          </div>
                        </div>
                        <span className="ccp-icon" style={{ color: "#94a3b8" }}>
                          {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: "16px", backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Planned Start (BS)</label>
                              <NepaliDatePicker className="ccp-input" value={adToBs(pd.start)}
                                onChange={(e: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, start: bsToAd(e.target.value) } }))}
                                onDateChange={(bsVal: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, start: bsToAd(bsVal) } }))} />
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Planned End (BS)</label>
                              <NepaliDatePicker className="ccp-input" value={adToBs(pd.end)}
                                onChange={(e: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, end: bsToAd(e.target.value) } }))}
                                onDateChange={(bsVal: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, end: bsToAd(bsVal) } }))} />
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Required By (BS)</label>
                              <NepaliDatePicker className="ccp-input" value={adToBs(pd.required)}
                                onChange={(e: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, required: bsToAd(e.target.value) } }))}
                                onDateChange={(bsVal: any) => setProductDates(prev => ({ ...prev, [item.id]: { ...pd, required: bsToAd(bsVal) } }))} />
                            </div>
                          </div>

                          <div>
                            <div style={{ ...S_stage.flexBetween, marginBottom: 10, marginTop: 16 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="ccp-icon" style={{ fontSize: 14 }}>timeline</span> Operational Routing Stages
                              </div>
                              <button type="button" onClick={() => addStage(item.id)} style={S_stage.btnAddStage}>
                                <span className="ccp-icon" style={{ fontSize: 15 }}>add</span> Add Stage
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {pStages.length > 0 && (
                                <div style={S_stage.stageHeaderRow}>
                                  <span style={{ width: 16 }} />
                                  <span style={{ width: 24, textAlign: "center", ...S_stage.stageHeaderLabel }}>#</span>
                                  <div style={S_stage.stageInputs}>
                                    <span style={S_stage.stageHeaderLabel}>Stage Name</span>
                                    <span style={S_stage.stageHeaderLabel}>Work Center</span>
                                    <span style={S_stage.stageHeaderLabel}>Start Date (BS)</span>
                                    <span style={S_stage.stageHeaderLabel}>End Date (BS)</span>
                                  </div>
                                  <span style={{ width: 26 }} />
                                </div>
                              )}
                              {pStages.map((stage: any, si: number) => (
                                <div key={si} style={S_stage.stageRow}>
                                  <span className="ccp-icon" style={{ fontSize: 16, color: "#cbd5e1", cursor: "grab" }}>drag_indicator</span>
                                  <div style={S_stage.stageIndex}>{si + 1}</div>
                                  <div style={S_stage.stageInputs}>
                                    <input style={S_stage.stageThinInput} type="text" value={stage.stageName} placeholder="Stage name"
                                      onChange={e => updateStage(item.id, si, "stageName", e.target.value)}
                                    />
                                    <select
                                      style={S_stage.stageThinSelect}
                                      value={stage.workCenter || ""}
                                      onChange={e => {
                                        const val = e.target.value;
                                        const selectedWc = availableWorkCenters.find(w => w.name === val || w.id === val);
                                        updateStage(item.id, si, "workCenter", selectedWc ? selectedWc.name : val);
                                        updateStage(item.id, si, "workCenterId", selectedWc ? selectedWc.id : val);
                                      }}
                                    >
                                      <option value="">-- Select Work Center --</option>
                                      {availableWorkCenters.map((wc: any) => (
                                        <option key={wc.id || wc.name} value={wc.name}>
                                          {wc.name} ({wc.type || "General"})
                                        </option>
                                      ))}
                                    </select>
                                    <NepaliDatePicker style={S_stage.stageThinInput} value={adToBs(stage.plannedStartDate)}
                                      onChange={(e: any) => updateStage(item.id, si, "plannedStartDate", bsToAd(e.target.value))}
                                      onDateChange={(bsVal: any) => updateStage(item.id, si, "plannedStartDate", bsToAd(bsVal))}
                                    />
                                    <NepaliDatePicker style={S_stage.stageThinInput} value={adToBs(stage.plannedEndDate)}
                                      onChange={(e: any) => updateStage(item.id, si, "plannedEndDate", bsToAd(e.target.value))}
                                      onDateChange={(bsVal: any) => updateStage(item.id, si, "plannedEndDate", bsToAd(bsVal))}
                                    />
                                  </div>
                                  <button type="button" onClick={() => removeStage(item.id, si)} style={S_stage.btnDanger}>
                                    <span className="ccp-icon" style={{ fontSize: 16 }}>delete</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Production Notes */}
            <section className="ccp-card">
              <div className="ccp-card-header">
                <h2>4. Production Instructions / Notes</h2>
                <p>Add special instructions for cutting, packing, or tailoring departments.</p>
              </div>
              <textarea
                className="ccp-textarea"
                rows={3}
                placeholder="E.g. Pack sizes individually. Ensure double stitches on all stress points."
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
              />
            </section>
          </main>

          {/* Sidebar Panel */}
          <aside className="ccp-sidebar-panel">
            {/* Source Account */}
            <div className="ccp-sidebar-section">
              <div className="ccp-sidebar-title">
                <h3>Source Account</h3>
                <p>{tempData.kind === "customer" ? "Customer Profile" : "Outlet Profile"}</p>
              </div>

              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="ccp-icon">{tempData.kind === "customer" ? "person" : "storefront"}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tempData.sourceDetail?.customerName || tempData.sourceDetail?.name}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                      {tempData.sourceDetail?.customerCode || tempData.sourceDetail?.outletCode}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", borderTop: "1px dashed #f1f5f9", paddingTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Location:</span>
                    <strong style={{ color: "#0f172a", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tempData.sourceDetail?.address || tempData.sourceDetail?.location}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>
                      {tempData.kind === "customer" ? "Payment terms:" : "Manager:"}
                    </span>
                    <strong style={{ color: "#0f172a" }}>
                      {tempData.sourceDetail?.paymentTerms || tempData.sourceDetail?.manager}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Basket Items Summary */}
            <div className="ccp-sidebar-section">
              <div className="ccp-sidebar-title">
                <h3>Basket Items ({tempData.basket.length})</h3>
                <p>Garments sent to production</p>
              </div>

              <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {tempData.basket.map((item: any) => (
                  <div key={item.id} style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={item.productImage} alt={item.productName} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ fontSize: "12px", color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</strong>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>{item.variant} | {item.quantity} pcs</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Total Items:</span>
                  <strong style={{ color: "#0f172a" }}>{tempData.basket.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Total Quantity:</span>
                  <strong style={{ color: "#2563eb", fontSize: "14px" }}>{totalQuantity.toLocaleString()} pcs</strong>
                </div>
              </div>
            </div>

            {/* Material Check */}
            <div className="ccp-sidebar-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="ccp-sidebar-title">
                  <h3>Material Checklist</h3>
                </div>
                <button
                  type="button"
                  className="ccp-btn ccp-btn-outline"
                  style={{ padding: "4px 10px", fontSize: "11px" }}
                  onClick={handleCheckMaterials}
                  disabled={isCheckingMaterials}
                >
                  {isCheckingMaterials ? "Verifying..." : "Verify Stock"}
                </button>
              </div>

              {isCheckingMaterials ? (
                <div style={{ textAlign: "center", padding: "12px", fontSize: "12px", color: "#64748b" }}>
                  Checking live inventory & BOM stock...
                </div>
              ) : materialChecked ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {stockCheckSummary.status === "success" ? (
                    <div style={{ backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="ccp-icon" style={{ fontSize: 16 }}>check_circle</span>
                      <span>All materials are available in stock.</span>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="ccp-icon" style={{ fontSize: 16 }}>warning</span>
                      <span>{stockCheckSummary.shortages} material(s) have shortages.</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                    {materialsList.map(mat => (
                      <div key={mat.materialCode} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }}>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: 700, display: "block", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }} title={mat.materialName}>
                            {mat.materialName}
                          </span>
                          <span style={{ fontSize: "10px", color: "#64748b" }}>
                            Req: {Math.ceil(mat.requiredQty)} {mat.unit} | Avail: {Math.floor(mat.availableQty)} {mat.unit}
                          </span>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {mat.shortageQty > 0 ? (
                            <span style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                              Short: -{Math.ceil(mat.shortageQty)} {mat.unit}
                            </span>
                          ) : (
                            <span style={{ backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: "center", fontSize: "11px", color: "#64748b", margin: 0 }}>Click Verify Stock to check material shortages against BOM requirements.</p>
              )}
            </div>

            {/* Submission Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                className="ccp-btn ccp-btn-primary ccp-btn-full"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e as any, false)}
              >
                {isSubmitting ? (
                  "Saving Plan..."
                ) : (
                  <>
                    <span className="ccp-icon">check_circle</span>
                    Confirm & Create Plan
                  </>
                )}
              </button>

              <button
                type="button"
                className="ccp-btn ccp-btn-outline ccp-btn-full"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e as any, true)}
              >
                <span className="ccp-icon">save</span>
                Save as Draft
              </button>

              <Link
                href={tempData.kind === "customer" ? `/production/demands/customer?customerId=${tempData.selectedSourceId}` : `/production/demands/outlet?outletId=${tempData.selectedSourceId}`}
                className="ccp-btn ccp-btn-ghost ccp-btn-full"
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
