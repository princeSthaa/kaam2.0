import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/permission`;

export interface PermissionDto {
  id: string;
  name: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionCreateDto {
  name: string;
  action: string;
  description?: string;
}

export interface PermissionUpdateDto {
  name: string;
  action: string;
  description?: string;
}

export async function fetchPermissions(): Promise<PermissionDto[]> {
  try {
    const response = await fetch(API_BASE_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id || `perm-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || "",
        action: item.action || "Get",
        description: item.description || "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
    return [];
  } catch (err) {
    console.error("fetchPermissions error:", err);
    throw err;
  }
}

export async function getPermissionById(id: string): Promise<PermissionDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch permission ${id}: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createPermission(payload: PermissionCreateDto): Promise<PermissionDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      action: payload.action.trim(),
      description: payload.description ? payload.description.trim() : "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create permission: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    name: data.name || payload.name,
    action: data.action || payload.action,
    description: data.description ?? payload.description,
  };
}

export async function updatePermission(
  id: string,
  payload: PermissionUpdateDto
): Promise<PermissionDto | void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      action: payload.action.trim(),
      description: payload.description ? payload.description.trim() : "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update permission ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deletePermission(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete permission ${id}: ${errorText || response.statusText}`);
  }
}
