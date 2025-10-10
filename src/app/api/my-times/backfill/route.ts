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

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const purge = url.searchParams.get('purge') === '1'

    console.log('[backfill] Starting backfill process')
    console.log(`[backfill] Environment variables: CLIMB_1=${CLIMB_1}, CLIMB_2=${CLIMB_2}, DESC_1=${DESC_1}, DESC_2=${DESC_2}, DESC_3=${DESC_3}`)

    const sb = adminSb()

    // Who is the current rider?
    const cookieStore = await cookies();
    const rider_id = cookieStore.get('rider_id')?.value;
    if (!rider_id) {
      return NextResponse.json({ error: 'No rider tokens found' }, { status: 401 })
    }
    console.log(`[backfill] Processing rider: ${rider_id}`)

    if (purge) {
      console.log('[backfill] Purging existing attempts')
      await sb.from('attempts').delete().eq('rider_id', rider_id)
    }

    // 1) get all efforts for MAIN segment (all-time)
    console.log('[backfill] Fetching all segment efforts from Strava')
    const efforts = await fetchAllSegmentEffortsSince2014()
    console.log(`[backfill] Found ${efforts.length} total efforts`)

    let imported = 0
    let skippedNoWindow = 0
    const skippedNoSegs = 0
    let skippedDup = 0

    for (const e of efforts) {
      // Type assertion for Strava effort object
      const effort = e as {
        start_date?: string;
        activity?: { id: number };
        activity_id?: number;
        elapsed_time?: number;
        moving_time?: number;
      };
      
      // use the canonical UTC timestamp
      const startUtc = effort.start_date
      const activity_id = effort.activity?.id ?? effort.activity_id
      if (!startUtc || !activity_id) continue

      // 2) find matching season window IN THE DB using UTC time
      const { data: win, error: werr } = await sb
        .from('season_windows')
        .select('season_key, start_at, end_at')
        .lte('start_at', startUtc)   // start_at <= ts
        .gte('end_at',   startUtc)   //   ts   <= end_at
        .single()

      if (werr || !win) {
        skippedNoWindow++
        continue
      }

      // 3) compute climb/desc sums for this activity using proper activity fetch
      let climb_sum_ms: number | null = null
      let desc_sum_ms: number | null = null
      try {
        const sums = await getSumsForActivity(rider_id, activity_id)
        climb_sum_ms = sums.climb
        desc_sum_ms = sums.desc
        console.log(`[backfill] Activity ${activity_id} sums: climb=${climb_sum_ms}ms, desc=${desc_sum_ms}ms`)
      } catch (err) {
        // if a single activity fails (privacy / Strava hiccup), keep null but still record main time
        console.warn(`[backfill] Failed to get sums for activity ${activity_id}:`, err)
      }

      // 4) upsert attempt (unique on rider_id + activity_id guarantees we don't duplicate)
      const insert = {
        rider_id,
        season_key: win.season_key,
        activity_id: Number(activity_id),
        main_ms: (effort.elapsed_time ?? effort.moving_time ?? 0) * 1000,
        climb_sum_ms,
        desc_sum_ms,
      }
      console.log(`[backfill] Inserting attempt for activity ${activity_id}: main=${insert.main_ms}ms, climb=${insert.climb_sum_ms}ms, desc=${insert.desc_sum_ms}ms`)

      const { error: insErr } = await sb
        .from('attempts')
        .upsert(insert, { onConflict: 'rider_id,activity_id' })

      if (insErr?.message?.includes('duplicate key')) {
        skippedDup++
      } else if (!insErr) {
        imported++
      }
    }

    // 5) Optionally (re)build rider_yearly_times from attempts server-side (if you rely on it)
    //    If your UI reads directly from attempts+grouping, you can skip this.

    return NextResponse.json({
      ok: true,
      imported,
      skippedNoWindow,
      skippedNoSegs,
      skippedDup,
      totalEfforts: efforts.length,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

/** Cache for per-activity segment effort lookups so we don't refetch the same activity repeatedly. */
const _activityCache = new Map<number, { climb: number|null, desc: number|null }>()

async function getSumsForActivity(rider_id: string, activity_id: number) {
  if (_activityCache.has(activity_id)) {
    console.log(`[backfill] Using cached sums for activity ${activity_id}`)
    return _activityCache.get(activity_id)!
  }
  
  console.log(`[backfill] Fetching activity ${activity_id} with segment efforts`)
  const token = await ensureFreshToken(rider_id)
  const activity = await fetchActivityWithEfforts(token, activity_id)
  const sums = sumsFromActivity(activity)
  _activityCache.set(activity_id, sums)
  return sums
}