import { Suspense } from "react";
import { ProductionDemandPlanPageContent } from "../../components/ProductionDemandPlanPage";

export default function CustomerDemandPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductionDemandPlanPageContent kind="customer" />
    </Suspense>
  );
}
