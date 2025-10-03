import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/my-segment?segmentId=7977451
// This endpoint gets the current athlete's most recent effort on a segment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segmentId');

    if (!segmentId) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    const stravaAPI = new StravaAPI();

    // For now, we'll use the test access token
    // In production, this would be the authenticated user's token
    const testAccessToken = process.env.STRAVA_TEST_ACCESS_TOKEN;
    
    if (!testAccessToken) {
      return NextResponse.json(
        { error: 'Strava access token not configured' },
        { status: 500 }
      );
    }

    // Get current athlete info
    const athlete = await stravaAPI.getAthlete(testAccessToken);
    
    // Get segment efforts for the specific segment
    const segmentEfforts = await stravaAPI.getSegmentEfforts(
      parseInt(segmentId),
      testAccessToken
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
    const activity = await stravaAPI.getActivity(mostRecentEffort.activityId, testAccessToken);

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
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch segment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
