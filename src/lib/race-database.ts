/**
 * RACE DATABASE SERVICE
 * Handles participant data and race results
 * Currently mocked, but ready for real database integration
 */

interface Participant {
  id: string;
  stravaId: number;
  name: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RaceResult {
  id: string;
  participantId: string;
  stageIndex: number;
  elapsedTime: number;
  effortDate: Date;
  segmentId: number;
  prRank?: number;
  leaderboardType: 'overall' | 'climbing' | 'descending';
  createdAt: Date;
}

// Mock database storage (in production, this would be Supabase/PostgreSQL)
class MockDatabase {
  private participants: Map<string, Participant> = new Map();
  private results: Map<string, RaceResult[]> = new Map();

  // Participant management
  async upsertParticipant(participant: Omit<Participant, 'createdAt' | 'updatedAt'>): Promise<Participant> {
    const now = new Date();
    const existing = this.participants.get(participant.id);
    
    const fullParticipant: Participant = {
      ...participant,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    
    this.participants.set(participant.id, fullParticipant);
    console.log('✅ Participant upserted:', participant.name);
    return fullParticipant;
  }

  async getParticipant(participantId: string): Promise<Participant | null> {
    return this.participants.get(participantId) || null;
  }

  // Race results management
  async upsertRaceResult(result: Omit<RaceResult, 'id' | 'createdAt'>): Promise<RaceResult> {
    const now = new Date();
    const fullResult: RaceResult = {
      ...result,
      id: `${result.participantId}_${result.stageIndex}_${Date.now()}`,
      createdAt: now
    };
    
    const existingResults = this.results.get(result.participantId) || [];
    const filteredResults = existingResults.filter(r => 
      !(r.stageIndex === result.stageIndex && r.leaderboardType === result.leaderboardType)
    );
    filteredResults.push(fullResult);
    
    this.results.set(result.participantId, filteredResults);
    console.log('✅ Race result upserted:', result.participantId, 'Stage', result.stageIndex);
    return fullResult;
  }

  async getResultsByParticipant(participantId: string): Promise<RaceResult[]> {
    return this.results.get(participantId) || [];
  }

  async getAllResults(): Promise<Array<RaceResult & { participantName?: string }>> {
    const allResults: Array<RaceResult & { participantName?: string }> = [];
    for (const [participantId, results] of this.results.entries()) {
      const participant = this.participants.get(participantId);
      const resultsWithNames = results.map(result => ({
        ...result,
        participantName: participant?.name
      }));
      allResults.push(...resultsWithNames);
    }
    return allResults;
  }

  // Leaderboard calculation
  async getLeaderboard(type: 'overall' | 'climbing' | 'descending' = 'overall'): Promise<{
    stageNames: string[];
    stageSegments: { [key: number]: number };
    rows: Array<{
      id: string;
      name: string;
      stages: { [key: number]: number | undefined };
      score: { best3: number; bonus: number; final: number };
    }>;
  }> {
    const stageNames = ['Fall 2025', 'Winter 2025', 'Spring 2026', 'Summer 2026'];
    
    let stageSegments: { [key: number]: number };
    
    if (type === 'climbing') {
      // Top Pogi's - Climbing segments
      stageSegments = {
        0: 9589287, // Fall 2025 - Climbing segment 1
        1: 18229887, // Winter 2025 - Climbing segment 2
        2: 0, // Spring 2026 - TBD
        3: 0  // Summer 2026 - TBD
      };
    } else if (type === 'descending') {
      // Top Bruni's - Descending segments
      stageSegments = {
        0: 2105607, // Fall 2025 - Descending segment 1
        1: 1359027, // Winter 2025 - Descending segment 2
        2: 0, // Spring 2026 - TBD
        3: 0  // Summer 2026 - TBD
      };
    } else {
      // Overall - Original segments
      stageSegments = {
        0: 7977451, // Fall 2025 - your segment
        1: 0, // Winter 2025 - TBD
        2: 0, // Spring 2026 - TBD  
        3: 0  // Summer 2026 - TBD
      };
    }
    const allResults = await this.getAllResults();
    
    // Filter results by leaderboard type and segment type
    const relevantSegments = Object.values(stageSegments).filter(id => id > 0);
    const filteredResults = allResults.filter(result => 
      result.leaderboardType === type && 
      result.segmentId && 
      relevantSegments.includes(result.segmentId)
    );
    
    console.log(`📊 Filtering results for ${type} leaderboard:`, {
      totalResults: allResults.length,
      filteredResults: filteredResults.length,
      relevantSegments,
      type,
      allResults: allResults.map(r => ({ participantId: r.participantId, segmentId: r.segmentId, stageIndex: r.stageIndex, elapsedTime: r.elapsedTime }))
    });
    
    // Group results by participant
    const participantResults = new Map<string, RaceResult[]>();
    for (const result of filteredResults) {
      const existing = participantResults.get(result.participantId) || [];
      existing.push(result);
      participantResults.set(result.participantId, existing);
    }
    
    const rows = [];
    for (const [participantId, results] of participantResults) {
      const participant = await this.getParticipant(participantId);
      if (!participant) continue;
      
      // Build stages object - map by segment ID to stage index
      const stages: { [key: number]: number | undefined } = {};
      for (let i = 0; i < 4; i++) {
        const segmentId = stageSegments[i];
        if (segmentId > 0) {
          if (type === 'climbing' || type === 'descending') {
            // For climbing/descending: sum all segments for this season
            const seasonResults = results.filter(r => r.stageIndex === i);
            if (seasonResults.length > 0) {
              stages[i] = seasonResults.reduce((sum, r) => sum + r.elapsedTime, 0);
            }
          } else {
            // For overall: single segment per season
            const stageResult = results.find(r => r.segmentId === segmentId);
            stages[i] = stageResult?.elapsedTime;
          }
        }
      }
      
      // Calculate score based on leaderboard type
      let best3: number;
      let bonus: number;
      let final: number;
      
      if (type === 'climbing' || type === 'descending') {
        // For climbing/descending: sum times for each season (2 segments per season)
        // Group results by season and sum the two segments
        const seasonTotals: number[] = [];
        for (let i = 0; i < 4; i++) {
          const seasonResults = results.filter(r => r.stageIndex === i);
          if (seasonResults.length > 0) {
            const seasonTotal = seasonResults.reduce((sum, r) => sum + r.elapsedTime, 0);
            seasonTotals.push(seasonTotal);
          }
        }
        
        best3 = seasonTotals.reduce((sum, time) => sum + time, 0);
        bonus = 0; // No bonus for climbing/descending
        final = best3; // Final is just the sum of all season totals
      } else {
        // For overall: best 3 times with bonus
        const completedStages = results.map(r => r.elapsedTime).sort((a, b) => a - b);
        best3 = completedStages.length >= 3 
          ? completedStages.slice(0, 3).reduce((sum, time) => sum + time, 0)
          : 0;
        
        bonus = completedStages.length === 4 ? 600 : 0; // 10 minutes = 600 seconds
        final = best3 > 0 ? best3 - bonus : 0;
      }
      
      rows.push({
        id: participantId,
        name: participant.name,
        stages,
        score: { best3, bonus, final }
      });
    }
    
    // Sort by final time (ascending - fastest first)
    rows.sort((a, b) => {
      if (a.score.final === 0 && b.score.final === 0) return 0;
      if (a.score.final === 0) return 1; // DNF goes to bottom
      if (b.score.final === 0) return -1;
      return a.score.final - b.score.final;
    });
    
    return { stageNames, stageSegments, rows };
  }

  // Clear all data for fresh start
  async clearAllData(): Promise<void> {
    this.participants.clear();
    this.results.clear();
    console.log('🧹 All database data cleared');
  }
}

export const raceDatabase = new MockDatabase();
