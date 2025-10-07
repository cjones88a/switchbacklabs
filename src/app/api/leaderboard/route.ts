import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type Row = {
  rider_id: string;
  season_key: string;
  main_ms: number | null;
  climb_sum_ms: number | null;
  desc_sum_ms: number | null;
  riders: { firstname: string | null; lastname: string | null; profile: string | null } | null;
};

const SEASONS = ["FALL", "WINTER", "SPRING", "SUMMER"] as const;
const keysForYear = (y: number) => SEASONS.map(s => `${y}_${s}`);

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const seasonKeys = keysForYear(year);

  const { data, error } = await supabase
    .from("attempts")
    .select("rider_id, season_key, main_ms, climb_sum_ms, desc_sum_ms, riders ( firstname, lastname, profile )")
    .in("season_key", seasonKeys);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Row[];

  const byRider = new Map<string, {
    rider: { name: string; avatar: string | null };
    by_season: Record<string, number | null>;
    climb_sum_ms: number | null;
    desc_sum_ms: number | null;
    total_ms: number;
    best_season_ms: number | null;
  }>();

  for (const r of rows) {
    const season = r.season_key.split("_")[1] as typeof SEASONS[number];
    if (!SEASONS.includes(season)) continue;
    if (!byRider.has(r.rider_id)) {
      byRider.set(r.rider_id, {
        rider: { name: `${r.riders?.firstname ?? ""} ${r.riders?.lastname ?? ""}`.trim(), avatar: r.riders?.profile ?? null },
        by_season: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        climb_sum_ms: null,
        desc_sum_ms: null,
        total_ms: 0,
        best_season_ms: null,
      });
    }
    const b = byRider.get(r.rider_id)!;
    b.by_season[season] = r.main_ms;
    if (season === "FALL" && r.climb_sum_ms != null) b.climb_sum_ms = r.climb_sum_ms;
    if (season === "FALL" && r.desc_sum_ms != null)  b.desc_sum_ms  = r.desc_sum_ms;
  }

  const out = Array.from(byRider.values()).map((b) => {
    const s = Object.values(b.by_season).filter((v): v is number => v != null);
    const total_ms = s.reduce((a, v) => a + v, 0);
    const best_season_ms = s.length ? Math.min(...s) : null;
    return { ...b, total_ms, best_season_ms };
  });

  return NextResponse.json({ year, rows: out });
}
