import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { performanceMonitor, TeslaErrorHandler, spaceXCache } from '@/lib/performance-monitor';

// GET /api/strava/segment-7977451?accessToken=xxx
// Fetches the specific segment 7977451 data for the authenticated user
export async function GET(request: NextRequest) {
  performanceMonitor.start('segment-7977451-fetch');
  
  try {
    console.log('🚀 [SPACEX] Segment 7977451 API called');
    
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    
    if (!accessToken) {
      performanceMonitor.end('segment-7977451-fetch', false, 'No access token provided');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Check cache first (SpaceX-level optimization)
    const cacheKey = `segment-7977451-${accessToken.slice(-8)}`;
    const cachedData = spaceXCache.get(cacheKey);
    if (cachedData) {
      console.log('⚡ [CACHE HIT] Returning cached segment data');
      performanceMonitor.end('segment-7977451-fetch', true);
      return NextResponse.json(cachedData);
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

    const responseData = {
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
      totalEfforts: athleteEfforts.length,
      performance: {
        fetchTime: performance.now(),
        cacheHit: false,
        dataFreshness: new Date().toISOString()
      }
    };

    // Cache the response (5 minutes TTL)
    spaceXCache.set(cacheKey, responseData, 300);
    
    performanceMonitor.end('segment-7977451-fetch', true);
    return NextResponse.json(responseData);

  } catch (error) {
    const errorHandler = TeslaErrorHandler.handle(error);
    performanceMonitor.end('segment-7977451-fetch', false, errorHandler.message);
    
    console.error('💥 [TESLA ERROR HANDLER]', errorHandler);
    
    return NextResponse.json(
      { 
        error: errorHandler.message,
        recoverable: errorHandler.recoverable,
        action: errorHandler.action,
        timestamp: new Date().toISOString()
      },
      { status: errorHandler.recoverable ? 400 : 500 }
    );
  }
}
