const API_BASE_URL = "http://localhost:5083/api/product-category";

export interface ProductCategoryDto {
  id?: string;
  categoryCode?: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductCategoryDto {
  name: string;
  categoryCode?: string;
  isActive?: boolean;
}

export interface UpdateProductCategoryDto {
  name?: string;
  categoryCode?: string;
  isActive?: boolean;
}

export async function fetchProductCategories(): Promise<ProductCategoryDto[]> {
  const response = await fetch(API_BASE_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch product categories: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchProductCategoryById(id: string): Promise<ProductCategoryDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch product category ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function createProductCategory(payload: CreateProductCategoryDto): Promise<ProductCategoryDto> {
  const body = {
    name: payload.name,
    categoryCode: payload.categoryCode || "",
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
    throw new Error(`Failed to create product category: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // JSON parse fallback if server returns non-json
    }
  }

  return {
    name: body.name,
    categoryCode: body.categoryCode,
    isActive: body.isActive,
  };
}

export async function updateProductCategory(id: string, payload: UpdateProductCategoryDto): Promise<void> {
  const body = {
    id,
    name: payload.name,
    categoryCode: payload.categoryCode || "",
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
    throw new Error(`Failed to update product category ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteProductCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete product category ${id}: ${errorText || response.statusText}`);
  }
}
