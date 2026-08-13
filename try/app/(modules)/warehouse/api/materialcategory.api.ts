import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface MaterialCategoryDto {
  id: string;
  name: string;
  code: string;
}

export async function fetchMaterialCategories(): Promise<MaterialCategoryDto[]> {
  const response = await fetch(`${API_MAIN_URL}/material-category`, {
    cache: "no-store",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch material categories");
  }
  
  return await response.json();
}
