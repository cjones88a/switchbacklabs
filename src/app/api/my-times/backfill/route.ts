import { NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { fetchAllSegmentEffortsSince2014 } from '@/lib/strava-improved'
import { ensureFreshToken, fetchActivityWithEfforts } from '@/lib/strava-activity'
import { sumsFromActivity } from '@/lib/computeSums'
import { cookies } from 'next/headers'

function adminSb() {
  return createSb(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, {
    auth: { persistSession: false }
  })
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const purge = url.searchParams.get('purge') === '1'

    console.log('[backfill] Starting backfill process')

    const cookieStore = await cookies()
    const rider_id = cookieStore.get('rider_id')?.value
    if (!rider_id) {
      return NextResponse.json({ error: 'Not authenticated (no rider_id cookie)' }, { status: 401 })
    }

    const sb = adminSb()
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

    let imported = 0
    let dup = 0
    let noWindow = 0

    // diagnostics
    let denied401 = 0
    let denied403 = 0
    let notFound404 = 0
    let otherFetchErr = 0
    let noSegEfforts = 0

    for (const e of efforts) {
      // Type assertion for Strava effort object
      const effort = e as {
        start_date?: string;
        activity?: { id: number };
        activity_id?: number;
        elapsed_time?: number;
        moving_time?: number;
      };
      
      const activity_id = Number(effort.activity?.id ?? effort.activity_id)
      const startUtc: string | undefined = effort.start_date
      if (!activity_id || !startUtc) continue

      // match season window in UTC
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
        const msg = String(err instanceof Error ? err.message : err)
        if (msg.includes(' 401 ')) denied401++
        else if (msg.includes(' 403 ')) denied403++
        else if (msg.includes(' 404 ')) notFound404++
        else otherFetchErr++
        console.warn(`[backfill] Failed to get sums for activity ${activity_id}:`, err)
      }

      const main_ms = (effort.elapsed_time ?? effort.moving_time ?? 0) * 1000

      const { error: upErr } = await sb.from('attempts').upsert(
        { rider_id, season_key: win.season_key, activity_id, main_ms, climb_sum_ms, desc_sum_ms },
        { onConflict: 'rider_id,activity_id' }
      )

      if (upErr?.message?.includes('duplicate key')) dup++
      else if (!upErr) imported++
    }

    return NextResponse.json({
      ok: true,
      imported,
      duplicates: dup,
      skipped_no_window: noWindow,
      diag: { denied401, denied403, notFound404, otherFetchErr, noSegEfforts, totalEfforts: efforts.length },
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}