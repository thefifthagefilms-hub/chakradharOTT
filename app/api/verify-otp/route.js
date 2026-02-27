export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    if (!process.env.ADMIN_SECRET) {
      throw new Error("Missing ADMIN_SECRET");
    }

    const snapshot = await adminDb
      .collection("admin_otps")
      .where("email", "==", email)
      .where("otp", "==", otp)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false });
    }

    const data = snapshot.docs[0].data();

    if (Date.now() > data.expiresAt) {
      return NextResponse.json({ success: false });
    }

    const signature = crypto
      .createHmac("sha256", process.env.ADMIN_SECRET)
      .update(email)
      .digest("hex");

    const token = `${email}.${signature}`;

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 30,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}