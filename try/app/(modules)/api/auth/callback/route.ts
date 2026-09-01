import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/app/lib/auth/session-store";
import {
  AUTH_SERVER,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
} from "@/app/lib/auth/oauth-config";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const returnedState = request.nextUrl.searchParams.get("state");

    const storedState = request.cookies.get("kaam_oauth_state")?.value;
    const codeVerifier = request.cookies.get("kaam_code_verifier")?.value;

    if (!code) {
        return NextResponse.json(
        { message: "Authorization code is missing." },
        { status: 400 }
        );
    }

    if (!returnedState || !storedState || returnedState !== storedState) {
        return NextResponse.json(
        { message: "Invalid OAuth state." },
        { status: 400 }
        );
    }

    if (!codeVerifier) {
        return NextResponse.json(
        { message: "PKCE code verifier is missing." },
        { status: 400 }
        );
    }

    const tokenResponse = await fetch(
        `${AUTH_SERVER}/connect/token`,
        {
        method: "POST",

        headers: {
            "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code_verifier: codeVerifier,
        }),

        cache: "no-store",
        }
    );

    if (!tokenResponse.ok) {
        const error = await tokenResponse.text();

        console.error(
        "Token exchange failed:",
        tokenResponse.status,
        error
        );

        return NextResponse.json(
        {
            message: "Token exchange failed.",
            error,
        },
        {
            status: tokenResponse.status,
        }
        );
    }

    const tokens = await tokenResponse.json();
    console.log("OAuth token exchange successful");

    const sessionId = createSession({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt:
        Date.now() + (tokens.expires_in ?? 600) * 1000,
    });

    let destination = "/";
    try {
      const profileResponse = await fetch(`${AUTH_SERVER}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: "no-store",
      });
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        destination = profile.isSuperAdmin
          ? "/admin/usersandrbac/employees"
          : profile.pageGrants?.find((grant: { actions?: string[] }) =>
              grant.actions?.some((action) => action.toUpperCase() === "GET"))?.route || "/access-denied";
      }
    } catch {
      destination = "/";
    }

    const response = NextResponse.redirect(new URL(destination, request.url));

    response.cookies.set(
    "kaam_session",
    sessionId,
    {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    }
    );

    response.cookies.delete("kaam_oauth_state");
    response.cookies.delete("kaam_code_verifier");

    return response;
}
