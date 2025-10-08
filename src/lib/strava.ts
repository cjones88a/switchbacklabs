import { createClient } from "@supabase/supabase-js";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API = "https://www.strava.com/api/v3";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MAIN_SEGMENT_ID = Number(process.env.MAIN_SEGMENT_ID || process.env.NEXT_PUBLIC_MAIN_SEGMENT_ID || process.env.SEGMENT_ID || 7977451);

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
  const { data, error } = await sb.from<TokenRow>("oauth_tokens").select("*").eq("rider_id", riderId).maybeSingle();
  if (error || !data) throw new Error("oauth_token_not_found");

  const expires = new Date(data.expires_at).getTime();
  const now = Date.now();
  if (expires - now > 60_000) {
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
  elapsed_time: number; // seconds
  moving_time: number;
  start_date_local: string;
  activity: { id: number };
};

export async function listSegmentEffortsForWindow(
  accessToken: string,
  segmentId: number,
  startLocal: string, // YYYY-MM-DDTHH:mm:ss (no Z)
  endLocal: string
): Promise<SegmentEffort[]> {
  const results: SegmentEffort[] = [];
  let page = 1;
  const per_page = 200;

  while (true) {
    const url = new URL(`${STRAVA_API}/segment_efforts`);
    url.searchParams.set("segment_id", String(segmentId));
    url.searchParams.set("start_date_local", startLocal);
    url.searchParams.set("end_date_local", endLocal);
    url.searchParams.set("per_page", String(per_page));
    url.searchParams.set("page", String(page));

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`strava_list_efforts_failed: ${t || r.statusText}`);
    }

    const chunk = (await r.json()) as SegmentEffort[];
    results.push(...chunk);
    if (chunk.length < per_page) break;
    page++;
    if (page > 20) break; // sanity
  }

  return results;
}

export { MAIN_SEGMENT_ID };