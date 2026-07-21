import { Suspense } from "react";
import { ProductionDemandPlanPageContent } from "../../components/ProductionDemandPlanPage";

export default function OutletDemandPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductionDemandPlanPageContent kind="outlet" />
    </Suspense>
  );
}
