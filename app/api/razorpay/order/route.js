import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

export async function POST(req) {
  const body = await req.json();
  const { amount } = body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
    });

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}