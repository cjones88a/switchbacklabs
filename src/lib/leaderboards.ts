/**
 * Leaderboard Logic - Prisma-style queries for race tracking
 * 
 * Table 1: Overall Loop (Segment 7977451)
 * Table 2: Climber Score (Segments 9589287 + 18229887)
 * Table 3: Downhill Score (Segments 2105607 + 1359027)
 */

export interface LeaderboardRow {
  riderId: string;
  riderName: string;
  seasons: {
    fall: number | null;    // Fall 2025
    winter: number | null;  // Winter 2025
    spring: number | null;  // Spring 2026
    summer: number | null;  // Summer 2026
  };
}

export interface LeaderboardData {
  title: string;
  subtitle: string;
  icon: string;
  rows: LeaderboardRow[];
}

// Mock data structure (in production, this would be Prisma queries)
interface MockEffort {
  id: string;
  riderId: string;
  riderName: string;
  segmentId: number;
  stageId: number;
  elapsedSec: number;
  effortDate: string;
}

interface MockStage {
  id: number;
  name: string;
  season: 'fall' | 'winter' | 'spring' | 'summer';
  startDate: string;
  endDate: string;
}

// Mock data (in production, this would come from Prisma)
const mockStages: MockStage[] = [
  { id: 1, name: 'Fall 2025', season: 'fall', startDate: '2025-09-22', endDate: '2025-12-20' },
  { id: 2, name: 'Winter 2025', season: 'winter', startDate: '2025-12-21', endDate: '2026-03-19' },
  { id: 3, name: 'Spring 2026', season: 'spring', startDate: '2026-03-20', endDate: '2026-06-20' },
  { id: 4, name: 'Summer 2026', season: 'summer', startDate: '2026-06-21', endDate: '2026-09-21' },
];

// This will be populated from the actual database
let mockEfforts: MockEffort[] = [
  // Sample data for Colt Jones - Fall 2025 (stage 1)
  { id: '1', riderId: 'athlete_123', riderName: 'Colt Jones', segmentId: 7977451, stageId: 1, elapsedSec: 6557, effortDate: '2025-10-01' }, // Overall Loop: 1:49:17
  { id: '2', riderId: 'athlete_123', riderName: 'Colt Jones', segmentId: 9589287, stageId: 1, elapsedSec: 1200, effortDate: '2025-10-01' }, // Climbing segment 1: 20:00
  { id: '3', riderId: 'athlete_123', riderName: 'Colt Jones', segmentId: 18229887, stageId: 1, elapsedSec: 1800, effortDate: '2025-10-01' }, // Climbing segment 2: 30:00
  { id: '4', riderId: 'athlete_123', riderName: 'Colt Jones', segmentId: 2105607, stageId: 1, elapsedSec: 900, effortDate: '2025-10-01' }, // Descending segment 1: 15:00
  { id: '5', riderId: 'athlete_123', riderName: 'Colt Jones', segmentId: 1359027, stageId: 1, elapsedSec: 1100, effortDate: '2025-10-01' }, // Descending segment 2: 18:20
];

/**
 * Load efforts from database
 */
async function loadEffortsFromDatabase(): Promise<MockEffort[]> {
  try {
    // Import the database service
    const { raceDatabase } = await import('./race-database');
    const results = await raceDatabase.getAllResults();
    
    console.log('📊 Database results:', results);
    
    const dbEfforts = results.map(result => ({
      id: result.id,
      riderId: result.participantId,
      riderName: result.participantName || 'Unknown',
      segmentId: result.segmentId,
      stageId: result.stageIndex + 1, // Convert 0-based to 1-based
      elapsedSec: result.elapsedTime,
      effortDate: result.effortDate.toISOString().split('T')[0]
    }));
    
    console.log('📊 Converted efforts:', dbEfforts);
    
    // Merge database results with sample data
    const allEfforts = [...mockEfforts, ...dbEfforts];
    
    // Remove duplicates (database results take precedence)
    const uniqueEfforts = allEfforts.filter((effort, index, self) => 
      index === self.findIndex(e => e.id === effort.id)
    );
    
    return uniqueEfforts;
  } catch (error) {
    console.error('Error loading efforts from database:', error);
    // Return sample data if database fails
    return mockEfforts;
  }
}

/**
 * Update mock efforts from database (called by sync API)
 */
export function updateMockEffortsFromDatabase(databaseResults: Array<{
  id: string;
  participantId: string;
  participantName?: string;
  segmentId: number;
  stageIndex: number;
  elapsedTime: number;
  effortDate: Date;
}>) {
  mockEfforts = databaseResults.map(result => ({
    id: result.id,
    riderId: result.participantId,
    riderName: result.participantName || 'Unknown',
    segmentId: result.segmentId,
    stageId: result.stageIndex + 1, // Convert 0-based to 1-based
    elapsedSec: result.elapsedTime,
    effortDate: result.effortDate.toISOString().split('T')[0]
  }));
}

