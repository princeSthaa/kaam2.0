import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/usersandrbac") {
    return NextResponse.redirect(new URL("/admin/usersandrbac/employees", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kaam-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
