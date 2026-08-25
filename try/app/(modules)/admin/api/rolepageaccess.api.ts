import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/role-page-access`;

export interface RolePageAccessDto {
  id: string;
  roleId: string;
  pageId: string;
  roleName?: string;
  pageName?: string;
  pageRoute?: string;
  pageIcon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePageAccessCreateDto {
  roleId: string;
  pageId: string;
}

export interface RolePageAccessUpdateDto {
  roleId: string;
  pageId: string;
}

export async function fetchRolePageAccesses(): Promise<RolePageAccessDto[]> {
  try {
    const response = await fetch(API_BASE_URL, { cache: "no-store" });

    if (!response.ok) {
      // Fallback try /rolepageaccess or plural
      const fallbackResponse = await fetch(`${API_MAIN_URL}/rolepageaccesses`, { cache: "no-store" });
      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }
      throw new Error(`Failed to fetch role page access: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id || `rpa-${Math.random().toString(36).substr(2, 9)}`,
        roleId: item.roleId || "",
        pageId: item.pageId || "",
        roleName: item.roleName || item.role?.roleName || item.role?.name,
        pageName: item.pageName || item.page?.name,
        pageRoute: item.pageRoute || item.page?.route,
        pageIcon: item.pageIcon || item.page?.icon,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
    return [];
  } catch (err) {
    console.error("fetchRolePageAccesses error:", err);
    throw err;
  }
}

export async function getRolePageAccessById(id: string): Promise<RolePageAccessDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch role page access ${id}: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createRolePageAccess(
  payload: RolePageAccessCreateDto
): Promise<RolePageAccessDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleId: payload.roleId.trim(),
      pageId: payload.pageId.trim(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create role page access: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    roleId: data.roleId || payload.roleId,
    pageId: data.pageId || payload.pageId,
  };
}

export async function updateRolePageAccess(
  id: string,
  payload: RolePageAccessUpdateDto
): Promise<RolePageAccessDto | void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleId: payload.roleId.trim(),
      pageId: payload.pageId.trim(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update role page access ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deleteRolePageAccess(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete role page access ${id}: ${errorText || response.statusText}`);
  }
}
