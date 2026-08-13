import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface ProductDemandGetDto {
    id: string;
    requestId: string;
    materialId: string;
    materialCode: string;
    materialTypeName: string;
    materialTypeCode: string;
    materialCategoryName: string;
    materialCategoryCode: string;
    quantity: number;
    approvedBy: string;
    isIssued: boolean;
}

export interface ProductDemandDto {
    id: string;
    requestId: string;
    materialId: string;
    quantity: number;
    approvedBy: string;
    isIssued: boolean;
    createdAt: string;
    updatedAt: string;
}

export async function getProductDemands(): Promise<ProductDemandGetDto[]> {
    const res = await fetch(`${API_MAIN_URL}/product-demand`);
    if (!res.ok) throw new Error("Failed to fetch product demands");
    return res.json();
}

export async function updateProductDemand(id: string, data: ProductDemandDto): Promise<void> {
    const res = await fetch(`${API_MAIN_URL}/product-demand/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to update product demand");
    }
}
