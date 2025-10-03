import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database/supabase';
import { LeaderboardEntry } from '@/types/race';

// Define proper types for the database results
type Stage = { 
  id: string; 
  name: string; 
  startDate: string;
  endDate: string;
};

type RawStageResult = {
  id: string;
  participantId: string;
  stageId: string;
  timeInSeconds: number;
  date: string;        // incoming is string (ISO), not Date
  isValid: boolean;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    stravaId: number;
  };
};

// StageResultOut type is defined in the LeaderboardEntry interface

// LeaderboardEntry is imported from types/race.ts

type RaceConfig = {
  name: string;
  bonusMinutes: number;
  race_stages: Stage[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const includeBonus = searchParams.get('includeBonus') === 'true';

    if (stageId) {
      // Get leaderboard for specific stage
      const results: RawStageResult[] = await DatabaseService.getResultsByStage(stageId);
      
      const leaderboard = results.map((result, index) => ({
        rank: index + 1,
        participant: {
          id: result.participants.id,
          firstName: result.participants.firstName,
          lastName: result.participants.lastName,
          stravaId: result.participants.stravaId
        },
        timeInSeconds: result.timeInSeconds,
        date: result.date,
        stageId: result.stageId
      }));

      return NextResponse.json({ leaderboard, stageId });
    } else {
      // Get overall leaderboard across all stages
      const raceConfig: RaceConfig = await DatabaseService.getRaceConfig();
      const stages: Stage[] = raceConfig.race_stages;
      
      // Get all participants who have results
      const allResults: RawStageResult[][] = await Promise.all(
        stages.map((stage: Stage) => DatabaseService.getResultsByStage(stage.id))
      );

      // Create a map of participants and their best times per stage
      const participantMap = new Map<string, LeaderboardEntry>();
      
      allResults.forEach((stageResults: RawStageResult[], stageIndex: number) => {
        const stage: Stage = stages[stageIndex];
        
        // Before: stageResults.forEach(result => { ... })  // result was 'any'
        (stageResults as RawStageResult[]).forEach((result: RawStageResult) => {
          const participantId = result.participantId;

          if (!participantMap.has(participantId)) {
            participantMap.set(participantId, {
              participant: {
                id: result.participants.id,
                firstName: result.participants.firstName,
                lastName: result.participants.lastName,
                stravaId: result.participants.stravaId,
                email: '', // Not available in leaderboard context
                stravaAccessToken: '', // Not available in leaderboard context
                stravaRefreshToken: '', // Not available in leaderboard context
                tokenExpiresAt: new Date(), // Not available in leaderboard context
                createdAt: new Date(), // Not available in leaderboard context
                updatedAt: new Date() // Not available in leaderboard context
              },
              totalTime: 0,
              bonusApplied: false,
              rank: 0,
              stageResults: {}
            });
          }

          const entry = participantMap.get(participantId)!;

          // Keep date as a string to match StageResultOut
          entry.stageResults[stage.id] = {
            timeInSeconds: result.timeInSeconds,
            date: result.date,          // ✅ now typed as string everywhere
            isValid: result.isValid
          };
        });
      });

      // Calculate total times and apply bonus
      const leaderboard: LeaderboardEntry[] = [];
      
      participantMap.forEach(entry => {
        const stageTimes = Object.values(entry.stageResults);
        
        // Only include participants who have completed all stages
        if (stageTimes.length === stages.length) {
          entry.totalTime = stageTimes.reduce((sum, stage) => sum + stage.timeInSeconds, 0);
          
          // Apply bonus if all stages completed
          if (includeBonus && raceConfig.bonusMinutes) {
            entry.totalTime -= raceConfig.bonusMinutes * 60; // Convert minutes to seconds
            entry.bonusApplied = true;
          }
          
          leaderboard.push(entry);
        }
      });

      // Sort by total time and assign ranks
      leaderboard.sort((a, b) => a.totalTime - b.totalTime);
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return NextResponse.json({ 
        leaderboard, 
        raceConfig: {
          name: raceConfig.name,
          bonusMinutes: raceConfig.bonusMinutes,
          stages: stages.map(stage => ({
            id: stage.id,
            name: stage.name,
            startDate: stage.startDate,
            endDate: stage.endDate
          }))
        }
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
