"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

/* ─── Mock Data ─────────────────────────────────────────────────── */
const mockFabrics = [
  { id: "11111111-1111-1111-1111-111111111111", code: "FAB-001", name: "100% Combed Cotton (Navy Blue)", category: "Cotton", swatchColor: "#1e3a8a", imagePath: "http://localhost:5083/images/fabrics/FAB-001.jpg" },
  { id: "22222222-2222-2222-2222-222222222222", code: "FAB-002", name: "Dyed Cotton Pique (Maroon)", category: "Pique", swatchColor: "#831843", imagePath: "http://localhost:5083/images/fabrics/FAB-002.png" },
  { id: "33333333-3333-3333-3333-333333333333", code: "FAB-003", name: "Heavy Twill Trouser Fabric", category: "Cotton", swatchColor: "#334155", imagePath: "http://localhost:5083/images/fabrics/FAB-003.png" },
  { id: "44444444-4444-4444-4444-444444444444", code: "FAB-004", name: "Premium Fleece Fabric (Grey Melange)", category: "Fleece", swatchColor: "#64748b", imagePath: "http://localhost:5083/images/fabrics/FAB-004.png" },
  { id: "55555555-5555-5555-5555-555555555555", code: "FAB-005", name: "Traditional Kurta Fabric", category: "Cotton", swatchColor: "#047857", imagePath: "http://localhost:5083/images/fabrics/FAB-005.png" }
];

const mockMaterials: any[] = [
  { id: "mat-1", materialCode: "MAT-COT-01", name: "100% Cotton Yarn", type: "Fabric Material", availableQty: 500, unit: "kg", costPerUnit: 450 },
  { id: "mat-2", materialCode: "MAT-BTN-01", name: "Standard Buttons 14mm", type: "Accessories", availableQty: 10000, unit: "pcs", costPerUnit: 2.5 },
  { id: "mat-3", materialCode: "MAT-THD-01", name: "Core Spun Thread", type: "Thread", availableQty: 1200, unit: "spool", costPerUnit: 120 }
];

const mockBoms: any[] = [
  { productId: "PRD-001", materialId: "mat-1", qtyPerUnit: 0.35, wastagePercent: 3 },
  { productId: "PRD-001", materialId: "mat-2", qtyPerUnit: 6, wastagePercent: 1 },
  { productId: "PRD-001", materialId: "mat-3", qtyPerUnit: 0.05, wastagePercent: 2 }
];

