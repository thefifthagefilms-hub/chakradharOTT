import { NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  const { email, otp } = await req.json();

  const q = query(
    collection(db, "admin_otps"),
    where("email", "==", email),
    where("otp", "==", otp)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return NextResponse.json({ success: false });
  }

  const data = snapshot.docs[0].data();

  if (Date.now() > data.expiresAt) {
    return NextResponse.json({ success: false });
  }

  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
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
}