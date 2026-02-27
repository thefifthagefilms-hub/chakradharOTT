export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
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

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await addDoc(collection(db, "admin_otps"), {
      email,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await resend.emails.send({
      from: "Chakradhar OTT <onboarding@resend.dev>",
      to: email,
      subject: "Admin OTP Verification",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Your OTP is: ${otp}</h2>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}