import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/page`;

export interface PageDto {
  id: string;
  name: string;
  route: string;
  icon?: string;
  parentPageId?: string | null;
  parentPageName?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageCreateDto {
  name: string;
  route: string;
  icon?: string;
  parentPageId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PageUpdateDto {
  name: string;
  route: string;
  icon?: string;
  parentPageId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export async function fetchPages(): Promise<PageDto[]> {
  try {
    const response = await fetch(API_BASE_URL, { cache: "no-store" });

    if (!response.ok) {
      // Fallback try /pages plural
      const fallbackResponse = await fetch(`${API_MAIN_URL}/pages`, { cache: "no-store" });
      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }
      throw new Error(`Failed to fetch pages: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id || `page-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || "",
        route: item.route || "",
        icon: item.icon || "web",
        parentPageId: item.parentPageId || null,
        parentPageName: item.parentPageName || item.parentName,
        displayOrder: item.displayOrder ?? 1,
        isActive: item.isActive ?? true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
    return [];
  } catch (err) {
    console.error("fetchPages error:", err);
    throw err;
  }
}

export async function getPageById(id: string): Promise<PageDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch page ${id}: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createPage(payload: PageCreateDto): Promise<PageDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      route: payload.route.trim(),
      icon: payload.icon ? payload.icon.trim() : "",
      parentPageId: payload.parentPageId || null,
      displayOrder: payload.displayOrder ?? 1,
      isActive: payload.isActive ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create page: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    name: data.name || payload.name,
    route: data.route || payload.route,
    icon: data.icon || payload.icon,
    parentPageId: data.parentPageId || payload.parentPageId,
    displayOrder: data.displayOrder ?? payload.displayOrder ?? 1,
    isActive: data.isActive ?? payload.isActive ?? true,
  };
}

export async function updatePage(id: string, payload: PageUpdateDto): Promise<PageDto | void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      route: payload.route.trim(),
      icon: payload.icon ? payload.icon.trim() : "",
      parentPageId: payload.parentPageId || null,
      displayOrder: payload.displayOrder ?? 1,
      isActive: payload.isActive ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update page ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deletePage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete page ${id}: ${errorText || response.statusText}`);
  }
}
