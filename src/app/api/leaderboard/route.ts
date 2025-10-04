import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// GET /api/leaderboard
// Returns leaderboard with proper scoring (best 3, bonus, final)
export async function GET() {
  try {
    // Get leaderboard data from database
    const leaderboardData = await raceDatabase.getLeaderboard();
    
    return NextResponse.json(leaderboardData);

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