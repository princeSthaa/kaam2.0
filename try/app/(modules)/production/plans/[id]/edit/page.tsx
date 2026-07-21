import { Suspense } from "react";
import { ProductionPlanEditPage } from "../../../components/ProductionPlanEditPage";

export default function PlanEditPage() {
  return (
    <Suspense fallback={<div>Loading plan editor...</div>}>
      <ProductionPlanEditPage />
    </Suspense>
  );
}
