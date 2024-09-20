import { NextRequest, NextResponse } from "next/server";

const rateLimitClients = new Map<
  string,
  {
    count: number;
    lastReset: number;
  }
>();

export default function rateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for");
  const limit = 50;
  const interval = 60 * 1000; // 1 minute

  if (!ip) {
    return NextResponse.next();
  }

  if (!rateLimitClients.has(ip)) {
    rateLimitClients.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitClients.get(ip)!;
  if (Date.now() - ipData.lastReset > interval) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  } else {
    ipData.count += 1;
  }

  if (ipData.count >= limit) {
    return Response.json(
      {
        status: false,
        error: "Too many requests",
      },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
