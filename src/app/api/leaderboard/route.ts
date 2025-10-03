import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database/supabase';
import { LeaderboardEntry, Participant } from '@/types/race';

// Define proper types for the database results
type StageResult = {
  id: string;
  participantId: string;
  stageId: string;
  timeInSeconds: number;
  date: string | Date; // raw input can be string or Date
  isValid: boolean;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    stravaId: number;
  };
};

type StageResultNormalized = {
  timeInSeconds: number;
  date: Date;
  isValid: boolean;
};

type RaceStage = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type RaceConfig = {
  name: string;
  bonusMinutes: number;
  race_stages: RaceStage[];
};

// Helper function to safely convert string/Date to Date
const toValidDate = (v: string | Date): Date | null => {
  const d = typeof v === 'string' ? new Date(v) : v;
  return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const includeBonus = searchParams.get('includeBonus') === 'true';

    if (stageId) {
      // Get leaderboard for specific stage
      const results: StageResult[] = await DatabaseService.getResultsByStage(stageId);
      
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
      const stages: RaceStage[] = raceConfig.race_stages;
      
      // Get all participants who have results
      const allResults: StageResult[][] = await Promise.all(
        stages.map((stage: RaceStage) => DatabaseService.getResultsByStage(stage.id))
      );

      // Create a map of participants and their best times per stage
      const participantMap = new Map<string, LeaderboardEntry>();
      
      allResults.forEach((stageResults: StageResult[], stageIndex: number) => {
        const stage: RaceStage = stages[stageIndex];
        
        stageResults.forEach((result: StageResult) => {
          const participantId: string = result.participantId;
          
          if (!participantMap.has(participantId)) {
            participantMap.set(participantId, {
              participant: result.participants as Participant,
              stageResults: {},
              totalTime: 0,
              bonusApplied: false,
              rank: 0
            });
          }
          
          const entry = participantMap.get(participantId)!;
          
          // Convert string date to Date object
          const raw = result.date;
          const date = typeof raw === 'string' ? new Date(raw) : raw;
          
          // Guard against invalid dates
          if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return; // skip invalid dates
          }
          
          entry.stageResults[stage.id] = {
            timeInSeconds: result.timeInSeconds,
            date, // now a proper Date object
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
