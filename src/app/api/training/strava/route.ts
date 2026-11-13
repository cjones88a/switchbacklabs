import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readOAuthEnv } from '@/lib/trainingGate';
import {
  openTrainingSession,
  sealTrainingSession,
  TRAINING_COOKIE_NAME,
  trainingCookieOptions,
} from '@/lib/trainingCookie';
import { DISCLAIMER_COOKIE_NAME, DISCLAIMER_VERSION, openDisclaimer } from '@/lib/trainingDisclaimer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

async function refreshStravaToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  const cfg = readOAuthEnv();
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: cfg.STRAVA_CLIENT_ID,
      client_secret: cfg.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.access_token || !data?.refresh_token) return null;
  const expiresAt =
    typeof data.expires_at === 'number'
      ? data.expires_at * 1000
      : Date.now() + (Number(data.expires_in) || 21600) * 1000;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const secret = process.env.TRAINING_SESSION_SECRET;
  let session = openTrainingSession(cookieStore.get(TRAINING_COOKIE_NAME)?.value, secret);
  if (!session) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  try {
    if (session.expiresAt - Date.now() < REFRESH_BUFFER_MS) {
      const refreshed = await refreshStravaToken(session.refreshToken);
      if (!refreshed) {
        cookieStore.set(TRAINING_COOKIE_NAME, '', { ...trainingCookieOptions(), maxAge: 0 });
        return NextResponse.json({ error: 'token_refresh_failed' }, { status: 401 });
      }
      session = {
        ...session,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      };
      cookieStore.set(TRAINING_COOKIE_NAME, sealTrainingSession(session, secret), trainingCookieOptions());
    }

    const activitiesRes = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=60',
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!activitiesRes.ok) {
      return NextResponse.json({ error: 'strava_fetch_failed' }, { status: 502 });
    }
    const activities = await activitiesRes.json();
    if (!Array.isArray(activities)) {
      return NextResponse.json({ error: 'strava_fetch_failed' }, { status: 502 });
    }

    const athleteRes = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    const athlete = athleteRes.ok ? await athleteRes.json() : null;

    const disclaimer = openDisclaimer(
      cookieStore.get(DISCLAIMER_COOKIE_NAME)?.value,
      secret
    );
    return NextResponse.json({
      ...summarizeActivities(activities, athlete),
      disclaimerAccepted: disclaimer != null,
      disclaimerVersion: DISCLAIMER_VERSION,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'strava_error';
    console.error('[training/strava]', message);
    const timedOut = /timeout|aborted/i.test(message);
    return NextResponse.json(
      { error: timedOut ? 'timeout' : 'strava_fetch_failed' },
      { status: timedOut ? 504 : 502 }
    );
  }
}

type Activity = {
  id: number;
  name: string;
  type: string;
  start_date: string;
  moving_time: number;
  distance: number;
  average_watts: number;
  weighted_average_watts?: number;
  device_watts: boolean;
  average_heartrate?: number;
  total_elevation_gain: number;
  sport_type: string;
};

function summarizeActivities(activities: Activity[], athlete: {
  id?: number;
  firstname?: string;
  lastname?: string;
  weight?: number;
  profile?: string;
} | null) {
  const rides = activities.filter((a) => a.type === 'Ride' || a.type === 'VirtualRide');
  const last30Days = rides.filter((a) => Date.now() - new Date(a.start_date).getTime() < 30 * 24 * 60 * 60 * 1000);
  const totalHours30d = last30Days.reduce((sum, a) => sum + a.moving_time / 3600, 0);
  const longestRide = rides.reduce<Activity | null>(
    (best, a) => (!best || a.moving_time > best.moving_time ? a : best),
    null
  );
  const powerRides = rides
    .filter((a) => a.device_watts && a.weighted_average_watts)
    .sort((a, b) => (b.weighted_average_watts ?? 0) - (a.weighted_average_watts ?? 0))
    .slice(0, 5);

  return {
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
      longestRideMinutes: longestRide ? Math.round(longestRide.moving_time / 60) : 0,
      longestRideName: longestRide?.name ?? null,
    },
    recentRides: last30Days.slice(0, 15).map((a) => ({
      id: a.id,
      name: a.name,
      date: a.start_date,
      durationMin: Math.round(a.moving_time / 60),
      distanceKm: Math.round(a.distance / 100) / 10,
      avgWatts: Math.round(a.average_watts || 0),
      npWatts: a.weighted_average_watts ? Math.round(a.weighted_average_watts) : null,
      devicePower: a.device_watts,
      avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
      elevationM: Math.round(a.total_elevation_gain || 0),
      sportType: a.sport_type,
    })),
    powerRides: powerRides.map((a) => ({
      id: a.id,
      name: a.name,
      durationMin: Math.round(a.moving_time / 60),
      npWatts: Math.round(a.weighted_average_watts ?? 0),
      avgWatts: Math.round(a.average_watts || 0),
    })),
  };
}
