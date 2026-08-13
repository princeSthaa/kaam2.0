import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface UpdateInventoryDto {
  materialId: string;
  quantityAdded: number;
  locationId?: string; // e.g., default warehouse location
  referenceId?: string; // e.g., purchase order ID
}

export async function updateInventory(data: UpdateInventoryDto): Promise<any> {
  const response = await fetch(`${API_MAIN_URL}/inventory`, {
    method: "POST", // assuming POST to create an inventory transaction
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Inventory: ${errorText}`);
  }

  return response.json();
}
