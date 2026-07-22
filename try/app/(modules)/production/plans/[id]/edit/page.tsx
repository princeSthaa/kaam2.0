import { Suspense } from "react";
import { ProductionPlanEditPage } from "../../../components/ProductionPlanEditPage";

function EditPageFallback() {
  return (
    <div style={{ maxWidth: 1100, margin: "60px auto", padding: 40, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h3 style={{ margin: "16px 0 6px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Loading Production Plan Editor</h3>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Retrieving plan parameters and routing stages...</p>
    </div>
  );
}

export default function PlanEditPage() {
  return (
    <Suspense fallback={<EditPageFallback />}>
      <ProductionPlanEditPage />
    </Suspense>
  );
}
