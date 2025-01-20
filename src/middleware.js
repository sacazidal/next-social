import { NextResponse } from "next/server";

export function middleware(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    req.ip;

  // Добавляем IP-адрес в заголовки запроса
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-ip", ip);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
