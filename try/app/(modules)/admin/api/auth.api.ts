import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export interface LoginDto {
  email?: string;
  password?: string;
}

export interface LoginResponseDto {
  message: string;
}

export async function loginUser(payload: LoginDto): Promise<LoginResponseDto> {
  const response = await fetch(`${API_MAIN_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Invalid email or password"
    );
  }

  return await response.json();
}