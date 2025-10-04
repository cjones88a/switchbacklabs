import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { raceDatabase } from '@/lib/race-database';
import { updateMockEffortsFromDatabase } from '@/lib/leaderboards';

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
    const redirectUri = process.env.STRAVA_REDIRECT_URI!;
    
    console.log('🔧 Environment check:', { 
      redirectUri: redirectUri ? 'present' : 'missing' 
    });

    if (!redirectUri) {
      console.error('❌ STRAVA_REDIRECT_URI not configured');
      return NextResponse.json({ error: 'Redirect URI not configured' }, { status: 500 });
    }

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

    // Fetch data for all segment types
    console.log('🔄 Fetching segment data for all categories...');
    
    // Fetch all segments for all seasons
    const segmentsToFetch = [
      // Overall Loop (7977451) for all seasons
      { id: 7977451, stageIndex: 0, type: 'overall' }, // Fall 2025
      { id: 7977451, stageIndex: 1, type: 'overall' }, // Winter 2025
      { id: 7977451, stageIndex: 2, type: 'overall' }, // Spring 2026
      { id: 7977451, stageIndex: 3, type: 'overall' }, // Summer 2026
      
      // Climbing segments (9589287 + 18229887) for all seasons
      { id: 9589287, stageIndex: 0, type: 'climbing' }, // Fall 2025
      { id: 9589287, stageIndex: 1, type: 'climbing' }, // Winter 2025
      { id: 9589287, stageIndex: 2, type: 'climbing' }, // Spring 2026
      { id: 9589287, stageIndex: 3, type: 'climbing' }, // Summer 2026
      
      { id: 18229887, stageIndex: 0, type: 'climbing' }, // Fall 2025
      { id: 18229887, stageIndex: 1, type: 'climbing' }, // Winter 2025
      { id: 18229887, stageIndex: 2, type: 'climbing' }, // Spring 2026
      { id: 18229887, stageIndex: 3, type: 'climbing' }, // Summer 2026
      
      // Descending segments (2105607 + 1359027) for all seasons
      { id: 2105607, stageIndex: 0, type: 'descending' }, // Fall 2025
      { id: 2105607, stageIndex: 1, type: 'descending' }, // Winter 2025
      { id: 2105607, stageIndex: 2, type: 'descending' }, // Spring 2026
      { id: 2105607, stageIndex: 3, type: 'descending' }, // Summer 2026
      
      { id: 1359027, stageIndex: 0, type: 'descending' }, // Fall 2025
      { id: 1359027, stageIndex: 1, type: 'descending' }, // Winter 2025
      { id: 1359027, stageIndex: 2, type: 'descending' }, // Spring 2026
      { id: 1359027, stageIndex: 3, type: 'descending' }, // Summer 2026
    ];
    
    const segmentEfforts: Array<{
      stageIndex: number;
      elapsedTime: number;
      effortDate: string;
      segmentId?: number;
      prRank?: number;
      type: string;
    }> = [];
    
    for (const segment of segmentsToFetch) {
      try {
        console.log(`🔄 Fetching segment ${segment.id} directly from Strava API...`);
        
        // Use Strava API directly instead of internal API calls
        const stravaSegmentEfforts = await stravaAPI.getSegmentEfforts(segment.id, tokenData.accessToken);
        
        if (stravaSegmentEfforts && stravaSegmentEfforts.length > 0) {
          // Filter for current athlete and get most recent effort
          const athleteEfforts = stravaSegmentEfforts
            .filter(effort => effort.athlete?.id === athlete.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
          
          const mostRecentEffort = athleteEfforts[0];
          
          if (mostRecentEffort) {
            segmentEfforts.push({
              stageIndex: segment.stageIndex,
              elapsedTime: mostRecentEffort.elapsedTime,
              effortDate: mostRecentEffort.startDate,
              segmentId: segment.id,
              prRank: mostRecentEffort.prRank,
              type: segment.type
            });
            console.log(`✅ Found segment ${segment.id} effort:`, mostRecentEffort.elapsedTime);
          } else {
            console.log(`⚠️ No efforts found for athlete on segment ${segment.id}`);
          }
        } else {
          console.log(`⚠️ No data found for segment ${segment.id}`);
        }
      } catch (error) {
        console.log(`❌ Error fetching segment ${segment.id}:`, error);
      }
    }
    
    // No fallback data - only use real Strava data
    if (segmentEfforts.length === 0) {
      console.log('⚠️ No segment data found from Strava API');
      return NextResponse.json({
        success: false,
        message: 'No segment efforts found for the authenticated athlete',
        athlete: athlete,
        segmentsAttempted: segmentsToFetch.length
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
    for (const effort of segmentEfforts) {
      await raceDatabase.upsertRaceResult({
        participantId: participant.id,
        stageIndex: effort.stageIndex,
        elapsedTime: effort.elapsedTime,
        effortDate: new Date(effort.effortDate),
        segmentId: effort.segmentId || 7977451,
        prRank: effort.prRank,
        leaderboardType: effort.type as 'overall' | 'climbing' | 'descending'
      });
    }
    
    console.log('✅ Participant and results stored:', {
      id: participant.id,
      name: participant.name,
      effortsCount: segmentEfforts.length
    });

    // Update the leaderboard data with new results
    const allResults = await raceDatabase.getAllResults();
    updateMockEffortsFromDatabase(allResults);

    return NextResponse.json({ 
      ok: true, 
      participant: {
        id: participant.id,
        name: participant.name,
        effortsCount: segmentEfforts.length
      }
    });

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
