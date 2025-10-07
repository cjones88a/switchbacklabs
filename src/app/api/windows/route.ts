import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season_key = searchParams.get("season_key");
  if (!season_key) return NextResponse.json({ error: "missing season_key" }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("season_effective_windows")
    .select("season_key, start_at, end_at, source, override_id")
    .eq("season_key", season_key)
    .order("start_at", { ascending: true });
  return NextResponse.json({ windows: data ?? [] });
}