/**
 * Get best time for a rider on a specific segment in a specific season
 */
function getBestTimeForSegment(
  efforts: MockEffort[], 
  riderId: string, 
  segmentId: number, 
  stageId: number
): number | null {
  const relevantEfforts = efforts.filter(effort => 
    effort.riderId === riderId && 
    effort.segmentId === segmentId && 
    effort.stageId === stageId
  );
  
  if (relevantEfforts.length === 0) return null;
  
  // Return MIN elapsedSec (best time)
  return Math.min(...relevantEfforts.map(effort => effort.elapsedSec));
}

/**
 * Get all riders who completed the Overall Loop (segment 7977451) in any season
 */
function getOverallLoopRiders(efforts: MockEffort[]): Set<string> {
  const loopRiders = new Set<string>();
  
  efforts.forEach(effort => {
    if (effort.segmentId === 7977451) {
      loopRiders.add(effort.riderId);
    }
  });
  
  return loopRiders;
}

/**
 * Check if rider completed the loop in a specific season
 */
function hasLoopTimeInSeason(
  efforts: MockEffort[], 
  riderId: string, 
  stageId: number
): boolean {
  return efforts.some(effort => 
    effort.riderId === riderId && 
    effort.segmentId === 7977451 && 
    effort.stageId === stageId
  );
}

/**
 * Table 1: Overall Loop Leaderboard
 */
export async function getOverallLoopLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const loopRiders = getOverallLoopRiders(efforts);
  const rows: LeaderboardRow[] = [];
  
  loopRiders.forEach(riderId => {
    const riderName = efforts.find(e => e.riderId === riderId)?.riderName || 'Unknown';
    
    const row: LeaderboardRow = {
      riderId,
      riderName,
      seasons: {
        fall: getBestTimeForSegment(efforts, riderId, 7977451, 1),
        winter: getBestTimeForSegment(efforts, riderId, 7977451, 2),
        spring: getBestTimeForSegment(efforts, riderId, 7977451, 3),
        summer: getBestTimeForSegment(efforts, riderId, 7977451, 4),
      }
    };
    
    rows.push(row);
  });
  
  return {
    title: 'Overall Loop',
    subtitle: 'Best time on segment 7977451 per season',
    icon: '🏆',
    rows
  };
}

/**
 * Table 2: Climber Score Leaderboard
 */
export async function getClimberScoreLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const loopRiders = getOverallLoopRiders(efforts);
  const rows: LeaderboardRow[] = [];
  
  loopRiders.forEach(riderId => {
    const riderName = efforts.find(e => e.riderId === riderId)?.riderName || 'Unknown';
    
    const row: LeaderboardRow = {
      riderId,
      riderName,
      seasons: {
        fall: null,
        winter: null,
        spring: null,
        summer: null,
      }
    };
    
    // Only include seasons where rider completed the loop
    mockStages.forEach(stage => {
      if (hasLoopTimeInSeason(efforts, riderId, stage.id)) {
        const climbingSegment1 = getBestTimeForSegment(efforts, riderId, 9589287, stage.id);
        const climbingSegment2 = getBestTimeForSegment(efforts, riderId, 18229887, stage.id);
        
        if (climbingSegment1 && climbingSegment2) {
          row.seasons[stage.season] = climbingSegment1 + climbingSegment2;
        }
      }
    });
    
    rows.push(row);
  });
  
  return {
    title: 'Best Climber',
    subtitle: 'Sum of segments 9589287 + 18229887 (only if completed loop)',
    icon: '🏔️',
    rows
  };
}

/**
 * Table 3: Downhill Score Leaderboard
 */
export async function getDownhillScoreLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const loopRiders = getOverallLoopRiders(efforts);
  const rows: LeaderboardRow[] = [];
  
  loopRiders.forEach(riderId => {
    const riderName = efforts.find(e => e.riderId === riderId)?.riderName || 'Unknown';
    
    const row: LeaderboardRow = {
      riderId,
      riderName,
      seasons: {
        fall: null,
        winter: null,
        spring: null,
        summer: null,
      }
    };
    
    // Only include seasons where rider completed the loop
    mockStages.forEach(stage => {
      if (hasLoopTimeInSeason(efforts, riderId, stage.id)) {
        const downhillSegment1 = getBestTimeForSegment(efforts, riderId, 2105607, stage.id);
        const downhillSegment2 = getBestTimeForSegment(efforts, riderId, 1359027, stage.id);
        
        if (downhillSegment1 && downhillSegment2) {
          row.seasons[stage.season] = downhillSegment1 + downhillSegment2;
        }
      }
    });
    
    rows.push(row);
  });
  
  return {
    title: 'Fastest Downhill',
    subtitle: 'Sum of segments 2105607 + 1359027 (only if completed loop)',
    icon: '🏂',
    rows
  };
}

/**
 * Format time in mm:ss format
 */
export function formatTime(seconds: number | null): string {
  if (seconds === null) return '–';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
