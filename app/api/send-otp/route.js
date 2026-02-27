export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email required" },
        { status: 400 }
      );
    }

    const now = Date.now();

    // 🔎 Check recent OTP requests
    const recentSnapshot = await adminDb
      .collection("admin_otps")
      .where("email", "==", email)
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    if (!recentSnapshot.empty) {
      const recentDocs = recentSnapshot.docs.map((doc) => doc.data());

      const lastOtp = recentDocs[0];

      // ⛔ Cooldown: 60 seconds
      if (now - lastOtp.createdAt < 60 * 1000) {
        return NextResponse.json(
          { success: false, error: "Wait before requesting new OTP." },
          { status: 429 }
        );
      }

      // ⛔ Max 3 OTPs in 5 minutes
      const lastFiveMinutes = recentDocs.filter(
        (doc) => now - doc.createdAt < 5 * 60 * 1000
      );

      if (lastFiveMinutes.length >= 3) {
        return NextResponse.json(
          { success: false, error: "Too many OTP requests. Try later." },
          { status: 429 }
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await adminDb.collection("admin_otps").add({
      email,
      otp,
      attempts: 0,
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Chakradhar OTT <onboarding@resend.dev>",
      to: email,
      subject: "Admin OTP Verification",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Your OTP is: ${otp}</h2>
          <p>Valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}