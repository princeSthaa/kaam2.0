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
  // MOCK DATA: Bypassing the backend 500 error
  return [
    {
      id: "d9b2d63d-a233-4123-8478-000000000001",
      sku: "TSH-WHT-001",
      name: "Premium White T-Shirt",
      isActive: true,
      productCategory: {
        id: "c1",
        name: "Apparel",
      },
      materialRequirements: [
        {
          id: "req-1",
          materialTypeId: "m1",
          productSize: 1, // S
          quantity: 1.2,
          materialType: { id: "m1", name: "Cotton Fabric", unit: "Meters" }
        },
        {
          id: "req-2",
          materialTypeId: "m1",
          productSize: 2, // M
          quantity: 1.5,
          materialType: { id: "m1", name: "Cotton Fabric", unit: "Meters" }
        },
        {
          id: "req-3",
          materialTypeId: "m2",
          productSize: 2, // M
          quantity: 10,
          materialType: { id: "m2", name: "White Thread", unit: "Spools" }
        }
      ],
      productionStages: [
        {
          id: "ps-1",
          productionStageId: "stg-1",
          sequence: 1,
          productionStage: { id: "stg-1", name: "Cutting" }
        },
        {
          id: "ps-2",
          productionStageId: "stg-2",
          sequence: 2,
          productionStage: { id: "stg-2", name: "Sewing" }
        }
      ]
    },
    {
      id: "d9b2d63d-a233-4123-8478-000000000002",
      sku: "HD-BLK-001",
      name: "Heavyweight Black Hoodie",
      isActive: true,
      productCategory: {
        id: "c2",
        name: "Outerwear",
      },
      materialRequirements: [
        {
          id: "req-4",
          materialTypeId: "m3",
          productSize: 3, // L
          quantity: 2.5,
          materialType: { id: "m3", name: "Fleece Fabric", unit: "Meters" }
        }
      ],
      productionStages: [
        {
          id: "ps-3",
          productionStageId: "stg-1",
          sequence: 1,
          productionStage: { id: "stg-1", name: "Cutting" }
        }
      ]
    },
    {
      id: "d9b2d63d-a233-4123-8478-000000000003",
      sku: "CP-RED-001",
      name: "Vintage Red Cap",
      isActive: false, // Draft/Review
      productCategory: {
        id: "c3",
        name: "Accessories",
      },
      materialRequirements: [],
      productionStages: []
    }
  ];
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
