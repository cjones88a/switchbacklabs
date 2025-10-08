import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeFromActivity } from '@/lib/strava';
import { getWindowsForSeason } from '@/lib/windows';
import { traceHeaders } from '@/lib/trace';

export const runtime = 'nodejs';

async function getValidAccessToken(riderId: string) {
  const supabase = getSupabaseAdmin();
  const { data: tokenRow } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('rider_id', riderId)
    .single();
  
  if (!tokenRow) throw new Error('no_token');
  
  // If token is expired, refresh it
  if (new Date(tokenRow.expires_at) <= new Date()) {
    // TODO: Implement token refresh logic
    throw new Error('token_expired');
  }
  
  return tokenRow.access_token;
}

async function withRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (i === maxRetries - 1) return response;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('max_retries_exceeded');
}

export async function POST(req: Request) {
  const t = traceHeaders("record");
  console.time(`[${t.name}] ${t.id}`);
  
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error(`[${t.name}] ${t.id} JSON parse error:`, jsonError);
      return NextResponse.json({ 
        recorded: false, 
        reason: 'invalid_json', 
        detail: 'Request body must be valid JSON' 
      }, { status: 400 });
    }
    
    const seasonKey = body.season_key;
    console.log(`[${t.name}] ${t.id} body`, body);
    const force_activity_id = process.env.NODE_ENV !== "production"
      ? (body?.force_activity_id as number | undefined)
      : undefined;
    
    if (!seasonKey) {
      return NextResponse.json({ recorded: false, reason: 'missing_season_key' }, { status: 400 });
    }

    // Check authentication
    const cookieStore = await cookies();
    const rid = cookieStore.get('RID')?.value;
    if (!rid) {
      return NextResponse.json({ recorded: false, reason: 'not_authenticated' }, { status: 401 });
    }

    // 1) gather windows
    const windows = await getWindowsForSeason(seasonKey);
    if (!windows.length) {
      return NextResponse.json({ recorded: false, reason: 'no_season_window' }, { status: 400 });
    }

    // 2) token
    const access = await getValidAccessToken(rid);

    let summaries: Array<{ activity_id: number; main_ms: number; climb_sum_ms: number | null; desc_sum_ms: number | null }> = [];

    if (force_activity_id) {
      // Force test with specific activity ID
      const dRes = await withRetry(
        `https://www.strava.com/api/v3/activities/${force_activity_id}?include_all_efforts=true`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      if (!dRes.ok) {
        const txt = await dRes.text();
        return NextResponse.json({ recorded: false, reason: 'force_fetch_failed', detail: txt }, { status: 502 });
      }
      const activity = await dRes.json();
      const sum = summarizeFromActivity(activity);
      if (!sum) return NextResponse.json({ recorded: false, reason: 'force_activity_missing_main' });
      summaries = [sum];
    } else {
      // 3) collect candidate activities across ALL windows (dedup IDs)
      const ids = new Set<number>();
      for (const w of windows) {
        const afterUnix = Math.floor(new Date(w.start_at).getTime() / 1000);
        const beforeUnix = Math.floor(new Date(w.end_at).getTime() / 1000);
        const actsRes = await withRetry(
          `https://www.strava.com/api/v3/athlete/activities?after=${afterUnix}&before=${beforeUnix}&per_page=50`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        if (!actsRes.ok) continue;
        const acts = (await actsRes.json()) as Array<{ id: number }>;
        acts.forEach(a => ids.add(a.id));
      }

      // 4) fetch details for each unique activity id, summarize (same-activity rule stays)
      for (const activityId of ids) {
        const dRes = await withRetry(
          `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
          { headers: { Authorization: `Bearer ${access}` } }
        );
        if (!dRes.ok) continue;
        const activity = await dRes.json();
        const sum = summarizeFromActivity(activity);
        if (sum) summaries.push(sum);
      }
    }

    if (summaries.length === 0) {
      return NextResponse.json({ recorded: false, reason: 'no_qualifying_effort' }, { status: 400 });
    }

    // Use the best (fastest) attempt
    const bestAttempt = summaries.reduce((best, current) => 
      current.main_ms < best.main_ms ? current : best
    );

        // Insert the attempt
        const supabase = getSupabaseAdmin();
        const { error: insertError } = await supabase
          .from('attempts')
          .upsert({
            rider_id: rid,
            season_key: seasonKey,
            activity_id: bestAttempt.activity_id,
            main_ms: bestAttempt.main_ms,
            climb_sum_ms: bestAttempt.climb_sum_ms,
            desc_sum_ms: bestAttempt.desc_sum_ms,
          }, { onConflict: 'rider_id,season_key' });

    if (insertError) {
      return NextResponse.json({ recorded: false, reason: 'insert_failed', detail: insertError.message }, { status: 500 });
    }

    const res = NextResponse.json({ 
      recorded: true, 
      activity_id: bestAttempt.activity_id,
      main_ms: bestAttempt.main_ms,
      climb_sum_ms: bestAttempt.climb_sum_ms,
      desc_sum_ms: bestAttempt.desc_sum_ms
    });
    res.headers.set("x-trace-id", t.id);
    res.headers.set("x-handler", t.name);
    console.timeEnd(`[${t.name}] ${t.id}`);
    return res;

  } catch (error) {
    console.error('Record API error:', error);
    return NextResponse.json({ 
      recorded: false, 
      reason: 'server_error', 
      detail: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
