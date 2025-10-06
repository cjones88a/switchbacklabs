import { NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/strava';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect('/race-trackingV2?error=missing_code');

  const data = await exchangeCodeForToken(code);
  const athlete = data?.athlete;

  const { data: riderRow, error: rErr } = await supabaseAdmin
    .from('riders')
    .upsert({
      strava_athlete_id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile
    }, { onConflict: 'strava_athlete_id' })
    .select('id, strava_athlete_id')
    .single();
  if (rErr) return NextResponse.redirect('/race-trackingV2?error=rider_upsert_failed');

  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await supabaseAdmin.from('oauth_tokens').upsert({
    rider_id: riderRow!.id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at
  });

  return NextResponse.redirect('/race-trackingV2?connected=1');
}
