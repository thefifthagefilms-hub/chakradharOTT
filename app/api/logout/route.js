import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}