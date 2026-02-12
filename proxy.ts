import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  const existing = headers.get("x-request-id");
  const requestId = existing || crypto.randomUUID();
  headers.set("x-request-id", requestId);

  const res = NextResponse.next({
    request: { headers },
  });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
