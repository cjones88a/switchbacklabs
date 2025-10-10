import { env } from '@/lib/env'

// Use the same segment IDs as the record API
const CLIMB_1 = env.SEGMENTS.c1
const CLIMB_2 = env.SEGMENTS.c2
const DESC_1  = env.SEGMENTS.d1
const DESC_2  = env.SEGMENTS.d2
const DESC_3  = env.SEGMENTS.d3

export function sumsFromActivity(activity: unknown) {
  const activityObj = activity as Record<string, unknown>;
  const segs: unknown[] = (activityObj?.segment_efforts as unknown[]) ?? []
  
  if (!Array.isArray(segs) || segs.length === 0) {
    console.log(`[computeSums] No segment efforts found in activity`)
    return { climb: null, desc: null }
  }

  console.log(`[computeSums] Processing ${segs.length} segment efforts`)
  console.log(`[computeSums] Looking for climb segments: ${CLIMB_1}, ${CLIMB_2}`)
  console.log(`[computeSums] Looking for descent segments: ${DESC_1}, ${DESC_2}, ${DESC_3}`)

  let climb = 0
  let desc = 0
  let foundClimb = false
  let foundDesc = false

  for (const s of segs) {
    const seg = s as Record<string, unknown>;
    const segment = seg.segment as Record<string, unknown> | undefined;
    const id = segment?.id as number | undefined;
    
    if (!id) continue
    
    const ms = ((seg.elapsed_time as number) ?? (seg.moving_time as number) ?? 0) * 1000
    const name = segment?.name as string | undefined;
    
    console.log(`[computeSums] Found segment ${id}: "${name}" (${ms}ms)`)

    if (id === CLIMB_1 || id === CLIMB_2) {
      climb += ms; 
      foundClimb = true;
      console.log(`[computeSums] Added climb segment ${id}: ${ms}ms (total: ${climb}ms)`)
    }
    if (id === DESC_1 || id === DESC_2 || id === DESC_3) {
      desc += ms; 
      foundDesc = true;
      console.log(`[computeSums] Added descent segment ${id}: ${ms}ms (total: ${desc}ms)`)
    }
  }

  const result = {
    climb: foundClimb ? climb : null,
    desc: foundDesc ? desc : null,
  }
  
  console.log(`[computeSums] Final sums: climb=${result.climb}ms, desc=${result.desc}ms`)
  return result
}
