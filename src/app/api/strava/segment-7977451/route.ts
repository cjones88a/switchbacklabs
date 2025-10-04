import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/segment-7977451?accessToken=xxx
// Fetches the specific segment 7977451 data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('🏃‍♂️ Segment 7977451 API called');
    
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    
    if (!accessToken) {
      console.error('❌ No access token provided');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const stravaAPI = new StravaAPI();
    const segmentId = 7977451;

    console.log('🔄 Fetching athlete info...');
    // Get athlete information
    const athlete = await stravaAPI.getAthlete(accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      username?: string;
      profile?: string;
    };

    console.log('🔄 Fetching segment efforts for segment', segmentId);
    // Get segment efforts for the specific segment
    const segmentEfforts = await stravaAPI.getSegmentEfforts(segmentId, accessToken);

    if (!segmentEfforts || segmentEfforts.length === 0) {
      console.log('ℹ️ No efforts found for segment', segmentId);
      return NextResponse.json({
        segmentId,
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          username: athlete.username,
          profile: athlete.profile
        },
        efforts: [],
        message: 'No efforts found for this segment'
      });
    }

    // Filter efforts for the current athlete and sort by date (most recent first)
    const athleteEfforts = segmentEfforts
      .filter(effort => effort.athlete?.id === athlete.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    console.log(`✅ Found ${athleteEfforts.length} efforts for athlete ${athlete.id}`);

    if (athleteEfforts.length === 0) {
      return NextResponse.json({
        segmentId,
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          username: athlete.username,
          profile: athlete.profile
        },
        efforts: [],
        message: 'No efforts found for this athlete on this segment'
      });
    }

    const mostRecentEffort = athleteEfforts[0];

    // Get the full activity details for the most recent effort
    console.log('🔄 Fetching activity details for effort', mostRecentEffort.id);
    const activity = await stravaAPI.getActivity(mostRecentEffort.activityId, accessToken);

    return NextResponse.json({
      segmentId,
      athlete: {
        id: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        username: athlete.username,
        profile: athlete.profile
      },
      mostRecentEffort: {
        id: mostRecentEffort.id,
        elapsedTime: mostRecentEffort.elapsedTime,
        startDate: mostRecentEffort.startDate,
        prRank: mostRecentEffort.prRank,
        activity: {
          id: activity.id,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          startDate: activity.startDate
        }
      },
      allEfforts: athleteEfforts.map(effort => ({
        id: effort.id,
        elapsedTime: effort.elapsedTime,
        startDate: effort.startDate,
        prRank: effort.prRank
      })),
      totalEfforts: athleteEfforts.length
    });

  } catch (error) {
    console.error('💥 Segment 7977451 API error:', error);
    
    // Handle specific Strava API errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { 
            error: 'Authentication failed',
            message: 'Access token is invalid or expired',
            details: error.message
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('403')) {
        return NextResponse.json(
          { 
            error: 'Access forbidden',
            message: 'Insufficient permissions to access segment data',
            details: error.message
          },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch segment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
