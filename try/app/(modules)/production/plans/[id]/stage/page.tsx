"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { TableShell } from "@/app/components/ui/TableShell";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

const stageStatusOptions = [
  "Select Status",
  "Not Started",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
  "Rejected",
];

function StageUpdateForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const planId = (params?.id as string) || searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-0001";
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5083/api/production-plans/${encodeURIComponent(planId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPlan(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [planId]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <Script src="https://cdn.jsdelivr.net/npm/nepali-date-converter/dist/nepali-date-converter.umd.js" strategy="lazyOnload" />
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Stage Progress Update & Routing</h1>
          <p className="text-xs text-slate-500 mt-1">Log operator output, completed quantities, defect rejections, and workcenter transitions for plan #{planId}.</p>
        </div>
        <Link href={`/production/plans/${encodeURIComponent(planId)}`} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white">
          Back to Details
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading plan stages...</div>
      ) : (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm">Active Plan: {plan?.planName || planId}</h3>
          <p className="text-xs text-slate-500">Demand: {plan?.demandType || 'Customer Order'} &bull; Priority: {plan?.priority || 'Normal'}</p>
          <div className="flex justify-end gap-3 mt-4">
            <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" onClick={() => router.back()}>Cancel</button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={() => router.push(`/production/plans/${encodeURIComponent(planId)}`)}>Save Stage Progress</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanStagePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading stage update...</div>}>
      <StageUpdateForm />
    </Suspense>
  );
}
