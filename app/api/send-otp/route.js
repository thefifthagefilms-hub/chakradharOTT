import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  const allowedEmails = [
    "thefifthagefilms@gmail.com",
    "rahulchakradharperepogu@gmail.com",
  ];

  if (!allowedEmails.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store OTP in memory temporarily
  global.otpStore = { email, otp };

  // Here you integrate email service (Resend, SendGrid etc.)
  console.log("OTP:", otp);

  return NextResponse.json({ success: true });
}