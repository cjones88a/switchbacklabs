import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/segment?segmentId=7977451&athleteId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segmentId');
    const athleteId = searchParams.get('athleteId');

    if (!segmentId) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      );
    }

    const stravaAPI = new StravaAPI();

    // For now, we'll use the test access token
    // In production, this would fetch the athlete's stored access token
    const testAccessToken = process.env.STRAVA_TEST_ACCESS_TOKEN;
    
    if (!testAccessToken) {
      return NextResponse.json(
        { error: 'Strava access token not configured' },
        { status: 500 }
      );
    }

    // Get segment efforts for the specific segment
    const segmentEfforts = await stravaAPI.getSegmentEfforts(
      parseInt(segmentId),
      testAccessToken
    );

    if (!segmentEfforts || segmentEfforts.length === 0) {
      return NextResponse.json({
        segmentId: parseInt(segmentId),
        athleteId: parseInt(athleteId),
        efforts: [],
        message: 'No efforts found for this segment'
      });
    }

    // Filter efforts for the specific athlete and get the most recent
    const athleteEfforts = segmentEfforts
      .filter(effort => effort.athlete?.id === parseInt(athleteId))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const mostRecentEffort = athleteEfforts[0];

    if (!mostRecentEffort) {
      return NextResponse.json({
        segmentId: parseInt(segmentId),
        athleteId: parseInt(athleteId),
        efforts: [],
        message: 'No efforts found for this athlete on this segment'
      });
    }

    // Get the full activity details
    const activity = await stravaAPI.getActivity(mostRecentEffort.activityId, testAccessToken);

    return NextResponse.json({
      segmentId: parseInt(segmentId),
      athleteId: parseInt(athleteId),
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
