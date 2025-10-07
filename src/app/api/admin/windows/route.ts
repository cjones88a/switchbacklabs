import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function isAuthed(req: Request) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const season_key = searchParams.get("season_key");
  if (!season_key) return NextResponse.json({ error: "missing season_key" }, { status: 400 });

  const { data: base } = await supabaseAdmin
    .from("season_windows").select("season_key, start_at, end_at").eq("season_key", season_key).maybeSingle();
  const { data: overrides } = await supabaseAdmin
    .from("season_overrides").select("id, season_key, start_at, end_at, reason, created_at").eq("season_key", season_key);

  return NextResponse.json({ base, overrides: overrides ?? [] });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as {
    season_key: string; start_at: string; end_at: string; reason?: string;
  } | null;
  if (!body?.season_key || !body?.start_at || !body?.end_at) {
    return NextResponse.json({ error: "season_key, start_at, end_at required" }, { status: 400 });
  }
  if (new Date(body.end_at) <= new Date(body.start_at)) {
    return NextResponse.json({ error: "end_at must be after start_at" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("season_overrides").insert({
    season_key: body.season_key,
    start_at: body.start_at,
    end_at: body.end_at,
    reason: body.reason ?? null,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data!.id });
}
