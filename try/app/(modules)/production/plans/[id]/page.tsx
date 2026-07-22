import { Suspense } from "react";
import { ProductionPlanDetailsPage } from "../../components/ProductionPlanDetailsPage";

export default function PlanDetailsPage() {
  return (
    <Suspense fallback={<div>Loading plan details...</div>}>
      <ProductionPlanDetailsPage />
    </Suspense>
  );
}
