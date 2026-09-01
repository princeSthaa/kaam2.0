import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/app/lib/auth/get-acces-token";
import { BACKEND_API_URL } from "@/app/lib/config/server-env";

export async function GET(request: NextRequest) {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    console.log("BFF employee: no valid access token");

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const backendUrl = new URL(
    `${BACKEND_API_URL}/employee`
  );

  request.nextUrl.searchParams.forEach(
    (value, key) => {
      backendUrl.searchParams.append(key, value);
    }
  );

  console.log(
    "BFF employee GET:",
    backendUrl.toString()
  );

  const backendResponse = await fetch(
    backendUrl,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      cache: "no-store",
    }
  );

  const body =
    await backendResponse.arrayBuffer();

  return new NextResponse(body, {
    status: backendResponse.status,

    headers: {
      "Content-Type":
        backendResponse.headers.get(
          "content-type"
        ) ?? "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  const accessToken =
    await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.arrayBuffer();

  const backendResponse = await fetch(
    `${BACKEND_API_URL}/employee`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type":
          request.headers.get(
            "content-type"
          ) ?? "application/json",
        Accept: "application/json",
      },

      body,

      cache: "no-store",
    }
  );

  const responseBody =
    await backendResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: backendResponse.status,

    headers: {
      "Content-Type":
        backendResponse.headers.get(
          "content-type"
        ) ?? "application/json",
    },
  });
}
