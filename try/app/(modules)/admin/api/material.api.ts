const API_BASE_URL = "http://localhost:5083/api/material";

export interface MaterialTypeRef {
  id?: string;
  name: string;
}

export interface MaterialCategoryRef {
  id?: string;
  name: string;
}

export interface MaterialGetDto {
  id: string;
  materialCode?: string;
  name: string;
  materialTypeId?: string;
  materialType?: MaterialTypeRef;
  materialCategoryId?: string;
  materialCategory?: MaterialCategoryRef;
  availableQty?: number;
  imagePath?: string;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialDto {
  id?: string;
  materialCode?: string;
  name: string;
  materialTypeId: string;
  materialCategoryId: string;
  availableQty?: number;
  imagePath?: string;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchMaterials(params?: {
  id?: string;
  materialCode?: string;
  name?: string;
  materialTypeId?: string;
  materialCategoryId?: string;
}): Promise<MaterialGetDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.materialCode) query.append("materialCode", params.materialCode);
  if (params?.name) query.append("name", params.name);
  if (params?.materialTypeId) query.append("materialTypeId", params.materialTypeId);
  if (params?.materialCategoryId) query.append("materialCategoryId", params.materialCategoryId);

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.statusText}`);
  }

  return await response.json();
}

export async function uploadMaterialImage(
  imageFile: File,
  typeName: string = "Fabric",
  categoryName: string = "General"
): Promise<{ relativePath: string; fullUrl: string }> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("typeName", typeName);
  formData.append("categoryName", categoryName);

  const response = await fetch(`${API_BASE_URL}/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload material image: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createMaterial(payload: MaterialDto): Promise<void> {
  const body = {
    id: payload.id || undefined,
    materialCode: payload.materialCode || `MAT-${Date.now().toString().slice(-6)}`,
    name: payload.name,
    materialTypeId: payload.materialTypeId,
    materialCategoryId: payload.materialCategoryId,
    availableQty: payload.availableQty ?? 0,
    imagePath: payload.imagePath || "",
    costPerUnit: payload.costPerUnit ?? 0,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString(),
  };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create material: ${errorText || response.statusText}`);
  }
}

export async function updateMaterial(id: string, payload: Partial<MaterialDto>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, id, updatedAt: new Date().toISOString() }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update material ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteMaterial(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete material ${id}: ${errorText || response.statusText}`);
  }
}
