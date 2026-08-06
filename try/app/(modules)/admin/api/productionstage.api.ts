const API_BASE_URL = "http://localhost:5083/api/production-stage";

export interface ProductionStageDto {
  id?: string;
  productionStageCode?: string;
  name: string;
  description?: string;
  duration?: string;
  isActive?: boolean;
}

export interface CreateProductionStageDto {
  name: string;
  description?: string;
  duration?: string;
  isActive?: boolean;
}

export interface UpdateProductionStageDto {
  id?: string;
  name?: string;
  description?: string;
  duration?: string;
  isActive?: boolean;
}

export async function fetchProductionStages(): Promise<ProductionStageDto[]> {
  const response = await fetch(API_BASE_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch production stages: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchProductionStageById(id: string): Promise<ProductionStageDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch production stage ${id}: ${response.statusText}`);
  }

  return await response.json();
}

export async function createProductionStage(payload: CreateProductionStageDto): Promise<ProductionStageDto> {
  const body = {
    name: payload.name,
    description: payload.description || "",
    duration: payload.duration || "30",
    isActive: payload.isActive ?? true,
  };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create production stage: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // Return fallback if non-json
    }
  }

  return {
    name: body.name,
    description: body.description,
    duration: body.duration,
    isActive: body.isActive,
  };
}

export async function updateProductionStage(id: string, payload: UpdateProductionStageDto): Promise<void> {
  const body = {
    id,
    name: payload.name,
    description: payload.description || "",
    duration: payload.duration || "30",
    isActive: payload.isActive ?? true,
  };

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update production stage ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteProductionStage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete production stage ${id}: ${errorText || response.statusText}`);
  }
}
