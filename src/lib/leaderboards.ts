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

// Enhanced data structure for improved segment logic
interface MockEffort {
  id: string;
  riderId: string;
  riderName: string;
  segmentId: number;
  stageId: number;
  elapsedSec: number;
  effortDate: string;
  activityId?: string; // Link to the activity that contains this segment
  activityDate?: string; // Date of the activity
}

// Activity-based segment grouping
interface ActivitySegments {
  activityId: string;
  activityDate: string;
  riderId: string;
  riderName: string;
  overallLoop?: {
    segmentId: 7977451;
    elapsedSec: number;
    effortDate: string;
  };
  climbingSegments: {
    segment9589287?: { elapsedSec: number; effortDate: string };
    segment18229887?: { elapsedSec: number; effortDate: string };
  };
  descendingSegments: {
    segment2105607?: { elapsedSec: number; effortDate: string };
    segment1359027?: { elapsedSec: number; effortDate: string };
  };
}

interface MockStage {
  id: number;
  name: string;
  season: 'fall' | 'winter' | 'spring' | 'summer';
  startDate: string;
  endDate: string;
}

// Seasonal stages with proper Equinox/Solstice dates
const mockStages: MockStage[] = [
  { id: 1, name: 'Fall 2025', season: 'fall', startDate: '2025-09-22', endDate: '2025-12-20' }, // Autumnal Equinox to Winter Solstice
  { id: 2, name: 'Winter 2025', season: 'winter', startDate: '2025-12-21', endDate: '2026-03-19' }, // Winter Solstice to Vernal Equinox
  { id: 3, name: 'Spring 2026', season: 'spring', startDate: '2026-03-20', endDate: '2026-06-20' }, // Vernal Equinox to Summer Solstice
  { id: 4, name: 'Summer 2026', season: 'summer', startDate: '2026-06-21', endDate: '2026-09-21' }, // Summer Solstice to Autumnal Equinox
];

/**
 * Check if a date falls within a seasonal window (Equinox/Solstice based)
 */
function isWithinSeasonalWindow(effortDate: string, season: 'fall' | 'winter' | 'spring' | 'summer'): boolean {
  try {
    const effort = new Date(effortDate);
    if (isNaN(effort.getTime())) {
      console.error('❌ Invalid effort date:', effortDate);
      return false;
    }
    
    const stage = mockStages.find(s => s.season === season);
    if (!stage) return false;
    
    const startDate = new Date(stage.startDate);
    const endDate = new Date(stage.endDate);
    
    return effort >= startDate && effort <= endDate;
  } catch (error) {
    console.error('❌ Error in isWithinSeasonalWindow:', error);
    return false;
  }
}

/**
 * Get the current season based on today's date
 */
function getCurrentSeason(): 'fall' | 'winter' | 'spring' | 'summer' {
  const today = new Date();
  const currentStage = mockStages.find(stage => {
    const startDate = new Date(stage.startDate);
    const endDate = new Date(stage.endDate);
    return today >= startDate && today <= endDate;
  });
  
  return currentStage?.season || 'fall'; // Default to fall if not found
}

// This will be populated from the actual database - starting fresh with no mock data
let mockEfforts: MockEffort[] = [];

/**
 * Load efforts from database with enhanced activity linking
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
      effortDate: result.effortDate.toISOString().split('T')[0],
      activityId: `activity_${result.id}`, // Generate activity ID from result ID
      activityDate: result.effortDate.toISOString().split('T')[0] // Use effort date as activity date
    }));
    
    console.log('📊 Converted efforts with activity linking:', dbEfforts);
    
    // Use only database results - no mock data
    console.log('📊 Using only real database results:', dbEfforts.length, 'efforts');
    return dbEfforts;
  } catch (error) {
    console.error('Error loading efforts from database:', error);
    // Return empty array if database fails - no mock data fallback
    console.log('📊 No database data available, returning empty results');
    return [];
  }
}

/**
 * Group efforts by activity to get all segments from the same ride
 */
