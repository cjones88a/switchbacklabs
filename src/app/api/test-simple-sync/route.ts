import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { raceDatabase } from '@/lib/race-database';
import { updateMockEffortsFromDatabase } from '@/lib/leaderboards';

// POST /api/test-simple-sync
// Simple test to get just one segment (7977451) for the authenticated user
export async function POST(req: Request) {
  try {
    console.log('🧪 Simple sync test started');
    
    const body = await req.json().catch(() => ({}));
    const accessToken = body?.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    const stravaAPI = new StravaAPI();
    
    // Get athlete info
    console.log('🔄 Getting athlete info...');
    const athlete = await stravaAPI.getAthlete(accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
    };
    console.log('✅ Athlete:', athlete.firstname, athlete.lastname);

    // Get just one segment - the Overall Loop (7977451)
    console.log('🔄 Fetching segment 7977451 (Overall Loop)...');
    const segmentEfforts = await stravaAPI.getSegmentEfforts(7977451, accessToken);
    console.log('📊 Raw segment efforts:', segmentEfforts?.length || 0, 'efforts found');
    
    if (!segmentEfforts || segmentEfforts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No efforts found for segment 7977451',
        athlete: athlete
      });
    }

    // Filter for current athlete
    const athleteEfforts = segmentEfforts.filter(effort => effort.athlete?.id === athlete.id);
    console.log('📊 Athlete efforts:', athleteEfforts.length, 'efforts found');
    
    if (athleteEfforts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No efforts found for this athlete on segment 7977451',
        athlete: athlete,
        totalEfforts: segmentEfforts.length
      });
    }

    // Get most recent effort
    const mostRecentEffort = athleteEfforts.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];
    
    console.log('✅ Most recent effort:', {
      elapsedTime: mostRecentEffort.elapsedTime,
      startDate: mostRecentEffort.startDate,
      prRank: mostRecentEffort.prRank
    });

    // Store in database
    const participant = await raceDatabase.upsertParticipant({
      id: `athlete_${athlete.id}`,
      stravaId: athlete.id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      username: '',
      accessToken: accessToken,
      refreshToken: '',
      tokenExpiresAt: new Date(Date.now() + (6 * 60 * 60 * 1000))
    });

    // Store the result
    await raceDatabase.upsertRaceResult({
      participantId: participant.id,
      stageIndex: 0, // Fall 2025
      elapsedTime: mostRecentEffort.elapsedTime,
      effortDate: new Date(mostRecentEffort.startDate),
      segmentId: 7977451,
      leaderboardType: 'overall'
    });

    // Update leaderboard data
    const allResults = await raceDatabase.getAllResults();
    updateMockEffortsFromDatabase(allResults);

    return NextResponse.json({
      success: true,
      message: 'Successfully synced segment 7977451',
      athlete: athlete,
      effort: {
        elapsedTime: mostRecentEffort.elapsedTime,
        startDate: mostRecentEffort.startDate,
        prRank: mostRecentEffort.prRank
      },
      formattedTime: formatTime(mostRecentEffort.elapsedTime)
    });

  } catch (error) {
    console.error('💥 Simple sync test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
