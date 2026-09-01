import "server-only";

import { getValidAccessToken } from "./get-acces-token";
import { BACKEND_API_URL } from "@/app/lib/config/server-env";
import type { CurrentUserAccess } from "./rbac-profile";

export async function getCurrentAccess(): Promise<CurrentUserAccess | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as CurrentUserAccess;
  } catch {
    return null;
  }
}