function groupEffortsByActivity(efforts: MockEffort[]): ActivitySegments[] {
  const activityMap = new Map<string, ActivitySegments>();
  
  efforts.forEach(effort => {
    const activityId = effort.activityId || `activity_${effort.id}`;
    
    if (!activityMap.has(activityId)) {
      activityMap.set(activityId, {
        activityId,
        activityDate: effort.activityDate || effort.effortDate,
        riderId: effort.riderId,
        riderName: effort.riderName,
        climbingSegments: {},
        descendingSegments: {}
      });
    }
    
    const activity = activityMap.get(activityId)!;
    
    // Add segment to appropriate category
    switch (effort.segmentId) {
      case 7977451: // Overall Loop
        activity.overallLoop = {
          segmentId: 7977451,
          elapsedSec: effort.elapsedSec,
          effortDate: effort.effortDate
        };
        break;
      case 9589287: // Climbing segment 1
        activity.climbingSegments.segment9589287 = {
          elapsedSec: effort.elapsedSec,
          effortDate: effort.effortDate
        };
        break;
      case 18229887: // Climbing segment 2
        activity.climbingSegments.segment18229887 = {
          elapsedSec: effort.elapsedSec,
          effortDate: effort.effortDate
        };
        break;
      case 2105607: // Descending segment 1
        activity.descendingSegments.segment2105607 = {
          elapsedSec: effort.elapsedSec,
          effortDate: effort.effortDate
        };
        break;
      case 1359027: // Descending segment 2
        activity.descendingSegments.segment1359027 = {
          elapsedSec: effort.elapsedSec,
          effortDate: effort.effortDate
        };
        break;
    }
  });
  
  return Array.from(activityMap.values());
}

/**
 * Get the most recent activity with Overall Loop within seasonal window
 */
function getMostRecentActivityInSeason(
  activities: ActivitySegments[], 
  riderId: string, 
  season: 'fall' | 'winter' | 'spring' | 'summer'
): ActivitySegments | null {
  const riderActivities = activities
    .filter(activity => 
      activity.riderId === riderId && 
      activity.overallLoop && 
      isWithinSeasonalWindow(activity.overallLoop.effortDate, season)
    )
    .sort((a, b) => {
      try {
        const dateA = new Date(a.activityDate);
        const dateB = new Date(b.activityDate);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // If either date is invalid, don't sort
        }
        return dateB.getTime() - dateA.getTime();
      } catch (error) {
        console.error('❌ Error sorting activity dates:', error);
        return 0;
      }
    });
  
  return riderActivities[0] || null;
}

/**
 * Update efforts from database (called by sync API) - now handles real data only
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
  console.log('🔄 Updating efforts from database:', databaseResults.length, 'results');
  
  mockEfforts = databaseResults.map(result => ({
    id: result.id,
    riderId: result.participantId,
    riderName: result.participantName || 'Unknown',
    segmentId: result.segmentId,
    stageId: result.stageIndex + 1, // Convert 0-based to 1-based
    elapsedSec: result.elapsedTime,
    effortDate: result.effortDate.toISOString().split('T')[0],
    activityId: `activity_${result.id}`, // Generate activity ID
    activityDate: result.effortDate.toISOString().split('T')[0]
  }));
  
  console.log('✅ Updated efforts with real data:', mockEfforts.length, 'efforts');
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
 * Table 1: Overall Loop Leaderboard (Improved Logic)
 * Gets most recent effort for Segment 7977451 within seasonal window
 */
