import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

export const runtime = 'nodejs';         // ensure Node runtime for server libs
export const dynamic = 'force-dynamic';  // disable static caching

// GET /api/leaderboard/descending
// Returns descending leaderboard (Top Bruni's)
export async function GET() {
  try {
    console.log('🏔️ Fetching descending leaderboard...');
    const DH_IDS = [2105607, 1359027];
    const MAIN_LOOP = 7977451;
    const all = await raceDatabase.getAllResults();

    // First, get all descending segment efforts (by segmentId OR leaderboardType)
    const dhEfforts = all.filter(r => 
      DH_IDS.includes(r.segmentId) || r.leaderboardType === 'descending'
    );
    console.log(`Found ${dhEfforts.length} descending efforts`);
    console.log('Descending efforts details:', dhEfforts.map(e => ({
      segmentId: e.segmentId,
      leaderboardType: e.leaderboardType,
      participantId: e.participantId,
      elapsedTime: e.elapsedTime
    })));

    // Get all loop completion efforts (to filter riders who completed the loop)
    const loopEfforts = all.filter(r => r.segmentId === MAIN_LOOP);
    console.log(`Found ${loopEfforts.length} loop efforts`);

    // Create a set of riders who completed the loop per season
    const loopRidersBySeason = new Map<string, Set<string>>();
    for (const effort of loopEfforts) {
      const seasonKey = `season_${effort.stageIndex}`;
      if (!loopRidersBySeason.has(seasonKey)) {
        loopRidersBySeason.set(seasonKey, new Set());
      }
      loopRidersBySeason.get(seasonKey)!.add(effort.participantId);
    }

    // Group descending efforts by rider and season
    const byRiderSeason = new Map<string, Map<number, Map<number, number>>>();
    // Structure: riderId -> seasonIndex -> segmentId -> bestTime

    for (const effort of dhEfforts) {
      const riderId = effort.participantId;
      const seasonIndex = effort.stageIndex;
      const segmentId = effort.segmentId;
      const time = effort.elapsedTime;

      if (!byRiderSeason.has(riderId)) {
        byRiderSeason.set(riderId, new Map());
      }
      const riderSeasons = byRiderSeason.get(riderId)!;

      if (!riderSeasons.has(seasonIndex)) {
        riderSeasons.set(seasonIndex, new Map());
      }
      const seasonSegments = riderSeasons.get(seasonIndex)!;

      // Keep best time for this segment in this season
      if (!seasonSegments.has(segmentId) || time < seasonSegments.get(segmentId)!) {
        seasonSegments.set(segmentId, time);
      }
    }

    // Now build the final leaderboard
    const finalRows: Array<{ riderId: string; riderName: string; seasons: { fall: number | null; winter: number | null; spring: number | null; summer: number | null }; total: number | null }> = [];

    for (const [riderId, riderSeasons] of byRiderSeason) {
      // Get rider name from any effort
      const sampleEffort = dhEfforts.find(e => e.participantId === riderId);
      const riderName = sampleEffort?.participantName || 'Unknown';

      const seasons: { fall: number | null; winter: number | null; spring: number | null; summer: number | null } = { fall: null, winter: null, spring: null, summer: null };
      let totalSum = 0;
      let hasAnySeason = false;

      // Check each season (0=fall, 1=winter, 2=spring, 3=summer)
      for (let seasonIndex = 0; seasonIndex < 4; seasonIndex++) {
        const seasonKey = `season_${seasonIndex}`;
        const seasonSegments = riderSeasons.get(seasonIndex);

        // Only include this rider in this season if they completed the loop AND have at least one descending segment
        if (loopRidersBySeason.get(seasonKey)?.has(riderId) && seasonSegments) {
          const hasAnyDescendingSegment = DH_IDS.some(segmentId => seasonSegments.has(segmentId));
          
          if (hasAnyDescendingSegment) {
            const seasonSum = DH_IDS.reduce((sum, segmentId) => sum + (seasonSegments.get(segmentId) || 0), 0);
            
            if (seasonIndex === 0) seasons.fall = seasonSum;
            if (seasonIndex === 1) seasons.winter = seasonSum;
            if (seasonIndex === 2) seasons.spring = seasonSum;
            if (seasonIndex === 3) seasons.summer = seasonSum;
            
            totalSum += seasonSum;
            hasAnySeason = true;
          }
        }
      }

      // Only include riders who have at least one complete season
      if (hasAnySeason) {
        finalRows.push({
          riderId,
          riderName,
          seasons,
          total: totalSum
        });
      }
    }

    // Sort by total time (best first)
    finalRows.sort((a, b) => (a.total || Infinity) - (b.total || Infinity));

    console.log(`✅ Descending rows: ${finalRows.length} (riders with both segments + loop completion)`);
    return NextResponse.json({ rows: finalRows }, { 
      headers: { 'cache-control': 'no-store' } 
    });
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
