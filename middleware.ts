import { NextRequest, NextResponse } from "next/server";

import corsMiddleware from "./middlewares/cors";
import authenticationMiddleware from "./middlewares/authentication";
import rateLimitMiddleware from "./middlewares/rate-limit";

const availableMiddlewares = [
  corsMiddleware,
  authenticationMiddleware,
  rateLimitMiddleware,
];

export function middleware(request: NextRequest) {
  for (const m of availableMiddlewares) {
    const response = m(request);
    if (!response.ok) {
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
