import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard/climbing
// Returns climbing leaderboard (Top Pogi's)
export async function GET() {
  try {
    console.log('🏔️ Fetching climbing leaderboard...');
    const CLIMB_IDS = new Set([9589287, 18229887]);
    const all = await raceDatabase.getAllResults();

    const byRider = new Map<string, { riderId: string; riderName: string; seasons: { fall: number | null; winter: number | null; spring: number | null; summer: number | null } }>();

    for (const r of all) {
      if (!CLIMB_IDS.has(r.segmentId)) continue;
      const riderId = r.participantId;
      const riderName = r.participantName || 'Unknown';
      const entry = byRider.get(riderId) || { riderId, riderName, seasons: { fall: null, winter: null, spring: null, summer: null } };
      const sec = r.elapsedTime;
      // sum both climbing segments per season
      if (r.stageIndex === 0) entry.seasons.fall = (entry.seasons.fall ?? 0) + sec;
      if (r.stageIndex === 1) entry.seasons.winter = (entry.seasons.winter ?? 0) + sec;
      if (r.stageIndex === 2) entry.seasons.spring = (entry.seasons.spring ?? 0) + sec;
      if (r.stageIndex === 3) entry.seasons.summer = (entry.seasons.summer ?? 0) + sec;
      byRider.set(riderId, entry);
    }

    const rows = Array.from(byRider.values()).map(r => ({ ...r, total: null }));
    console.log('✅ Climbing rows', rows.length);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('💥 Climbing leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch climbing leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
