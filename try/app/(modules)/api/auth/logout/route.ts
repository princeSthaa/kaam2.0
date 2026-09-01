import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/app/lib/auth/session-store";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("kaam_session")?.value;
  if (sessionId) deleteSession(sessionId);

  // Notify ASP.NET backend to sign out cookie session
  try {
    const authCookie = cookieStore.get("Kaam.Auth")?.value;
    await fetch("http://localhost:5083/api/auth/logout", {
      method: "POST",
      headers: authCookie ? { Cookie: `Kaam.Auth=${authCookie}` } : {},
    });
  } catch {
    // ignore backend connectivity issues on signout
  }

  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set("kaam_session", "", { path: "/", expires: new Date(0) });
  response.cookies.set("Kaam.Auth", "", { path: "/", expires: new Date(0) });
  return response;
}
