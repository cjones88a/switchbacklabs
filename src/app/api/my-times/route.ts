import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fmtLocal, getFreshAccessToken, listSegmentEffortsForWindow, MAIN_SEGMENT_ID } from "@/lib/strava";
import { traceHeaders } from "@/lib/trace";

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// fallback "approximate" windows if not present in DB (Fri–Mon around equinox/solstice)
function defaultWindowsFromYear(year: number) {
  // Note: these are rough anchors; your admin tool can override in DB for precision.
  const approx = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 0, 0, 0));
  const bumpToFriday = (dt: Date) => {
    const day = dt.getUTCDay(); // 0 Sun..6 Sat
    const delta = (5 - day + 7) % 7; // to Friday
    const fri = new Date(dt.getTime() + delta * 86400000);
    const mon = new Date(fri.getTime() + 3 * 86400000);
    return { start: fri, end: mon };
  };

  // anchors
  const fall   = bumpToFriday(approx(year, 8, 22)); // ~Sept 22
  const winter = bumpToFriday(approx(year, 11, 21)); // ~Dec 21
  const spring = bumpToFriday(approx(year + 1, 2, 20)); // ~Mar 20 (next year)
  const summer = bumpToFriday(approx(year + 1, 5, 20)); // ~Jun 20 (next year)

  return {
    [`${year}_FALL`]:   fall,
    [`${year}_WINTER`]: winter,
    [`${year + 1}_SPRING`]: spring,
    [`${year + 1}_SUMMER`]: summer,
  } as Record<string, { start: Date; end: Date }>;
}

function parseKey(key: string) {
  const [y, s] = key.split("_");
  const season = s as "FALL" | "WINTER" | "SPRING" | "SUMMER";
  const year = Number(y);
  // Race year is the Fall year:
  const race_year = (season === "FALL" || season === "WINTER") ? year : year - 1;
  return { year, season, race_year };
}

type SeasonWindowRow = { season_key: string; start_at: string; end_at: string };
type AttemptRow = {
  id: string;
  rider_id: string;
  season_key: string;
  activity_id: number | null;
  main_ms: number | null;
};

export async function GET() {
  const t = traceHeaders("my-times");
  console.time(`[${t.name}] ${t.id}`);
  
  const cookieStore = await cookies();
  const rid = cookieStore.get("rider_id")?.value;
  if (!rid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // 1) Load all windows from DB
  const { data: winRows, error: winErr } = await sb
    .from<SeasonWindowRow>("season_windows")
    .select("*")
    .order("start_at", { ascending: true });

  if (winErr) return NextResponse.json({ error: winErr.message }, { status: 500 });

  // Build a windows map back to 2014, using defaults when missing
  const FIRST_RACE_YEAR = 2014;
  const now = new Date();
  const latestFallYear = now.getUTCFullYear() + 1; // include next spring/summer if present
  const windows: Record<string, { start: Date; end: Date }> = {};

  // bring in DB-defined windows
  for (const w of winRows || []) {
    const start = new Date(w.start_at);
    const end   = new Date(w.end_at);
    if (!isFinite(start.getTime()) || !isFinite(end.getTime())) continue;
    windows[w.season_key] = { start, end };
  }

  // fill defaults if some seasons are missing
  for (let y = FIRST_RACE_YEAR; y <= latestFallYear; y++) {
    const defaults = defaultWindowsFromYear(y);
    for (const [key, val] of Object.entries(defaults)) {
      if (!windows[key]) windows[key] = val;
    }
  }

  // Fetch attempts we may already have (cache)
  const { data: cachedAttempts } = await sb
    .from<AttemptRow>("attempts")
    .select("id, rider_id, season_key, activity_id, main_ms")
    .eq("rider_id", rid);

  const cacheMap = new Map<string, AttemptRow>();
  for (const a of cachedAttempts || []) cacheMap.set(`${a.season_key}`, a);

  // Strava token
  const accessToken = await getFreshAccessToken(rid);

  // 2) For each window, ensure we have the fastest effort
  type SeasonTime = { season_key: string; race_year: number; season: string; ms: number | null };
  const perSeason: SeasonTime[] = [];

  const keys = Object.keys(windows).sort(); // chronological
  for (const season_key of keys) {
    const { season, race_year } = parseKey(season_key);
    const w = windows[season_key];

    let ms: number | null = null;
    let activityId: number | null = null;

    // Prefer cached attempt if exists
    const cached = cacheMap.get(season_key);
    if (cached?.main_ms && cached.activity_id) {
      ms = cached.main_ms;
      activityId = cached.activity_id;
    } else {
      // Fetch ALL efforts in the window from Strava
      const startLocal = fmtLocal(w.start);
      const endLocal   = fmtLocal(w.end);

      try {
        const efforts = await listSegmentEffortsForWindow(accessToken, MAIN_SEGMENT_ID, startLocal, endLocal);

        if (efforts.length) {
          // Choose the fastest effort in that window
          const best = efforts.reduce((acc, e) => (e.elapsed_time < acc.elapsed_time ? e : acc), efforts[0]);
          ms = best.elapsed_time * 1000;
          activityId = best.activity.id;

          // Cache into attempts for future speed; ignore climb/desc here
          const { error: upErr } = await sb
            .from("attempts")
            .upsert(
              {
                rider_id: rid,
                season_key,
                activity_id: activityId,
                main_ms: ms,
              },
              { onConflict: "rider_id,activity_id" } // uses our unique index
            );
          if (upErr && upErr.code !== "23505") {
            console.error("attempts upsert failed", upErr);
          }
        }
      } catch (e) {
        console.error("Strava efforts fetch failed", season_key, e);
      }
    }

    // Only include rows where a time exists
    if (ms != null) {
      perSeason.push({ season_key, race_year, season, ms });
    }
  }

  // 3) Pivot per race_year into rows
  type Row = { race_year: number; fall_ms: number | null; winter_ms: number | null; spring_ms: number | null; summer_ms: number | null };
  const byYear = new Map<number, Row>();
  for (const s of perSeason) {
    const row = byYear.get(s.race_year) || { race_year: s.race_year, fall_ms: null, winter_ms: null, spring_ms: null, summer_ms: null };
    if (s.season === "FALL")   row.fall_ms   = min(row.fall_ms, s.ms);
    if (s.season === "WINTER") row.winter_ms = min(row.winter_ms, s.ms);
    if (s.season === "SPRING") row.spring_ms = min(row.spring_ms, s.ms);
    if (s.season === "SUMMER") row.summer_ms = min(row.summer_ms, s.ms);
    byYear.set(s.race_year, row);
  }

  const rows = Array.from(byYear.values()).sort((a, b) => b.race_year - a.race_year);

  const res = NextResponse.json({ rows });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}

function min(a: number | null, b: number | null) {
  if (a == null) return b ?? null;
  if (b == null) return a;
  return Math.min(a, b);
}
