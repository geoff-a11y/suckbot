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
    const sessionData = await req.json();

    const supabase = getSupabaseClient();

    // Store anonymous session - NO email, NO identifying info
    const { error } = await supabase.from("suckbot_sessions").insert({
      candidates: sessionData.candidates,
      selected_candidate: sessionData.selectedCandidate,
      evaluation_mode: sessionData.evaluationMode,
      audit: sessionData.audit,
      autopsy: sessionData.autopsy,
      desuck: sessionData.desuck,
      completed_at: sessionData.completedAt || new Date().toISOString(),
      conversation_summary: sessionData.conversationSummary || [],
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session storage error:", error);
    return NextResponse.json(
      { error: "Failed to store session" },
      { status: 500 }
    );
  }
}
