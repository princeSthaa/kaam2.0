// const API_BASE_URL = "http://localhost:5083/api/product";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/product`;

export interface ProductCategoryRef {
  id?: string;
  categoryCode?: string;
  name: string;
  isActive?: boolean;
}

export interface ProductMaterialRequirementItem {
  id?: string;
  productId?: string;
  materialTypeId: string;
  productSize: number | string; // Enum 0=XS, 1=S, 2=M, 3=L, 4=XL, 5=XXL etc
  quantity: number;
  materialType?: {
    id?: string;
    name?: string;
    unit?: string;
  };
}

export interface ProductProductionStageItem {
  id?: string;
  productId?: string;
  productionStageId: string;
  sequence: number;
  productionStage?: {
    id?: string;
    name?: string;
  };
}

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  imagePath?: string;
  isActive?: boolean;
  productCategoryId?: string;
  productCategoryName?: string;
  productCategory?: ProductCategoryRef;
  materialRequirements?: ProductMaterialRequirementItem[];
  productionStages?: ProductProductionStageItem[];
}

export interface CreateProductDto {
  sku?: string;
  name: string;
  productCategoryId: string;
  isActive?: boolean;
  materialRequirements?: ProductMaterialRequirementItem[] | string;
  productionStages?: ProductProductionStageItem[] | string;
  image?: File | null;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  productCategoryId?: string;
  isActive?: boolean;
  imagePath?: string;
  image?: File | null;
  materialRequirements?: ProductMaterialRequirementItem[] | string;
  productionStages?: ProductProductionStageItem[] | string;
}

export async function fetchProducts(params?: {
  id?: string;
  name?: string;
  imagePath?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}): Promise<ProductDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    } else {
      console.warn(`Product API returned status ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.error("Error connecting to Product API:", err);
  }
  return [];
}

export async function fetchProductById(id: string): Promise<ProductDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function createProduct(payload: CreateProductDto): Promise<ProductDto> {
  // If an image file is provided, use multipart/form-data POST to /api/product
  if (payload.image) {
    const formData = new FormData();
    if (payload.sku) formData.append("SKU", payload.sku);
    formData.append("Name", payload.name);
    formData.append("ProductCategoryId", payload.productCategoryId);
    formData.append("IsActive", String(payload.isActive ?? true));
    formData.append("Image", payload.image);

    const matReqStr = typeof payload.materialRequirements === "string"
      ? payload.materialRequirements
      : JSON.stringify(payload.materialRequirements || []);
    formData.append("MaterialRequirements", matReqStr);

    const stagesStr = typeof payload.productionStages === "string"
      ? payload.productionStages
      : JSON.stringify(payload.productionStages || []);
    formData.append("ProductionStages", stagesStr);

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product with image: ${errorText || response.statusText}`);
    }
    return await response.json();
  }

  // Otherwise use JSON POST endpoint /api/product/json
  const matReqList = Array.isArray(payload.materialRequirements)
    ? payload.materialRequirements
    : typeof payload.materialRequirements === "string" && payload.materialRequirements
      ? JSON.parse(payload.materialRequirements)
      : [];

  const stagesList = Array.isArray(payload.productionStages)
    ? payload.productionStages
    : typeof payload.productionStages === "string" && payload.productionStages
      ? JSON.parse(payload.productionStages)
      : [];

  const body = {
    sku: payload.sku || `SKU-${Date.now().toString().slice(-4)}`,
    name: payload.name,
    productCategoryId: payload.productCategoryId,
    isActive: payload.isActive ?? true,
    materialRequirements: matReqList,
    productionStages: stagesList,
  };

  const response = await fetch(`${API_BASE_URL}/json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create product: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateProduct(id: string, payload: UpdateProductDto): Promise<void> {
  if (payload.image) {
    const formData = new FormData();
    if (payload.sku) formData.append("SKU", payload.sku);
    if (payload.name) formData.append("Name", payload.name);
    if (payload.productCategoryId) formData.append("ProductCategoryId", payload.productCategoryId);
    if (payload.isActive !== undefined) formData.append("IsActive", String(payload.isActive));
    if (payload.imagePath) formData.append("ImagePath", payload.imagePath);
    formData.append("Image", payload.image);

    if (payload.materialRequirements) {
      const matReqStr = typeof payload.materialRequirements === "string" 
        ? payload.materialRequirements 
        : JSON.stringify(payload.materialRequirements);
      formData.append("MaterialRequirements", matReqStr);
    }
    
    if (payload.productionStages) {
      const stagesStr = typeof payload.productionStages === "string" 
        ? payload.productionStages 
        : JSON.stringify(payload.productionStages);
      formData.append("ProductionStages", stagesStr);
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update product ${id}: ${errorText || response.statusText}`);
    }
    return;
  }

  const matReqList = Array.isArray(payload.materialRequirements)
    ? payload.materialRequirements
    : typeof payload.materialRequirements === "string" && payload.materialRequirements
      ? JSON.parse(payload.materialRequirements)
      : undefined;

  const stagesList = Array.isArray(payload.productionStages)
    ? payload.productionStages
    : typeof payload.productionStages === "string" && payload.productionStages
      ? JSON.parse(payload.productionStages)
      : undefined;

  const body: any = { ...payload };
  if (matReqList !== undefined) body.materialRequirements = matReqList;
  if (stagesList !== undefined) body.productionStages = stagesList;

  const response = await fetch(`${API_BASE_URL}/${id}/json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update product ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete product ${id}: ${errorText || response.statusText}`);
  }
}
