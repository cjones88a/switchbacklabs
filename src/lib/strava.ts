import { env } from './env';

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