const getFabricInfo = (fabricNameOrId?: string) => {
  const name = fabricNameOrId || "Standard Cotton Fabric";
  const matched = mockFabrics.find(f => f.id === fabricNameOrId || f.name.toLowerCase() === name.toLowerCase() || f.code.toLowerCase() === name.toLowerCase());
  if (matched) return matched;
  const lower = name.toLowerCase();
  if (lower.includes("pique") || lower.includes("fab-002")) return mockFabrics[1];
  if (lower.includes("trouser") || lower.includes("twill") || lower.includes("fab-003")) return mockFabrics[2];
  if (lower.includes("fleece") || lower.includes("fab-004")) return mockFabrics[3];
  if (lower.includes("kurta") || lower.includes("fab-005")) return mockFabrics[4];
  return mockFabrics[0];
};

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
  page: { maxWidth: 1100, margin: "0 auto", paddingBottom: 80, display: "flex", flexDirection: "column" as const, gap: 28 },
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
  heroActions: { display: "flex", gap: 10, flexShrink: 0, zIndex: 1 },
  btnOutlineWhite: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.2s", textDecoration: "none", height: 40 },
  btnSolidWhite: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#fff", border: "none", color: "#1e3a8a", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", textDecoration: "none", height: 40 },
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
  fieldLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6, fontFamily: "JetBrains Mono, monospace" },
  input: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42 },
  select: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42, cursor: "pointer" },
  textarea: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", resize: "vertical" as const, minHeight: 70 },
  searchBar: { position: "relative" as const },
  searchInput: { width: "100%", border: "2px solid #e2e8f0", borderRadius: 12, padding: "12px 48px 12px 46px", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif" },
  searchIcon: { position: "absolute" as const, left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 20, pointerEvents: "none" as const },
  dropdown: { position: "absolute" as const, left: 0, right: 0, zIndex: 50, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, marginTop: 6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: 260, overflowY: "auto" as const },
  dropItem: { padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background 0.15s" },
  dropItemAvatar: (c: string) => ({ width: 36, height: 36, borderRadius: 8, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, border: "2px solid #e2e8f0" }),
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
  variantCard: { border: "1.5px solid #e2e8f0", borderRadius: 12, background: "#fff", overflow: "hidden" as const },
  variantHeader: { padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", gap: 10, background: "#fafbff" },
  swatch: (color: string, hasBorder?: boolean) => ({ width: 34, height: 34, borderRadius: 8, background: color, border: hasBorder ? "1.5px solid #cbd5e1" : "1.5px solid transparent", boxShadow: "0 2px 8px rgba(0,0,0,0.14)", flexShrink: 0 }),
  sizesGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, padding: "12px 16px" },
  sizeCell: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
  sizeLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" },
  sizeInput: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 4px", fontSize: 13, textAlign: "center" as const, background: "#f8fafc", outline: "none", fontFamily: "Inter, sans-serif", color: "#0f172a" },
  stageRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", transition: "border-color 0.2s, box-shadow 0.2s" },
  stageIndex: { width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  stageInputs: { display: "grid", gridTemplateColumns: "2fr 1.4fr 80px 1fr", gap: 8, flex: 1 },
  stageThinInput: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const },
  stageThinSelect: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "#f8fafc", outline: "none", color: "#0f172a", fontFamily: "Inter, sans-serif", width: "100%", height: 34, boxSizing: "border-box" as const, cursor: "pointer" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg,#1d4ed8,#2563eb)", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.2s", letterSpacing: "0.01em" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: "#fff", border: "1.5px solid #e2e8f0", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  btnDanger: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px", borderRadius: 7, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", transition: "all 0.18s" },
  btnAddVariant: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1.5px dashed #93c5fd", color: "#1d4ed8", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  btnAddStage: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1.5px dashed #86efac", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.18s" },
  badgeSuccess: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #bbf7d0" },
  badgeError: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #fecaca" },
  badgeNeutral: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: "1px solid #e2e8f0" },
  matTable: { width: "100%", borderCollapse: "collapse" as const },
  matTh: { padding: "12px 16px", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "2px solid #e2e8f0", fontFamily: "JetBrains Mono, monospace", textAlign: "left" as const },
  matTd: { padding: "13px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f1f5f9" },
  summaryBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius: 14, gap: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.25)" },
  summaryItem: { display: "flex", flexDirection: "column" as const, gap: 2 },
  summaryVal: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 },
  summaryLbl: { fontSize: 10, color: "#93c5fd", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const },
  summaryDivider: { width: 1, background: "rgba(255,255,255,0.15)", alignSelf: "stretch" },
  emptyState: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "56px 24px", gap: 12, border: "2px dashed #e2e8f0", borderRadius: 14, background: "#fafafa" },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 30 },
  modalOverlay: { position: "fixed" as const, inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modalPanel: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column" as const, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)" },
  modalHeader: { padding: "22px 24px", borderBottom: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalTabs: { display: "flex", padding: "0 24px", borderBottom: "2px solid #f1f5f9", background: "#fafafa" },
  modalTab: (active: boolean): React.CSSProperties => ({ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: active ? "#2563eb" : "#94a3b8", borderBottom: `2.5px solid ${active ? "#2563eb" : "transparent"}`, marginBottom: -2, cursor: "pointer", background: "none", border: "none", transition: "all 0.2s" }),
  modalBody: { padding: 20, overflowY: "auto" as const, flex: 1 },
  fabricGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 },
  fabricItem: (selected: boolean) => ({ border: `2px solid ${selected ? "#2563eb" : "#e2e8f0"}`, borderRadius: 12, padding: "16px 12px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10, cursor: "pointer", background: selected ? "#eff6ff" : "#fff", transition: "all 0.18s", boxShadow: selected ? "0 4px 14px rgba(37,99,235,0.18)" : "none" }),
  fabricSwatch: (color: string) => ({ width: 52, height: 52, borderRadius: 12, background: color, boxShadow: "0 4px 12px rgba(0,0,0,0.18)", border: "2px solid rgba(255,255,255,0.4)" }),
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  flex: { display: "flex" as const },
  flexBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  flexCenter: { display: "flex", alignItems: "center" },
};



/* ─── Component ─────────────────────────────────────────────────── */
export function ProductionPlanEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = (params?.id as string) || searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "";
  const planId = rawId ? decodeURIComponent(rawId) : "";

  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().split("T")[0]);
  const [planDateNp, setPlanDateNp] = useState("");
  const [demandType, setDemandType] = useState("Customer Order");
  const [priority, setPriority] = useState("Normal");
  const [outputDestination, setOutputDestination] = useState("Customer Dispatch");
  const [customerId, setCustomerId] = useState("CUST-001");
  const [supervisor, setSupervisor] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [materialWarehouse, setMaterialWarehouse] = useState("");
  const [productionNotes, setProductionNotes] = useState("");

  const [dbId, setDbId] = useState<string | null>(null);
  const [originalPlan, setOriginalPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [activeProductId, setActiveProductId] = useState<string>("");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [nepaliReady, setNepaliReady] = useState(false);

  const rawStatus = String(originalPlan?.status || "Draft");
  const statusLower = rawStatus.toLowerCase();
  const isDraft = statusLower === "draft" || statusLower === "0";
  const isCompleted = statusLower === "completed" || statusLower === "5";
  const isLimited = !isDraft && !isCompleted;

  const safelyConvertAD2BS = (adDateStr: string): string => {
    if (!adDateStr) return "";
    try {
      const clean = adDateStr.split("T")[0];
      const parts = clean.split("-").map(Number);
      if (parts.length !== 3 || isNaN(parts[0])) return clean;
      // If already a BS date (2070-2100), return as-is
      if (parts[0] >= 2070) return clean;
      // Use NepaliFunctions if available
      if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
        const bsObj = (window as any).NepaliFunctions.AD2BS({ year: parts[0], month: parts[1], day: parts[2] });
        if (bsObj) {
          return `${bsObj.year}-${String(bsObj.month).padStart(2, "0")}-${String(bsObj.day).padStart(2, "0")}`;
        }
      }
      // Fallback approximation: AD + 56/57 years
      const bsYear = parts[0] + ((parts[1] > 4 || (parts[1] === 4 && parts[2] >= 14)) ? 57 : 56);
      const bsMonth = ((parts[1] + 8) % 12) + 1;
      return `${bsYear}-${String(bsMonth).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    } catch {
      return adDateStr.split("T")[0];
    }
  };

  const safelyConvertBS2AD = (bsDateStr: string): string => {
    if (!bsDateStr) return "";
    try {
      const clean = bsDateStr.split("T")[0];
      const parts = clean.split("-").map(Number);
      if (parts.length !== 3 || isNaN(parts[0])) return clean;
      // If already an AD date (< 2070), return as-is
      if (parts[0] < 2070) return clean;
      // Use NepaliFunctions if available
      if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
        const adObj = (window as any).NepaliFunctions.BS2AD({ year: parts[0], month: parts[1], day: parts[2] });
        if (adObj) {
          return `${adObj.year}-${String(adObj.month).padStart(2, "0")}-${String(adObj.day).padStart(2, "0")}`;
        }
      }
      // Fallback approximation: BS - 56/57 years
      const adYear = parts[0] - ((parts[1] > 9 || (parts[1] === 9 && parts[2] >= 17)) ? 57 : 56);
      const adMonth = ((parts[1] + 3) % 12) + 1;
      return `${adYear}-${String(adMonth).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    } catch {
      return bsDateStr.split("T")[0];
    }
  };

  const parseDatePair = (rawDate: any) => {
    if (!rawDate) {
      const todayAD = new Date().toISOString().split("T")[0];
      return { ad: todayAD, bs: safelyConvertAD2BS(todayAD) };
    }
    const str = String(rawDate).split("T")[0];
    if (!str || str.startsWith("0001") || str.startsWith("0000") || str === "1970-01-01") {
      const todayAD = new Date().toISOString().split("T")[0];
      return { ad: todayAD, bs: safelyConvertAD2BS(todayAD) };
    }
    const yr = parseInt(str.split("-")[0], 10) || 2026;
    if (yr >= 2070 && yr <= 2100) {
      return { ad: safelyConvertBS2AD(str), bs: str };
    } else {
      return { ad: str, bs: safelyConvertAD2BS(str) };
    }
  };

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && (window as any).NepaliFunctions) {
      setNepaliReady(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!planId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    Promise.all([
      fetch("http://localhost:5083/api/production-plans").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/production-plan-product").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/production-plan-product-size").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/production-plan-stage").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/customers").then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([plans, allProducts, allSizes, allStages, custs]) => {
      const plan = (plans || []).find((p: any) =>
        String(p.planId) === planId || String(p.planNo) === planId || String(p.id) === planId
      );

      if (plan) {
        setDbId(plan.id);
        setOriginalPlan(plan);
        setPlanName(plan.planName || "");

        const pPair = parseDatePair(plan.planDate || plan.plannedStartDate);
        setPlanDate(pPair.ad);
        setPlanDateNp(pPair.bs);

        setDemandType(plan.demandType || "Customer Order");
        setPriority(plan.priority || "Normal");
        setOutputDestination(plan.outputDestination || "Customer Dispatch");
        setCustomerId(plan.sourceId || "");
        setSupervisor(plan.supervisor || "");
        setProductionLine(plan.productionLine || "Sewing Line 1");
        setMaterialWarehouse(plan.materialWarehouse || "Central Raw Material Hub");
        setProductionNotes(plan.productionNotes || "");

        const planProds = (allProducts || []).filter((pp: any) =>
          String(pp.productionPlanId) === String(plan.id) || String(pp.productionPlanId) === String(plan.planId)
        );

        const planStages = (allStages || []).filter((ps: any) =>
          String(ps.productionPlanId) === String(plan.id) || String(ps.productionPlanId) === String(plan.planId)
        );

        const loadedStages = planStages.length > 0 ? planStages
          .slice()
          .sort((a: any, b: any) => {
            const numA = parseInt((a.stageId || "").replace(/\D/g, "")) || 0;
            const numB = parseInt((b.stageId || "").replace(/\D/g, "")) || 0;
            if (numA !== numB) return numA - numB;
            return (a.createdAt || "").localeCompare(b.createdAt || "");
          })
          .map((s: any, idx: number) => {
            const stgPair = parseDatePair(s.plannedStartDate || plan.plannedStartDate);
            return {
              id: String(idx + 1).padStart(2, "0"),
              name: s.stageName || `Stage ${idx + 1}`,
              workCenter: s.workCenter || s.workCenterName || s.workCenterId || "QC Station 1",
              leadHours: "8",
              date: stgPair.ad,
              dateNp: stgPair.bs
            };
          }) : [
          { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4", date: pPair.ad, dateNp: pPair.bs },
          { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", leadHours: "12", date: pPair.ad, dateNp: pPair.bs },
          { id: "03", name: "Stitching", workCenter: "Line 4A", leadHours: "48", date: pPair.ad, dateNp: pPair.bs }
        ];

        if (planProds.length > 0) {
          const grouped: any[] = [];
          planProds.forEach((p: any) => {
            let group = grouped.find(g => g.productId === p.productId);
            if (!group) {
              const startPair = parseDatePair(p.plannedStartDate || plan.plannedStartDate);
              const endPair = parseDatePair(p.plannedCompletionDate || plan.plannedCompletionDate);
              const reqPair = parseDatePair(p.requiredDate || plan.requiredDate);

              // Find stages belonging to this specific product by checking if stageName contains the productName or productCode
              let productStages = planStages.filter((ps: any) => 
                (ps.stageName || "").toLowerCase().includes((p.productName || "").toLowerCase()) ||
                (ps.stageName || "").toLowerCase().includes((p.productCode || "").toLowerCase())
              );
              
              // If we didn't find any specific stages for this product, and we have loadedStages (which might be un-prefixed defaults),
              // we can fallback to the default loaded stages, but ideally we only want the matched ones if they exist.
              if (productStages.length === 0 && planStages.length === 0) {
                 productStages = loadedStages; // fallback to generated defaults if no DB stages exist
              } else if (productStages.length > 0) {
                 // Format the matched DB stages
                 productStages = productStages.sort((a: any, b: any) => {
                    const numA = parseInt((a.stageId || "").replace(/\D/g, "")) || 0;
                    const numB = parseInt((b.stageId || "").replace(/\D/g, "")) || 0;
                    if (numA !== numB) return numA - numB;
                    return (a.createdAt || "").localeCompare(b.createdAt || "");
                 }).map((s: any, idx: number) => {
                    const stgPair = parseDatePair(s.plannedStartDate || plan.plannedStartDate);
                    // Strip the product name prefix for cleaner display in the UI if desired, or keep it.
                    // We'll keep it as is, since they can edit it.
                    return {
                      id: String(idx + 1).padStart(2, "0"),
                      name: s.stageName || `Stage ${idx + 1}`,
                      workCenter: s.workCenter || s.workCenterName || s.workCenterId || "QC Station 1",
                      leadHours: "8",
                      date: stgPair.ad,
                      dateNp: stgPair.bs
                    };
                 });
              }

              group = {
                productId: p.productId,
                productCode: p.productCode || p.productId,
                productName: p.productName || "Garment Item",
                productImage: p.productImage || "",
                plannedStartDate: startPair.ad,
                plannedStartDateNp: startPair.bs,
                plannedCompletionDate: endPair.ad,
                plannedCompletionDateNp: endPair.bs,
                requiredDate: reqPair.ad,
                requiredDateNp: reqPair.bs,
                variants: [],
                stages: productStages.length > 0 ? productStages.map((s: any) => ({ ...s })) : loadedStages.map((s: any) => ({ ...s })),
                productionNotes: p.productionNotes || plan.productionNotes || ""
              };
              grouped.push(group);
            }

            const pSizes = (allSizes || []).filter((sz: any) => String(sz.productionPlanProductId) === String(p.id));
            const sizesObj: any = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
            if (pSizes.length > 0) {
              pSizes.forEach((sz: any) => { if (sz.size) sizesObj[sz.size] = Number(sz.quantity) || 0; });
            } else if (p.sizes && Array.isArray(p.sizes)) {
              p.sizes.forEach((sz: any) => { if (sz.size) sizesObj[sz.size] = Number(sz.quantity) || 0; });
            }

            group.variants.push({
              id: p.lineId || p.id || `var-${Math.random()}`,
              fabricId: p.fabricId || "RM-FAB-COT-NAVY",
              fabricName: p.variant || "Standard Fabric",
              swatchColor: "#1e3a8a",
              sizes: sizesObj
            });
          });

          setSelectedProducts(grouped);
          setActiveProductId(grouped[0].productId);
        } else {
          setSelectedProducts([]);
        }
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Error loading plan details:", err);
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
      let boms = mockBoms.filter(b => b.productId === prod.productId || b.productId === "PRD-001");
      if (boms.length === 0) {
        boms = [
          { productId: prod.productId, materialId: "mat-1", qtyPerUnit: 1.8, wastagePercent: 5 },
          { productId: prod.productId, materialId: "mat-2", qtyPerUnit: 6, wastagePercent: 2 },
          { productId: prod.productId, materialId: "mat-3", qtyPerUnit: 0.2, wastagePercent: 2 }
        ];
      }
      boms.forEach(bom => {
        const mat = mockMaterials.find(m => m.id === bom.materialId || m.materialCode === bom.materialId);
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
    if (!activeProductId || !isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId === activeProductId ? { ...p, [field]: value } : p));
  };

  const addVariant = () => {
    if (!activeProductId || !isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.concat({ id: `var-${Date.now()}`, fabricId: "RM-FAB-COT-RED", fabricName: "Dyed Cotton (Scarlet Red)", swatchColor: "#b91c1c", sizes: { XS: 0, S: 10, M: 20, L: 20, XL: 10, XXL: 0 } }),
    }));
  };

  const removeVariant = (variantId: string) => {
    if (!isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : { ...p, variants: p.variants.filter((v: any) => v.id !== variantId) }));
  };

  const updateSize = (variantId: string, size: string, value: number) => {
    if (!isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.map((v: any) => v.id !== variantId ? v : { ...v, sizes: { ...v.sizes, [size]: Math.max(0, value) } }),
    }));
  };

  const addStage = () => {
    if (!isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.concat({ id: String(p.stages.length + 1).padStart(2, "0"), name: "Quality Check", workCenter: "QC Table", leadHours: "8", date: planDate }),
    }));
  };
  
  const updateStage = (idx: number, field: string, value: string) => {
    if (!isDraft) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.map((s: any, i: number) => i !== idx ? s : { ...s, [field]: value }),
    }));
  };

  const applyPreset = (preset: string) => {
    if (!isDraft) return;
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbId || !originalPlan) {
      alert("Plan not fully loaded or invalid ID.");
      return;
    }
    if (isCompleted) {
      alert("Completed production plans cannot be edited.");
      return;
    }

    setIsSubmitting(true);

    const firstProd = selectedProducts[0];
    const updatedPlan = {
      ...originalPlan,
      planName: isDraft ? (planName || originalPlan.planName) : originalPlan.planName,
      planDate: planDate,
      plannedStartDate: firstProd?.plannedStartDateNp || firstProd?.plannedStartDate || planDate,
      plannedCompletionDate: firstProd?.plannedCompletionDateNp || firstProd?.plannedCompletionDate || planDate,
      requiredDate: firstProd?.requiredDateNp || firstProd?.requiredDate || planDate,
      demandType: isDraft ? (demandType || originalPlan.demandType) : originalPlan.demandType,
      sourceId: isDraft ? (customerId || originalPlan.sourceId) : originalPlan.sourceId,
      priority: priority || originalPlan.priority,
      outputDestination: outputDestination || originalPlan.outputDestination,
      supervisor: supervisor || originalPlan.supervisor,
      productionLine: productionLine || originalPlan.productionLine,
      materialWarehouse: materialWarehouse || originalPlan.materialWarehouse,
      productionNotes: productionNotes || originalPlan.productionNotes,
      updatedAt: new Date().toISOString(),
      ...(isDraft ? {
        productionPlanProducts: selectedProducts.flatMap(prod => prod.variants.map((v: any, vi: number) => ({
          lineId: `${planId}-${prod.productId}-V${vi + 1}`,
          productId: prod.productId,
          productCode: prod.productCode,
          productName: prod.productName,
          category: "Garment",
          variant: v.fabricName,
          quantity: (Object.values(v.sizes) as number[]).reduce((a: number, b: any) => a + Number(b), 0),
          plannedStartDate: prod.plannedStartDateNp || prod.plannedStartDate,
          plannedCompletionDate: prod.plannedCompletionDateNp || prod.plannedCompletionDate,
          requiredDate: prod.requiredDateNp || prod.requiredDate,
          status: originalPlan.status || "Draft",
          productionPlanProductSizes: Object.entries(v.sizes).filter(([_, qty]) => Number(qty) > 0).map(([size, qty]) => ({ size, quantity: Number(qty) })),
          productionNotes: prod.productionNotes
        }))),
        productionPlanStages: selectedProducts.flatMap(prod => 
          (prod.stages || []).map((s: any) => {
            // Ensure the stage name has the product name so it can be filtered back out on next load
            const finalStageName = s.name.toLowerCase().includes((prod.productName || "").toLowerCase()) 
              ? s.name 
              : `${prod.productName} - ${s.name}`;
            return {
              stageId: `STG-${s.id}`,
              stageName: finalStageName,
              workCenter: s.workCenter,
              plannedStartDate: s.dateNp || s.date,
              plannedEndDate: s.dateNp || s.date,
              status: "Not Started",
              completedQty: 0,
              rejectedQty: 0
            };
          })
        )
      } : {})
    };

    try {
      const res = await fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(dbId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update plan");
      }

      setIsSubmitting(false);
      alert("Production Plan updated successfully!");
      router.push("/production/plans");
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      alert(err.message || "Error saving updates to backend.");
    }
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
            {/* STATUS MODE BANNER */}
            <div style={{ marginBottom: 20 }}>
              {isDraft ? (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <div>
                    <strong>Full Edit Mode (Status: {rawStatus}):</strong> All plan details, demand type, source, products, sizes, and stages are fully editable.
                  </div>
                </div>
              ) : isLimited ? (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined">info</span>
                  <div>
                    <strong>Limited Edit Mode (Status: {rawStatus}):</strong> Operational parameters (supervisor, line, warehouse, priority, destination, notes) can be edited. Core demand source and product items are locked for active production.
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined">lock</span>
                  <div>
                    <strong>Completed Plan (Read Only):</strong> This plan is completed and cannot be edited.
                  </div>
                </div>
              )}
            </div>

            <div style={S.grid2}>
              <div>
                <label style={S.fieldLabel}>Plan No</label>
                <input style={{...S.input, background: "#f1f5f9", color: "#64748b"}} type="text" value={planId} readOnly />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Date (AD)</label>
                <input style={{...S.input, background: isCompleted ? "#f1f5f9" : "#fff", color: "#0f172a"}} type="date" value={planDate} onChange={e => {
                  const val = e.target.value;
                  setPlanDate(val);
                  setPlanDateNp(safelyConvertAD2BS(val));
                }} disabled={isCompleted} />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Date (BS)</label>
                <NepaliDatePicker style={{...S.input, background: isCompleted ? "#f1f5f9" : "#fff", color: "#0f172a"}} value={planDateNp} onChange={e => {
                  const val = e.target.value;
                  setPlanDateNp(val);
                  setPlanDate(safelyConvertBS2AD(val));
                }} onDateChange={bsVal => {
                  setPlanDateNp(bsVal);
                  setPlanDate(safelyConvertBS2AD(bsVal));
                }} disabled={isCompleted} />
              </div>
              <div>
                <label style={S.fieldLabel}>Demand Type</label>
                <select style={S.select} value={demandType} onChange={e => setDemandType(e.target.value)} disabled={!isDraft}>
                  {demandTypesList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Priority</label>
                <select style={S.select} value={priority} onChange={e => setPriority(e.target.value)} disabled={isCompleted}>
                  {prioritiesList.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Output Destination</label>
                <select style={S.select} value={outputDestination} onChange={e => setOutputDestination(e.target.value)} disabled={isCompleted}>
                  {destinationsList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Supervisor</label>
                <input style={S.input} type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={isCompleted} placeholder="e.g. Ramesh Sharma" />
              </div>
              <div>
                <label style={S.fieldLabel}>Production Line</label>
                <input style={S.input} type="text" value={productionLine} onChange={e => setProductionLine(e.target.value)} disabled={isCompleted} placeholder="e.g. Sewing Line 1" />
              </div>
              <div>
                <label style={S.fieldLabel}>Material Warehouse</label>
                <input style={S.input} type="text" value={materialWarehouse} onChange={e => setMaterialWarehouse(e.target.value)} disabled={isCompleted} placeholder="e.g. Central Store" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={S.fieldLabel}>Production Notes</label>
                <textarea style={S.textarea} value={productionNotes} onChange={e => setProductionNotes(e.target.value)} disabled={isCompleted} placeholder="Special instructions for shopfloor production..." />
              </div>
            </div>


          </div>
        </div>

        {/* ── SECTION 2: PRODUCTS WORKSPACE ────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#7c3aed", "#f5f3ff")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>view_sidebar</span>
              </div>
              <div>
                <div style={S.cardTitle}>Products Workspace</div>
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
               {isDraft && (
                 <button type="button" style={{ ...S.btnGhost, marginTop: "auto" }}>
                   <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Product
                 </button>
               )}
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
                            }} onDateChange={bsVal => {
                              updateProductField("plannedStartDateNp", bsVal);
                              updateProductField("plannedStartDate", safelyConvertBS2AD(bsVal));
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
                            }} onDateChange={bsVal => {
                              updateProductField("plannedCompletionDateNp", bsVal);
                              updateProductField("plannedCompletionDate", safelyConvertBS2AD(bsVal));
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
                            }} onDateChange={bsVal => {
                              updateProductField("requiredDateNp", bsVal);
                              updateProductField("requiredDate", safelyConvertBS2AD(bsVal));
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
                       {isDraft && (
                         <button type="button" onClick={addVariant} style={S.btnAddVariant}>
                           <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Variant
                         </button>
                       )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {activeProduct.variants.map((v: any, vi: number) => {
                          const fabInfo = getFabricInfo(v.fabricName || v.fabricId);
                          return (
                            <div key={v.id} style={S.variantCard}>
                              <div style={S.variantHeader}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <img
                                    src={fabInfo.imagePath}
                                    alt={fabInfo.name}
                                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1.5px solid #cbd5e1", flexShrink: 0 }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = "http://localhost:5083/images/fabrics/FAB-001.jpg"; }}
                                  />
                                  <div style={S.swatch(v.swatchColor || fabInfo.swatchColor, (v.swatchColor || fabInfo.swatchColor) === "#e2e8f0")} />
                                  <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                                      {v.fabricName || fabInfo.name}
                                      <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                                        {fabInfo.code}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontFamily: "JetBrains Mono, monospace" }}>
                                      Variant {vi + 1} &bull; {fabInfo.category}
                                    </div>
                                  </div>
                                </div>
                                {isDraft && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button type="button" style={{ ...S.btnGhost, padding: "6px 14px" }}>Change</button>
                                    {activeProduct.variants.length > 1 && (
                                      <button type="button" onClick={() => removeVariant(v.id)} style={{ ...S.btnDanger, padding: 5 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
                                      </button>
                                    )}
                                  </div>
                                )}
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
                          );
                        })}
                      </div>
                    </div>

                   {/* Routing Stages */}
                   <div>
                     <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>timeline</span> Production Stages & Routing
                       </div>
                       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <button type="button" onClick={addStage} style={S.btnAddStage}>
                           <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Stage
                         </button>
                       </div>
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       {/* Column Headers */}
                       <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
                         <span style={{ width: 16 }}></span>{/* drag icon spacer */}
                         <span style={{ width: 24 }}></span>{/* index spacer */}
                         <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 60px 1.2fr 1.2fr", gap: 8, flex: 1 }}>
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Stage Name</span>
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Work Center</span>
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Hours</span>
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Date (AD)</span>
                           <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Date (BS)</span>
                         </div>
                       </div>
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
                             }} onDateChange={bsVal => {
                               updateStage(si, "dateNp", bsVal);
                               updateStage(si, "date", safelyConvertBS2AD(bsVal));
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
                <div style={S.summaryVal}>{totalUnits.toLocaleString()} pcs</div>
                <div style={S.summaryLbl}>Total Garments</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{materialsRequirements.length}</div>
                <div style={S.summaryLbl}>Total Materials</div>
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
          <Link href={`/production/plans/${encodeURIComponent(planId)}`} style={S.btnSecondary}>Cancel Edits</Link>
          {isCompleted ? (
            <button type="button" disabled style={{ ...S.btnPrimary, background: "#94a3b8", cursor: "not-allowed", boxShadow: "none" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
              Plan Completed (Read Only)
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} style={S.btnPrimary}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              {isSubmitting ? "Saving..." : "Save Changes to Plan"}
            </button>
          )}
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

