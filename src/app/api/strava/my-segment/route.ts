import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/my-segment?segmentId=7977451&participantId=mock_123
// This endpoint gets the authenticated user's most recent effort on a segment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segmentId');
    const participantId = searchParams.get('participantId');

    if (!segmentId) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required. Please connect your Strava account first.' },
        { status: 400 }
      );
    }

    const stravaAPI = new StravaAPI();

    // For now, we'll mock the participant data since we don't have Supabase set up yet
    // In production, this would fetch from the database
    let participant;
    
    if (participantId.startsWith('mock_')) {
      // For mock participants, we need to get a fresh token via OAuth
      // Since the test token is expired, we'll redirect to OAuth
      return NextResponse.json(
        { 
          error: 'Token expired - OAuth required',
          message: 'Your Strava token has expired. Please reconnect your account.',
          requiresReauth: true,
          participantId: participantId
        },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid participant ID format' },
        { status: 400 }
      );
    }

    if (!participant.stravaAccessToken) {
      return NextResponse.json(
        { 
          error: 'No Strava access token found for this participant',
          message: 'Please reconnect your Strava account'
        },
        { status: 401 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = participant.stravaAccessToken;
    let refreshToken = participant.stravaRefreshToken;
    let expiresAt = participant.tokenExpiresAt;

    if (stravaAPI.isTokenExpired(expiresAt)) {
      try {
        const refreshedTokens = await stravaAPI.refreshAccessToken(refreshToken);
        accessToken = refreshedTokens.accessToken;
        refreshToken = refreshedTokens.refreshToken;
        expiresAt = refreshedTokens.expiresAt;
        
        // In production, you would update the database with new tokens here
        console.log('Token refreshed successfully');
      } catch (refreshError) {
        const errorMessage = refreshError instanceof Error ? refreshError.message : 'Unknown error';
        return NextResponse.json(
          { 
            error: 'Token refresh failed',
            message: 'Please reconnect your Strava account',
            details: errorMessage
          },
          { status: 401 }
        );
      }
    }

    // Get current athlete info
    const athlete = await stravaAPI.getAthlete(accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      profile: string;
    };
    
    // Get segment efforts for the specific segment
    const segmentEfforts = await stravaAPI.getSegmentEfforts(
      parseInt(segmentId),
      accessToken
    );

    if (!segmentEfforts || segmentEfforts.length === 0) {
      return NextResponse.json({
        segmentId: parseInt(segmentId),
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          profile: athlete.profile
        },
        efforts: [],
        message: 'No efforts found for this segment'
      });
    }

    // Filter efforts for the current athlete and get the most recent
    const athleteEfforts = segmentEfforts
      .filter(effort => effort.athlete?.id === athlete.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const mostRecentEffort = athleteEfforts[0];

    if (!mostRecentEffort) {
      return NextResponse.json({
        segmentId: parseInt(segmentId),
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          profile: athlete.profile
        },
        efforts: [],
        message: 'No efforts found for this athlete on this segment'
      });
    }

    // Get the full activity details
    const activity = await stravaAPI.getActivity(mostRecentEffort.activityId, accessToken);

    return NextResponse.json({
      segmentId: parseInt(segmentId),
      athlete: {
        id: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
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
      }))
    });

  } catch (error) {
    console.error('Error fetching segment data:', error);
    
    // Handle specific Strava API errors
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Strava authentication failed',
          message: 'Access token may be expired or invalid. Please check STRAVA_TEST_ACCESS_TOKEN in Vercel environment variables.',
          details: error.message
        },
        { status: 401 }
      );
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
