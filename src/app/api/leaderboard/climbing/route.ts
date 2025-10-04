import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard/climbing
// Returns climbing leaderboard (Top Pogi's)
export async function GET() {
  try {
    console.log('🏔️ Fetching climbing leaderboard...');
    
    // Get climbing leaderboard data from database
    const leaderboardData = await raceDatabase.getLeaderboard('climbing');
    
    console.log('✅ Climbing leaderboard fetched:', {
      stageNames: leaderboardData.stageNames,
      stageSegments: leaderboardData.stageSegments,
      participantCount: leaderboardData.rows.length
    });
    
    return NextResponse.json(leaderboardData);

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
