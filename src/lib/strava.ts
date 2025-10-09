import { createClient } from "@supabase/supabase-js";
import { env } from './env';

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API = "https://www.strava.com/api/v3";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE!;
const MAIN_SEGMENT_ID = Number(process.env.MAIN_SEGMENT_ID || process.env.NEXT_PUBLIC_MAIN_SEGMENT_ID || process.env.SEGMENT_ID || 7977451);

// Legacy functions for backward compatibility
export function getAuthorizeURL(stateObj: unknown) {
  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id', env.STRAVA_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.STRAVA_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('approval_prompt', 'auto');
  url.searchParams.set('scope', 'read,activity:read_all');
  const state = Buffer.from(JSON.stringify(stateObj ?? {})).toString('base64url');
  url.searchParams.set('state', state);
  return url.toString();
}

export function decodeState<T extends object = Record<string, unknown>>(state?: string | null): T | null {
  if (!state) return null;
  try { return JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as T; }
  catch { return null; }
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code, grant_type: 'authorization_code'
    })
  });
  if (!res.ok) throw new Error('token_exchange_failed');
  return res.json();
}

export type Effort = { segment: { id: number }, elapsed_time: number };
export type Activity = { id: number, start_date: string, segment_efforts?: Effort[] };

export function summarizeFromActivity(activity: Activity) {
  const ids = env.SEGMENTS;
  const list = activity.segment_efforts ?? [];
  const pick = (id: number) => list.find(e => e.segment.id === id);

  const main = pick(ids.main);
  if (!main) return null;

  const c1 = pick(ids.c1), c2 = pick(ids.c2);
  const d1 = pick(ids.d1), d2 = pick(ids.d2), d3 = pick(ids.d3);

  const main_ms = main.elapsed_time * 1000;
  const climb_sum_ms = (c1 && c2) ? (c1.elapsed_time + c2.elapsed_time) * 1000 : null;
  const desc_sum_ms  = (d1 && d2 && d3) ? (d1.elapsed_time + d2.elapsed_time + d3.elapsed_time) * 1000 : null;

  return { activity_id: activity.id, main_ms, climb_sum_ms, desc_sum_ms };
}

/** format YYYY-MM-DDTHH:mm:ss with no Z (Strava expects 'local' for start_date_local/end_date_local) */
export function fmtLocal(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

export type TokenRow = {
  rider_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // timestamptz
};

export async function getFreshAccessToken(riderId: string): Promise<string> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb.from("oauth_tokens").select("*").eq("rider_id", riderId).maybeSingle();
  if (error || !data) throw new Error("oauth_token_not_found");

  const expires = new Date(data.expires_at).getTime();
  if (expires - Date.now() > 60_000) {
    return data.access_token;
  }

  // refresh
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: data.refresh_token,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`strava_refresh_failed: ${t || res.statusText}`);
  }

  const json = await res.json();
  const update = {
    access_token: json.access_token as string,
    refresh_token: json.refresh_token as string,
    expires_at: new Date(json.expires_at * 1000).toISOString(),
  };

  const { error: upErr } = await sb.from("oauth_tokens").update(update).eq("rider_id", riderId);
  if (upErr) console.error("Failed updating oauth_tokens:", upErr);

  return update.access_token;
}

export type SegmentEffort = {
  id: number;
  elapsed_time: number;    // seconds
  moving_time: number;     // seconds
  start_date: string;      // ISO 8601 UTC, e.g. "2024-09-21T15:02:11Z"
  start_date_local: string;
  activity: { id: number };
};

/**
 * Fetch ALL efforts for a segment within a UTC range.
 * Uses start_date/end_date (UTC) to avoid local-time ambiguity.
 */
export async function listAllSegmentEffortsUTC(
  accessToken: string,
  segmentId: number,
  startISO: string, // "2014-01-01T00:00:00Z"
  endISO: string    // now.toISOString()
): Promise<SegmentEffort[]> {
  const results: SegmentEffort[] = [];
  let page = 1;
  const per_page = 200;
  
  console.log(`[strava] Fetching segment efforts for segment ${segmentId} from ${startISO} to ${endISO}`);
  
  while (true) {
    const url = new URL(`${STRAVA_API}/segment_efforts`);
    url.searchParams.set("segment_id", String(segmentId));
    url.searchParams.set("start_date", startISO);
    url.searchParams.set("end_date", endISO);
    url.searchParams.set("per_page", String(per_page));
    url.searchParams.set("page", String(page));

    console.log(`[strava] Fetching page ${page}: ${url.toString()}`);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    
    if (!r.ok) {
      const errorText = await r.text().catch(() => r.statusText);
      console.error(`[strava] API error: ${r.status} ${errorText}`);
      throw new Error(`strava_list_efforts_failed: ${errorText}`);
    }

    const chunk = (await r.json()) as SegmentEffort[];
    console.log(`[strava] Page ${page}: received ${chunk.length} efforts`);
    results.push(...chunk);
    if (chunk.length < per_page) break;
    page++;
    if (page > 50) break; // hard stop safety
  }
  
  console.log(`[strava] Total efforts fetched: ${results.length}`);
  return results;
}

export { MAIN_SEGMENT_ID };