import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard/descending
// Returns descending leaderboard (Top Bruni's)
export async function GET() {
  try {
    console.log('🏔️ Fetching descending leaderboard...');
    
    // Get descending leaderboard data from database
    const leaderboardData = await raceDatabase.getLeaderboard('descending');
    
    console.log('✅ Descending leaderboard fetched:', {
      stageNames: leaderboardData.stageNames,
      stageSegments: leaderboardData.stageSegments,
      participantCount: leaderboardData.rows.length
    });
    
    return NextResponse.json(leaderboardData);

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
