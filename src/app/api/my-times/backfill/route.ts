import { NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { fetchAllSegmentEffortsSince2014, fetchActivitySegmentEfforts } from '@/lib/strava-improved'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

// Use the same segment IDs as the record API
const CLIMB_1 = env.SEGMENTS.c1
const CLIMB_2 = env.SEGMENTS.c2
const DESC_1  = env.SEGMENTS.d1
const DESC_2  = env.SEGMENTS.d2
const DESC_3  = env.SEGMENTS.d3

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

      // 3) fetch the activity's segment efforts once to compute climb/desc sums
      //    (cache to avoid re-fetching if the same activity pops again in pagination)
      const sums = await getClimbDescSumsForActivity(activity_id, allEfforts)
      console.log(`[backfill] Activity ${activity_id} sums: climb=${sums?.climb}ms, desc=${sums?.desc}ms`)

      // 4) upsert attempt (unique on rider_id + activity_id guarantees we don't duplicate)
      const insert = {
        rider_id,
        season_key: win.season_key,
        activity_id: Number(activity_id),
        main_ms: (effort.elapsed_time ?? effort.moving_time ?? 0) * 1000,
        climb_sum_ms: sums?.climb ?? null,
        desc_sum_ms: sums?.desc ?? null,
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
const _segCache = new Map<number, { climb: number|null; desc: number|null }>()

async function getClimbDescSumsForActivity(activity_id: number, allSegmentEfforts: any[]) {
  if (_segCache.has(activity_id)) return _segCache.get(activity_id)!

  try {
    console.log(`[backfill] Looking for climb/descent segments for activity ${activity_id}`)
    
    // Find all segment efforts for this specific activity from our already-fetched data
    const activitySegs = allSegmentEfforts.filter((effort: any) => {
      const activity = effort.activity as Record<string, unknown> | undefined;
      return activity?.id === activity_id;
    });
    
    console.log(`[backfill] Found ${activitySegs.length} segment efforts for activity ${activity_id} from cached data`)
    
    if (activitySegs.length === 0) {
      console.log(`[backfill] WARNING: No segment efforts found for activity ${activity_id} in cached data`)
      return { climb: null, desc: null }
    }

    // Log the segment IDs we're looking for
    console.log(`[backfill] Looking for climb segments: ${CLIMB_1}, ${CLIMB_2}`)
    console.log(`[backfill] Looking for descent segments: ${DESC_1}, ${DESC_2}, ${DESC_3}`)
    
    // Always log all segments found for debugging
    console.log(`[backfill] All segments found in activity ${activity_id}:`)
    for (const s of activitySegs) {
      const seg = s as Record<string, unknown>;
      const segment = seg.segment as Record<string, unknown> | undefined;
      const id = segment?.id as number | undefined;
      const name = segment?.name as string | undefined;
      const ms = ((seg.elapsed_time as number) ?? (seg.moving_time as number) ?? 0) * 1000;
      if (id) {
        console.log(`[backfill]   Segment ${id}: "${name}" (${ms}ms)`)
      }
    }
    
    // If environment variables are not set, log warning
    if (isNaN(CLIMB_1) || isNaN(CLIMB_2) || isNaN(DESC_1) || isNaN(DESC_2) || isNaN(DESC_3)) {
      console.log(`[backfill] WARNING: Environment variables not set properly!`)
      console.log(`[backfill] CLIMB_1=${CLIMB_1}, CLIMB_2=${CLIMB_2}, DESC_1=${DESC_1}, DESC_2=${DESC_2}, DESC_3=${DESC_3}`)
    }

    // pick the segment times we care about (in ms)
    let climb = 0
    let desc = 0
    let haveClimb = false
    let haveDesc = false

    for (const s of activitySegs) {
      const seg = s as Record<string, unknown>;
      const segment = seg.segment as Record<string, unknown> | undefined;
      const id = segment?.id as number | undefined;
      const ms = ((seg.elapsed_time as number) ?? (seg.moving_time as number) ?? 0) * 1000;
      
      // Log each segment we find
      if (id) {
        console.log(`[backfill] Found segment ${id} with time ${ms}ms`)
      }
      
      if (id === CLIMB_1 || id === CLIMB_2) { 
        climb += ms; 
        haveClimb = true;
        console.log(`[backfill] Added climb segment ${id}: ${ms}ms (total: ${climb}ms)`)
      }
      if (id === DESC_1 || id === DESC_2 || id === DESC_3) { 
        desc += ms; 
        haveDesc = true;
        console.log(`[backfill] Added descent segment ${id}: ${ms}ms (total: ${desc}ms)`)
      }
    }

    const sums = { climb: haveClimb ? climb : null, desc: haveDesc ? desc : null }
    console.log(`[backfill] Final sums for activity ${activity_id}: climb=${sums.climb}ms, desc=${sums.desc}ms`)
    
    _segCache.set(activity_id, sums)
    return sums
  } catch (error) {
    console.error(`[backfill] Failed to get climb/desc sums for activity ${activity_id}:`, error)
    return { climb: null, desc: null }
  }
}