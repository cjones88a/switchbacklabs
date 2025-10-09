import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFreshAccessToken, listAllSegmentEffortsUTC, MAIN_SEGMENT_ID } from "@/lib/strava";
import { traceHeaders } from "@/lib/trace";

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type SeasonWindowRow = { season_key: string; start_at: string; end_at: string };
type AttemptRow = {
  id: string;
  rider_id: string;
  season_key: string;
  activity_id: number | null;
  main_ms: number | null;
};

const FIRST_RACE_YEAR = 2014;

// Fallback windows if DB is incomplete
function defaultWindowsForRaceYear(fallYear: number) {
  // UTC anchors for equinox/solstice (approx) → Fri..Mon window
  const approxUTC = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 0, 0, 0));
  const friToMon = (dt: Date) => {
    const day = dt.getUTCDay(); // 0-6
    const delta = (5 - day + 7) % 7; // to Friday
    const fri = new Date(dt.getTime() + delta * 86400000);
    const mon = new Date(fri.getTime() + 3 * 86400000);
    return { start: fri, end: mon };
  };

  return {
    [`${fallYear}_FALL`]:        friToMon(approxUTC(fallYear, 8, 22)),  // ~Sep 22
    [`${fallYear}_WINTER`]:      friToMon(approxUTC(fallYear, 11, 21)), // ~Dec 21
    [`${fallYear + 1}_SPRING`]:  friToMon(approxUTC(fallYear + 1, 2, 20)), // ~Mar 20
    [`${fallYear + 1}_SUMMER`]:  friToMon(approxUTC(fallYear + 1, 5, 20)), // ~Jun 20
  } as Record<string, { start: Date; end: Date }>;
}

function parseKey(key: string) {
  const [ys, season] = key.split("_");
  const y = Number(ys);
  // race_year is the Fall year
  const race_year = (season === "SPRING" || season === "SUMMER") ? y - 1 : y;
  return { year: y, season, race_year };
}

function within(effortISO: string, win: { start: Date; end: Date }) {
  const t = new Date(effortISO).getTime(); // effort.start_date (UTC)
  return t >= win.start.getTime() && t <= win.end.getTime();
}

function min(a: number | null, b: number | null) {
  if (a == null) return b ?? null;
  if (b == null) return a;
  return Math.min(a, b);
}

export async function GET() {
  const t = traceHeaders("my-times");
  console.time(`[${t.name}] ${t.id}`);
  
  const cookieStore = await cookies();
  const rid = cookieStore.get("rider_id")?.value;
  if (!rid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // 1) Load all season windows from DB
  const { data: dbWins, error: winErr } = await sb
    .from("season_windows")
    .select("*");
  if (winErr) return NextResponse.json({ error: winErr.message }, { status: 500 });

  // Build final windows: DB overrides + defaults for missing
  const windows: Record<string, { start: Date; end: Date }> = {};
  for (const w of dbWins || []) {
    const start = new Date(w.start_at);
    const end   = new Date(w.end_at);
    if (isFinite(start.getTime()) && isFinite(end.getTime())) {
      windows[w.season_key] = { start, end };
    }
  }
  const latestFallYear = new Date().getUTCFullYear() + 1;
  for (let y = FIRST_RACE_YEAR; y <= latestFallYear; y++) {
    const def = defaultWindowsForRaceYear(y);
    for (const [k, v] of Object.entries(def)) {
      if (!windows[k]) windows[k] = v;
    }
  }

  // 2) Fetch ALL efforts in one go (2014 → now), UTC
  const access = await getFreshAccessToken(rid);
  console.log(`[${t.name}] ${t.id} Fetching efforts for segment ${MAIN_SEGMENT_ID} from ${FIRST_RACE_YEAR} to now`);
  
  let allEfforts;
  try {
    allEfforts = await listAllSegmentEffortsUTC(
      access,
      MAIN_SEGMENT_ID,
      new Date(Date.UTC(FIRST_RACE_YEAR, 0, 1)).toISOString(),
      new Date().toISOString()
    );
    console.log(`[${t.name}] ${t.id} Found ${allEfforts.length} total efforts`);
  } catch (error) {
    console.error(`[${t.name}] ${t.id} Strava API error:`, error);
    return NextResponse.json({ error: "strava_api_failed", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }

  // 3) For each season window, pick the fastest effort that falls inside
  type SeasonBest = { season_key: string; race_year: number; season: string; ms: number; activity_id: number };
  const bestBySeason = new Map<string, SeasonBest>();

  // Pre-index windows by year for a tiny speed bump
  const keys = Object.keys(windows);

  for (const effort of allEfforts) {
    const tISO = effort.start_date; // UTC
    // Find which window this belongs to (at most one)
    for (const k of keys) {
      const win = windows[k];
      if (!within(tISO, win)) continue;

      const { season, race_year } = parseKey(k);
      const ms = effort.elapsed_time * 1000;

      const prev = bestBySeason.get(k);
      if (!prev || ms < prev.ms) {
        bestBySeason.set(k, { season_key: k, race_year, season, ms, activity_id: effort.activity.id });
      }
      break; // an effort can belong to only one window
    }
  }

  // 4) Upsert best-of-season into attempts using (rider_id, season_key)
  console.log(`[${t.name}] ${t.id} Found best efforts for ${bestBySeason.size} seasons`);
  if (bestBySeason.size) {
    const payload = Array.from(bestBySeason.values()).map(b => ({
      rider_id: rid,
      season_key: b.season_key,
      activity_id: b.activity_id,
      main_ms: b.ms,
    }));
    console.log(`[${t.name}] ${t.id} Upserting ${payload.length} attempts`);
    const { error: upErr } = await sb.from("attempts").upsert(payload, { onConflict: "rider_id,season_key" });
    if (upErr) {
      console.error("attempts upsert failed", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
  }

  // 5) Build MyTimes response (pivot by race_year)
  type Row = { race_year: number; fall_ms: number | null; winter_ms: number | null; spring_ms: number | null; summer_ms: number | null };
  const byYear = new Map<number, Row>();

  for (const b of bestBySeason.values()) {
    const row = byYear.get(b.race_year) || { race_year: b.race_year, fall_ms: null, winter_ms: null, spring_ms: null, summer_ms: null };
    if (b.season === "FALL")   row.fall_ms   = min(row.fall_ms, b.ms);
    if (b.season === "WINTER") row.winter_ms = min(row.winter_ms, b.ms);
    if (b.season === "SPRING") row.spring_ms = min(row.spring_ms, b.ms);
    if (b.season === "SUMMER") row.summer_ms = min(row.summer_ms, b.ms);
    byYear.set(b.race_year, row);
  }

  const rows = Array.from(byYear.values()).sort((a, b) => b.race_year - a.race_year);

  const res = NextResponse.json({ rows });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
