import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = await raceDatabase.getAllResults();
    
    const bySegmentId: Record<number, number> = {};
    const byLeaderboardType: Record<string, number> = {};
    
    for (const result of all) {
      bySegmentId[result.segmentId] = (bySegmentId[result.segmentId] || 0) + 1;
      byLeaderboardType[result.leaderboardType] = (byLeaderboardType[result.leaderboardType] || 0) + 1;
    }
    
    return NextResponse.json({
      totalResults: all.length,
      bySegmentId,
      byLeaderboardType,
      allResults: all.map(r => ({
        participantId: r.participantId,
        participantName: r.participantName,
        segmentId: r.segmentId,
        leaderboardType: r.leaderboardType,
        stageIndex: r.stageIndex,
        elapsedTime: r.elapsedTime,
        effortDate: r.effortDate.toISOString()
      }))
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
