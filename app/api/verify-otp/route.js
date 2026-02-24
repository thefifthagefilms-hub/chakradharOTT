import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, otp } = await req.json();

  if (
    global.otpStore &&
    global.otpStore.email === email &&
    global.otpStore.otp == otp
  ) {
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-session", "verified", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
}