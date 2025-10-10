import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { traceHeaders } from "@/lib/trace";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const t = traceHeaders("leaderboard-simple");
  console.time(`[${t.name}] ${t.id}`);
  
  const supabase = getSupabaseAdmin();

  const { searchParams } = new URL(req.url);
  const requestedYear = Number(searchParams.get("year") || new Date().getFullYear());
  
  // First, find what years actually have data
  const { data: allSeasons, error: seasonsError } = await supabase
    .from("attempts")
    .select("season_key")
    .order("season_key", { ascending: false });
  
  if (seasonsError) {
    console.error(`[${t.name}] ${t.id} seasons error:`, seasonsError);
    return NextResponse.json({ error: seasonsError.message }, { status: 500 });
  }

  // Extract unique years from season keys
  const years = [...new Set((allSeasons || []).map(s => parseInt(s.season_key.split('_')[0])))].sort((a, b) => b - a);
  console.log(`[${t.name}] ${t.id} available years:`, years);
  
  // Use the requested year if it has data, otherwise use the most recent year with data
  const year = years.includes(requestedYear) ? requestedYear : (years[0] || requestedYear);
  const seasonKeys = [`${year}_FALL`, `${year}_WINTER`, `${year}_SPRING`, `${year}_SUMMER`];
  console.log(`[${t.name}] ${t.id} using year`, year, 'seasonKeys', seasonKeys);

  // Get all attempts data without joining riders table
  const { data, error } = await supabase
    .from("attempts")
    .select("rider_id, season_key, main_ms, climb_sum_ms, desc_sum_ms")
    .in("season_key", seasonKeys);

  if (error) {
    console.error(`[${t.name}] ${t.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[${t.name}] ${t.id} found ${data?.length || 0} attempts for season keys:`, seasonKeys);

  // Group by rider_id and season
  const byRider = new Map<string, {
    rider: { name: string; avatar: string | null };
    by_season: Record<string, number | null>;
    climb_sum_ms: number | null;
    desc_sum_ms: number | null;
    total_ms: number;
    best_season_ms: number | null;
  }>();

  const SEASONS = ["FALL", "WINTER", "SPRING", "SUMMER"] as const;

  for (const attempt of data || []) {
    const season = attempt.season_key.split("_")[1] as typeof SEASONS[number];
    if (!SEASONS.includes(season)) continue;

    if (!byRider.has(attempt.rider_id)) {
      byRider.set(attempt.rider_id, {
        rider: { name: `Rider ${attempt.rider_id.slice(0, 8)}`, avatar: null },
        by_season: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        climb_sum_ms: null,
        desc_sum_ms: null,
        total_ms: 0,
        best_season_ms: null,
      });
    }
    
    const rider = byRider.get(attempt.rider_id)!;
    rider.by_season[season] = attempt.main_ms;
    
    // Use climb/desc from any season (prefer FALL if available)
    if (attempt.climb_sum_ms != null) rider.climb_sum_ms = attempt.climb_sum_ms;
    if (attempt.desc_sum_ms != null) rider.desc_sum_ms = attempt.desc_sum_ms;
  }

  const out = Array.from(byRider.values()).map((rider) => {
    const times = Object.values(rider.by_season).filter((v): v is number => v != null);
    const total_ms = times.reduce((a, v) => a + v, 0);
    const best_season_ms = times.length ? Math.min(...times) : null;
    return { ...rider, total_ms, best_season_ms };
  });

  const res = NextResponse.json({ year, rows: out });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
