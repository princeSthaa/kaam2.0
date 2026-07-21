import { Suspense } from "react";
import { ProductionStageUpdatePage } from "../../../components/ProductionStageUpdatePage";

export default function PlanStagePage() {
  return (
    <Suspense fallback={<div>Loading stage update...</div>}>
      <ProductionStageUpdatePage />
    </Suspense>
  );
}
