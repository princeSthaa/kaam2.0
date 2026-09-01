import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/role`;

export interface RoleDto {
  id: string;
  roleName: string;
  name?: string;
  description?: string;
  modulePageId?: string | null;
  moduleName?: string | null;
  moduleRoute?: string | null;
  isModuleAdmin?: boolean;
  isSuperAdmin?: boolean;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleCreateDto {
  roleName: string;
  description?: string;
  modulePageId?: string | null;
  isModuleAdmin?: boolean;
}

export interface RoleUpdateDto {
  roleName: string;
  description?: string;
  modulePageId?: string | null;
  isModuleAdmin?: boolean;
}

export async function fetchRoles(): Promise<RoleDto[]> {
  const response = await fetch(API_BASE_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.statusText}`);
  }

  const data = await response.json();
  // Normalize if data has "name" instead of "roleName" or vice-versa
  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      ...item,
      roleName: item.roleName || item.name || "",
      description: item.description || "",
    }));
  }
  return [];
}

export async function getRoleById(id: string): Promise<RoleDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch role ${id}: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    roleName: data.roleName || data.name || "",
    description: data.description || "",
  };
}

export async function createRole(payload: RoleCreateDto): Promise<RoleDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleName: payload.roleName.trim(),
      description: payload.description ? payload.description.trim() : "",
      modulePageId: payload.modulePageId,
      isModuleAdmin: payload.isModuleAdmin ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create role: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    roleName: data.roleName || payload.roleName,
    description: data.description ?? payload.description,
  };
}

export async function updateRole(id: string, payload: RoleUpdateDto): Promise<RoleDto | void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleName: payload.roleName.trim(),
      description: payload.description ? payload.description.trim() : "",
      modulePageId: payload.modulePageId,
      isModuleAdmin: payload.isModuleAdmin ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update role ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deleteRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete role ${id}: ${errorText || response.statusText}`);
  }
}
