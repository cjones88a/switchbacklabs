import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard/descending
// Returns descending leaderboard (Top Bruni's)
export async function GET() {
  try {
    console.log('🏔️ Fetching descending leaderboard...');
    const DH_IDS = new Set([2105607, 1359027]);
    const all = await raceDatabase.getAllResults();

    const byRider = new Map<string, { riderId: string; riderName: string; seasons: { fall: number | null; winter: number | null; spring: number | null; summer: number | null } }>();

    for (const r of all) {
      if (!DH_IDS.has(r.segmentId)) continue;
      const riderId = r.participantId;
      const riderName = r.participantName || 'Unknown';
      const entry = byRider.get(riderId) || { riderId, riderName, seasons: { fall: null, winter: null, spring: null, summer: null } };
      const sec = r.elapsedTime;
      if (r.stageIndex === 0) entry.seasons.fall = (entry.seasons.fall ?? 0) + sec;
      if (r.stageIndex === 1) entry.seasons.winter = (entry.seasons.winter ?? 0) + sec;
      if (r.stageIndex === 2) entry.seasons.spring = (entry.seasons.spring ?? 0) + sec;
      if (r.stageIndex === 3) entry.seasons.summer = (entry.seasons.summer ?? 0) + sec;
      byRider.set(riderId, entry);
    }

    const rows = Array.from(byRider.values()).map(r => ({ ...r, total: null }));
    console.log('✅ Descending rows', rows.length);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('💥 Descending leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch descending leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
