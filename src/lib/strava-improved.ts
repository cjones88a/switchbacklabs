// src/lib/strava-improved.ts
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
  const sb = adminSb();
  // Get rider_id from cookie
  const cookieStore = await cookies();
  const riderId = cookieStore.get('rider_id')?.value;
  if (!riderId) return null;

  const { data, error } = await sb
    .from('oauth_tokens')
    .select('rider_id, access_token, refresh_token, expires_at')
    .eq('rider_id', riderId)
    .single();

  if (error) return null;
  return data as Tokens;
}

async function refreshIfNeeded(tokens: Tokens): Promise<Tokens> {
  const now = Date.now();
  if (new Date(tokens.expires_at).getTime() - now > 60_000) return tokens;

  console.log(`[strava] Refreshing token for rider ${tokens.rider_id}`);

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
  });

  const r = await fetch(`https://www.strava.com/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: params.toString(),
    cache: 'no-store',
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`Strava refresh failed ${r.status}: ${errorText}`);
  }
  
  const j = await r.json();

  const sb = adminSb();
  const { data, error } = await sb.from('oauth_tokens')
    .update({
      access_token: j.access_token,
      refresh_token: j.refresh_token,
      expires_at: new Date(j.expires_at * 1000).toISOString(),
    })
    .eq('rider_id', tokens.rider_id)
    .select()
    .single();
    
  if (error) throw error;

  console.log(`[strava] Token refreshed successfully for rider ${tokens.rider_id}`);

  return {
    rider_id: tokens.rider_id,
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: new Date(j.expires_at * 1000).toISOString(),
  };
}

export async function stravaFetch(path: string, search: Record<string,string|number> = {}) {
  const t0 = await getTokensForCurrentRider();
  if (!t0) throw new Error('No Strava tokens for current rider.');
  const t = await refreshIfNeeded(t0);

  const url = new URL(STRAVA_BASE + path);
  Object.entries(search).forEach(([k,v]) => url.searchParams.set(k, String(v)));

  console.log(`[strava] Fetching: ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t.access_token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava ${res.status} ${res.statusText} — ${url}\n${body}`);
  }
  return res.json();
}

/** Fetch ALL efforts for the authenticated athlete on the main segment with pagination. */
export async function fetchAllSegmentEffortsSince2014() {
  console.log(`[strava] Starting to fetch all segment efforts for segment ${MAIN_SEGMENT_ID}`);
  
  const efforts: any[] = [];
  let page = 1;
  
  while (true) {
    console.log(`[strava] Fetching page ${page}...`);
    
    const batch = await stravaFetch('/athlete/segment_efforts', {
      segment_id: MAIN_SEGMENT_ID,
      per_page: 200,
      page,
    });
    
    if (!Array.isArray(batch) || batch.length === 0) {
      console.log(`[strava] Page ${page}: no more results`);
      break;
    }
    
    console.log(`[strava] Page ${page}: received ${batch.length} efforts`);
    efforts.push(...batch);
    
    if (batch.length < 200) {
      console.log(`[strava] Page ${page}: less than 200 results, stopping pagination`);
      break;
    }
    
    page++;
    
    // Safety check to prevent infinite loops
    if (page > 50) {
      console.log(`[strava] Safety limit reached at page ${page}`);
      break;
    }
  }
  
  console.log(`[strava] Total efforts fetched: ${efforts.length}`);
  return efforts;
}
