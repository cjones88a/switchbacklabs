import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { raceDatabase } from '@/lib/race-database';
import { updateMockEffortsFromDatabase } from '@/lib/leaderboards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StageKind = 'overall' | 'climbing' | 'descending';

interface EffortPayload {
  effortId: number;           // Strava segment_effort.id
  stageIndex: number;         // your season index (0..3)
  elapsedTime: number;        // seconds
  effortDate: string;         // ISO timestamp from Strava
  segmentId: number;          // Strava segment id
  prRank?: number | null;
  leaderboardType: StageKind; // maps to DB column "leaderboard_type"
}

// POST /api/times/sync
// Exchange Strava code for token, fetch segment efforts, and upsert to database
export async function POST(req: Request) {
  try {
    console.log('🔄 Times sync API called');
    
    const body = await req.json().catch(() => ({}));
    console.log('📋 Request body:', { hasAccessToken: !!body?.accessToken, hasCode: !!body?.code });
    
    if (!body?.accessToken && !body?.code) {
      console.error('❌ Missing access token or code in sync request');
      return NextResponse.json({ error: 'Missing access token or code' }, { status: 400 });
    }

    const stravaAPI = new StravaAPI();
    const redirectUri = process.env.STRAVA_REDIRECT_URI || 'https://switchbacklabsco.com/api/strava/callback-simple';
    
    console.log('🔧 Environment check:', { 
      redirectUri: redirectUri ? 'present' : 'missing' 
    });

    let tokenData;
    let athlete;
    
    if (body.accessToken) {
      // Use provided access token
      console.log('🔄 Using provided access token...');
      tokenData = { accessToken: body.accessToken };
      athlete = await stravaAPI.getAthlete(body.accessToken) as {
        id: number;
        firstname: string;
        lastname: string;
        username?: string;
      };
    } else {
      // Exchange code for tokens
      console.log('🔄 Exchanging code for tokens...');
      tokenData = await stravaAPI.exchangeCodeForToken(body.code, redirectUri);
      console.log('✅ Token exchange successful');
      
      // Get athlete information
      athlete = await stravaAPI.getAthlete(tokenData.accessToken) as {
        id: number;
        firstname: string;
        lastname: string;
        username?: string;
      };
    }
    
    console.log('✅ Athlete info retrieved:', athlete.firstname, athlete.lastname);

    // Define target segments
    const MAIN = 7977451;
    const CLIMB = [9589287, 18229887];
    const DESC = [2105607, 1359027];
    const wanted = new Set([MAIN, ...CLIMB, ...DESC]);
    
    console.log(`🔄 Fetching activities for ${athlete.firstname} ${athlete.lastname} to find segments:`, Array.from(wanted));
    
    // Get recent activities (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - (6 * 30 * 24 * 60 * 60 * 1000));
    const activities = await stravaAPI.getAthleteActivities(tokenData.accessToken, undefined, sixMonthsAgo);
    console.log(`📊 Found ${activities.length} activities in last 6 months`);
    
    // Instrument: count segments found per type
    const found: Record<number, number> = {};
    const segmentEfforts: EffortPayload[] = [];
    
    // Helper function to determine leaderboard type
    function groupFor(segId: number): 'overall'|'climbing'|'descending' {
      if (segId === MAIN) return 'overall';
      if (CLIMB.includes(segId)) return 'climbing';
      if (DESC.includes(segId)) return 'descending';
      return 'overall';
    }
    
    // Helper function to map date to season index
    function getSeasonIndex(dateStr: string): number {
      const dt = new Date(dateStr);
      const m = dt.getUTCMonth(); // 0=Jan
      return (m >= 8 && m <= 10) ? 0 // Sep-Nov: Fall
           : (m === 11 || m <= 1) ? 1 // Dec-Feb: Winter
           : (m >= 2 && m <= 4) ? 2   // Mar-May: Spring
           : 3;                       // Jun-Aug: Summer
    }
    
    // Process each activity to find segment efforts
    for (const activity of activities) {
      try {
        console.log(`🔄 Checking activity ${activity.id} (${activity.name}) for target segments...`);
        
        // Get activity details with segment efforts
        const activityDetails = await stravaAPI.getActivityDetails(activity.id, tokenData.accessToken);
        
        if (activityDetails.segment_efforts) {
          // Debug: prove which segments this activity has
          const activityFound: Record<number, number> = {};
          for (const effort of activityDetails.segment_efforts) {
            const segId = Number(effort.segment?.id);
            if (wanted.has(segId)) {
              activityFound[segId] = (activityFound[segId] ?? 0) + 1;
            }
          }
          console.log(`[sync] activity ${activity.id} found segments:`, activityFound);
          
          for (const effort of activityDetails.segment_efforts) {
            const segId = Number(effort.segment?.id);
            if (!wanted.has(segId)) continue;
            
            // Count for instrumentation
            found[segId] = (found[segId] ?? 0) + 1;
            
            // Add to results
            segmentEfforts.push({
              effortId: effort.id,
              stageIndex: getSeasonIndex(effort.start_date),
              elapsedTime: effort.elapsed_time,
              effortDate: effort.start_date,
              segmentId: segId,
              prRank: effort.pr_rank ?? null,
              leaderboardType: groupFor(segId)
            });
            
            console.log(`✅ Found ${groupFor(segId)} segment ${segId}: ${effort.elapsed_time}s on ${effort.start_date}`);
          }
        } else {
          console.log(`❌ Activity ${activity.id} has no segment_efforts`);
        }
      } catch (error) {
        console.log(`❌ Error processing activity ${activity.id}:`, error);
      }
    }
    
    // Log instrumentation results
    console.log('[sync] segment counts found:', found);
    console.log(`[sync] total efforts collected: ${segmentEfforts.length}`);
    
    // No fallback data - only use real Strava data
    if (segmentEfforts.length === 0) {
      console.log('⚠️ No segment data found from Strava API');
      return NextResponse.json({
        success: false,
        message: 'No segment efforts found for the authenticated athlete',
        athlete: athlete,
        segmentsAttempted: wanted.size
      });
    }

    // Store participant in database
    const participant = await raceDatabase.upsertParticipant({
      id: `athlete_${athlete.id}`,
      stravaId: athlete.id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      username: athlete.username || '',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || '',
      tokenExpiresAt: tokenData.expiresAt || new Date(Date.now() + (6 * 60 * 60 * 1000)) // 6 hours default
    });

    // Store race results in database
    const storedByType: Record<string, number> = {};
    for (const effort of segmentEfforts) {
      // Validate and parse the date safely
      let effortDate: Date;
      try {
        effortDate = new Date(effort.effortDate);
        if (isNaN(effortDate.getTime())) {
          console.error('❌ Invalid date format:', effort.effortDate);
          continue; // Skip this effort if date is invalid
        }
      } catch (error) {
        console.error('❌ Error parsing date:', effort.effortDate, error);
        continue; // Skip this effort if date parsing fails
      }

      await raceDatabase.upsertRaceResult({
        effortId: effort.effortId,
        participantId: participant.id,
        stageIndex: effort.stageIndex,
        elapsedTime: effort.elapsedTime,
        effortDate: effortDate,
        segmentId: effort.segmentId,
        prRank: effort.prRank ?? undefined,
        leaderboardType: effort.leaderboardType
      });
      
      // Count by type for logging
      storedByType[effort.leaderboardType] = (storedByType[effort.leaderboardType] || 0) + 1;
      console.log(`💾 Stored ${effort.leaderboardType} effort: segment ${effort.segmentId}, ${effort.elapsedTime}s, season ${effort.stageIndex}`);
    }
    
    console.log('✅ Participant and results stored:', {
      id: participant.id,
      name: participant.name,
      effortsCount: segmentEfforts.length,
      storedByType
    });

    // Update the leaderboard data with new results
    const allResults = await raceDatabase.getAllResults();
    updateMockEffortsFromDatabase(allResults);

    // Group efforts by type for summary
    const effortsByType = segmentEfforts.reduce((acc, effort) => {
      acc[effort.leaderboardType] = (acc[effort.leaderboardType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ Sync completed successfully:', {
      participant: participant.name,
      totalEfforts: segmentEfforts.length,
      effortsByType,
      segmentsAttempted: wanted.size
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully synced ${segmentEfforts.length} segment efforts for ${participant.name}`,
      participant: {
        id: participant.id,
        name: participant.name,
        effortsCount: segmentEfforts.length
      },
      summary: {
        totalEfforts: segmentEfforts.length,
        effortsByType,
        segmentsAttempted: wanted.size
      }
    }, { headers: { 'cache-control': 'no-store' } });

  } catch (error) {
    console.error('💥 Sync error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to sync times',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}
