import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getValidAccessToken,
} from "@/app/lib/auth/get-acces-token";
import { BACKEND_API_URL } from "@/app/lib/config/server-env";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const accessToken =
    await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const backendResponse = await fetch(
    `${BACKEND_API_URL}/employee/${id}`,
    {
      method: "GET",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

        Accept: "application/json",
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

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const accessToken =
    await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const body =
    await request.arrayBuffer();

  const backendResponse = await fetch(
    `${BACKEND_API_URL}/employee/${id}`,
    {
      method: "PUT",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

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

  return new NextResponse(
    responseBody,
    {
      status:
        backendResponse.status,

      headers: {
        "Content-Type":
          backendResponse.headers.get(
            "content-type"
          ) ?? "application/json",
      },
    }
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const accessToken =
    await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const backendResponse = await fetch(
    `${BACKEND_API_URL}/employee/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
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
