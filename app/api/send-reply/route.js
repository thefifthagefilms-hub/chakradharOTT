import { Resend } from "resend";
import { NextResponse } from "next/server";

// Lazy initialize Resend only when API is called
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to .env.local to enable email replies."
    );
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const resend = getResendClient();
    const { to, message } = await req.json();

    const data = await resend.emails.send({
      from: "Chakradhar OTT <onboarding@resend.dev>",
      to: [to],
      subject: "Reply from Chakradhar OTT",
      html: `
        <div style="font-family:sans-serif;">
          <p>${message}</p>
          <br/>
          <p>— Chakradhar OTT Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Email failed" },
      { status: 500 }
    );
  }
}