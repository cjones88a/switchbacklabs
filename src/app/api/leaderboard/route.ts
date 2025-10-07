import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

function keysForYear(year: number) {
  return SEASONS.map((s) => `${year}_${s}`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const seasonKeys = keysForYear(year);

  const { data, error } = await supabaseAdmin
    .from("attempts")
    .select("rider_id, season_key, main_ms, climb_sum_ms, desc_sum_ms, riders ( firstname, lastname, profile )")
    .in("season_key", seasonKeys);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as Row[];

  // group by rider
  const byRider = new Map<
    string,
    {
      rider: { name: string; avatar: string | null };
      by_season: Record<(typeof SEASONS)[number], number | null>;
      climb_sum_ms: number | null;
      desc_sum_ms: number | null;
      total_ms: number;
      best_season_ms: number | null;
    }
  >();

  for (const r of rows) {
    const season = r.season_key.split("_")[1] as (typeof SEASONS)[number];
    if (!SEASONS.includes(season)) continue;

    if (!byRider.has(r.rider_id)) {
      const first = r.riders?.firstname ?? "";
      const last = r.riders?.lastname ?? "";
      byRider.set(r.rider_id, {
        rider: { name: `${first} ${last}`.trim(), avatar: r.riders?.profile ?? null },
        by_season: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        climb_sum_ms: null,
        desc_sum_ms: null,
        total_ms: 0,
        best_season_ms: null,
      });
    }
    const bucket = byRider.get(r.rider_id)!;
    bucket.by_season[season] = r.main_ms;

    // store latest known climb/desc (use the one for FALL if present; otherwise any)
    if (season === "FALL" && r.climb_sum_ms != null) bucket.climb_sum_ms = r.climb_sum_ms;
    if (season === "FALL" && r.desc_sum_ms != null) bucket.desc_sum_ms = r.desc_sum_ms;
  }

  // compute totals & ranking
  const out = Array.from(byRider.values()).map((b) => {
    const seasonTotals = Object.values(b.by_season).filter((v): v is number => v != null);
    const total_ms = seasonTotals.reduce((a, v) => a + v, 0);
    const best_season_ms = seasonTotals.length ? Math.min(...seasonTotals) : null;
    return { ...b, total_ms, best_season_ms };
  });

  // default sort = current season if present, else total
  const currentSeason = ((): (typeof SEASONS)[number] => {
    const m = new Date().getMonth();
    if ([8, 9].includes(m)) return "FALL";
    if ([11, 0].includes(m)) return "WINTER";
    if ([2, 3].includes(m)) return "SPRING";
    return "SUMMER";
  })();

  out.sort((a, b) => {
    const aS = a.by_season[currentSeason] ?? Number.POSITIVE_INFINITY;
    const bS = b.by_season[currentSeason] ?? Number.POSITIVE_INFINITY;
    if (aS !== bS) return aS - bS;
    return a.total_ms - b.total_ms;
  });

  return NextResponse.json({ year, rows: out });
}
