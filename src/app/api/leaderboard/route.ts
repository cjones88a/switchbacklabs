import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const includeBonus = searchParams.get('includeBonus') === 'true';

    // For now, return mock data to get the build working
    const mockLeaderboard = [
      {
        rank: 1,
        participant: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          stravaId: 1007748
        },
        timeInSeconds: 6539,
        date: '2021-09-26T22:01:35Z',
        stageId: stageId || 'overall'
      }
    ];

    const mockRaceConfig = {
      name: '4SOH Race 2025',
      bonusMinutes: 10,
      stages: [
        {
          id: 'stage1',
          name: 'Stage 1: Mountain Climb',
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-31T23:59:59Z'
        }
      ]
    };

    if (stageId) {
      return NextResponse.json({ leaderboard: mockLeaderboard, stageId });
    } else {
      return NextResponse.json({ 
        leaderboard: mockLeaderboard, 
        raceConfig: mockRaceConfig
      });
    }
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' }, 
      { status: 500 }
    );
  }
}
