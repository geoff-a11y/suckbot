import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const supabase = getSupabaseClient();

    // Store email SEPARATELY - NO session reference
    const { error } = await supabase.from("suckbot_emails").insert({
      email,
      submitted_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email storage error:", error);
    return NextResponse.json(
      { error: "Failed to store email" },
      { status: 500 }
    );
  }
}