export async function getOverallLoopLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const activities = groupEffortsByActivity(efforts);
  
  // Get all unique riders who have completed the Overall Loop
  const riders = new Set<string>();
  activities.forEach(activity => {
    if (activity.overallLoop) {
      riders.add(activity.riderId);
    }
  });
  
  const rows: LeaderboardRow[] = [];
  
  riders.forEach(riderId => {
    const riderName = activities.find(a => a.riderId === riderId)?.riderName || 'Unknown';
    
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
    
    // Get most recent activity for each season
    mockStages.forEach(stage => {
      const mostRecentActivity = getMostRecentActivityInSeason(activities, riderId, stage.season);
      if (mostRecentActivity?.overallLoop) {
        row.seasons[stage.season] = mostRecentActivity.overallLoop.elapsedSec;
      }
    });
    
    rows.push(row);
  });
  
  return {
    title: 'Overall Loop',
    subtitle: 'Most recent time on segment 7977451 per season (Four Seasons of Horsetooth Challenge)',
    icon: '🏆',
    rows
  };
}

/**
 * Table 2: Climber Score Leaderboard (Improved Logic)
 * Uses climbing segments from the same activity as the Overall Loop
 */
export async function getClimberScoreLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const activities = groupEffortsByActivity(efforts);
  
  // Get all unique riders who have completed the Overall Loop
  const riders = new Set<string>();
  activities.forEach(activity => {
    if (activity.overallLoop) {
      riders.add(activity.riderId);
    }
  });
  
  const rows: LeaderboardRow[] = [];
  
  riders.forEach(riderId => {
    const riderName = activities.find(a => a.riderId === riderId)?.riderName || 'Unknown';
    
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
    
    // Get climbing segments from the same activity as the Overall Loop
    mockStages.forEach(stage => {
      const mostRecentActivity = getMostRecentActivityInSeason(activities, riderId, stage.season);
      
      if (mostRecentActivity?.overallLoop && mostRecentActivity.climbingSegments) {
        const segment1 = mostRecentActivity.climbingSegments.segment9589287;
        const segment2 = mostRecentActivity.climbingSegments.segment18229887;
        
        if (segment1 && segment2) {
          row.seasons[stage.season] = segment1.elapsedSec + segment2.elapsedSec;
        }
      }
    });
    
    rows.push(row);
  });
  
  return {
    title: 'Best Climber',
    subtitle: 'Sum of climbing segments 9589287 + 18229887 from same activity as Overall Loop',
    icon: '🏔️',
    rows
  };
}

/**
 * Table 3: Downhill Score Leaderboard (Improved Logic)
 * Uses descending segments from the same activity as the Overall Loop
 */
export async function getDownhillScoreLeaderboard(): Promise<LeaderboardData> {
  const efforts = await loadEffortsFromDatabase();
  const activities = groupEffortsByActivity(efforts);
  
  // Get all unique riders who have completed the Overall Loop
  const riders = new Set<string>();
  activities.forEach(activity => {
    if (activity.overallLoop) {
      riders.add(activity.riderId);
    }
  });
  
  const rows: LeaderboardRow[] = [];
  
  riders.forEach(riderId => {
    const riderName = activities.find(a => a.riderId === riderId)?.riderName || 'Unknown';
    
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
    
    // Get descending segments from the same activity as the Overall Loop
    mockStages.forEach(stage => {
      const mostRecentActivity = getMostRecentActivityInSeason(activities, riderId, stage.season);
      
      if (mostRecentActivity?.overallLoop && mostRecentActivity.descendingSegments) {
        const segment1 = mostRecentActivity.descendingSegments.segment2105607;
        const segment2 = mostRecentActivity.descendingSegments.segment1359027;
        
        if (segment1 && segment2) {
          row.seasons[stage.season] = segment1.elapsedSec + segment2.elapsedSec;
        }
      }
    });
    
    rows.push(row);
  });
  
  return {
    title: 'Fastest Downhill',
    subtitle: 'Sum of descending segments 2105607 + 1359027 from same activity as Overall Loop',
    icon: '🏂',
    rows
  };
}

/**
 * Format time in Hr:Min:Sec format (improved for longer times)
 */
export function formatTime(seconds: number | null): string {
  if (seconds === null) return '–';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
