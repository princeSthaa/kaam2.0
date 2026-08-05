const API_BASE_URL = "http://localhost:5083/api/material-type";

export interface MaterialTypeDto {
  id?: string;
  name: string;
  materialCode?: string;
  description?: string;
  isActive?: boolean;
  unit?: string;
  defaultUom?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialTypeDto {
  name: string;
  unit?: string;
  defaultUom?: string;
  description?: string;
  materialCode?: string;
  isActive?: boolean;
}

export interface UpdateMaterialTypeDto {
  name?: string;
  unit?: string;
  defaultUom?: string;
  description?: string;
  isActive?: boolean;
}

export async function fetchMaterialTypes(params?: {
  id?: string;
  name?: string;
  unit?: string;
  description?: string;
  isActive?: boolean;
}): Promise<MaterialTypeDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.name) query.append("name", params.name);
  if (params?.unit) query.append("unit", params.unit);
  if (params?.description) query.append("description", params.description);
  if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch material types: ${response.statusText}`);
  }

  const data: MaterialTypeDto[] = await response.json();
  return data.map((item) => ({
    ...item,
    defaultUom: item.unit || item.defaultUom || "meters",
  }));
}

export async function fetchMaterialTypeById(id: string): Promise<MaterialTypeDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch material type ${id}: ${response.statusText}`);
  }
  const item: MaterialTypeDto = await response.json();
  return {
    ...item,
    defaultUom: item.unit || item.defaultUom || "meters",
  };
}

export async function createMaterialType(payload: CreateMaterialTypeDto): Promise<MaterialTypeDto> {
  const body = {
    name: payload.name,
    unit: payload.unit || payload.defaultUom || "meters",
    description: payload.description || "",
    materialCode: payload.materialCode || "",
    isActive: payload.isActive ?? true,
  };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create material type: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  if (text) {
    try {
      const created = JSON.parse(text);
      return {
        ...created,
        defaultUom: created.unit || created.defaultUom || body.unit,
      };
    } catch {
      // If server returned plain text or non-json status 200
    }
  }

  return {
    name: body.name,
    unit: body.unit,
    defaultUom: body.unit,
    description: body.description,
    isActive: body.isActive,
  };
}

export async function updateMaterialType(id: string, payload: UpdateMaterialTypeDto): Promise<void> {
  const body = {
    id,
    name: payload.name,
    unit: payload.unit || payload.defaultUom || "meters",
    description: payload.description || "",
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
    throw new Error(`Failed to update material type ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteMaterialType(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete material type ${id}: ${errorText || response.statusText}`);
  }
}
