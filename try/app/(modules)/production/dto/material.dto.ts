export interface MaterialDto {
  id: string;
  materialCode: string;
  name: string;
  type: string;
  availableQty: number;
  unit: string;
  costPerUnit?: number;
}

export interface MaterialRequirementDto {
  materialCode: string;
  materialName: string;
  materialType: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  unit: string;
  cost: number;
  status?: "Available" | "Shortage";
}

export interface BillOfMaterialDto {
  id?: string;
  productId: string;
  materialId: string;
  qtyPerUnit: number;
  wastagePercent: number;
}
