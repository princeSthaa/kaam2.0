const API_BASE_URL = "http://localhost:5083/api/supplier";

export interface SupplierCategoryResponseDto {
  id?: string;
  materialCategoryId: string;
  name: string;
  materialCode?: string;
}

export interface SupplierDto {
  id: string;
  supplierCode: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: number | string;
  onTimeDeliveryRate?: number;
  defectRate?: number;
  rating?: number;
  totalOrders?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  materialCategories?: SupplierCategoryResponseDto[];
}

export interface SupplierCreateDto {
  supplierCode?: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status?: number;
  materialCategoryIds?: string[];
}

export interface SupplierUpdateDto {
  supplierCode?: string;
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status?: number;
  materialCategoryIds?: string[];
}

export async function fetchSuppliers(params?: {
  id?: string;
  supplierCode?: string;
  name?: string;
  status?: number;
}): Promise<SupplierDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.supplierCode) query.append("supplierCode", params.supplierCode);
  if (params?.name) query.append("name", params.name);
  if (params?.status !== undefined) query.append("status", String(params.status));

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
  }

  return await response.json();
}

export async function createSupplier(payload: SupplierCreateDto): Promise<SupplierDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      supplierCode: payload.supplierCode || "",
      name: payload.name,
      contactEmail: payload.contactEmail || "",
      contactPhone: payload.contactPhone || "",
      address: payload.address || "",
      status: payload.status ?? 0,
      materialCategoryIds: payload.materialCategoryIds || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create supplier: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateSupplier(id: string, payload: SupplierUpdateDto): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update supplier ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete supplier ${id}: ${errorText || response.statusText}`);
  }
}
