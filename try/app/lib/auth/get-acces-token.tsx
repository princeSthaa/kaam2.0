import { cookies } from "next/headers";

import { getSession, updateSession, deleteSession } from "./session-store";

import {
  AUTH_SERVER,
  CLIENT_ID,
  CLIENT_SECRET,
} from "./oauth-config";

export async function getValidAccessToken(): Promise<
  string | null
> {
  const cookieStore = await cookies();

  const sessionId =
    cookieStore.get("kaam_session")?.value;

  console.log(
    "KAAM SESSION COOKIE:",
    sessionId ? "FOUND" : "MISSING"
  );

  if (!sessionId) {
    return null;
  }

  const session = getSession(sessionId);

  console.log(
    "SERVER SESSION:",
    session ? "FOUND" : "MISSING"
  );

  if (!session) {
    return null;
  }

  console.log(
    "ACCESS TOKEN:",
    session.accessToken ? "FOUND" : "MISSING"
  );

  const now = Date.now();

  if (
    session.accessToken &&
    session.expiresAt > now + 30_000
  ) {
    console.log("ACCESS TOKEN STILL VALID");

    return session.accessToken;
  }

  console.log("ACCESS TOKEN EXPIRED OR EXPIRING");

  if (!session.refreshToken) {
    console.log("REFRESH TOKEN: MISSING");

    deleteSession(sessionId);

    return null;
  }

  console.log("REFRESH TOKEN: FOUND");

  const refreshResponse = await fetch(
    `${AUTH_SERVER}/connect/token`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),

      cache: "no-store",
    }
  );

  if (!refreshResponse.ok) {
    const error =
      await refreshResponse.text();

    console.error(
      "REFRESH TOKEN FAILED:",
      refreshResponse.status,
      error
    );

    deleteSession(sessionId);

    return null;
  }

  const tokens =
    await refreshResponse.json();

  if (!tokens.access_token) {
    console.error(
      "REFRESH RESPONSE HAS NO ACCESS TOKEN"
    );

    deleteSession(sessionId);

    return null;
  }

  const updatedSession = {
    accessToken: tokens.access_token,

    refreshToken:
      tokens.refresh_token ??
      session.refreshToken,

    expiresAt:
      Date.now() +
      (tokens.expires_in ?? 600) * 1000,
  };

  updateSession(
    sessionId,
    updatedSession
  );

  console.log(
    "ACCESS TOKEN REFRESHED"
  );

  return updatedSession.accessToken;
}
