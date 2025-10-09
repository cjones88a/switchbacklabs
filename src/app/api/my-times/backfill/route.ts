import { NextResponse } from 'next/server';
import { adminSb } from '@/lib/seasons';
import { fetchAllSegmentEffortsSince2014 } from '@/lib/strava-improved';
import { cookies } from 'next/headers';
import { seasonKeyFor, raceYearFromSeasonKey } from '@/lib/seasons';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('[backfill] Starting backfill process');
  
  const cookieStore = await cookies();
  const rider_id = cookieStore.get('rider_id')?.value;
  if (!rider_id) {
    console.log('[backfill] No rider_id found in cookies');
    return NextResponse.json({ ok: false, error: 'no_rider' }, { status: 401 });
  }

  console.log(`[backfill] Processing rider: ${rider_id}`);

  const sb = adminSb();

  try {
    const efforts = await fetchAllSegmentEffortsSince2014();
    console.log(`[backfill] Fetched ${efforts.length} efforts from Strava`);

    // Group by race_year, then write to rider_yearly_times
    const yearly: Record<number, {fall_ms?:number; winter_ms?:number; spring_ms?:number; summer_ms?:number;}> = {};

    for (const e of efforts) {
      // Type assertion for Strava effort object
      const effort = e as {
        id: number;
        start_date_local?: string;
        start_date?: string;
        elapsed_time: number;
        activity?: { id: number };
        activity_id?: number;
      };

      // e.start_date_local or e.start_date? prefer local to match windows
      const when = effort.start_date_local ?? effort.start_date;
      if (!when) {
        console.log(`[backfill] Skipping effort ${effort.id} - no start date`);
        continue;
      }

      const season_key = await seasonKeyFor(when);
      if (!season_key) {
        console.log(`[backfill] Skipping effort ${effort.id} - no season window for ${when}`);
        continue;
      }
      
      const race_year = raceYearFromSeasonKey(season_key);
      const ms = effort.elapsed_time * 1000; // Strava seconds → ms

      console.log(`[backfill] Effort ${effort.id}: ${when} -> ${season_key} (race year ${race_year}) = ${ms}ms`);

      yearly[race_year] ??= {};
      if (season_key.endsWith('_FALL'))   yearly[race_year].fall_ms   = Math.min(yearly[race_year].fall_ms   ?? Infinity, ms);
      if (season_key.endsWith('_WINTER')) yearly[race_year].winter_ms = Math.min(yearly[race_year].winter_ms ?? Infinity, ms);
      if (season_key.endsWith('_SPRING')) yearly[race_year].spring_ms = Math.min(yearly[race_year].spring_ms ?? Infinity, ms);
      if (season_key.endsWith('_SUMMER')) yearly[race_year].summer_ms = Math.min(yearly[race_year].summer_ms ?? Infinity, ms);

      // Optional: keep a canonical attempts table too
      await sb.from('attempts').upsert({
        rider_id,
        season_key,
        activity_id: effort.activity?.id ?? effort.activity_id, // Strava may embed activity or give id
        main_ms: ms,
        created_at: new Date().toISOString(),
      }, { onConflict: 'rider_id,season_key,activity_id' });
    }

    console.log(`[backfill] Processed ${Object.keys(yearly).length} race years`);

    // Note: rider_yearly_times is a VIEW that automatically aggregates from attempts table
    // We don't need to insert into it directly - the view will show the data
    // after we've inserted the attempts above

    console.log(`[backfill] Backfill completed successfully`);
    return NextResponse.json({ 
      ok: true, 
      imported: efforts.length, 
      years: Object.keys(yearly).length,
      yearly_data: yearly
    });

  } catch (error) {
    console.error('[backfill] Error during backfill:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
