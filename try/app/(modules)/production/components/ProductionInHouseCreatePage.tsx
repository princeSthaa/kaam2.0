"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

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

/* ─── Mock Data ─────────────────────────────────────────────────── */
const mockWarehouses = [
  { id: "WH-001", code: "WH-FG-001", name: "Central Finished Goods Warehouse", location: "Balaju Industrial Area, Kathmandu" },
  { id: "WH-002", code: "WH-RM-001", name: "Central Raw Material Hub", location: "Koteshwor, Kathmandu" },
  { id: "WH-003", code: "WH-TR-001", name: "Pokhara Transit Store", location: "Lakeside, Pokhara" },
];

const mockProducts = [
  { id: "PRD-001", productCode: "PRD-001", productName: "School Uniform Set", category: "Uniform", productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg" },
  { id: "PRD-002", productCode: "PRD-002", productName: "School Tracksuit Set", category: "Sports Uniform", productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg" },
  { id: "PRD-003", productCode: "PRD-003", productName: "Men Casual Shirt", category: "Retail Garment", productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg" },
  { id: "PRD-004", productCode: "PRD-004", productName: "Corporate Polo T-Shirt", category: "Corporate Wear", productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg" },
];

const mockFabrics = [
  { id: "RM-FAB-COT-NAVY", name: "Dyed Cotton (Navy Blue)", category: "Cotton", swatchColor: "#1e3a8a" },
  { id: "RM-FAB-COT-RED", name: "Dyed Cotton (Scarlet Red)", category: "Cotton", swatchColor: "#b91c1c" },
  { id: "RM-FAB-COT-WHITE", name: "Dyed Cotton (Pure White)", category: "Cotton", swatchColor: "#e2e8f0", border: true },
  { id: "RM-FAB-COT-GREEN", name: "Dyed Cotton (Forest Green)", category: "Cotton", swatchColor: "#14532d" },
  { id: "RM-FAB-PIQUE-BLACK", name: "Pique Knit (Midnight Black)", category: "Pique", swatchColor: "#111827" },
  { id: "RM-FAB-PIQUE-NAVY", name: "Pique Knit (Navy Blue)", category: "Pique", swatchColor: "#1e3a8a" },
  { id: "RM-FAB-PIQUE-MAROON", name: "Pique Knit (Maroon)", category: "Pique", swatchColor: "#7f1d1d" },
  { id: "RM-FAB-FLEECE-GREY", name: "Fleece Knit (Heather Grey)", category: "Fleece", swatchColor: "#94a3b8" },
  { id: "RM-FAB-FLEECE-NAVY", name: "Fleece Knit (Navy)", category: "Fleece", swatchColor: "#1e3a8a" },
];

const mockMaterials = [
  { id: "MAT-001", materialCode: "RM-FAB-COT-DYED", name: "Dyed Cotton Fabric", type: "Fabric", availableQty: 1800, unit: "meter", costPerUnit: 250 },
  { id: "MAT-002", materialCode: "RM-FAB-PIQUE-DYED", name: "Dyed Pique Fabric", type: "Fabric", availableQty: 950, unit: "meter", costPerUnit: 320 },
  { id: "MAT-003", materialCode: "RM-FAB-TRS-DYED", name: "Dyed Trouser Fabric", type: "Fabric", availableQty: 700, unit: "meter", costPerUnit: 380 },
  { id: "MAT-004", materialCode: "RM-FAB-FLEECE-DYED", name: "Dyed Fleece Fabric", type: "Fabric", availableQty: 420, unit: "meter", costPerUnit: 450 },
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

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FABRIC_CATEGORIES = ["Cotton", "Pique", "Fleece"];
const WORK_CENTERS = ["QC Station 1", "Cutter Auto-B", "Line 4A", "Sewing Floor", "QC Table", "Packing Area", "Embroidery Unit"];

const formatRs = (v: number) => `Rs. ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Variant = { id: string; fabricId: string; fabricName: string; swatchColor: string; sizes: Record<string, number> };
type Stage   = { id: string; name: string; workCenter: string; leadHours: string; date: string };
type Product = { productId: string; productCode: string; productName: string; productImage: string; plannedStartDate: string; plannedCompletionDate: string; requiredDate: string; variants: Variant[]; stages: Stage[]; productionNotes: string; isExpanded: boolean };
type MatReq  = { materialCode: string; materialName: string; materialType: string; requiredQty: number; availableQty: number; shortageQty: number; unit: string; cost: number };

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
  stepItem: (active: boolean, isFirst: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: active ? "#eff6ff" : "#fff",
    borderTop: `1px solid ${active ? "#bfdbfe" : "#e5e7eb"}`,
    borderBottom: `1px solid ${active ? "#bfdbfe" : "#e5e7eb"}`,
    borderLeft: isFirst ? "none" : `1px solid ${active ? "#bfdbfe" : "#e5e7eb"}`,
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
  stageHeaderRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", marginBottom: 4, border: "1px solid #e2e8f0" },
  stageHeaderLabel: { fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: "JetBrains Mono, monospace" },
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
export function ProductionInHouseCreatePage() {
  const router = useRouter();

  const [planId, setPlanId]     = useState("");
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [inHouseReason, setInHouseReason] = useState("Seasonal Buffer Stock");
  const [targetWarehouseId, setTargetWarehouseId] = useState("WH-001");

  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown]   = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const [fabricModal, setFabricModal] = useState<{ show: boolean; productId: string | null; variantId: string | null; category: string; search: string }>
    ({ show: false, productId: null, variantId: null, category: "Cotton", search: "" });

  const [hoveredDropItem, setHoveredDropItem] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const d = today.toISOString().split("T")[0];
    const rand = Math.floor(100 + Math.random() * 900);
    setPlanId(`PP-INHOUSE-${d.replaceAll("-", "")}-${rand}`);
    setPlanDate(d);
    setPlanName(`Inhouse Buffer Run — ${today.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`);
  }, []);

  const filteredProducts = useMemo(() =>
    !productSearch.trim() ? mockProducts
      : mockProducts.filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase()) || p.productCode.toLowerCase().includes(productSearch.toLowerCase()))
  , [productSearch]);

  const handleSelectProduct = (prod: typeof mockProducts[0]) => {
    if (selectedProducts.some(p => p.productId === prod.id)) return;
    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(); endDate.setDate(endDate.getDate() + 14);
    const endStr = endDate.toISOString().split("T")[0];
    const newProd: Product = {
      productId: prod.id, productCode: prod.productCode, productName: prod.productName, productImage: prod.productImage,
      plannedStartDate: today, plannedCompletionDate: endStr, requiredDate: endStr,
      variants: [{ id: `var-${Date.now()}`, fabricId: "RM-FAB-COT-NAVY", fabricName: "Dyed Cotton (Navy Blue)", swatchColor: "#1e3a8a", sizes: { XS: 10, S: 20, M: 40, L: 30, XL: 10, XXL: 0 } }],
      stages: [
        { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4",  date: today },
        { id: "02", name: "Cutting",         workCenter: "Cutter Auto-B",  leadHours: "12", date: today },
        { id: "03", name: "Stitching",       workCenter: "Line 4A",        leadHours: "48", date: today },
      ],
      productionNotes: "",
      isExpanded: true,
    };
    setSelectedProducts(prev => prev.map(p => ({ ...p, isExpanded: false })).concat(newProd));
    setProductSearch(""); setShowDropdown(false);
  };

  const removeProduct = (id: string) => setSelectedProducts(prev => prev.filter(p => p.productId !== id));
  const toggleExpand  = (id: string) => setSelectedProducts(prev => prev.map(p => ({ ...p, isExpanded: p.productId === id ? !p.isExpanded : false })));

  const updateProductField = (productId: string, field: "plannedStartDate" | "plannedCompletionDate" | "requiredDate" | "productionNotes", value: string) =>
    setSelectedProducts(prev => prev.map(p => p.productId === productId ? { ...p, [field]: value } : p));

  const addVariant = (productId: string) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : {
    ...p, variants: p.variants.concat({ id: `var-${Date.now()}`, fabricId: "RM-FAB-COT-RED", fabricName: "Dyed Cotton (Scarlet Red)", swatchColor: "#b91c1c", sizes: { XS: 0, S: 10, M: 20, L: 20, XL: 10, XXL: 0 } }),
  }));

  const removeVariant = (productId: string, variantId: string) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : { ...p, variants: p.variants.filter(v => v.id !== variantId) }));

  const updateSize = (productId: string, variantId: string, size: string, value: number) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : {
    ...p, variants: p.variants.map(v => v.id !== variantId ? v : { ...v, sizes: { ...v.sizes, [size]: Math.max(0, value) } }),
  }));

  const openFabricModal = (productId: string, variantId: string) => {
    const fab = selectedProducts.find(p => p.productId === productId)?.variants.find(v => v.id === variantId);
    const cur = mockFabrics.find(f => f.id === fab?.fabricId);
    setFabricModal({ show: true, productId, variantId, category: cur?.category || "Cotton", search: "" });
  };

  const selectFabric = (fabric: typeof mockFabrics[0]) => {
    const { productId, variantId } = fabricModal;
    if (!productId || !variantId) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : {
      ...p, variants: p.variants.map(v => v.id !== variantId ? v : { ...v, fabricId: fabric.id, fabricName: fabric.name, swatchColor: fabric.swatchColor }),
    }));
    setFabricModal(s => ({ ...s, show: false }));
  };

  const updateStage = (productId: string, idx: number, field: string, value: string) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : {
    ...p, stages: p.stages.map((s, i) => i !== idx ? s : { ...s, [field]: value }),
  }));

  const addStage = (productId: string) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : {
    ...p, stages: p.stages.concat({ id: String(p.stages.length + 1).padStart(2, "0"), name: "Quality Check", workCenter: "QC Table", leadHours: "8", date: new Date().toISOString().split("T")[0] }),
  }));

  const removeStage = (productId: string, idx: number) => setSelectedProducts(prev => prev.map(p => p.productId !== productId ? p : { ...p, stages: p.stages.filter((_, i) => i !== idx) }));

  const applyPreset = (preset: string) => {
    const today = new Date().toISOString().split("T")[0];
    const presets: Record<string, Stage[]> = {
      standard: [
        { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4",  date: today },
        { id: "02", name: "Cutting",         workCenter: "Cutter Auto-B",  leadHours: "12", date: today },
        { id: "03", name: "Stitching",       workCenter: "Line 4A",        leadHours: "48", date: today },
      ],
      expedited: [
        { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "2",  date: today },
        { id: "02", name: "Cutting",         workCenter: "Cutter Auto-B",  leadHours: "6",  date: today },
        { id: "03", name: "Stitching",       workCenter: "Line 4A",        leadHours: "24", date: today },
        { id: "04", name: "Finishing",       workCenter: "QC Table",       leadHours: "8",  date: today },
      ],
    };
    if (presets[preset]) setSelectedProducts(prev => prev.map(p => ({ ...p, stages: presets[preset] })));
  };

  /* BOM calculation */
  const materialsRequirements = useMemo<MatReq[]>(() => {
    const reqs: Record<string, MatReq> = {};
    selectedProducts.forEach(prod => {
      const totalQty = prod.variants.reduce((s, v) => s + Object.values(v.sizes).reduce((a, b) => a + b, 0), 0);
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
  const totalUnits    = useMemo(() => selectedProducts.reduce((s, p) => s + p.variants.reduce((a, v) => a + Object.values(v.sizes).reduce((x, y) => x + y, 0), 0), 0), [selectedProducts]);

  const buildPayload = (status: "Draft" | "Material Check") => {
    const first = selectedProducts[0] || {};
    return {
      planId, planNo: planId, planDate, demandType: "In-house Stock", planName,
      sourceName: mockWarehouses.find(w => w.id === targetWarehouseId)?.name || "",
      productId: first.productId || "", productName: first.productName || "In-house Replenishment",
      quantity: totalUnits, priority: "Normal", status,
      plannedStartDate: first.plannedStartDate || planDate, plannedCompletionDate: first.plannedCompletionDate || planDate,
      reason: inHouseReason,
      stages: (first.stages || []).map((s: Stage) => ({ stageId: `STG-${s.id}`, stageName: s.name, workCenter: s.workCenter, plannedStartDate: s.date, plannedEndDate: s.date, status: "Not Started", completedQty: 0, rejectedQty: 0 })),
      products: selectedProducts.flatMap(prod => prod.variants.map((v, vi) => {
        return {
          lineId: `${planId}-${prod.productId}-V${vi + 1}`,
          productId: prod.productId,
          productCode: prod.productCode,
          productName: prod.productName,
          category: "Garment",
          variant: v.fabricName,
          quantity: Object.values(v.sizes).reduce((a, b) => a + b, 0),
          requiredDate: prod.requiredDate,
          status,
          sizes: Object.entries(v.sizes).map(([size, qty]) => ({ size, quantity: Number(qty) })),
          productionNotes: prod.productionNotes
        };
      })),
      activities: [{ title: "In-house buffer run initiated", text: `Target: ${mockWarehouses.find(w => w.id === targetWarehouseId)?.name}. Reason: ${inHouseReason}` }],
    };
  };

  const handleSaveDraft = () => {
    if (!selectedProducts.length) return;
    const draft = buildPayload("Draft");
    if (typeof window !== "undefined") {
      const list = JSON.parse(localStorage.getItem("kaam.productionPlanDrafts.v1") || "[]");
      list.unshift(draft);
      localStorage.setItem("kaam.productionPlanDrafts.v1", JSON.stringify(list));
    }
    alert("Draft saved!"); router.push("/production/drafts");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProducts.length) return;
    setIsSubmitting(true);
    const plan = buildPayload("Material Check");
    
    if (typeof window !== "undefined") {
      fetch("http://localhost:5083/api/production-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan)
      })
      .then(res => res.json())
      .then(savedPlan => {
        setIsSubmitting(false);
        router.push(`/production/plans/${planId}/process`);
      })
      .catch(err => {
        setIsSubmitting(false);
        console.error("Failed to save in-house production plan to API:", err);
        alert("Failed to save plan to backend.");
      });
    }
  };

  const filteredFabrics = useMemo(() =>
    mockFabrics.filter(f => f.category === fabricModal.category && (!fabricModal.search.trim() || f.name.toLowerCase().includes(fabricModal.search.toLowerCase())))
  , [fabricModal.category, fabricModal.search]);

  const productColors: Record<string, string> = { "Uniform": "#dbeafe", "Sports Uniform": "#fce7f3", "Retail Garment": "#d1fae5", "Corporate Wear": "#fef3c7" };
  const productIcons: Record<string, string>  = { "Uniform": "school", "Sports Uniform": "sports_basketball", "Retail Garment": "checkroom", "Corporate Wear": "business_center" };

  const steps = [
    { icon: "settings", label: "Configuration", sub: "Plan details & warehouse" },
    { icon: "apparel",  label: "Products & Variants", sub: "Fabrics, sizes, routing" },
    { icon: "inventory", label: "BOM Review", sub: "Materials & stock check" },
  ];

  const filledStep = selectedProducts.length > 0 ? (materialsRequirements.length > 0 ? 2 : 1) : 0;

  return (
    <div style={S.page}>

      {/* ── HERO HEADER ──────────────────────────────────────────── */}
      <div style={S.hero}>
        <div style={S.heroBlobA} />
        <div style={S.heroBlobB} />
        <div style={{ zIndex: 1 }}>
          <div style={S.heroLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>manufacturing</span>
            IN-HOUSE PRODUCTION
          </div>
          <h1 style={S.heroTitle}>Create In-House Production Plan</h1>
          <p style={S.heroSub}>Schedule buffer stock conversions and replenishment runs for target warehouses.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" as const }}>
            <div style={S.heroBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#60a5fa" }}>tag</span>
              {planId || "Generating…"}
            </div>
            <div style={S.heroBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#60a5fa" }}>warehouse</span>
              {mockWarehouses.find(w => w.id === targetWarehouseId)?.name || "—"}
            </div>
            {totalUnits > 0 && (
              <div style={{ ...S.heroBadge, background: "rgba(34,197,94,0.15)", borderColor: "rgba(134,239,172,0.35)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#4ade80" }}>straighten</span>
                {totalUnits.toLocaleString()} units planned
              </div>
            )}
          </div>
        </div>
        <div style={S.heroActions}>
          <Link href="/production/demands" style={S.btnOutlineWhite}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
            Change Type
          </Link>
          <Link href="/production/plans" style={S.btnSolidWhite}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            All Plans
          </Link>
        </div>
      </div>

      {/* ── STEP INDICATOR ───────────────────────────────────────── */}
      <div style={{ ...S.stepRow, borderRadius: 14, overflow: "hidden", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {steps.map((step, i) => (
          <div key={i} style={S.stepItem(i <= filledStep, i === 0)}>
            <div style={S.stepNumBubble(i <= filledStep)}>
              {i < filledStep
                ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                : i + 1
              }
            </div>
            <div>
              <div style={S.stepLabel(i <= filledStep)}>{step.label}</div>
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
              <div style={S.cardIconBox("#2563eb", "#eff6ff")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
              </div>
              <div>
                <div style={S.cardTitle}>General Configuration</div>
                <div style={S.cardSub}>Plan metadata, target warehouse & replenishment reason</div>
              </div>
            </div>
            <span style={{ ...S.badgeNeutral }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>Step 1</span>
          </div>
          <div style={S.cardBody}>
            <div style={S.grid2}>
              <div>
                <label style={S.fieldLabel}>Plan ID Reference</label>
                <input style={S.input} type="text" value={planId} onChange={e => setPlanId(e.target.value)} required
                  onFocus={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Name</label>
                <input style={S.input} type="text" value={planName} onChange={e => setPlanName(e.target.value)} required
                  onFocus={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={S.fieldLabel}>Target Warehouse</label>
                <select style={S.select} value={targetWarehouseId} onChange={e => setTargetWarehouseId(e.target.value)}>
                  {mockWarehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Replenishment Reason</label>
                <select style={S.select} value={inHouseReason} onChange={e => setInHouseReason(e.target.value)}>
                  <option>Seasonal Buffer Stock</option>
                  <option>Standard Stock Replenishment</option>
                  <option>Festival Demand Buffer</option>
                  <option>Raw Material Conversion Run</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: PRODUCTS ──────────────────────────────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#7c3aed", "#f5f3ff")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>apparel</span>
              </div>
              <div>
                <div style={S.cardTitle}>Products, Variants & Routing</div>
                <div style={S.cardSub}>Add catalog garments, configure fabric variants, sizes and production stages</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedProducts.length > 0 && (
                <span style={{ ...S.badgeSuccess }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>inventory_2</span>
                  {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""}
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ ...S.fieldLabel, margin: 0, whiteSpace: "nowrap" as const }}>Preset:</label>
                <select
                  style={{ ...S.select, width: "auto", height: 34, fontSize: 12, padding: "6px 10px" }}
                  defaultValue=""
                  onChange={e => { if (e.target.value) applyPreset(e.target.value); }}
                >
                  <option value="" disabled>Apply to all…</option>
                  <option value="standard">Standard 3-Step</option>
                  <option value="expedited">Expedited 4-Step</option>
                </select>
              </div>
            </div>
          </div>

          <div style={S.cardBody}>
            {/* Search bar */}
            <div style={{ ...S.searchBar, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ ...S.searchIcon }}>search</span>
              <input
                style={S.searchInput}
                type="text"
                placeholder="Search catalog products by name or code (e.g. Polo, Jacket)…"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setShowDropdown(true); }}
                onFocus={e => { setShowDropdown(true); e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                onBlur={e => { setTimeout(() => setShowDropdown(false), 200); e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
              />
              {productSearch && (
                <button type="button" onClick={() => { setProductSearch(""); setShowDropdown(false); }}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              )}
              {showDropdown && (
                <div style={S.dropdown}>
                  {filteredProducts.length > 0 ? filteredProducts.map(prod => (
                    <div key={prod.id} style={{ ...S.dropItem, background: hoveredDropItem === prod.id ? "#f8fafc" : "#fff" }}
                      onMouseEnter={() => setHoveredDropItem(prod.id)}
                      onMouseLeave={() => setHoveredDropItem(null)}
                      onMouseDown={() => handleSelectProduct(prod)}>
                      <div style={S.dropItemAvatar(productColors[prod.category] || "#f1f5f9")}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#6366f1" }}>{productIcons[prod.category] || "apparel"}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{prod.productName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>{prod.productCode} • {prod.category}</div>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#2563eb" }}>add_circle</span>
                    </div>
                  )) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No matching products found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Product accordion list */}
            {selectedProducts.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}><span className="material-symbols-outlined">apparel</span></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>No products added yet</div>
                <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" as const }}>Use the search bar above to find and add catalog products to this plan.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {selectedProducts.map((prod, prodIdx) => {
                  const totalQty = prod.variants.reduce((s, v) => s + Object.values(v.sizes).reduce((a, b) => a + b, 0), 0);
                  return (
                    <div key={prod.productId} style={S.prodCard(prod.isExpanded)}>
                      {/* Card header */}
                      <div style={S.prodHeader(prod.isExpanded)} onClick={() => toggleExpand(prod.productId)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={S.prodIndexBadge(prodIdx)}>{prodIdx + 1}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{prod.productName}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", marginTop: 1 }}>
                              {prod.productCode} • {totalQty} pcs across {prod.variants.length} variant{prod.variants.length > 1 ? "s" : ""} • {prod.stages.length} stage{prod.stages.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ ...S.badgeNeutral, background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}>{totalQty} pcs</div>
                          <button type="button" onClick={e => { e.stopPropagation(); removeProduct(prod.productId); }}
                            style={{ ...S.btnDanger }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#94a3b8" }}>{prod.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                        </div>
                      </div>

                      {/* Card body */}
                      {prod.isExpanded && (
                        <div style={S.prodBody}>

                          {/* Dates */}
                          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "16px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12, fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span> Production Timeline
                            </div>
                            <div style={S.grid3}>
                              {(["plannedStartDate", "plannedCompletionDate", "requiredDate"] as const).map((f, i) => (
                                <div key={f}>
                                  <label style={S.fieldLabel}>{["Planned Start", "Planned End", "Required By"][i]}</label>
                                  <NepaliDatePicker style={{ ...S.input, height: 38 }} value={adToBs((prod as any)[f])} 
                                    onChange={e => updateProductField(prod.productId, f, bsToAd(e.target.value))} 
                                    onDateChange={bsVal => updateProductField(prod.productId, f, bsToAd(bsVal))} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Variants */}
                          <div>
                            <div style={{ ...S.flexBetween, marginBottom: 10 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>palette</span> Fabric Variants & Sizes
                              </div>
                              <button type="button" onClick={() => addVariant(prod.productId)} style={S.btnAddVariant}
                                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#dbeafe,#bfdbfe)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#eff6ff,#dbeafe)"; }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Variant
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                              {prod.variants.map((v, vi) => {
                                const vQty = Object.values(v.sizes).reduce((a, b) => a + b, 0);
                                return (
                                  <div key={v.id} style={S.variantCard}>
                                    <div style={S.variantHeader}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={S.swatch(v.swatchColor, v.swatchColor === "#e2e8f0")} />
                                        <div>
                                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{v.fabricName}</div>
                                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, fontFamily: "JetBrains Mono, monospace" }}>Variant {vi + 1} • {vQty} pcs total</div>
                                        </div>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <button type="button" onClick={() => openFabricModal(prod.productId, v.id)}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, background: "#fff", border: "1.5px solid #e2e8f0", color: "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.18s" }}
                                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#1d4ed8"; }}
                                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#374151"; }}>
                                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>palette</span> Change Fabric
                                        </button>
                                        {prod.variants.length > 1 && (
                                          <button type="button" onClick={() => removeVariant(prod.productId, v.id)}
                                            style={{ ...S.btnDanger, padding: "5px 5px" }}
                                            onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div style={S.sizesGrid}>
                                      {SIZES.map(size => (
                                        <div key={size} style={S.sizeCell}>
                                          <span style={S.sizeLabel}>{size}</span>
                                          <input type="number" min={0} style={S.sizeInput} value={v.sizes[size] || 0}
                                            onChange={e => updateSize(prod.productId, v.id, size, parseInt(e.target.value) || 0)}
                                            onFocus={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.12)"; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Stages */}
                          <div>
                            <div style={{ ...S.flexBetween, marginBottom: 10 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timeline</span> Operational Routing Stages
                              </div>
                              <button type="button" onClick={() => addStage(prod.productId)} style={S.btnAddStage}
                                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#dcfce7,#bbf7d0)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#f0fdf4,#dcfce7)"; }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> Add Stage
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                              {prod.stages.length > 0 && (
                                <div style={S.stageHeaderRow}>
                                  <span style={{ width: 16 }} />
                                  <span style={{ width: 24, textAlign: "center", ...S.stageHeaderLabel }}>#</span>
                                  <div style={S.stageInputs}>
                                    <span style={S.stageHeaderLabel}>Stage Name</span>
                                    <span style={S.stageHeaderLabel}>Work Center</span>
                                    <span style={S.stageHeaderLabel}>Lead Time</span>
                                    <span style={S.stageHeaderLabel}>Target Date (BS)</span>
                                  </div>
                                  <span style={{ width: 26 }} />
                                </div>
                              )}
                              {prod.stages.map((stage, si) => (
                                <div key={stage.id} style={S.stageRow}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.08)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#cbd5e1", cursor: "grab" }}>drag_indicator</span>
                                  <div style={S.stageIndex}>{stage.id}</div>
                                  <div style={S.stageInputs}>
                                    <input style={S.stageThinInput} type="text" value={stage.name} placeholder="Stage name"
                                      onChange={e => updateStage(prod.productId, si, "name", e.target.value)}
                                      onFocus={e => e.currentTarget.style.borderColor = "#2563eb"}
                                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                                    />
                                    <select style={S.stageThinSelect} value={stage.workCenter} onChange={e => updateStage(prod.productId, si, "workCenter", e.target.value)}>
                                      {WORK_CENTERS.map(wc => <option key={wc}>{wc}</option>)}
                                    </select>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                      <input style={{ ...S.stageThinInput, width: 52, textAlign: "center" as const }} type="number" value={stage.leadHours}
                                        onChange={e => updateStage(prod.productId, si, "leadHours", e.target.value)} />
                                      <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" as const, fontFamily: "JetBrains Mono, monospace" }}>hrs</span>
                                    </div>
                                    <NepaliDatePicker style={S.stageThinInput} value={adToBs(stage.date)}
                                      onChange={e => updateStage(prod.productId, si, "date", bsToAd(e.target.value))}
                                      onDateChange={bsVal => updateStage(prod.productId, si, "date", bsToAd(bsVal))}
                                    />
                                  </div>
                                  <button type="button" onClick={() => removeStage(prod.productId, si)}
                                    style={{ ...S.btnDanger }}
                                    onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label style={S.fieldLabel}>Production Notes</label>
                            <textarea style={S.textarea} placeholder="Special requirements, finishing instructions, priority notes…"
                              value={prod.productionNotes} onChange={e => updateProductField(prod.productId, "productionNotes", e.target.value)}
                              onFocus={e => { e.currentTarget.style.borderColor = "#2563eb"; }}
                              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                            />
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 3: BOM ───────────────────────────────────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#d97706", "#fffbeb")}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>inventory</span>
              </div>
              <div>
                <div style={S.cardTitle}>Bill of Materials & Stock Estimator</div>
                <div style={S.cardSub}>Auto-calculated based on selected products, variants, and BOM ratios</div>
              </div>
            </div>
            {materialsRequirements.some(m => m.shortageQty > 0) ? (
              <span style={S.badgeError}><span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>{materialsRequirements.filter(m => m.shortageQty > 0).length} shortage{materialsRequirements.filter(m => m.shortageQty > 0).length > 1 ? "s" : ""}</span>
            ) : materialsRequirements.length > 0 ? (
              <span style={S.badgeSuccess}><span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>All in stock</span>
            ) : null}
          </div>
          <div style={{ ...S.cardBody, padding: 0 }}>
            {materialsRequirements.length > 0 ? (
              <>
                <div style={{ overflowX: "auto" as const }}>
                  <table style={S.matTable}>
                    <thead>
                      <tr>
                        <th style={S.matTh}>Material</th>
                        <th style={{ ...S.matTh, textAlign: "right" as const }}>Required</th>
                        <th style={{ ...S.matTh, textAlign: "right" as const }}>Available</th>
                        <th style={{ ...S.matTh, textAlign: "right" as const }}>Shortage</th>
                        <th style={{ ...S.matTh, textAlign: "right" as const }}>Unit Cost</th>
                        <th style={{ ...S.matTh, textAlign: "center" as const }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialsRequirements.map((mat, i) => {
                        const shortage = mat.shortageQty > 0;
                        return (
                          <tr key={mat.materialCode} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa")}>
                            <td style={S.matTd}>
                              <div style={{ fontWeight: 700, color: "#0f172a" }}>{mat.materialName}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>{mat.materialCode}</div>
                            </td>
                            <td style={{ ...S.matTd, textAlign: "right" as const, fontWeight: 700 }}>{mat.requiredQty.toFixed(1)} <span style={{ color: "#94a3b8", fontWeight: 400 }}>{mat.unit}</span></td>
                            <td style={{ ...S.matTd, textAlign: "right" as const }}>{mat.availableQty} <span style={{ color: "#94a3b8" }}>{mat.unit}</span></td>
                            <td style={{ ...S.matTd, textAlign: "right" as const, fontWeight: 700, color: shortage ? "#dc2626" : "#15803d" }}>{shortage ? `${mat.shortageQty.toFixed(1)} ${mat.unit}` : "—"}</td>
                            <td style={{ ...S.matTd, textAlign: "right" as const, fontFamily: "JetBrains Mono, monospace" }}>{formatRs(mat.cost)}</td>
                            <td style={{ ...S.matTd, textAlign: "center" as const }}>
                              <span style={shortage ? S.badgeError : S.badgeSuccess}>
                                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{shortage ? "error" : "check_circle"}</span>
                                {shortage ? "Shortage" : "OK"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {estimatedCost > 0 && (
                  <div style={{ padding: "16px 24px", borderTop: "1.5px solid #f1f5f9", display: "flex", justifyContent: "flex-end" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Estimated Material Budget</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8", letterSpacing: "-0.03em" }}>{formatRs(estimatedCost)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ ...S.emptyState, margin: 24 }}>
                <div style={{ ...S.emptyIcon, background: "linear-gradient(135deg,#fffbeb,#fef3c7)" }}><span className="material-symbols-outlined" style={{ color: "#d97706" }}>inventory</span></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>No materials calculated yet</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Add products with quantities above to estimate raw material requirements.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── SUMMARY BAR + ACTIONS ────────────────────────────────── */}
        {selectedProducts.length > 0 && (
          <div style={S.summaryBar}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{selectedProducts.length}</div>
                <div style={S.summaryLbl}>Products</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{totalUnits.toLocaleString()}</div>
                <div style={S.summaryLbl}>Total Units</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{selectedProducts.reduce((s, p) => s + p.variants.length, 0)}</div>
                <div style={S.summaryLbl}>Variants</div>
              </div>
              {estimatedCost > 0 && (
                <>
                  <div style={S.summaryDivider} />
                  <div style={S.summaryItem}>
                    <div style={{ ...S.summaryVal, fontSize: 16 }}>{formatRs(estimatedCost)}</div>
                    <div style={S.summaryLbl}>Est. Budget</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button type="button" onClick={() => router.push("/production/demands")} style={S.btnSecondary}>Cancel</button>
              <button type="button" onClick={handleSaveDraft} style={{ ...S.btnSecondary, color: "#1d4ed8", borderColor: "#bfdbfe", background: "rgba(255,255,255,0.1)" }}
                disabled={isSubmitting}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>draft</span>
                Save Draft
              </button>
              <button type="submit" disabled={isSubmitting || !selectedProducts.length}
                style={{ ...S.btnPrimary, opacity: (isSubmitting || !selectedProducts.length) ? 0.6 : 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{isSubmitting ? "hourglass_top" : "save"}</span>
                {isSubmitting ? "Creating Plan…" : "Create Production Plan"}
              </button>
            </div>
          </div>
        )}

        {/* Bottom action bar (always visible) */}
        {!selectedProducts.length && (
          <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: 10, paddingTop: 8 }}>
            <button type="button" onClick={() => router.push("/production/demands")} style={S.btnSecondary}>Cancel</button>
            <button type="submit" disabled style={{ ...S.btnPrimary, opacity: 0.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
              Create Production Plan
            </button>
          </div>
        )}

      </form>

      {/* ── FABRIC SELECTOR MODAL ────────────────────────────────── */}
      {fabricModal.show && (
        <div style={S.modalOverlay} onClick={() => setFabricModal(s => ({ ...s, show: false }))}>
          <div style={S.modalPanel} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>Select Fabric / Colour</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Choose a fabric variant for this production run</div>
              </div>
              <button type="button" onClick={() => setFabricModal(s => ({ ...s, show: false }))}
                style={{ background: "#f1f5f9", border: "none", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <div style={S.modalTabs}>
              {FABRIC_CATEGORIES.map(cat => (
                <button key={cat} type="button" style={S.modalTab(fabricModal.category === cat)}
                  onClick={() => setFabricModal(s => ({ ...s, category: cat }))}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={S.modalBody}>
              <input type="text" placeholder="Search fabrics…"
                style={{ ...S.input, fontSize: 13, height: 38 }}
                value={fabricModal.search}
                onChange={e => setFabricModal(s => ({ ...s, search: e.target.value }))}
                onFocus={e => { e.currentTarget.style.borderColor = "#2563eb"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
              <div style={S.fabricGrid}>
                {filteredFabrics.length > 0 ? filteredFabrics.map(fab => {
                  const currentFabId = selectedProducts.find(p => p.productId === fabricModal.productId)?.variants.find(v => v.id === fabricModal.variantId)?.fabricId;
                  const isSelected = fab.id === currentFabId;
                  return (
                    <div key={fab.id} style={S.fabricItem(isSelected)} onClick={() => selectFabric(fab)}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.1)"; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; } }}>
                      <div style={S.fabricSwatch(fab.swatchColor)} />
                      <div style={{ textAlign: "center" as const }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#1d4ed8" : "#0f172a", lineHeight: 1.3 }}>{fab.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", marginTop: 3 }}>{fab.id}</div>
                      </div>
                      {isSelected && (
                        <span style={{ ...S.badgeSuccess, fontSize: 10, padding: "2px 8px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>check</span> Selected
                        </span>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ gridColumn: "1 / -1", padding: "32px", textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>
                    No fabrics found in this category.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
