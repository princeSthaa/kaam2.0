import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/department`;

export interface DepartmentDto {
  id: string;
  name: string;
  departmentCode?: string;
  code?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentCreateDto {
  name: string;
  departmentCode?: string;
  code?: string;
  description?: string;
}

export interface DepartmentUpdateDto {
  name: string;
  departmentCode?: string;
  code?: string;
  description?: string;
}

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  const response = await fetch(API_BASE_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.statusText}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      ...item,
      name: item.name || item.departmentName || "",
      departmentCode: item.departmentCode || item.code || "",
    }));
  }
  return [];
}

export async function getDepartmentById(id: string): Promise<DepartmentDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch department ${id}: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    name: data.name || data.departmentName || "",
    departmentCode: data.departmentCode || data.code || "",
  };
}

export async function createDepartment(payload: DepartmentCreateDto): Promise<DepartmentDto> {
  const code = payload.departmentCode || payload.code || "";
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      departmentCode: code.trim(),
      code: code.trim(),
      description: payload.description ? payload.description.trim() : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create department: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    name: data.name || payload.name,
    departmentCode: data.departmentCode || data.code || code,
  };
}

export async function updateDepartment(id: string, payload: DepartmentUpdateDto): Promise<DepartmentDto | void> {
  const code = payload.departmentCode || payload.code || "";
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name.trim(),
      departmentCode: code.trim(),
      code: code.trim(),
      description: payload.description ? payload.description.trim() : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update department ${id}: ${errorText || response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return;
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete department ${id}: ${errorText || response.statusText}`);
  }
}
