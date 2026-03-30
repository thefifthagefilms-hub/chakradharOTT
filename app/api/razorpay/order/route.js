import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { amount } = body;

  try {
    // ✅ Initialize INSIDE function (fixes Vercel build error)
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, // optional but good practice
    });

    return NextResponse.json(order);

  } catch (err) {
    console.error("Razorpay Order Error:", err);

    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}