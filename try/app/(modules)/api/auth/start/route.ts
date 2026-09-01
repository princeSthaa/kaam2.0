import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  AUTH_SERVER,
  CLIENT_ID,
  REDIRECT_URI,
} from "@/app/lib/auth/oauth-config";

function base64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function GET() {
  const state = base64Url(crypto.randomBytes(32));

  const codeVerifier = base64Url(
    crypto.randomBytes(32)
  );

  const codeChallenge = base64Url(
    crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest()
  );

  const authorizationUrl = new URL(
    `${AUTH_SERVER}/connect/authorize`
  );

  authorizationUrl.searchParams.set(
    "client_id",
    CLIENT_ID
  );

  authorizationUrl.searchParams.set(
    "response_type",
    "code"
  );

  authorizationUrl.searchParams.set(
    "redirect_uri",
    REDIRECT_URI
  );

  authorizationUrl.searchParams.set(
    "scope",
    "openid profile email api offline_access"
  );

  authorizationUrl.searchParams.set(
    "state",
    state
  );

  authorizationUrl.searchParams.set(
    "code_challenge",
    codeChallenge
  );

  authorizationUrl.searchParams.set(
    "code_challenge_method",
    "S256"
  );

  const response = NextResponse.redirect(
    authorizationUrl
  );

  response.cookies.set(
    "kaam_oauth_state",
    state,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10
    }
  );

  response.cookies.set(
    "kaam_code_verifier",
    codeVerifier,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10
    }
  );

  return response;
}
