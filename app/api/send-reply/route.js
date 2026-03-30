import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { to, message } = await req.json();

    const data = await resend.emails.send({
      from: "Chakradhar OTT <onboarding@resend.dev>", // change later to your domain
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
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}