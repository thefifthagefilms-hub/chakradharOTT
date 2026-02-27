import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function verifySession(token) {
  try {
    const [email, signature] = token.split(".");

    const expected = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(email)
      .digest("hex");

    return signature === expected;
  } catch {
    return false;
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin-session");

    if (!session || !verifySession(session.value)) {
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