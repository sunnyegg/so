import { NextRequest, NextResponse } from "next/server";

const AUTH_KEY = "authorization";

export default function authenticationMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get(AUTH_KEY);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json(
      {
        status: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
