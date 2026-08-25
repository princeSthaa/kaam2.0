import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface LoginDto {
  email?: string;
  username?: string;
  password?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  departmentName?: string;
  phoneNumber?: string;
}

export interface LoginResponseDto {
  token?: string;
  user?: AuthUser;
}

export async function loginUser(payload: LoginDto): Promise<LoginResponseDto> {
  try {
    const response = await fetch(`${API_MAIN_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Fallback try /login
      const fallbackResponse = await fetch(`${API_MAIN_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }

      const errorText = await response.text();
      throw new Error(errorText || "Invalid username or password");
    }

    return await response.json();
  } catch (err: any) {
    console.warn("API login failed, checking offline session fallback:", err);
    throw err;
  }
}
