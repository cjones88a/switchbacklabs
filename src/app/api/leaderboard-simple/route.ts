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

  // Calculate race years from season keys (Spring/Summer roll back to prior year)
  const raceYears = [...new Set((allSeasons || []).map(s => {
    const seasonKey = s.season_key;
    const year = parseInt(seasonKey.split('_')[0]);
    const season = seasonKey.split('_')[1];
    // Spring/Summer belong to prior race year
    return (season === 'SPRING' || season === 'SUMMER') ? year - 1 : year;
  }))].sort((a, b) => b - a);
  
  console.log(`[${t.name}] ${t.id} available race years:`, raceYears);
  
  // Use the requested year if it has data, otherwise use the most recent race year with data
  const year = raceYears.includes(requestedYear) ? requestedYear : (raceYears[0] || requestedYear);
  const seasonKeys = [`${year}_FALL`, `${year}_WINTER`, `${year + 1}_SPRING`, `${year + 1}_SUMMER`];
  console.log(`[${t.name}] ${t.id} using race year`, year, 'seasonKeys', seasonKeys);

  // Get all attempts data with rider information
  const { data, error } = await supabase
    .from("attempts")
    .select(`
      rider_id, 
      season_key, 
      main_ms, 
      climb_sum_ms, 
      desc_sum_ms,
      riders!inner (
        id,
        firstname,
        lastname,
        profile,
        consent_public
      )
    `)
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
    by_season_climb: Record<string, number | null>;
    by_season_desc: Record<string, number | null>;
    climb_sum_ms: number | null;
    desc_sum_ms: number | null;
    total_ms: number;
    best_season_ms: number | null;
  }>();

  const SEASONS = ["FALL", "WINTER", "SPRING", "SUMMER"] as const;

  for (const attempt of data || []) {
    const season = attempt.season_key.split("_")[1] as typeof SEASONS[number];
    if (!SEASONS.includes(season)) continue;

    // Skip riders who haven't consented to public display
    const rider = Array.isArray(attempt.riders) ? attempt.riders[0] : attempt.riders;
    if (!rider?.consent_public) {
      console.log(`[${t.name}] ${t.id} skipping rider ${attempt.rider_id} - no consent`);
      continue;
    }

    if (!byRider.has(attempt.rider_id)) {
      byRider.set(attempt.rider_id, {
        rider: { 
          name: `${rider?.firstname ?? ''} ${rider?.lastname ?? ''}`.trim() || 'Unknown Rider', 
          avatar: rider?.profile ?? null 
        },
        by_season: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        by_season_climb: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        by_season_desc: { FALL: null, WINTER: null, SPRING: null, SUMMER: null },
        climb_sum_ms: null,
        desc_sum_ms: null,
        total_ms: 0,
        best_season_ms: null,
      });
    }
    
    const riderData = byRider.get(attempt.rider_id)!;
    riderData.by_season[season] = attempt.main_ms;
    riderData.by_season_climb[season] = attempt.climb_sum_ms;
    riderData.by_season_desc[season] = attempt.desc_sum_ms;
    
    // Use climb/desc from any season (prefer FALL if available)
    if (attempt.climb_sum_ms != null) riderData.climb_sum_ms = attempt.climb_sum_ms;
    if (attempt.desc_sum_ms != null) riderData.desc_sum_ms = attempt.desc_sum_ms;
  }

  const out = Array.from(byRider.values()).map((rider) => {
    const times = Object.values(rider.by_season).filter((v): v is number => v != null);
    const total_ms = times.reduce((a, v) => a + v, 0);
    const best_season_ms = times.length ? Math.min(...times) : null;
    return { 
      ...rider, 
      total_ms, 
      best_season_ms,
      // Map by_season to the expected format
      fall_ms: rider.by_season.FALL,
      winter_ms: rider.by_season.WINTER,
      spring_ms: rider.by_season.SPRING,
      summer_ms: rider.by_season.SUMMER,
      // Map individual season climb/descent times
      fall_climb_ms: rider.by_season_climb.FALL,
      winter_climb_ms: rider.by_season_climb.WINTER,
      spring_climb_ms: rider.by_season_climb.SPRING,
      summer_climb_ms: rider.by_season_climb.SUMMER,
      fall_desc_ms: rider.by_season_desc.FALL,
      winter_desc_ms: rider.by_season_desc.WINTER,
      spring_desc_ms: rider.by_season_desc.SPRING,
      summer_desc_ms: rider.by_season_desc.SUMMER,
    };
  });

  const res = NextResponse.json({ year, rows: out });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
