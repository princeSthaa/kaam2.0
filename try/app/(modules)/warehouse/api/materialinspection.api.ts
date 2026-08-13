import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface MaterialInspectionItemDto {
  id: string; // Used for PUT
  materialInspectionId?: string;
  materialId?: string; // Used to map to PO items
  materialCode?: string;
  materialName?: string;
  receivedQuantity?: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  inspectionStatus: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialInspectionDto {
  inspectionStatus: string;
  inspectorName: string;
  notes?: string;
  items: MaterialInspectionItemDto[];
}

export interface MaterialInspectionDto {
  id: string;
  purchaseOrderReceiptId: string;
  purchaseOrderId?: string;
  receiptNumber?: string;
  orderNumber?: string;
  supplierId?: string;
  supplierName?: string;
  inspectionStatus: string;
  inspectorName: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items: MaterialInspectionItemDto[];
}

export async function createMaterialInspection(data: CreateMaterialInspectionDto): Promise<any> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Material Inspection: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function fetchMaterialInspections(): Promise<MaterialInspectionDto[]> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch material inspections");
  }
  return response.json();
}

export async function updateMaterialInspection(id: string, data: CreateMaterialInspectionDto): Promise<MaterialInspectionDto> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Material Inspection: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
