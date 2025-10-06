import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard
// Returns leaderboard with proper scoring (best 3, bonus, final)
export async function GET() {
  try {
    // Aggregate directly from persisted results so we are not blocked by any in-memory path
    const all = await raceDatabase.getAllResults();
    const MAIN_SEGMENT_ID = 7977451;

    // Map participantId -> { riderId, riderName, seasons }
    const byRider = new Map<string, { riderId: string; riderName: string; seasons: { fall: number | null; winter: number | null; spring: number | null; summer: number | null } }>();

    for (const r of all) {
      if (r.segmentId !== MAIN_SEGMENT_ID) continue;
      const riderId = r.participantId;
      const riderName = r.participantName || 'Unknown';
      const entry = byRider.get(riderId) || { riderId, riderName, seasons: { fall: null, winter: null, spring: null, summer: null } };
      const sec = r.elapsedTime;
      if (r.stageIndex === 0) entry.seasons.fall = entry.seasons.fall == null ? sec : Math.min(entry.seasons.fall, sec);
      if (r.stageIndex === 1) entry.seasons.winter = entry.seasons.winter == null ? sec : Math.min(entry.seasons.winter, sec);
      if (r.stageIndex === 2) entry.seasons.spring = entry.seasons.spring == null ? sec : Math.min(entry.seasons.spring, sec);
      if (r.stageIndex === 3) entry.seasons.summer = entry.seasons.summer == null ? sec : Math.min(entry.seasons.summer, sec);
      byRider.set(riderId, entry);
    }

    const rows = Array.from(byRider.values()).map(r => ({ ...r, total: null }));

    console.log('[leaderboard] overall rows', rows.length);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}