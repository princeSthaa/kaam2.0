import { API_MAIN_URL } from "../../production/api/constant";

export interface PurchaseOrderItemDto {
  materialId: string;
  orderedQuantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  materialCategoryId: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentTerms: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItemDto[];
}

export interface PurchaseOrderGetItemDto {
  id: string;
  purchaseOrderId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  orderedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderReceiptItemDto {
  id: string;
  purchaseOrderReceiptId: string;
  purchaseOrderItemId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  receivedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderReceiptDto {
  id: string;
  purchaseOrderId: string;
  orderNumber: string;
  receiptNumber: string;
  receivedDate: string;
  receivedBy: string;
  deliveryNoteNumber: string;
  remarks: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderReceiptItemDto[];
}

export interface PurchaseOrderGetDto {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  materialCategoryId: string;
  materialCategoryName: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentTerms: string;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderGetItemDto[];
  receipts: PurchaseOrderReceiptDto[];
}

export async function createPurchaseOrder(po: CreatePurchaseOrderDto): Promise<PurchaseOrderGetDto> {
  const response = await fetch(`${API_MAIN_URL}/purchase-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(po),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Purchase Order: ${errorText}`);
  }

  return response.json();
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrderGetDto[]> {
  const response = await fetch(`${API_MAIN_URL}/purchase-order`);
  if (!response.ok) {
    throw new Error("Failed to fetch Purchase Orders");
  }
  return response.json();
}
