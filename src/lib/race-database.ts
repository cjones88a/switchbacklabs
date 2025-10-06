/**
 * RACE DATABASE SERVICE
 * Handles participant data and race results
 * Currently mocked, but ready for real database integration
 */

export type EffortRow = {
  id: string;                 // uuid
  participant_id: string;
  segment_id: number;
  stage_index: number;
  elapsed_time: number;
  effort_date: string;        // ISO timestamptz
  leaderboard_type: 'overall' | 'climbing' | 'descending';
  pr_rank: number | null;
};

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
  effortId?: number;
  participantId: string;
  stageIndex: number;
  elapsedTime: number;
  effortDate: Date;
  segmentId: number;
  prRank?: number;
  leaderboardType: 'overall' | 'climbing' | 'descending';
  createdAt: Date;
}

import { getSupabaseService, getSupabaseAnon } from './db';

// Hybrid DB: Supabase in production, in-memory fallback locally
class MockDatabase {
  private participants: Map<string, Participant> = new Map();
  private results: Map<string, RaceResult[]> = new Map();

  // Participant management
  async upsertParticipant(participant: Omit<Participant, 'createdAt' | 'updatedAt'>): Promise<Participant> {
    const now = new Date();
    const svc = getSupabaseService();
    if (svc) {
      const { data, error } = await svc
        .from('participants')
        .upsert({
          id: participant.id,
          strava_id: participant.stravaId,
          name: participant.name,
          username: participant.username,
        }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      console.log('✅ Participant upserted (supabase):', data?.name);
    }

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
    const svc = getSupabaseService();
    if (svc) {
      const upsertData: Record<string, unknown> = {
        participant_id: result.participantId,
        segment_id: result.segmentId,
        stage_index: result.stageIndex,
        elapsed_time: result.elapsedTime,
        effort_date: result.effortDate.toISOString(),
        leaderboard_type: result.leaderboardType,
        pr_rank: result.prRank ?? null,
      };
      
      // Add effort_id if provided (for proper upserting)
      if (result.effortId) {
        upsertData.effort_id = result.effortId;
      }
      
      const { error } = await svc.from('efforts').upsert(upsertData, {
        onConflict: result.effortId ? 'effort_id' : 'participant_id,segment_id,stage_index,leaderboard_type'
      });
      if (error) throw error;
    }
    
    const existingResults = this.results.get(result.participantId) || [];
    const filteredResults = existingResults.filter(r => 
      !(r.stageIndex === result.stageIndex && r.leaderboardType === result.leaderboardType && r.segmentId === result.segmentId)
    );
    filteredResults.push(fullResult);
    
    this.results.set(result.participantId, filteredResults);
    console.log('✅ Race result upserted:', result.participantId, 'Stage', result.stageIndex);
    return fullResult;
  }

  async getResultsByParticipant(participantId: string): Promise<RaceResult[]> {
    const anon = getSupabaseAnon();
    if (anon) {
      const { data, error } = await anon
        .from('efforts')
        .select('*')
        .eq('participant_id', participantId);
      if (error) throw error;
      return (data || []).map(r => ({
        id: String(r.id),
        participantId: r.participant_id,
        stageIndex: r.stage_index,
        elapsedTime: r.elapsed_time,
        effortDate: new Date(r.effort_date),
        segmentId: r.segment_id,
        prRank: r.pr_rank ?? undefined,
        leaderboardType: r.leaderboard_type,
        createdAt: new Date(r.created_at)
      }));
    }
    return this.results.get(participantId) || [];
  }

  async getAllResults(): Promise<Array<RaceResult & { participantName?: string }>> {
    const anon = getSupabaseAnon();
    if (anon) {
      const { data: efforts, error: e1 } = await anon
        .from('efforts')
        .select('*');
      if (e1) throw e1;
      const { data: participants, error: e2 } = await anon
        .from('participants')
        .select('*');
      if (e2) throw e2;
      const idToName = new Map<string, string>();
      (participants || []).forEach(p => idToName.set(p.id, p.name));
      return (efforts || []).map(r => ({
        id: String(r.id),
        effortId: r.effort_id ?? undefined,
        participantId: r.participant_id,
        stageIndex: r.stage_index,
        elapsedTime: r.elapsed_time,
        effortDate: new Date(r.effort_date),
        segmentId: r.segment_id,
        prRank: r.pr_rank ?? undefined,
        leaderboardType: r.leaderboard_type,
        createdAt: new Date(r.created_at),
        participantName: idToName.get(r.participant_id)
      }));
    }
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
    const svc = getSupabaseService();
    if (svc) {
      await svc.from('efforts').delete().neq('participant_id', '');
      await svc.from('participants').delete().neq('id', '');
    }
    this.participants.clear();
    this.results.clear();
    console.log('🧹 All database data cleared');
  }
}

export const raceDatabase = new MockDatabase();
