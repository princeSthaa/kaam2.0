"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import { ProductionPlanDto, MaterialDto, BillOfMaterialDto } from "../../../dto";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FABRIC_CATEGORIES = ["Cotton", "Pique", "Fleece"];
const WORK_CENTERS = ["QC Station 1", "Cutter Auto-B", "Line 4A", "Sewing Floor", "QC Table", "Packing Area", "Embroidery Unit"];

const formatRs = (v: number) => `Rs. ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Variant = { id: string; fabricId: string; fabricName: string; swatchColor: string; sizes: Record<string, number> };
type Stage   = { id: string; name: string; workCenter: string; leadHours: string; date: string };
type Product = { productId: string; productCode: string; productName: string; productImage: string; plannedStartDate: string; plannedCompletionDate: string; requiredDate: string; variants: Variant[]; stages: Stage[]; productionNotes: string; isExpanded: boolean };
type MatReq  = { materialCode: string; materialName: string; materialType: string; requiredQty: number; availableQty: number; shortageQty: number; unit: string; cost: number };

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
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)",
  },
  cardHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  cardIconBox: (color: string, bg: string) => ({ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }),
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  cardBody: { padding: "24px" },
  fieldLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6, fontFamily: "JetBrains Mono, monospace" },
  input: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42 },
  select: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif", height: 42, cursor: "pointer" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg,#1d4ed8,#2563eb)", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: "#fff", border: "1.5px solid #e2e8f0", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" },
};

function PlanEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const planId = (params?.id as string) || searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-20260529-001";

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
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5083/api/material").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/bill-of-material").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:5083/api/customer").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([mats, boms, custs]) => {
      setCustomers(custs || []);
    });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5083/api/production-plans")
      .then((res) => res.json())
      .then((plans) => {
        const plan = plans.find((p: any) => p.planId === planId || p.planNo === planId || p.id === planId);
        if (plan) {
          setDbId(plan.id);
          setOriginalPlan(plan);
          setPlanDate(plan.planDate || plan.plannedStartDate || new Date().toISOString().split("T")[0]);
          setDemandType(plan.demandType || "Customer Order");
          setPriority(plan.priority || "Normal");
          setOutputDestination(plan.outputDestination || "Customer Dispatch");
          setCustomerId(plan.sourceId || "CUST-001");
        }
      })
      .catch((err) => console.error("Error fetching plan:", err))
      .finally(() => setIsLoading(false));
  }, [planId]);

  return (
    <div style={S.page}>
      <Script src="https://cdn.jsdelivr.net/npm/nepali-date-converter/dist/nepali-date-converter.umd.js" strategy="lazyOnload" />
      <div style={S.hero}>
        <div style={S.heroBlobA} />
        <div style={S.heroBlobB} />
        <div>
          <div style={S.heroLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
            PLAN EDITOR &bull; {planId}
          </div>
          <h1 style={S.heroTitle}>Edit Production Plan</h1>
          <p style={S.heroSub}>Modify plan attributes, target quantities, and stage routing details.</p>
        </div>
        <div style={S.heroActions}>
          <Link href={`/production/plans/${encodeURIComponent(planId)}`} style={S.btnOutlineWhite}>
            Cancel
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Loading plan details...</div>
      ) : (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox("#2563eb", "#eff6ff")}>
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div>
                <h3 style={S.cardTitle}>Header & Demand Source</h3>
                <div style={S.cardSub}>Update demand classification and customer information</div>
              </div>
            </div>
          </div>
          <div style={S.cardBody}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={S.fieldLabel}>Plan ID</label>
                <input style={{ ...S.input, background: "#e2e8f0" }} value={planId} disabled />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Date</label>
                <input type="date" style={S.input} value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
              </div>
              <div>
                <label style={S.fieldLabel}>Demand Type</label>
                <select style={S.select} value={demandType} onChange={(e) => setDemandType(e.target.value)}>
                  <option value="Customer Order">Customer Order</option>
                  <option value="Outlet Replenishment">Outlet Replenishment</option>
                  <option value="In-house Stock">In-house Stock</option>
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Priority</label>
                <select style={S.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button style={S.btnSecondary} onClick={() => router.back()}>Cancel</button>
              <button style={S.btnPrimary} onClick={() => router.push(`/production/plans/${encodeURIComponent(planId)}`)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanEditPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}>Loading plan editor...</div>}>
      <PlanEditForm />
    </Suspense>
  );
}
