import 'server-only';
import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@supabase/supabase-js';

const STRAVA_BASE = 'https://www.strava.com/api/v3';
const MAIN_SEGMENT_ID = Number(process.env.MAIN_SEGMENT_ID || process.env.NEXT_PUBLIC_MAIN_SEGMENT_ID || 7977451);

type Tokens = {
  rider_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO
};

function adminSb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  return createServerClient(url, key, { auth: { persistSession: false } });
}

async function getTokensForCurrentRider(): Promise<Tokens | null> {
  const riderId = cookies().get('rider_id')?.value;
  if (!riderId) return null;
  const sb = adminSb();
  const { data } = await sb
    .from('oauth_tokens')
    .select('rider_id, access_token, refresh_token, expires_at')
    .eq('rider_id', riderId)
    .single();
  return (data as Tokens) ?? null;
}

async function refreshIfNeeded(tokens: Tokens): Promise<Tokens> {
  const now = Date.now();
  if (new Date(tokens.expires_at).getTime() - now > 60_000) return tokens;

  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
  });

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Strava refresh failed: ${res.status} ${t}`);
  }
  const j = await res.json();

  const sb = adminSb();
  await sb.from('oauth_tokens').update({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: new Date(j.expires_at * 1000).toISOString(),
  }).eq('rider_id', tokens.rider_id);

  return {
    rider_id: tokens.rider_id,
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: new Date(j.expires_at * 1000).toISOString(),
  };
}

async function bearer() {
  const t0 = await getTokensForCurrentRider();
  if (!t0) throw new Error('No Strava tokens for current rider');
  const t = await refreshIfNeeded(t0);
  return t.access_token;
}

async function stravaJson(url: string, accessToken?: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken ?? await bearer()}` },
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) {
    // bubble up useful diagnostics
    throw new Error(`Strava ${res.status} ${res.statusText} — ${url} ${text}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

export async function getMe() {
  const url = `${STRAVA_BASE}/athlete`;
  return stravaJson(url);
}

/** Primary: /athlete/segment_efforts; Fallback: /segments/{id}/all_efforts?athlete_id=me */
export async function fetchAllSegmentEffortsSince2014() {
  const accessToken = await bearer();
  const segId = MAIN_SEGMENT_ID;

  const pageSize = 200;
  const collected: unknown[] = [];

  // ---- Primary: /athlete/segment_efforts
  try {
    let page = 1;
    while (true) {
      const url = new URL(`${STRAVA_BASE}/athlete/segment_efforts`);
      url.searchParams.set('segment_id', String(segId));
      url.searchParams.set('per_page', String(pageSize));
      url.searchParams.set('page', String(page));
      const batch = await stravaJson(url.toString(), accessToken);
      if (!Array.isArray(batch) || batch.length === 0) break;
      collected.push(...batch);
      if (batch.length < pageSize) break;
      page++;
    }
    if (collected.length > 0) {
      console.log(`[strava] Primary method succeeded: ${collected.length} efforts`);
      return collected;
    }
  } catch (e: unknown) {
    // Keep message for diagnostics, but try fallback
    console.warn('Primary segment efforts fetch failed, falling back:', e instanceof Error ? e.message : e);
  }

  // ---- Fallback: /segments/{id}/all_efforts?athlete_id=me
  const me = await getMe();
  const athleteId = (me as { id?: number })?.id;
  if (!athleteId) throw new Error('Could not resolve athlete id for fallback');

  let page = 1;
  while (true) {
    const url = new URL(`${STRAVA_BASE}/segments/${segId}/all_efforts`);
    url.searchParams.set('athlete_id', String(athleteId));
    url.searchParams.set('per_page', String(pageSize));
    url.searchParams.set('page', String(page));
    // Optional: narrow by date if needed
    const batch = await stravaJson(url.toString(), accessToken);
    if (!Array.isArray(batch) || batch.length === 0) break;
    collected.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }
  console.log(`[strava] Fallback method succeeded: ${collected.length} efforts`);
  return collected;
}

/** helper in UI to produce upgrade link (force new scopes) */
export function buildForceConsentUrl() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
    response_type: 'code',
    approval_prompt: 'force',
    scope: 'read,activity:read_all',
    redirect_uri: process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!,
    state: 'upgrade-scopes',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}