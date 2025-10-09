import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    // Get all season windows
    const { data: windows, error: winErr } = await sb
      .from("season_windows")
      .select("*")
      .order("start_at", { ascending: true });

    if (winErr) {
      return NextResponse.json({ error: winErr.message }, { status: 500 });
    }

    // Get count of attempts
    const { count: attemptCount, error: attemptErr } = await sb
      .from("attempts")
      .select("*", { count: "exact", head: true });

    if (attemptErr) {
      return NextResponse.json({ error: attemptErr.message }, { status: 500 });
    }

    // Get count of oauth tokens
    const { count: tokenCount, error: tokenErr } = await sb
      .from("oauth_tokens")
      .select("*", { count: "exact", head: true });

    if (tokenErr) {
      return NextResponse.json({ error: tokenErr.message }, { status: 500 });
    }

    return NextResponse.json({
      season_windows: {
        count: windows?.length || 0,
        data: windows || []
      },
      attempts: {
        count: attemptCount || 0
      },
      oauth_tokens: {
        count: tokenCount || 0
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Database error", 
      detail: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
