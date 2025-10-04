import { NextResponse } from 'next/server';

// GET /api/leaderboard
// Returns leaderboard with proper scoring (best 3, bonus, final)
export async function GET() {
  try {
    // Stage names used to render chips; times in seconds
    const stageNames = ['Fall 2025','Winter 2025','Spring 2026','Summer 2026'];
    
    // Mock data - in production this would come from database
    const rows = [
      { 
        id: '1', 
        name: 'B. Parman', 
        stages: {
          0: 639+3600,  // 1:10:39
          1: 1800+3600, // 1:30:00
          2: 900+3600,  // 1:15:00
          3: undefined  // Not completed
        }, 
        score: {
          best3: (639+3600) + (1800+3600) + (900+3600), // Sum of best 3
          bonus: 0, // No bonus since only 3 stages completed
          final: (639+3600) + (1800+3600) + (900+3600) // Same as best3
        } 
      },
      { 
        id: '2', 
        name: 'C. Jones', 
        stages: {
          0: 1200+3600, // 1:20:00
          1: 1500+3600, // 1:25:00
          2: 1100+3600, // 1:18:20
          3: 1300+3600  // 1:21:40
        }, 
        score: {
          best3: (1200+3600) + (1100+3600) + (1300+3600), // Best 3 of 4
          bonus: 600, // 10 minutes = 600 seconds
          final: (1200+3600) + (1100+3600) + (1300+3600) - 600 // Best 3 minus bonus
        } 
      },
      { 
        id: '3', 
        name: 'A. Smith', 
        stages: {
          0: 1800+3600, // 1:30:00
          1: undefined, // Not completed
          2: undefined, // Not completed
          3: undefined  // Not completed
        }, 
        score: {
          best3: 0, // DNF - need at least 3 stages
          bonus: 0,
          final: 0
        } 
      }
    ];

    // Sort by final time (ascending - fastest first)
    const sortedRows = rows.sort((a, b) => {
      if (a.score.final === 0 && b.score.final === 0) return 0;
      if (a.score.final === 0) return 1; // DNF goes to bottom
      if (b.score.final === 0) return -1;
      return a.score.final - b.score.final;
    });

    return NextResponse.json({ 
      stageNames, 
      rows: sortedRows 
    });

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