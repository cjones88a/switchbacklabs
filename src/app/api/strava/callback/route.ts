import { NextResponse } from 'next/server';
import { exchangeCodeForToken, decodeState } from '@/lib/strava';
import { getSupabaseAdmin } from '@/lib/supabase';
import { traceHeaders } from '@/lib/trace';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const t = traceHeaders("strava-callback");
  console.time(`[${t.name}] ${t.id}`);
  
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const state = decodeState<{ consent_public?: boolean }>(stateRaw);
  console.log(`[${t.name}] ${t.id} query params`, { code: code ? `${code.substring(0, 8)}...` : null, state: stateRaw });
  if (!code) return NextResponse.redirect(new URL('/race-trackingV2?error=missing_code', req.url));

  const data = await exchangeCodeForToken(code);
  const athlete = data?.athlete;
  const supabase = getSupabaseAdmin();

  const { data: riderRow, error: rErr } = await supabase
    .from('riders')
    .upsert({
      strava_athlete_id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
      consent_public: !!state?.consent_public,
      consent_public_at: state?.consent_public ? new Date().toISOString() : null,
    }, { onConflict: 'strava_athlete_id' })
    .select('id, strava_athlete_id')
    .single();

  if (rErr || !riderRow) return NextResponse.redirect(new URL('/race-trackingV2?error=rider_upsert_failed', req.url));

  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await supabase.from('oauth_tokens').upsert({
    rider_id: riderRow.id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at,
  });

  // set cookies on the response (works in dev/prod)
  const res = NextResponse.redirect(new URL('/race-trackingV2?connected=1', req.url));
  res.cookies.set('RID', riderRow.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set('rider_id', riderRow.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
