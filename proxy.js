import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow login and APIs
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin-session")?.value;

    if (!session) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    // Basic token format validation
    const parts = session.split(".");
    if (parts.length !== 2) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};