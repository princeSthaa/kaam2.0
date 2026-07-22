"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import { checkMaterials } from "../../api/production.api";

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

function CreatePlanForm() {
  const router = useRouter();
  const [tempData, setTempData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planNo, setPlanNo] = useState("");
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pending_production_plan");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTempData(parsed);
        setPlanNo(parsed.planNo || `PP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-001`);
        setPlanName(parsed.planName || "New Production Run");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create Production Plan</h1>
          <p className="text-xs text-slate-500 mt-1">Configure line assignments, scheduling, and stage routing details.</p>
        </div>
        <Link href="/production/demands" className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white">
          Back to Demands
        </Link>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Plan Number</label>
            <input className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 font-mono" value={planNo} onChange={(e) => setPlanNo(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono font-mono">Plan Title</label>
            <input className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50" value={planName} onChange={(e) => setPlanName(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" onClick={() => router.push("/production/demands")}>Cancel</button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={() => router.push("/production/plans")}>Save Production Plan</button>
        </div>
      </div>
    </div>
  );
}

export default function PlanNewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading plan creator...</div>}>
      <CreatePlanForm />
    </Suspense>
  );
}
