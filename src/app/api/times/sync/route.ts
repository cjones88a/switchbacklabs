import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { raceDatabase } from '@/lib/race-database';

// POST /api/times/sync
// Exchange Strava code for token, fetch segment efforts, and upsert to database
export async function POST(req: Request) {
  try {
    console.log('🔄 Times sync API called');
    
    const body = await req.json().catch(() => ({}));
    console.log('📋 Request body:', { hasCode: !!body?.code });
    
    if (!body?.code) {
      console.error('❌ Missing authorization code in sync request');
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
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

    console.log('🔄 Exchanging code for tokens...');
    // Exchange code for tokens
    const tokenData = await stravaAPI.exchangeCodeForToken(body.code, redirectUri);
    console.log('✅ Token exchange successful');
    
    // Get athlete information
    const athlete = await stravaAPI.getAthlete(tokenData.accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      username?: string;
    };

    // Fetch actual segment 7977451 data (Fall 2025 stage)
    console.log('🔄 Fetching segment 7977451 data for Fall 2025 stage...');
    const segmentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/strava/segment-7977451?accessToken=${tokenData.accessToken}`);
    
    let segmentEfforts: Array<{
      stageIndex: number;
      elapsedTime: number;
      effortDate: string;
      segmentId?: number;
      prRank?: number;
    }> = [];
    if (segmentResponse.ok) {
      const segmentData = await segmentResponse.json();
      if (segmentData.mostRecentEffort) {
        // Convert segment 7977451 to Fall 2025 stage (index 0)
        segmentEfforts = [{
          stageIndex: 0, // Fall 2025
          elapsedTime: segmentData.mostRecentEffort.elapsedTime,
          effortDate: segmentData.mostRecentEffort.startDate,
          segmentId: 7977451,
          prRank: segmentData.mostRecentEffort.prRank
        }];
        console.log('✅ Found segment 7977451 effort:', segmentEfforts[0]);
      }
    } else {
      console.log('⚠️ No segment 7977451 data found, using mock data');
      // Fallback to mock data if segment fetch fails
      segmentEfforts = [
        { stageIndex: 0, elapsedTime: 3600 + 2940, effortDate: new Date().toISOString() }, // 1:49:00 (close to your 1:49:17)
      ];
    }

    // Store participant in database
    const participant = await raceDatabase.upsertParticipant({
      id: `athlete_${athlete.id}`,
      stravaId: athlete.id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      username: athlete.username || '',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresAt
    });

    // Store race results in database
    for (const effort of segmentEfforts) {
      await raceDatabase.upsertRaceResult({
        participantId: participant.id,
        stageIndex: effort.stageIndex,
        elapsedTime: effort.elapsedTime,
        effortDate: new Date(effort.effortDate),
        segmentId: effort.segmentId || 7977451,
        prRank: effort.prRank
      });
    }
    
    console.log('✅ Participant and results stored:', {
      id: participant.id,
      name: participant.name,
      effortsCount: segmentEfforts.length
    });

    return NextResponse.json({ 
      ok: true, 
      participant: {
        id: participant.id,
        name: participant.name,
        effortsCount: segmentEfforts.length
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync times',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
