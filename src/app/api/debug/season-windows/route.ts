import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE!;

export async function GET() {
  console.log("[debug] Starting season-windows debug check");
  
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log("[debug] Missing environment variables");
    return NextResponse.json({ 
      error: "Missing environment variables",
      SUPABASE_URL: !!SUPABASE_URL,
      SERVICE_KEY: !!SERVICE_KEY
    }, { status: 500 });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    console.log("[debug] Testing database connection...");
    
    // Test basic connection first
    const { error: testError } = await sb
      .from("riders")
      .select("id")
      .limit(1);

    if (testError) {
      console.log("[debug] Database connection failed:", testError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        detail: testError.message 
      }, { status: 500 });
    }

    console.log("[debug] Database connection successful");

    // Check if season_windows table exists
    let windowsResult: { data: any[] | null; error: string | null } = { data: [], error: null };
    try {
      const result = await sb
        .from("season_windows")
        .select("*")
        .order("start_at", { ascending: true });
      windowsResult = { data: result.data, error: result.error?.message || null };
    } catch (err) {
      windowsResult.error = err instanceof Error ? err.message : "Unknown error";
    }

    // Check attempts table
    let attemptsResult: { count: number | null; error: string | null } = { count: 0, error: null };
    try {
      const result = await sb
        .from("attempts")
        .select("*", { count: "exact", head: true });
      attemptsResult = { count: result.count, error: result.error?.message || null };
    } catch (err) {
      attemptsResult.error = err instanceof Error ? err.message : "Unknown error";
    }

    // Check oauth_tokens table
    let tokensResult: { count: number | null; error: string | null } = { count: 0, error: null };
    try {
      const result = await sb
        .from("oauth_tokens")
        .select("*", { count: "exact", head: true });
      tokensResult = { count: result.count, error: result.error?.message || null };
    } catch (err) {
      tokensResult.error = err instanceof Error ? err.message : "Unknown error";
    }

    return NextResponse.json({
      status: "success",
      season_windows: {
        count: windowsResult.data?.length || 0,
        data: windowsResult.data || [],
        error: windowsResult.error
      },
      attempts: {
        count: attemptsResult.count || 0,
        error: attemptsResult.error
      },
      oauth_tokens: {
        count: tokensResult.count || 0,
        error: tokensResult.error
      }
    });

  } catch (error) {
    console.log("[debug] Unexpected error:", error);
    return NextResponse.json({ 
      error: "Unexpected error", 
      detail: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
