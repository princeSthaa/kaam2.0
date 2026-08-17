import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import { MaterialGetDto } from "./material.api";

export interface SupplierGetDto {
  id: string;
  code: string;
  name: string;
}

export interface MaterialRequestItemDto {
  id: string;
  materialRequestId: string;
  materialId: string;
  requestedQuantity: number;
  material?: MaterialGetDto;
}

export interface MaterialRequestDto {
  id: string;
  requestNumber: string;
  supplierId?: string;
  status: string;
  requiredDate: string;
  notes: string;
  requestedBy: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  supplier?: SupplierGetDto;
  items: MaterialRequestItemDto[];
}

export interface CreateMaterialRequestItemDto {
  materialId: string;
  requestedQuantity: number;
}

export interface CreateMaterialRequestDto {
  supplierId?: string;
  status?: string;
  requiredDate: string;
  notes?: string;
  requestedBy?: string;
  items: CreateMaterialRequestItemDto[];
}

export interface UpdateStatusDto {
  status: string;
}

export async function getMaterialRequests(): Promise<MaterialRequestDto[]> {
  const response = await fetch(`${API_MAIN_URL}/material-request`);
  if (!response.ok) {
    throw new Error("Failed to fetch Material Requests");
  }
  return response.json();
}

export async function createMaterialRequest(data: CreateMaterialRequestDto): Promise<MaterialRequestDto> {
  const response = await fetch(`${API_MAIN_URL}/material-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Material Request: ${errorText}`);
  }

  return response.json();
}

export async function updateMaterialRequestStatus(id: string, status: string): Promise<MaterialRequestDto> {
  const response = await fetch(`${API_MAIN_URL}/material-request/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Material Request status: ${errorText}`);
  }

  return response.json();
}
