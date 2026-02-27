import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await addDoc(collection(db, "admin_otps"), {
      email,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const result = await resend.emails.send({
      from: "Chakradhar OTT <onboarding@resend.dev>",
      to: email,
      subject: "Admin OTP Verification",
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`,
    });

    console.log("Resend result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}