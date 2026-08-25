import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/employee`;

export interface EmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  employeeRoleId?: string;
  roleName?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeCreateDto {
  firstName: string;
  lastName: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  employeeRoleId?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface EmployeeUpdateDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  employeeRoleId?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface DepartmentDto {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface EmployeeRoleDto {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export async function fetchEmployees(params?: {
  id?: string;
  search?: string;
  departmentId?: string;
  employeeRoleId?: string;
  isActive?: boolean;
}): Promise<EmployeeDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.search) query.append("search", params.search);
  if (params?.departmentId) query.append("departmentId", params.departmentId);
  if (params?.employeeRoleId) query.append("employeeRoleId", params.employeeRoleId);
  if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  return await response.json();
}

export async function getEmployeeById(id: string): Promise<EmployeeDto> {
  const response = await fetch(`${API_BASE_URL}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch employee ${id}: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function createEmployee(payload: EmployeeCreateDto): Promise<EmployeeDto> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phoneNumber: payload.phoneNumber ? payload.phoneNumber.trim() : "",
      email: payload.email ? payload.email.trim() : "",
      employeeRoleId: payload.employeeRoleId || undefined,
      departmentId: payload.departmentId || undefined,
      isActive: payload.isActive ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create employee: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateEmployee(id: string, payload: EmployeeUpdateDto): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update employee ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete employee ${id}: ${errorText || response.statusText}`);
  }
}

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  try {
    const response = await fetch(`${API_MAIN_URL}/department`, { cache: "no-store" });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch departments:", err);
    return [];
  }
}

export async function fetchEmployeeRoles(): Promise<EmployeeRoleDto[]> {
  try {
    const response = await fetch(`${API_MAIN_URL}/role`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.roleName || item.name || "",
          code: item.code || "",
          description: item.description || "",
        }));
      }
    }
    // Fallback attempt to /employee-role
    const fallbackResponse = await fetch(`${API_MAIN_URL}/employee-role`, { cache: "no-store" });
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.roleName || item.name || "",
          code: item.code || "",
          description: item.description || "",
        }));
      }
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch employee roles:", err);
    return [];
  }
}
