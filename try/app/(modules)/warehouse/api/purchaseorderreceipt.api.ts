import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import { PurchaseOrderReceiptDto } from "./purchaseorder.api";

export interface CreatePurchaseOrderReceiptItemDto {
  purchaseOrderItemId: string;
  materialId: string;
  receivedQuantity: number;
}

export interface CreatePurchaseOrderReceiptDto {
  purchaseOrderId: string;
  orderNumber?: string;
  receivedBy: string;
  deliveryNoteNumber?: string;
  remarks?: string;
  status?: string;
  items: CreatePurchaseOrderReceiptItemDto[];
}

export async function createPurchaseOrderReceipt(data: CreatePurchaseOrderReceiptDto): Promise<PurchaseOrderReceiptDto> {
  const response = await fetch(`${API_MAIN_URL}/purchase-order-receipt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Purchase Order Receipt: ${errorText}`);
  }

  return response.json();
}

export async function fetchPurchaseOrderReceipts(): Promise<PurchaseOrderReceiptDto[]> {
  const response = await fetch(`${API_MAIN_URL}/purchase-order-receipt`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Purchase Order Receipts");
  }
  return response.json();
}
