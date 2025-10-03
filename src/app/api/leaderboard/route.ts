import { NextRequest, NextResponse } from 'next/server';
import { LeaderboardEntry } from '@/types/race';

// Mock data for testing OAuth flow
const mockRaceConfig = {
  name: "4SOH Challenge",
  bonusMinutes: 10,
  stages: [
    {
      id: "stage1",
      name: "Stage 1",
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    },
    {
      id: "stage2", 
      name: "Stage 2",
      startDate: "2024-02-01",
      endDate: "2024-02-29"
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const includeBonus = searchParams.get('includeBonus') === 'true';

    if (stageId) {
      // Mock single stage results
      const mockStageResults = [
        {
          rank: 1,
          participant: {
            id: "1",
            firstName: "Colt",
            lastName: "Jones",
            stravaId: 1007748
          },
          timeInSeconds: 1800, // 30 minutes
          date: "2024-01-15",
          stageId: stageId
        }
      ];

      return NextResponse.json({ leaderboard: mockStageResults, stageId });
    } else {
      // Mock overall leaderboard
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          participant: {
            id: "1",
            firstName: "Colt",
            lastName: "Jones",
            stravaId: 1007748,
            email: "colt@example.com",
            stravaAccessToken: "mock_token",
            stravaRefreshToken: "mock_refresh",
            tokenExpiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          stageResults: {
            "stage1": {
              timeInSeconds: 1800,
              date: "2024-01-15",
              isValid: true
            },
            "stage2": {
              timeInSeconds: 1900,
              date: "2024-02-15", 
              isValid: true
            }
          },
          totalTime: includeBonus ? 3600 : 3700, // 60 minutes with bonus, 61:40 without
          bonusApplied: includeBonus,
          rank: 1
        }
      ];

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