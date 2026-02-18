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
  console.log(`[${t.name}] ${t.id} requested year:`, requestedYear);
  
  // Use the requested year exactly — don't silently fall back to a different year
  // (that causes year 2026 to show year 2025 data when no 2026 data exists yet)
  const year = requestedYear;
  const seasonKeys = [`${year}_FALL`, `${year}_WINTER`, `${year + 1}_SPRING`, `${year + 1}_SUMMER`];
  console.log(`[${t.name}] ${t.id} using race year`, year, 'seasonKeys', seasonKeys);

  // Get all attempts data
  const { data, error } = await supabase
    .from("attempts")
    .select("rider_id, season_key, main_ms, climb_sum_ms, desc_sum_ms")
    .in("season_key", seasonKeys);

  // Get rider information separately to avoid join issues
  const riderIds = [...new Set((data || []).map(a => a.rider_id))];
  const { data: ridersData } = await supabase
    .from("riders")
    .select("id, firstname, lastname, profile")
    .in("id", riderIds);

  // Create a map for quick rider lookup
  const ridersMap = new Map();
  (ridersData || []).forEach(rider => {
    ridersMap.set(rider.id, rider);
  });

  if (error) {
    console.error(`[${t.name}] ${t.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[${t.name}] ${t.id} found ${data?.length || 0} attempts for season keys:`, seasonKeys);
  console.log(`[${t.name}] ${t.id} sample attempts:`, data?.slice(0, 3));
  console.log(`[${t.name}] ${t.id} found ${riderIds.length} unique riders:`, riderIds);
  console.log(`[${t.name}] ${t.id} rider info:`, ridersData?.slice(0, 3));

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

    // Get rider info from our map
    const riderInfo = ridersMap.get(attempt.rider_id);

    if (!byRider.has(attempt.rider_id)) {
      byRider.set(attempt.rider_id, {
        rider: { 
          name: riderInfo 
            ? `${riderInfo.firstname ?? ''} ${riderInfo.lastname ?? ''}`.trim() || 'Unknown Rider'
            : `Rider ${attempt.rider_id.slice(0, 8)}`, 
          avatar: riderInfo?.profile ?? null 
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

  console.log(`[${t.name}] ${t.id} final output: ${out.length} riders`);
  console.log(`[${t.name}] ${t.id} sample output:`, out.slice(0, 2));
  
  const res = NextResponse.json({ year, rows: out });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
