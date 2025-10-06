import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 QA: Checking database contents...');
    
    const allResults = await raceDatabase.getAllResults();
    console.log(`📊 Total results in database: ${allResults.length}`);
    
    // Group by segment ID
    const bySegmentId: Record<number, number> = {};
    const byLeaderboardType: Record<string, number> = {};
    const byParticipant: Record<string, number> = {};
    
    for (const result of allResults) {
      bySegmentId[result.segmentId] = (bySegmentId[result.segmentId] || 0) + 1;
      byLeaderboardType[result.leaderboardType] = (byLeaderboardType[result.leaderboardType] || 0) + 1;
      byParticipant[result.participantId] = (byParticipant[result.participantId] || 0) + 1;
    }
    
    console.log('📈 Results by segment ID:', bySegmentId);
    console.log('📈 Results by leaderboard type:', byLeaderboardType);
    console.log('📈 Results by participant:', byParticipant);
    
    // Check specifically for climbing segments
    const CLIMB_IDS = [9589287, 18229887];
    const DESC_IDS = [2105607, 1359027];
    const MAIN_LOOP = 7977451;
    
    const climbingResults = allResults.filter(r => CLIMB_IDS.includes(r.segmentId));
    const descendingResults = allResults.filter(r => DESC_IDS.includes(r.segmentId));
    const overallResults = allResults.filter(r => r.segmentId === MAIN_LOOP);
    
    console.log(`🏔️ Climbing segments (${CLIMB_IDS.join(', ')}): ${climbingResults.length} results`);
    console.log(`🏂 Descending segments (${DESC_IDS.join(', ')}): ${descendingResults.length} results`);
    console.log(`🔄 Overall loop (${MAIN_LOOP}): ${overallResults.length} results`);
    
    // Show sample data
    const sampleResults = allResults.slice(0, 5).map(r => ({
      participantId: r.participantId,
      participantName: r.participantName,
      segmentId: r.segmentId,
      leaderboardType: r.leaderboardType,
      stageIndex: r.stageIndex,
      elapsedTime: r.elapsedTime,
      effortDate: r.effortDate.toISOString()
    }));
    
    return NextResponse.json({
      summary: {
        totalResults: allResults.length,
        bySegmentId,
        byLeaderboardType,
        byParticipant,
        climbingCount: climbingResults.length,
        descendingCount: descendingResults.length,
        overallCount: overallResults.length
      },
      sampleResults,
      climbingResults: climbingResults.map(r => ({
        participantId: r.participantId,
        participantName: r.participantName,
        segmentId: r.segmentId,
        stageIndex: r.stageIndex,
        elapsedTime: r.elapsedTime,
        effortDate: r.effortDate.toISOString()
      })),
      descendingResults: descendingResults.map(r => ({
        participantId: r.participantId,
        participantName: r.participantName,
        segmentId: r.segmentId,
        stageIndex: r.stageIndex,
        elapsedTime: r.elapsedTime,
        effortDate: r.effortDate.toISOString()
      }))
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    return NextResponse.json(
      { 
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
