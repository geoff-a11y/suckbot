import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  return new Resend(apiKey);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const pdfBase64 = formData.get("pdf") as string;

    if (!email || !pdfBase64) {
      return NextResponse.json(
        { error: "Missing email or PDF" },
        { status: 400 }
      );
    }

    const resend = getResendClient();

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    const { error } = await resend.emails.send({
      from: "Suckbot <suckbot@human-machines.com>",
      to: email,
      subject: "Your Suckbot Report — The thing that sucked is about to suck less",
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-family: Georgia, serif; color: #1A1A2E; font-size: 28px; margin-bottom: 20px;">
            Your Suckbot Report
          </h1>

          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Attached is your complete Suckbot report — including your Suck Audit, Suck Autopsy, and De-Suckification blueprint.
          </p>

          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            <strong style="color: #1A1A2E;">The thing that sucked? It's about to suck a lot less.</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #E5E5EF; margin: 30px 0;">

          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Want help making it happen?
          </p>

          <a href="https://calendly.com/geoff-human-machines/30min"
             style="display: inline-block; background: #7C3AED; color: white; padding: 14px 28px;
                    border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Book a call with Geoff Gibbins
          </a>

          <p style="color: #6B6B80; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Or reach out anytime at <a href="mailto:hello@human-machines.com" style="color: #7C3AED;">hello@human-machines.com</a>
          </p>

          <hr style="border: none; border-top: 1px solid #E5E5EF; margin: 30px 0;">

          <p style="color: #9CA3AF; font-size: 12px;">
            Human Machines | <a href="https://human-machines.com" style="color: #9CA3AF;">human-machines.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "Suckbot-Report.pdf",
          content: pdfBuffer,
        },
      ],
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}
