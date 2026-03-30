import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export async function POST(req) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    premiereId,
    title,
  } = body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const premiereRef = doc(db, "premieres", premiereId);
  const premiereSnap = await getDoc(premiereRef);

  if (!premiereSnap.exists()) {
    return NextResponse.json({ success: false });
  }

  const premiere = premiereSnap.data();

  // 🚫 LIMIT CHECK
  if (
    premiere.maxTickets &&
    premiere.ticketsSold >= premiere.maxTickets
  ) {
    return NextResponse.json({
      success: false,
      message: "Sold out",
    });
  }

  // 🎟 generate ticket
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  // store ticket in premiere
  await setDoc(
    doc(db, "premieres", premiereId, "tickets", code),
    {
      code,
      used: false,
      createdAt: new Date(),
      paymentId: razorpay_payment_id,
    }
  );

  // store in user profile
  await setDoc(
    doc(db, "users", userId, "tickets", code),
    {
      ticketCode: code,
      premiereId,
      title,
      purchasedAt: new Date(),
    }
  );

  // ✅ increment sold count
  await updateDoc(premiereRef, {
    ticketsSold: (premiere.ticketsSold || 0) + 1,
  });

  return NextResponse.json({ success: true });
}