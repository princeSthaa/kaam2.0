import { MaterialRequirementDto } from "../dto";

export function calculateMaterialShortage(
  requiredMaterials: { materialCode: string; materialName: string; requiredQty: number; unit: string; cost: number }[],
  availableStock: Record<string, number>
): MaterialRequirementDto[] {
  return requiredMaterials.map((mat) => {
    const available = availableStock[mat.materialCode] ?? 1000;
    const shortage = Math.max(0, mat.requiredQty - available);
    return {
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      materialType: "Raw Material",
      requiredQty: mat.requiredQty,
      availableQty: available,
      shortageQty: shortage,
      unit: mat.unit,
      cost: mat.cost,
    };
  });
}

export function estimateProductionLeadTimeHours(stages: { leadHours?: string | number }[]): number {
  return stages.reduce((total, st) => {
    const hrs = typeof st.leadHours === "number" ? st.leadHours : parseFloat(String(st.leadHours || 0));
    return total + (isNaN(hrs) ? 0 : hrs);
  }, 0);
}
