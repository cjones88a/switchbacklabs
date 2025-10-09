import { NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { fetchAllSegmentEffortsSince2014, fetchActivitySegmentEfforts } from '@/lib/strava-improved'
import { cookies } from 'next/headers'

// const MAIN_SEGMENT_ID = Number(process.env.MAIN_SEGMENT_ID) // Not used in this file
const CLIMB_1 = Number(process.env.CLIMB_1)
const CLIMB_2 = Number(process.env.CLIMB_2)
const DESC_1  = Number(process.env.DESC_1)
const DESC_2  = Number(process.env.DESC_2)
const DESC_3  = Number(process.env.DESC_3)

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

    const sb = adminSb()

    // Who is the current rider?
    const cookieStore = await cookies();
    const rider_id = cookieStore.get('rider_id')?.value;
    if (!rider_id) {
      return NextResponse.json({ error: 'No rider tokens found' }, { status: 401 })
    }

    if (purge) {
      await sb.from('attempts').delete().eq('rider_id', rider_id)
    }

    // 1) get all efforts for MAIN segment (all-time)
    const efforts = await fetchAllSegmentEffortsSince2014()

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
      const sums = await getClimbDescSumsForActivity(activity_id)

      // 4) upsert attempt (unique on rider_id + activity_id guarantees we don't duplicate)
      const insert = {
        rider_id,
        season_key: win.season_key,
        activity_id: Number(activity_id),
        main_ms: (effort.elapsed_time ?? effort.moving_time ?? 0) * 1000,
        climb_sum_ms: sums?.climb ?? null,
        desc_sum_ms: sums?.desc ?? null,
      }

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

async function getClimbDescSumsForActivity(activity_id: number) {
  if (_segCache.has(activity_id)) return _segCache.get(activity_id)!

  try {
    // Fetch segment efforts for this activity from Strava
    const segs = await fetchActivitySegmentEfforts(activity_id)

    // pick the segment times we care about (in ms)
    let climb = 0
    let desc = 0
    let haveClimb = false
    let haveDesc = false

    for (const s of segs) {
      const seg = s as Record<string, unknown>;
      const segment = seg.segment as Record<string, unknown> | undefined;
      const id = segment?.id as number | undefined;
      const ms = ((seg.elapsed_time as number) ?? (seg.moving_time as number) ?? 0) * 1000;
      
      if (id === CLIMB_1 || id === CLIMB_2) { 
        climb += ms; 
        haveClimb = true 
      }
      if (id === DESC_1 || id === DESC_2 || id === DESC_3) { 
        desc += ms; 
        haveDesc = true 
      }
    }

    const sums = { climb: haveClimb ? climb : null, desc: haveDesc ? desc : null }
    _segCache.set(activity_id, sums)
    return sums
  } catch (error) {
    console.error(`Failed to get climb/desc sums for activity ${activity_id}:`, error)
    return { climb: null, desc: null }
  }
}