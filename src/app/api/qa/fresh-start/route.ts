import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';
import { updateMockEffortsFromDatabase } from '@/lib/leaderboards';

// POST /api/qa/fresh-start
// Clear all data and start fresh
export async function POST() {
  try {
    console.log('🧹 Starting fresh - clearing all data...');
    
    // Clear all database data
    await raceDatabase.clearAllData();
    
    // Clear leaderboard data
    updateMockEffortsFromDatabase([]);
    
    console.log('✅ Fresh start completed - all data cleared');
    
    return NextResponse.json({
      success: true,
      message: 'All data cleared - fresh start completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Fresh start error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
