import { createClient } from '@supabase/supabase-js';
import { Participant, RaceStage, RaceResult, RaceConfig } from '@/types/race';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database operations
export class DatabaseService {
  // Participants
  static async createParticipant(participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .insert([participant])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getParticipantByStravaId(stravaId: number) {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('stravaId', stravaId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateParticipantTokens(
    stravaId: number, 
    accessToken: string, 
    refreshToken: string, 
    expiresAt: Date
  ) {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .update({
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .eq('stravaId', stravaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Race Stages
  static async getActiveStages() {
    const { data, error } = await supabaseAdmin
      .from('race_stages')
      .select('*')
      .eq('isActive', true)
      .order('startDate', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getStageById(stageId: string) {
    const { data, error } = await supabaseAdmin
      .from('race_stages')
      .select('*')
      .eq('id', stageId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Race Results
  static async createRaceResult(result: Omit<RaceResult, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabaseAdmin
      .from('race_results')
      .insert([result])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getResultsByStage(stageId: string) {
    const { data, error } = await supabaseAdmin
      .from('race_results')
      .select(`
        *,
        participants (
          id,
          firstName,
          lastName,
          stravaId
        )
      `)
      .eq('stageId', stageId)
      .eq('isValid', true)
      .order('timeInSeconds', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getParticipantResults(participantId: string) {
    const { data, error } = await supabaseAdmin
      .from('race_results')
      .select(`
        *,
        race_stages (
          id,
          name,
          stravaSegmentId
        )
      `)
      .eq('participantId', participantId)
      .eq('isValid', true)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Race Configuration
  static async getRaceConfig() {
    const { data, error } = await supabaseAdmin
      .from('race_config')
      .select(`
        *,
        race_stages (*)
      `)
      .eq('isActive', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateRaceConfig(config: Partial<RaceConfig>) {
    const { data, error } = await supabaseAdmin
      .from('race_config')
      .update({
        ...config,
        updatedAt: new Date()
      })
      .eq('isActive', true)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
