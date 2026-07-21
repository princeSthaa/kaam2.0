"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

/* ─── Mock Data ─────────────────────────────────────────────────── */
const mockWarehouses: any[] = [];

const mockProducts: any[] = [];

const mockFabrics: any[] = [];

const mockMaterials: any[] = [];

const mockBoms: any[] = [];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FABRIC_CATEGORIES = ["Cotton", "Pique", "Fleece"];
const WORK_CENTERS = ["QC Station 1", "Cutter Auto-B", "Line 4A", "Sewing Floor", "QC Table", "Packing Area", "Embroidery Unit"];

const formatRs = (v: number) => `Rs. ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Variant = { id: string; fabricId: string; fabricName: string; swatchColor: string; sizes: Record<string, number> };
type Stage   = { id: string; name: string; workCenter: string; leadHours: string; date: string };
type Product = { productId: string; productCode: string; productName: string; productImage: string; plannedStartDate: string; plannedCompletionDate: string; requiredDate: string; variants: Variant[]; stages: Stage[]; productionNotes: string; isExpanded: boolean };
type MatReq  = { materialCode: string; materialName: string; materialType: string; requiredQty: number; availableQty: number; shortageQty: number; unit: string; cost: number };



const mockCustomers: any[] = [];

/* ─── Inline styles ─────────────────────────────────────────────── */
const S = {
  // Layout
  page: { maxWidth: 1100, margin: "0 auto", paddingBottom: 80, display: "flex", flexDirection: "column" as const, gap: 28 },

  // Hero header
  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)",
    borderRadius: 20,
    padding: "32px 36px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
    position: "relative" as const,
    overflow: "hidden" as const,
    boxShadow: "0 20px 60px rgba(29,78,216,0.35), 0 4px 16px rgba(0,0,0,0.2)",
  },
  heroBlobA: { position: "absolute" as const, top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(96,165,250,0.12)", pointerEvents: "none" as const },
  heroBlobB: { position: "absolute" as const, bottom: -80, left: 120, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.15)", pointerEvents: "none" as const },
  heroLabel: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 24, padding: "4px 12px", marginBottom: 10, fontSize: 11, color: "#bfdbfe", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em", fontWeight: 600 },
  heroTitle: { margin: 0, color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em" },
  heroSub: { margin: "6px 0 0", color: "#93c5fd", fontSize: 13.5, fontWeight: 400, lineHeight: 1.5 },
  heroBadge: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.14)", fontSize: 12, color: "#e0f2fe", fontFamily: "JetBrains Mono, monospace" },

  // Action buttons in hero
  heroActions: { display: "flex", gap: 10, flexShrink: 0, zIndex: 1 },
  btnOutlineWhite: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.2s", textDecoration: "none", height: 40 },
  btnSolidWhite: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#fff", border: "none", color: "#1e3a8a", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", textDecoration: "none", height: 40 },

  // Step indicator
  stepRow: { display: "flex", gap: 0, alignItems: "stretch" },
  stepItem: (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: active ? "#eff6ff" : "#fff",
    border: "1px solid",
    borderColor: active ? "#bfdbfe" : "#e5e7eb",
    borderRight: "none",
    transition: "all 0.25s",
  }),
  stepNumBubble: (active: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: "50%",
    background: active ? "#2563eb" : "#e5e7eb",
    color: active ? "#fff" : "#9ca3af",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800, flexShrink: 0,
    transition: "all 0.25s",
    boxShadow: active ? "0 0 0 4px rgba(37,99,235,0.15)" : "none",
  }),
  stepLabel: (active: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: 700, color: active ? "#1d4ed8" : "#9ca3af", letterSpacing: "0.02em",
  }),
  stepSub: { fontSize: 11, color: "#9ca3af", marginTop: 1 },

  // Section card
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s",
  },
  cardHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  cardIconBox: (color: string, bg: string) => ({ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }),
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  cardBody: { padding: "24px" },

  // Form inputs
  fieldLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6, fontFamily: "JetBrains Mono, monospace" },
  input: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42 },
  select: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42, cursor: "pointer" },
  textarea: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", resize: "vertical" as const, minHeight: 70 },

  // Search bar
  searchBar: { position: "relative" as const },
  searchInput: { width: "100%", border: "2px solid #e2e8f0", borderRadius: 12, padding: "12px 48px 12px 46px", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif" },
  searchIcon: { position: "absolute" as const, left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 20, pointerEvents: "none" as const },

  // Product dropdown
  dropdown: { position: "absolute" as const, left: 0, right: 0, zIndex: 50, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, marginTop: 6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: 260, overflowY: "auto" as const },
  dropItem: { padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background 0.15s" },
  dropItemAvatar: (c: string) => ({ width: 36, height: 36, borderRadius: 8, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, border: "2px solid #e2e8f0" }),

  // Product accordion
  prodCard: (expanded: boolean) => ({
    border: `2px solid ${expanded ? "#bfdbfe" : "#e5e7eb"}`,
    borderRadius: 14,
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: expanded ? "0 4px 20px rgba(37,99,235,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
    background: "#fff",
  }),
  prodHeader: (expanded: boolean) => ({
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    background: expanded ? "#eff6ff" : "#fafafa",
    transition: "background 0.2s",
    gap: 12,
  }),
  prodIndexBadge: (n: number) => {
    const colors = ["#dbeafe","#fce7f3","#d1fae5","#fef3c7"];
    const textColors = ["#1d4ed8","#9d174d","#065f46","#92400e"];
    return { width: 28, height: 28, borderRadius: "50%", background: colors[n % 4], color: textColors[n % 4], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 };
  },
  prodBody: { padding: "20px", background: "#f8fafc", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column" as const, gap: 20 },

  // Variant card
  variantCard: { border: "1.5px solid #e2e8f0", borderRadius: 12, background: "#fff", overflow: "hidden" as const },
  variantHeader: { padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", gap: 10, background: "#fafbff" },
  swatch: (color: string, hasBorder?: boolean) => ({ width: 34, height: 34, borderRadius: 8, background: color, border: hasBorder ? "1.5px solid #cbd5e1" : "1.5px solid transparent", boxShadow: "0 2px 8px rgba(0,0,0,0.14)", flexShrink: 0 }),
  sizesGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, padding: "12px 16px" },
  sizeCell: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
  sizeLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" },
  sizeInput: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 4px", fontSize: 13, textAlign: "center" as const, background: "#f8fafc", outline: "none", fontFamily: "Inter, sans-serif", color: "#0f172a" },

  // Stage row
  stageRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", transition: "border-color 0.2s, box-shadow 0.2s" },
  stageIndex: { width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  stageInputs: { display: "grid", gridTemplateColumns: "2fr 1.4fr 80px 1fr", gap: 8, flex: 1 },
  stageThinInput: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const },
  stageThinSelect: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const, cursor: "pointer" },

  // Buttons
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg,#1d4ed8,#2563eb)", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.2s", letterSpacing: "0.01em" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: "#fff", border: "1.5px solid #e2e8f0", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  btnDanger: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px", borderRadius: 7, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", transition: "all 0.18s" },
  btnAddVariant: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1.5px dashed #93c5fd", color: "#1d4ed8", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  btnAddStage: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1.5px dashed #86efac", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },

  // Status badges
  badgeSuccess: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #bbf7d0" },
  badgeError: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #fecaca" },
  badgeNeutral: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #e2e8f0" },

  // Material table
  matTable: { width: "100%", borderCollapse: "collapse" as const },
  matTh: { padding: "12px 16px", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "2px solid #e2e8f0", fontFamily: "JetBrains Mono, monospace", textAlign: "left" as const },
  matTd: { padding: "13px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f1f5f9" },

  // Summary footer bar
  summaryBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius: 14, gap: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.25)" },
  summaryItem: { display: "flex", flexDirection: "column" as const, gap: 2 },
  summaryVal: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 },
  summaryLbl: { fontSize: 10, color: "#93c5fd", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const },
  summaryDivider: { width: 1, background: "rgba(255,255,255,0.15)", alignSelf: "stretch" },

  // Empty state
  emptyState: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "56px 24px", gap: 12, border: "2px dashed #e2e8f0", borderRadius: 14, background: "#fafafa" },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 30 },

  // Fabric modal
  modalOverlay: { position: "fixed" as const, inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modalPanel: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column" as const, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)" },
  modalHeader: { padding: "22px 24px", borderBottom: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalTabs: { display: "flex", padding: "0 24px", borderBottom: "2px solid #f1f5f9", background: "#fafafa" },
  modalTab: (active: boolean): React.CSSProperties => ({ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: active ? "#2563eb" : "#94a3b8", borderBottom: `2.5px solid ${active ? "#2563eb" : "transparent"}`, marginBottom: -2, cursor: "pointer", background: "none", border: "none", transition: "all 0.2s" }),
  modalBody: { padding: 20, overflowY: "auto" as const, flex: 1 },
  fabricGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 },
  fabricItem: (selected: boolean) => ({ border: `2px solid ${selected ? "#2563eb" : "#e2e8f0"}`, borderRadius: 12, padding: "16px 12px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10, cursor: "pointer", background: selected ? "#eff6ff" : "#fff", transition: "all 0.18s", boxShadow: selected ? "0 4px 14px rgba(37,99,235,0.18)" : "none" }),
  fabricSwatch: (color: string) => ({ width: 52, height: 52, borderRadius: 12, background: color, boxShadow: "0 4px 12px rgba(0,0,0,0.18)", border: "2px solid rgba(255,255,255,0.4)" }),

  // Grid helpers
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  flex: { display: "flex" as const },
  flexBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  flexCenter: { display: "flex", alignItems: "center" },
};



/* ─── Component ─────────────────────────────────────────────────── */
export function ProductionPlanEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-20260529-001";

  const [planDate, setPlanDate] = useState(new Date().toISOString().split("T")[0]);
  const [demandType, setDemandType] = useState("Customer Order");
  const [priority, setPriority] = useState("Normal");
  const [outputDestination, setOutputDestination] = useState("Customer Dispatch");
  const [customerId, setCustomerId] = useState("CUST-001");

  const [dbId, setDbId] = useState<string | null>(null);
  const [originalPlan, setOriginalPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [activeProductId, setActiveProductId] = useState<string>("");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [nepaliReady, setNepaliReady] = useState(false);

  const safelyConvertAD2BS = (adDateStr: string) => {
    if (!adDateStr || typeof window === 'undefined' || !(window as any).NepaliFunctions) return "";
    try {
      const [y, m, d] = adDateStr.split("-").map(Number);
      if (!y || !m || !d) return "";
      const bsObj = (window as any).NepaliFunctions.AD2BS({ year: y, month: m, day: d });
      if (!bsObj) return "";
      const yy = bsObj.year;
      const mm = String(bsObj.month).padStart(2, '0');
      const dd = String(bsObj.day).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const safelyConvertBS2AD = (bsDateStr: string) => {
    if (!bsDateStr || typeof window === 'undefined' || !(window as any).NepaliFunctions) return "";
    try {
      const [y, m, d] = bsDateStr.split("-").map(Number);
      if (!y || !m || !d) return "";
      const adObj = (window as any).NepaliFunctions.BS2AD({ year: y, month: m, day: d });
      if (!adObj) return "";
      const yy = adObj.year;
      const mm = String(adObj.month).padStart(2, '0');
      const dd = String(adObj.day).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && (window as any).NepaliFunctions) {
      setSelectedProducts(prev => prev.map(prod => ({
        ...prod,
        plannedStartDateNp: safelyConvertAD2BS(prod.plannedStartDate),
        plannedCompletionDateNp: safelyConvertAD2BS(prod.plannedCompletionDate),
        requiredDateNp: safelyConvertAD2BS(prod.requiredDate),
        stages: prod.stages.map((s: any) => ({
          ...s,
          dateNp: safelyConvertAD2BS(s.date)
        }))
      })));
    }
  }, [isLoading, nepaliReady]);

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then(res => res.json())
      .then(plans => {
        const plan = plans.find((p: any) => p.planId === planId || p.planNo === planId);
        if (plan) {
          setDbId(plan.id);
          setOriginalPlan(plan);
          setPlanDate(plan.planDate || plan.plannedStartDate || new Date().toISOString().split("T")[0]);
          setDemandType(plan.demandType || "Customer Order");
          setPriority(plan.priority || "Normal");
          setOutputDestination(plan.outputDestination || "Customer Dispatch");
          setCustomerId(plan.sourceId || "CUST-001");
          
          if (plan.products && plan.products.length > 0) {
            const grouped: any[] = [];
            plan.products.forEach((p: any) => {
              let group = grouped.find(g => g.productId === p.productId);
              if (!group) {
                group = {
                  productId: p.productId, productCode: p.productCode || p.productId, productName: p.productName || p.productId, productImage: "",
                  plannedStartDate: plan.plannedStartDate, plannedCompletionDate: plan.plannedCompletionDate, requiredDate: p.requiredDate || plan.requiredDate,
                  variants: [], 
                  stages: (plan.stages && plan.stages.length > 0) ? plan.stages.map((s: any, i: number) => ({ id: s.stageId?.replace('STG-','') || String(i+1).padStart(2,'0'), name: s.stageName, workCenter: s.workCenter, leadHours: "8", date: s.plannedStartDate })) : [
                    { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4",  date: plan.plannedStartDate },
                  ],
                  productionNotes: p.productionNotes || ""
                };
                grouped.push(group);
              }
              const sizesObj: any = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
              if (p.sizes) { p.sizes.forEach((sz: any) => sizesObj[sz.size] = sz.quantity); }
              group.variants.push({
                id: p.lineId || `var-${Math.random()}`,
                fabricId: "RM-FAB-COT-NAVY",
                fabricName: p.variant || "Standard Fabric",
                swatchColor: "#1e3a8a",
                sizes: sizesObj
              });
            });
            setSelectedProducts(grouped);
            setActiveProductId(grouped[0].productId);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch plan:", err);
        setIsLoading(false);
      });
  }, [planId]);
  
  const [fabricModal, setFabricModal] = useState({ show: false, productId: null, variantId: null, category: "Cotton", search: "" });
  
  const activeProduct = selectedProducts.find(p => p.productId === activeProductId) || selectedProducts[0] || {} as any;

  // Calculate BOM & Cost
  const materialsRequirements = useMemo(() => {
    const reqs: Record<string, MatReq> = {};
    selectedProducts.forEach(prod => {
      const totalQty = prod.variants.reduce((s: number, v: any) => s + (Object.values(v.sizes) as number[]).reduce((a: number, b: any) => a + Number(b), 0), 0);
      mockBoms.filter(b => b.productId === prod.productId).forEach(bom => {
        const mat = mockMaterials.find(m => m.id === bom.materialId);
        if (!mat) return;
        const need = totalQty * bom.qtyPerUnit * (1 + bom.wastagePercent / 100);
        if (reqs[mat.materialCode]) { reqs[mat.materialCode].requiredQty += need; }
        else { reqs[mat.materialCode] = { materialCode: mat.materialCode, materialName: mat.name, materialType: mat.type, requiredQty: need, availableQty: mat.availableQty, shortageQty: 0, unit: mat.unit, cost: mat.costPerUnit }; }
      });
    });
    return Object.values(reqs).map(r => ({ ...r, shortageQty: Math.max(r.requiredQty - r.availableQty, 0) }));
  }, [selectedProducts]);

  const estimatedCost = useMemo(() => materialsRequirements.reduce((s, r) => s + r.requiredQty * r.cost, 0), [materialsRequirements]);
  const totalUnits = useMemo(() => selectedProducts.reduce((s: number, p: any) => s + p.variants.reduce((a: number, v: any) => a + (Object.values(v.sizes) as number[]).reduce((x: any, y: any) => x + y, 0), 0), 0), [selectedProducts]);

  // Handlers for Right-Side Editor
  const updateProductField = (field: string, value: string) => {
    if (!activeProductId) return;
    setSelectedProducts(prev => prev.map(p => p.productId === activeProductId ? { ...p, [field]: value } : p));
  };

  const addVariant = () => {
    if (!activeProductId) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.concat({ id: `var-${Date.now()}`, fabricId: "RM-FAB-COT-RED", fabricName: "Dyed Cotton (Scarlet Red)", swatchColor: "#b91c1c", sizes: { XS: 0, S: 10, M: 20, L: 20, XL: 10, XXL: 0 } }),
    }));
  };

  const removeVariant = (variantId: string) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : { ...p, variants: p.variants.filter((v: any) => v.id !== variantId) }));
  };

  const updateSize = (variantId: string, size: string, value: number) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.map((v: any) => v.id !== variantId ? v : { ...v, sizes: { ...v.sizes, [size]: Math.max(0, value) } }),
    }));
  };

  const addStage = () => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.concat({ id: String(p.stages.length + 1).padStart(2, "0"), name: "Quality Check", workCenter: "QC Table", leadHours: "8", date: planDate }),
    }));
  };
  
  const updateStage = (idx: number, field: string, value: string) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.map((s: any, i: number) => i !== idx ? s : { ...s, [field]: value }),
    }));
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Stage[]> = {
      standard: [
        { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4",  date: planDate },
        { id: "02", name: "Cutting",         workCenter: "Cutter Auto-B",  leadHours: "12", date: planDate },
        { id: "03", name: "Stitching",       workCenter: "Line 4A",        leadHours: "48", date: planDate },
      ],
      expedited: [
        { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "2",  date: planDate },
        { id: "02", name: "Cutting",         workCenter: "Cutter Auto-B",  leadHours: "6",  date: planDate },
        { id: "03", name: "Stitching",       workCenter: "Line 4A",        leadHours: "24", date: planDate },
        { id: "04", name: "Finishing",       workCenter: "QC Table",       leadHours: "8",  date: planDate },
      ],
    };
    if (presets[preset]) {
      setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : { ...p, stages: presets[preset] }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbId || !originalPlan) {
      alert("Plan not fully loaded or invalid.");
      return;
    }
    setIsSubmitting(true);
    
    const updatedPlan = {
      ...originalPlan,
      planDate,
      demandType,
      priority,
      outputDestination,
      products: selectedProducts.flatMap(prod => prod.variants.map((v: any, vi: number) => ({
        lineId: `${planId}-${prod.productId}-V${vi + 1}`,
        productId: prod.productId,
        productCode: prod.productCode,
        productName: prod.productName,
        category: "Garment",
        variant: v.fabricName,
        quantity: (Object.values(v.sizes) as number[]).reduce((a: number, b: any) => a + Number(b), 0),
        requiredDate: prod.requiredDate,
        status: originalPlan.status || "Draft",
        sizes: Object.entries(v.sizes).filter(([_, qty]) => Number(qty) > 0).map(([size, qty]) => ({ size, quantity: Number(qty) })),
        productionNotes: prod.productionNotes
      }))),
      stages: selectedProducts[0]?.stages?.map((s: any) => ({
        stageId: `STG-${s.id}`,
        stageName: s.name,
        workCenter: s.workCenter,
        plannedStartDate: s.date,
        plannedEndDate: s.date,
        status: "Not Started",
        completedQty: 0,
        rejectedQty: 0
      })) || originalPlan.stages
    };

    fetch(`http://localhost:5083/api/production-plans/${dbId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update");
      setIsSubmitting(false);
      alert("Production Plan updated!");
      router.push("/production/plans");
    })
    .catch(err => {
      console.error(err);
      setIsSubmitting(false);
      alert("Error saving updates to backend.");
    });
  };

  const steps = [
    { icon: "settings", label: "Configuration", sub: "Plan details & order" },
    { icon: "apparel",  label: "Products Workspace", sub: "Variants, sizes, routing" },
    { icon: "inventory", label: "BOM & Budget", sub: "Material cost estimator" },
  ];

  const demandTypesList = ["Customer Order", "Outlet Replenishment", "In-house Stock"];
  const prioritiesList = ["Normal", "Urgent", "Seasonal"];
  const destinationsList = ["Finished Goods Warehouse", "Customer Dispatch", "Outlet Transfer"];

  const selectedCustomer = mockCustomers.find(c => c.id === customerId);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#3b82f6", fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ animation: "spin 1.5s linear infinite" }}>sync</span>
          Loading Plan Data...
        </div>
      </div>
    );
  }

  if (!selectedProducts.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#dc2626" }}>Error loading products or plan not found.</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── HERO HEADER ──────────────────────────────────────────── */}
      <div style={{...S.hero, background: "linear-gradient(135deg, #0f172a 0%, #0369a1 55%, #0284c7 100%)"}}>
        <div style={S.heroBlobA} />
        <div style={S.heroBlobB} />
        <div style={{ zIndex: 1 }}>
          <div style={S.heroLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit_note</span>
            PLANNING EDITOR
          </div>
          <h1 style={S.heroTitle}>Edit Production Plan</h1>
          <p style={S.heroSub}>Review and update draft customer order production plans.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <div style={S.heroBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#7dd3fc" }}>tag</span>
              {planId}
            </div>
            <div style={S.heroBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#7dd3fc" }}>person</span>
              {selectedCustomer?.name || "—"}
            </div>
          </div>
        </div>
        <div style={S.heroActions}>
          <Link href={`/production/plans/${planId}`} style={S.btnOutlineWhite}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
            View Details
          </Link>
          <Link href="/production" style={S.btnSolidWhite}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Plans
          </Link>
        </div>
      </div>

      {/* ── STEP INDICATOR ───────────────────────────────────────── */}
      <div style={{ ...S.stepRow, borderRadius: 14, overflow: "hidden", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ ...S.stepItem(true), borderLeft: i === 0 ? "none" : "1px solid #e5e7eb", borderRight: "none" }}>
            <div style={S.stepNumBubble(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
            </div>
            <div>
              <div style={S.stepLabel(true)}>{step.label}</div>
              <div style={S.stepSub}>{step.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ── SECTION 1: GENERAL CONFIGURATION ────────────────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#0284c7", "#f0f9ff")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
              </div>
              <div>
                <div style={S.cardTitle}>General Configuration</div>
                <div style={S.cardSub}>Plan metadata, demand type & customer order details</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>Step 1</span>
          </div>
          <div style={S.cardBody}>
            <div style={S.grid2}>
              <div>
                <label style={S.fieldLabel}>Plan No</label>
                <input style={{...S.input, background: "#f1f5f9", color: "#64748b"}} type="text" value={planId} readOnly />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Date</label>
                <input style={{...S.input, background: "#f1f5f9", color: "#64748b"}} type="date" value={planDate} readOnly />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={S.fieldLabel}>Demand Type</label>
                <select style={S.select} value={demandType} onChange={e => setDemandType(e.target.value)}>
                  {demandTypesList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Priority</label>
                <select style={S.select} value={priority} onChange={e => setPriority(e.target.value)}>
                  {prioritiesList.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Output Destination</label>
                <select style={S.select} value={outputDestination} onChange={e => setOutputDestination(e.target.value)}>
                  {destinationsList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Customer Details Block (Hybrid Design) */}
            <div style={{ marginTop: 24, padding: 20, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Customer Order Details</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Linked customer master data for this demand.</div>
                </div>
                {isEditingCustomer ? (
                  <button type="button" style={S.btnGhost} onClick={() => setIsEditingCustomer(false)}>Done</button>
                ) : (
                  <button type="button" style={S.btnGhost} onClick={() => setIsEditingCustomer(true)}>Change Customer</button>
                )}
              </div>

              {isEditingCustomer && (
                <div style={{ marginBottom: 16 }}>
                  <label style={S.fieldLabel}>Select Customer</label>
                  <select 
                    style={S.select} 
                    value={customerId} 
                    onChange={e => {
                      setCustomerId(e.target.value);
                      setIsEditingCustomer(false);
                    }}
                  >
                    <option value="">Select a customer...</option>
                    {mockCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCustomer && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                  {[
                    ["Customer Code", selectedCustomer.code],
                    ["Customer Name", selectedCustomer.name],
                    ["Phone", selectedCustomer.phone],
                    ["Address", selectedCustomer.address],
                    ["Payment Terms", selectedCustomer.terms],
                    ["Delivery Location", selectedCustomer.location],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 4 }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: PRODUCTS WORKSPACE (SPLIT-SCREEN) ────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#7c3aed", "#f5f3ff")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>view_sidebar</span>
              </div>
              <div>
                <div style={S.cardTitle}>Products Workspace (Split-Screen)</div>
                <div style={S.cardSub}>Select a product on the left, and edit its sizes and routing stages on the right.</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>Step 2</span>
          </div>

          <div style={{ ...S.cardBody, display: "flex", gap: 24, alignItems: "stretch", minHeight: 600 }}>
            {/* LEFT PANEL: Scrollable Product List */}
            <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, background: "#f8fafc", padding: 16, borderRadius: 12, border: "1.5px solid #e2e8f0", overflowY: "auto" }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Order Products ({selectedProducts.length})</div>
               {selectedProducts.map(prod => {
                 const isActive = activeProductId === prod.productId;
                 return (
                   <div key={prod.productId} 
                        onClick={() => setActiveProductId(prod.productId)}
                        style={{ 
                          padding: "14px 16px", 
                          background: isActive ? "#fff" : "transparent",
                          border: `1.5px solid ${isActive ? "#2563eb" : "transparent"}`,
                          borderRadius: 12,
                          cursor: "pointer",
                          boxShadow: isActive ? "0 4px 12px rgba(37,99,235,0.1)" : "none",
                          transition: "all 0.2s"
                        }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#1d4ed8" : "#334155" }}>{prod.productName}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
                        {prod.productCode} • {prod.variants.reduce((a: any, v: any) => a + (Object.values(v.sizes) as number[]).reduce((x: any, y: any)=>x+y,0), 0)} pcs
                      </div>
                   </div>
                 );
               })}
               <button type="button" style={{ ...S.btnGhost, marginTop: "auto" }}>
                 <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Product
               </button>
            </div>

            {/* RIGHT PANEL: Active Editor */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
               {activeProduct ? (
                 <>
                   {/* Editor Header */}
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{activeProduct.productName}</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{activeProduct.productCode}</div>
                      </div>
                      <div style={S.badgeNeutral}>{activeProduct.variants.reduce((a: any, v: any) => a + (Object.values(v.sizes) as number[]).reduce((x: any, y: any)=>x+y,0), 0)} Total Pcs</div>
                   </div>

                   {/* Production Timeline */}
                   <div style={S.variantCard}>
                      <div style={S.variantHeader}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>calendar_month</span> Production Timeline
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={S.fieldLabel}>Planned Start (AD)</label>
                            <input style={{ ...S.input, height: 38 }} type="date" value={activeProduct.plannedStartDate || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("plannedStartDate", val);
                              updateProductField("plannedStartDateNp", safelyConvertAD2BS(val));
                            }} />
                          </div>
                          <div>
                            <label style={S.fieldLabel}>Planned Start (BS)</label>
                            <NepaliDatePicker style={{ ...S.input, height: 38, background: "#fff" }} value={activeProduct.plannedStartDateNp || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("plannedStartDateNp", val);
                              updateProductField("plannedStartDate", safelyConvertBS2AD(val));
                            }} />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={S.fieldLabel}>Planned End (AD)</label>
                            <input style={{ ...S.input, height: 38 }} type="date" value={activeProduct.plannedCompletionDate || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("plannedCompletionDate", val);
                              updateProductField("plannedCompletionDateNp", safelyConvertAD2BS(val));
                            }} />
                          </div>
                          <div>
                            <label style={S.fieldLabel}>Planned End (BS)</label>
                            <NepaliDatePicker style={{ ...S.input, height: 38, background: "#fff" }} value={activeProduct.plannedCompletionDateNp || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("plannedCompletionDateNp", val);
                              updateProductField("plannedCompletionDate", safelyConvertBS2AD(val));
                            }} />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={S.fieldLabel}>Required By (AD)</label>
                            <input style={{ ...S.input, height: 38 }} type="date" value={activeProduct.requiredDate || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("requiredDate", val);
                              updateProductField("requiredDateNp", safelyConvertAD2BS(val));
                            }} />
                          </div>
                          <div>
                            <label style={S.fieldLabel}>Required By (BS)</label>
                            <NepaliDatePicker style={{ ...S.input, height: 38, background: "#fff" }} value={activeProduct.requiredDateNp || ""} onChange={e => {
                              const val = e.target.value;
                              updateProductField("requiredDateNp", val);
                              updateProductField("requiredDate", safelyConvertBS2AD(val));
                            }} />
                          </div>
                        </div>
                      </div>
                   </div>

                   {/* Variants & Sizes */}
                   <div>
                     <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>palette</span> Fabric Variants & Sizes
                       </div>
                       <button type="button" onClick={addVariant} style={S.btnAddVariant}>
                         <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Variant
                       </button>
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {activeProduct.variants.map((v: any, vi: number) => (
                          <div key={v.id} style={S.variantCard}>
                            <div style={S.variantHeader}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={S.swatch(v.swatchColor, v.swatchColor === "#e2e8f0")} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{v.fabricName}</div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, fontFamily: "JetBrains Mono, monospace" }}>Variant {vi + 1}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button type="button" style={{ ...S.btnGhost, padding: "6px 14px" }}>Change</button>
                                {activeProduct.variants.length > 1 && (
                                  <button type="button" onClick={() => removeVariant(v.id)} style={{ ...S.btnDanger, padding: 5 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={S.sizesGrid}>
                              {SIZES.map(size => (
                                <div key={size} style={S.sizeCell}>
                                  <span style={S.sizeLabel}>{size}</span>
                                  <input type="number" min={0} style={S.sizeInput} value={v.sizes[size] || 0} onChange={e => updateSize(v.id, size, parseInt(e.target.value)||0)} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                     </div>
                   </div>

                   {/* Routing Stages */}
                   <div>
                     <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>timeline</span> Production Stages & Routing
                       </div>
                       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <select style={{ ...S.select, width: "auto", height: 32, padding: "4px 10px", fontSize: 12 }} defaultValue="" onChange={e => e.target.value && applyPreset(e.target.value)}>
                           <option value="" disabled>Apply Preset...</option>
                           <option value="standard">Standard 3-Step</option>
                           <option value="expedited">Expedited 4-Step</option>
                         </select>
                         <button type="button" onClick={addStage} style={S.btnAddStage}>
                           <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Stage
                         </button>
                       </div>
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       {activeProduct.stages.map((stage: any, si: number) => (
                         <div key={stage.id} style={S.stageRow}>
                           <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#cbd5e1", cursor: "grab" }}>drag_indicator</span>
                           <div style={S.stageIndex}>{stage.id}</div>
                           <div style={{ ...S.stageInputs, gridTemplateColumns: "1.8fr 1.2fr 60px 1.2fr 1.2fr" }}>
                             <input style={S.stageThinInput} type="text" value={stage.name} placeholder="Stage name" onChange={e => updateStage(si, "name", e.target.value)} />
                             <input style={S.stageThinInput} type="text" value={stage.workCenter} placeholder="Work Center" onChange={e => updateStage(si, "workCenter", e.target.value)} />
                             <input style={S.stageThinInput} type="number" value={stage.leadHours} placeholder="Hours" onChange={e => updateStage(si, "leadHours", e.target.value)} />
                             <input style={S.stageThinInput} type="date" value={stage.date || ""} onChange={e => {
                               const val = e.target.value;
                               updateStage(si, "date", val);
                               updateStage(si, "dateNp", safelyConvertAD2BS(val));
                             }} />
                             <NepaliDatePicker style={{ ...S.stageThinInput, background: "#fff" }} value={stage.dateNp || ""} placeholder="Date (BS)" onChange={e => {
                               const val = e.target.value;
                               updateStage(si, "dateNp", val);
                               updateStage(si, "date", safelyConvertBS2AD(val));
                             }} />
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                 </>
               ) : (
                 <div style={S.emptyState}>
                   <div style={S.emptyIcon}><span className="material-symbols-outlined">apparel</span></div>
                   <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>No product selected</div>
                   <div style={{ fontSize: 13, color: "#94a3b8" }}>Select a product from the left to edit its routing and sizes.</div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: BOM & BUDGET (COMPLETELY REPLACED) ────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#059669", "#dcfce7")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>inventory_2</span>
              </div>
              <div>
                <div style={S.cardTitle}>Bill of Materials & Stock Estimator</div>
                <div style={S.cardSub}>Dynamic material requirement generated from the products and variants above</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>Step 3</span>
          </div>
          <div style={{ padding: 0 }}>
            {materialsRequirements.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}><span className="material-symbols-outlined">receipt_long</span></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>No materials required</div>
                <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Add products and quantities to generate the BOM.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.matTable}>
                  <thead>
                    <tr>
                      <th style={S.matTh}>Material Name</th>
                      <th style={S.matTh}>Type</th>
                      <th style={S.matTh}>Required</th>
                      <th style={S.matTh}>Available</th>
                      <th style={S.matTh}>Shortage</th>
                      <th style={S.matTh}>Unit Cost</th>
                      <th style={S.matTh}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialsRequirements.map(mat => (
                      <tr key={mat.materialCode}>
                        <td style={{ ...S.matTd, fontWeight: 600 }}>{mat.materialName} <span style={{ fontSize: 10, color: "#94a3b8", display: "block", fontFamily: "JetBrains Mono, monospace", fontWeight: 400 }}>{mat.materialCode}</span></td>
                        <td style={S.matTd}>{mat.materialType}</td>
                        <td style={{ ...S.matTd, fontWeight: 700, color: "#0f172a" }}>{mat.requiredQty.toLocaleString(undefined,{maximumFractionDigits:2})} {mat.unit}</td>
                        <td style={S.matTd}>{mat.availableQty.toLocaleString()} {mat.unit}</td>
                        <td style={{ ...S.matTd, color: mat.shortageQty > 0 ? "#dc2626" : "#10b981", fontWeight: 600 }}>{mat.shortageQty.toLocaleString(undefined,{maximumFractionDigits:2})} {mat.unit}</td>
                        <td style={S.matTd}>Rs. {mat.cost.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                        <td style={S.matTd}>
                          {mat.shortageQty > 0 ? (
                            <span style={S.badgeError}><span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>Shortage</span>
                          ) : (
                            <span style={S.badgeSuccess}><span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>In Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ padding: 24, background: "#fafbff", borderTop: "1px solid #f1f5f9" }}>
            <div style={S.summaryBar}>
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{totalUnits.toLocaleString()}</div>
                <div style={S.summaryLbl}>Total Garments</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{materialsRequirements.length}</div>
                <div style={S.summaryLbl}>Unique Materials</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{materialsRequirements.filter(m => m.shortageQty > 0).length}</div>
                <div style={S.summaryLbl}>Shortages Found</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={{ ...S.summaryItem, alignItems: "flex-end", flex: 1 }}>
                <div style={{ ...S.summaryVal, color: "#60a5fa" }}>Rs. {estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={S.summaryLbl}>Estimated Material Budget</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM ACTIONS ───────────────────────────────────────────── */}
        <div style={{ ...S.card, padding: 24, display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <Link href={`/production/plans/${planId}`} style={S.btnSecondary}>Cancel Edits</Link>
          <button type="submit" disabled={isSubmitting} style={S.btnPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            {isSubmitting ? "Saving..." : "Save Changes to Plan"}
          </button>
        </div>
      </form>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
        onLoad={() => setNepaliReady(true)}
      />
      <link
        rel="stylesheet"
        href="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css"
      />
    </div>
  );
}

