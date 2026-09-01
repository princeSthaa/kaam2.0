import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/role-page-permission`;

export interface RolePagePermissionDto {
  id: string;
  rolePageAccessId: string;
  permissionId: string;
  roleName?: string;
  pageName?: string;
  pageRoute?: string;
  permissionName?: string;
  permissionAction?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePagePermissionCreateDto {
  rolePageAccessId: string;
  permissionId: string;
}

export interface RolePagePermissionUpdateDto {
  rolePageAccessId: string;
  permissionId: string;
}

export async function fetchRolePagePermissions(): Promise<RolePagePermissionDto[]> {
  try {
    const response = await fetch(API_BASE_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch role page permissions: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id || `rpp-${Math.random().toString(36).substr(2, 9)}`,
        rolePageAccessId: item.rolePageAccessId || "",
        permissionId: item.permissionId || "",
        roleName: item.roleName,
        pageName: item.pageName,
        pageRoute: item.pageRoute,
        permissionName: item.permissionName || item.permission?.name,
        permissionAction: item.permissionAction || item.permission?.action,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
    return [];
  } catch (err) {
    console.error("fetchRolePagePermissions error:", err);
    throw err;
  }
}

export async function getRolePagePermissionById(id: string): Promise<RolePagePermissionDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch role page permission ${id}: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createRolePagePermission(
  payload: RolePagePermissionCreateDto
): Promise<RolePagePermissionDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rolePageAccessId: payload.rolePageAccessId.trim(),
      permissionId: payload.permissionId.trim(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create role page permission: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    rolePageAccessId: data.rolePageAccessId || payload.rolePageAccessId,
    permissionId: data.permissionId || payload.permissionId,
  };
}

export async function updateRolePagePermission(
  id: string,
  payload: RolePagePermissionUpdateDto
): Promise<RolePagePermissionDto | void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rolePageAccessId: payload.rolePageAccessId.trim(),
      permissionId: payload.permissionId.trim(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update role page permission ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deleteRolePagePermission(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete role page permission ${id}: ${errorText || response.statusText}`);
  }
}
