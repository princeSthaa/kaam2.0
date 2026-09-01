import { NextRequest, NextResponse } from "next/server";

import { getValidAccessToken } from "@/app/lib/auth/get-acces-token";
import { BACKEND_API_URL } from "@/app/lib/config/server-env";

const REQUEST_HEADERS_TO_FORWARD = [
  "accept",
  "content-type",
  "if-match",
  "if-none-match",
] as const;

const RESPONSE_HEADERS_TO_FORWARD = [
  "cache-control",
  "content-disposition",
  "content-type",
  "etag",
  "last-modified",
  "location",
] as const;

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyToBackend(
  request: NextRequest,
  { params }: ProxyContext
) {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { path } = await params;
  const encodedPath = path.map(encodeURIComponent).join("/");
  const backendUrl = new URL(`${BACKEND_API_URL}/${encodedPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  });

  REQUEST_HEADERS_TO_FORWARD.forEach((headerName) => {
    const value = request.headers.get(headerName);

    if (value) {
      headers.set(headerName, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();

    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(backendUrl, init);
  } catch (error) {
    console.error("BFF backend request failed", {
      method: request.method,
      path: encodedPath,
      error,
    });

    return NextResponse.json(
      { message: "Backend service is unavailable" },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();

  RESPONSE_HEADERS_TO_FORWARD.forEach((headerName) => {
    const value = backendResponse.headers.get(headerName);

    if (value) {
      responseHeaders.set(headerName, value);
    }
  });

  const hasNoBody =
    request.method === "HEAD" ||
    backendResponse.status === 204 ||
    backendResponse.status === 304;

  return new NextResponse(hasNoBody ? null : backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxyToBackend;
export const HEAD = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
