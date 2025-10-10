import { createClient } from '@supabase/supabase-js'

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!

export type OAuthRow = {
  rider_id: string
  access_token: string
  refresh_token: string
  expires_at: string | null
}

function sbAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })
}

export async function getRiderOAuth(rider_id: string): Promise<OAuthRow> {
  const sb = sbAdmin()
  const { data, error } = await sb.from('oauth_tokens').select('*').eq('rider_id', rider_id).single()
  if (error || !data) throw new Error('No oauth token row for rider')
  return data as OAuthRow
}

export async function ensureFreshToken(rider_id: string): Promise<string> {
  const sb = sbAdmin()
  const row = await getRiderOAuth(rider_id)
  const now = Math.floor(Date.now() / 1000)
  const exp = row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : 0

  if (exp > now + 120) {
    return row.access_token
  }

  // refresh
  const tokenUrl = 'https://www.strava.com/oauth/token'
  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: row.refresh_token,
  })

  const r = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Strava refresh failed: ${r.status} ${t}`)
  }
  const j = await r.json()

  // persist new tokens
  const { error } = await sb
    .from('oauth_tokens')
    .update({
      access_token: j.access_token,
      refresh_token: j.refresh_token ?? row.refresh_token,
      expires_at: new Date((j.expires_at ?? now + 3600) * 1000).toISOString(),
    })
    .eq('rider_id', rider_id)
  if (error) throw new Error('Failed to persist refreshed tokens')

  return j.access_token as string
}

export async function stravaJson<T>(token: string, path: string) {
  const r = await fetch(`https://www.strava.com/api/v3${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    cache: 'no-store',
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Strava ${path} -> ${r.status} ${t}`)
  }
  return (await r.json()) as T
}

/** Fetch an activity including all segment efforts (owner only). */
export async function fetchActivityWithEfforts(token: string, activity_id: number) {
  // include_all_efforts=true is critical to get per-activity segment efforts
  return stravaJson<unknown>(token, `/activities/${activity_id}?include_all_efforts=true`)
}
