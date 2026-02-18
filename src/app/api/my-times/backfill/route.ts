export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { fetchAllSegmentEffortsSince2014 } from '@/lib/strava-improved'
import { ensureFreshToken, fetchActivityWithEfforts } from '@/lib/strava-activity'
import { sumsFromActivity } from '@/lib/computeSums'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const purge = url.searchParams.get('purge') === '1'

    console.log('[backfill] Starting backfill process')

    const cookieStore = await cookies()
    // Accept either cookie name (RID is the primary one set by the OAuth callback)
    const rider_id = cookieStore.get('RID')?.value ?? cookieStore.get('rider_id')?.value
    if (!rider_id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sb = supabaseAdmin()
    if (purge) {
      console.log('[backfill] Purging existing attempts')
      await sb.from('attempts').delete().eq('rider_id', rider_id)
    }

    // Ensure we have a fresh token for the current rider
    const token = await ensureFreshToken(rider_id)
    console.log(`[backfill] Using fresh token for rider ${rider_id}`)

    // Fetch all segment efforts from Strava
    const efforts = await fetchAllSegmentEffortsSince2014()
    console.log(`[backfill] Found ${efforts.length} total efforts`)

    // Track best (lowest) main_ms per season to avoid overwriting a better time
    const bestPerSeason = new Map<string, {
      activity_id: number;
      main_ms: number;
      climb_sum_ms: number | null;
      desc_sum_ms: number | null;
    }>()

    let noWindow = 0
    let denied401 = 0
    let denied403 = 0
    let notFound404 = 0
    let otherFetchErr = 0
    let noSegEfforts = 0

    for (const e of efforts) {
      const effort = e as {
        start_date?: string;
        activity?: { id: number };
        activity_id?: number;
        elapsed_time?: number;
        moving_time?: number;
      }

      const activity_id = Number(effort.activity?.id ?? effort.activity_id)
      const startUtc: string | undefined = effort.start_date
      if (!activity_id || !startUtc) continue

      // Match to a season window
      const { data: win } = await sb
        .from('season_windows')
        .select('season_key')
        .lte('start_at', startUtc)
        .gte('end_at', startUtc)
        .single()

      if (!win) {
        noWindow++
        continue
      }

      const main_ms = (effort.elapsed_time ?? effort.moving_time ?? 0) * 1000

      // Only bother fetching activity details if this could beat the current best
      const existing = bestPerSeason.get(win.season_key)
      if (existing && existing.main_ms <= main_ms) continue

      let climb_sum_ms: number | null = null
      let desc_sum_ms: number | null = null

      try {
        const act = await fetchActivityWithEfforts(token, activity_id)
        const actObj = act as Record<string, unknown>
        const segEff = Array.isArray(actObj?.segment_efforts) ? actObj.segment_efforts : []
        if (segEff.length === 0) {
          noSegEfforts++
        } else {
          const sums = sumsFromActivity(act)
          climb_sum_ms = sums.climb
          desc_sum_ms = sums.desc
        }
      } catch (err: unknown) {
        const m = String(err instanceof Error ? err.message : err)
        if (m.includes(' 401 ')) denied401++
        else if (m.includes(' 403 ')) denied403++
        else if (m.includes(' 404 ')) notFound404++
        else otherFetchErr++
        console.warn(`[backfill] Failed to get sums for activity ${activity_id}:`, err)
      }

      bestPerSeason.set(win.season_key, { activity_id, main_ms, climb_sum_ms, desc_sum_ms })
    }

    // Upsert one best attempt per season using the correct PK (rider_id, season_key)
    let imported = 0
    for (const [season_key, best] of bestPerSeason.entries()) {
      const { error: upErr } = await sb.from('attempts').upsert(
        { rider_id, season_key, ...best },
        { onConflict: 'rider_id,season_key' }
      )
      if (!upErr) imported++
      else console.warn(`[backfill] Upsert failed for ${season_key}:`, upErr.message)
    }

    return NextResponse.json({
      ok: true,
      imported,
      skipped_no_window: noWindow,
      diag: { denied401, denied403, notFound404, otherFetchErr, noSegEfforts, totalEfforts: efforts.length },
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}