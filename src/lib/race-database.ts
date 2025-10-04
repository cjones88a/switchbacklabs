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
    const filteredResults = existingResults.filter(r => r.stageIndex !== result.stageIndex);
    filteredResults.push(fullResult);
    
    this.results.set(result.participantId, filteredResults);
    console.log('✅ Race result upserted:', result.participantId, 'Stage', result.stageIndex);
    return fullResult;
  }

  async getResultsByParticipant(participantId: string): Promise<RaceResult[]> {
    return this.results.get(participantId) || [];
  }

  async getAllResults(): Promise<RaceResult[]> {
    const allResults: RaceResult[] = [];
    for (const results of this.results.values()) {
      allResults.push(...results);
    }
    return allResults;
  }

  // Leaderboard calculation
  async getLeaderboard(): Promise<{
    stageNames: string[];
    rows: Array<{
      id: string;
      name: string;
      stages: { [key: number]: number | undefined };
      score: { best3: number; bonus: number; final: number };
    }>;
  }> {
    const stageNames = ['Fall 2025', 'Winter 2025', 'Spring 2026', 'Summer 2026'];
    const allResults = await this.getAllResults();
    
    // Group results by participant
    const participantResults = new Map<string, RaceResult[]>();
    for (const result of allResults) {
      const existing = participantResults.get(result.participantId) || [];
      existing.push(result);
      participantResults.set(result.participantId, existing);
    }
    
    const rows = [];
    for (const [participantId, results] of participantResults) {
      const participant = await this.getParticipant(participantId);
      if (!participant) continue;
      
      // Build stages object
      const stages: { [key: number]: number | undefined } = {};
      for (let i = 0; i < 4; i++) {
        const stageResult = results.find(r => r.stageIndex === i);
        stages[i] = stageResult?.elapsedTime;
      }
      
      // Calculate score
      const completedStages = results.map(r => r.elapsedTime).sort((a, b) => a - b);
      const best3 = completedStages.length >= 3 
        ? completedStages.slice(0, 3).reduce((sum, time) => sum + time, 0)
        : 0;
      
      const bonus = completedStages.length === 4 ? 600 : 0; // 10 minutes = 600 seconds
      const final = best3 > 0 ? best3 - bonus : 0;
      
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
    
    return { stageNames, rows };
  }
}

export const raceDatabase = new MockDatabase();
