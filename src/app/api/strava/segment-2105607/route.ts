import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { performanceMonitor, TeslaErrorHandler, spaceXCache } from '@/lib/performance-monitor';

// GET /api/strava/segment-2105607?accessToken=xxx
// Fetches the specific climbing segment 9589287 data for the authenticated user
export async function GET(request: NextRequest) {
  performanceMonitor.start('segment-2105607-fetch');
  
  try {
    console.log('🏂 [DESCENDING] Segment 2105607 API called');
    
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    
    if (!accessToken) {
      performanceMonitor.end('segment-2105607-fetch', false, 'No access token provided');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    // Check cache first (SpaceX-level optimization)
    const cacheKey = `segment-2105607-${accessToken.slice(-8)}`;
    const cachedData = spaceXCache.get(cacheKey);
    if (cachedData) {
      console.log('⚡ [CACHE HIT] Returning cached climbing segment data');
      performanceMonitor.end('segment-2105607-fetch', true);
      return NextResponse.json(cachedData);
    }

    const stravaAPI = new StravaAPI();
    const segmentId = 2105607;

    console.log('🔄 Fetching athlete info...');
    const athlete = await stravaAPI.getAthlete(accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      username?: string;
      profile: string;
    };
    console.log('✅ Athlete info fetched:', { id: athlete.id, name: `${athlete.firstname} ${athlete.lastname}` });
    
    // Get segment efforts for the specific segment
    console.log(`🔄 Fetching segment efforts for climbing segment ${segmentId}...`);
    const segmentEfforts = await stravaAPI.getSegmentEfforts(
      segmentId,
      accessToken
    );
    console.log(`✅ Found ${segmentEfforts.length} efforts for climbing segment ${segmentId}`);

    if (!segmentEfforts || segmentEfforts.length === 0) {
      const responseData = {
        segmentId: segmentId,
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          username: athlete.username,
          profile: athlete.profile
        },
        mostRecentEffort: null,
        allEfforts: [],
        totalEfforts: 0,
        message: 'No efforts found for this climbing segment',
        performance: {
          fetchTime: performance.now(),
          cacheHit: false,
          dataFreshness: new Date().toISOString()
        }
      };
      spaceXCache.set(cacheKey, responseData, 300); // Cache empty result
      performanceMonitor.end('segment-2105607-fetch', true);
      return NextResponse.json(responseData);
    }

    // Filter efforts for the current athlete and get the most recent
    const athleteEfforts = segmentEfforts
      .filter(effort => effort.athlete?.id === athlete.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const mostRecentEffort = athleteEfforts[0];

    if (!mostRecentEffort) {
      const responseData = {
        segmentId: segmentId,
        athlete: {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          username: athlete.username,
          profile: athlete.profile
        },
        mostRecentEffort: null,
        allEfforts: athleteEfforts.map(effort => ({
          id: effort.id,
          elapsedTime: effort.elapsedTime,
          startDate: effort.startDate,
          prRank: effort.prRank
        })),
        totalEfforts: athleteEfforts.length,
        message: 'No efforts found for this athlete on this climbing segment',
        performance: {
          fetchTime: performance.now(),
          cacheHit: false,
          dataFreshness: new Date().toISOString()
        }
      };
      spaceXCache.set(cacheKey, responseData, 300); // Cache empty result
      performanceMonitor.end('segment-2105607-fetch', true);
      return NextResponse.json(responseData);
    }

    // Get the full activity details for the most recent effort
    console.log('🔄 Fetching activity details for climbing effort', mostRecentEffort.id);
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
    
    performanceMonitor.end('segment-2105607-fetch', true);
    return NextResponse.json(responseData);

  } catch (error) {
    const errorHandler = TeslaErrorHandler.handle(error);
    performanceMonitor.end('segment-2105607-fetch', false, errorHandler.message);
    
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
