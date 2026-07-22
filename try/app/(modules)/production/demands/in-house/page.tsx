"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import { fetchProducts, fetchFabrics, resolveMediaUrl } from "../../../crm/api/catalog.api";

export default function InHouseDemandPage() {
  const router = useRouter();
  const [productsList, setProductsList] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [targetWarehouse, setTargetWarehouse] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  useEffect(() => {
    Promise.all([
      fetchProducts().catch(() => []),
      fetch("http://localhost:5083/api/warehouse").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([prods, whs]) => {
      setProductsList(prods || []);
      setWarehouses(whs || []);
      if (whs && whs.length > 0) setTargetWarehouse(whs[0].id || whs[0].name);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">In-House Stock Demand</h1>
          <p className="text-xs text-slate-500 mt-1">Initiate internal inventory replenishment runs directly for factory warehouses.</p>
        </div>
        <Link href="/production/demands" className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white">
          Back to Demands
        </Link>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Plan Title / Batch Note</label>
            <input 
              type="text"
              placeholder="e.g. Q3 Seasonal Replenishment Run"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Target Destination Warehouse</label>
            <select 
              className="w-full border border-slate-200 rounded-xl p-3 text-sm"
              value={targetWarehouse}
              onChange={(e) => setTargetWarehouse(e.target.value)}
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name} ({wh.location || 'Main Factory'})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" onClick={() => router.push("/production/demands")}>
            Cancel
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={() => router.push("/production/plans/new")}>
            Proceed to Stage Routing
          </button>
        </div>
      </div>
    </div>
  );
}
