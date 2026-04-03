import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

async function refreshStravaToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: string;
} | null> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(data.expires_at * 1000).toISOString(),
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const riderId = cookieStore.get('rider_id')?.value;
  if (!riderId) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // get token row
  const { data: tokenRow, error: tErr } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('rider_id', riderId)
    .single();

  if (tErr || !tokenRow) {
    return NextResponse.json({ error: 'no_token' }, { status: 401 });
  }

  // refresh if expired (with 5 min buffer)
  let accessToken = tokenRow.access_token;
  const expiresAt = new Date(tokenRow.expires_at).getTime();
  const now = Date.now();

  if (expiresAt - now < 5 * 60 * 1000) {
    const refreshed = await refreshStravaToken(tokenRow.refresh_token);
    if (!refreshed) {
      return NextResponse.json({ error: 'token_refresh_failed' }, { status: 401 });
    }
    accessToken = refreshed.access_token;
    await supabase.from('oauth_tokens').update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at,
    }).eq('rider_id', riderId);
  }

  // fetch last 60 activities from Strava
  const activitiesRes = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=60',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!activitiesRes.ok) {
    return NextResponse.json({ error: 'strava_fetch_failed' }, { status: 502 });
  }

  const activities = await activitiesRes.json();

  // fetch athlete profile
  const athleteRes = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const athlete = athleteRes.ok ? await athleteRes.json() : null;

  // filter to rides only and compute summary stats
  const rides = activities.filter((a: { type: string }) =>
    a.type === 'Ride' || a.type === 'VirtualRide'
  );

  const last30Days = rides.filter((a: { start_date: string }) => {
    const d = new Date(a.start_date);
    return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
  });

  const totalHours30d = last30Days.reduce(
    (sum: number, a: { moving_time: number }) => sum + a.moving_time / 3600,
    0
  );

  // find longest ride
  const longestRide = rides.reduce(
    (best: { moving_time: number } | null, a: { moving_time: number }) =>
      !best || a.moving_time > best.moving_time ? a : best,
    null
  );

  // find key power rides (device_watts: true only)
  const powerRides = rides
    .filter((a: { device_watts: boolean; weighted_average_watts?: number }) =>
      a.device_watts && a.weighted_average_watts
    )
    .sort(
      (a: { weighted_average_watts: number }, b: { weighted_average_watts: number }) =>
        b.weighted_average_watts - a.weighted_average_watts
    )
    .slice(0, 5);

  return NextResponse.json({
    athlete: athlete
      ? {
          id: athlete.id,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          weight: athlete.weight,
          profile: athlete.profile,
        }
      : null,
    summary: {
      totalHours30d: Math.round(totalHours30d * 10) / 10,
      rideCount30d: last30Days.length,
      longestRideMinutes: longestRide
        ? Math.round(longestRide.moving_time / 60)
        : 0,
      longestRideName: longestRide?.name ?? null,
    },
    recentRides: last30Days.slice(0, 15).map((a: {
      id: number;
      name: string;
      start_date: string;
      moving_time: number;
      distance: number;
      average_watts: number;
      weighted_average_watts?: number;
      device_watts: boolean;
      average_heartrate?: number;
      total_elevation_gain: number;
      sport_type: string;
    }) => ({
      id: a.id,
      name: a.name,
      date: a.start_date,
      durationMin: Math.round(a.moving_time / 60),
      distanceKm: Math.round(a.distance / 100) / 10,
      avgWatts: Math.round(a.average_watts),
      npWatts: a.weighted_average_watts
        ? Math.round(a.weighted_average_watts)
        : null,
      devicePower: a.device_watts,
      avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
      elevationM: Math.round(a.total_elevation_gain),
      sportType: a.sport_type,
    })),
    powerRides: powerRides.map((a: {
      id: number;
      name: string;
      moving_time: number;
      weighted_average_watts: number;
      average_watts: number;
    }) => ({
      id: a.id,
      name: a.name,
      durationMin: Math.round(a.moving_time / 60),
      npWatts: Math.round(a.weighted_average_watts),
      avgWatts: Math.round(a.average_watts),
    })),
  });
}
