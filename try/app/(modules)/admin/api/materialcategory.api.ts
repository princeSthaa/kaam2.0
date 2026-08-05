const API_BASE_URL = "http://localhost:5083/api/material-category";

export interface MaterialCategoryDto {
  id?: string;
  name: string;
  materialCode?: string;
  description?: string;
  isActive?: boolean;
  materialTypeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialCategoryDto {
  name: string;
  materialTypeId?: string;
  description?: string;
  materialCode?: string;
  isActive?: boolean;
}

export interface UpdateMaterialCategoryDto {
  name?: string;
  materialTypeId?: string;
  description?: string;
  materialCode?: string;
  isActive?: boolean;
}

export async function fetchMaterialCategories(params?: {
  id?: string;
  name?: string;
  materialCode?: string;
  description?: string;
  isActive?: boolean;
  materialTypeId?: string;
}): Promise<MaterialCategoryDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.name) query.append("name", params.name);
  if (params?.materialCode) query.append("materialCode", params.materialCode);
  if (params?.description) query.append("description", params.description);
  if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
  if (params?.materialTypeId) query.append("materialTypeId", params.materialTypeId);

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch material categories: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchMaterialCategoryById(id: string): Promise<MaterialCategoryDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch material category ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function createMaterialCategory(payload: CreateMaterialCategoryDto): Promise<MaterialCategoryDto> {
  const body = {
    name: payload.name,
    materialTypeId: payload.materialTypeId || "00000000-0000-0000-0000-000000000000",
    description: payload.description || "",
    materialCode: payload.materialCode || "",
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create material category: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // If server returned plain text or status 200
    }
  }

  return {
    name: body.name,
    materialTypeId: body.materialTypeId,
    description: body.description,
    materialCode: body.materialCode,
    isActive: body.isActive,
  };
}

export async function updateMaterialCategory(id: string, payload: UpdateMaterialCategoryDto): Promise<void> {
  const body = {
    id,
    name: payload.name,
    materialTypeId: payload.materialTypeId || "00000000-0000-0000-0000-000000000000",
    description: payload.description || "",
    materialCode: payload.materialCode || "",
    isActive: payload.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update material category ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteMaterialCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete material category ${id}: ${errorText || response.statusText}`);
  }
}
