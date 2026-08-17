import { API_MAIN_URL } from "@/app/(modules)/api/constant";

/* ─── Item DTOs ──────────────────────────────────────────────────────── */

export interface MaterialInspectionItemDto {
  id?: string;
  materialInspectionId?: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  inspectionStatus: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ─── POST (Create) DTOs ─────────────────────────────────────────────── */

export interface CreateMaterialInspectionDto {
  purchaseOrderId?: string;
  purchaseOrderReceiptId: string;
  inspectionStatus: string;
  inspectorName?: string;
  notes?: string;
  items: MaterialInspectionItemDto[];
}

export interface MaterialInspectionDto {
  id: string;
  purchaseOrderReceiptId: string;
  receiptNumber?: string;
  purchaseOrderId?: string;
  orderNumber?: string;
  supplierId?: string;
  supplierCode?: string;
  supplierName?: string;
  inspectionStatus: string;
  inspectorName?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  items: MaterialInspectionItemDto[];
}

/* ─── PUT (Update) DTOs ──────────────────────────────────────────────── */

export interface UpdateMaterialInspectionItemDto {
  id?: string;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  inspectionStatus?: string;
  notes?: string;
}

export interface UpdateMaterialInspectionDto {
  inspectionStatus?: string;
  inspectorName?: string;
  notes?: string;
  items?: UpdateMaterialInspectionItemDto[];
}

/* ─── API Functions ──────────────────────────────────────────────────── */

export async function fetchMaterialInspections(params?: {
  purchaseOrderReceiptId?: string;
  inspectionStatus?: string;
}): Promise<MaterialInspectionDto[]> {
  const query = new URLSearchParams();
  if (params?.purchaseOrderReceiptId) query.append("purchaseOrderReceiptId", params.purchaseOrderReceiptId);
  if (params?.inspectionStatus) query.append("inspectionStatus", params.inspectionStatus);

  const url = `${API_MAIN_URL}/material-inspection${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch material inspections: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function fetchMaterialInspectionById(id: string): Promise<MaterialInspectionDto> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch material inspection ${id}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function createMaterialInspection(data: CreateMaterialInspectionDto): Promise<MaterialInspectionDto> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Material Inspection: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function updateMaterialInspection(id: string, data: UpdateMaterialInspectionDto): Promise<MaterialInspectionDto> {
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

  return response.json();
}

export async function updateMaterialInspectionItem(
  itemId: string,
  data: UpdateMaterialInspectionItemDto
): Promise<any> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update inspection item ${itemId}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function deleteMaterialInspection(id: string): Promise<void> {
  const response = await fetch(`${API_MAIN_URL}/material-inspection/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete Material Inspection ${id}: ${errorText || response.statusText}`);
  }
}