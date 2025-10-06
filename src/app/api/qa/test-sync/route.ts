import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';
import { StravaAPI } from '@/lib/strava/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    console.log('🔍 Testing sync process with access token...');
    
    const stravaAPI = new StravaAPI();
    
    // Get athlete info
    const athlete = await stravaAPI.getAthlete(accessToken);
    console.log('👤 Athlete:', athlete.firstname, athlete.lastname);
    
    // Define target segments
    const MAIN = 7977451;
    const CLIMB = [9589287, 18229887];
    const DESC = [2105607, 1359027];
    const wanted = new Set([MAIN, ...CLIMB, ...DESC]);
    
    console.log('🎯 Target segments:', Array.from(wanted));
    
    // Get recent activities (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - (6 * 30 * 24 * 60 * 60 * 1000));
    const activities = await stravaAPI.getAthleteActivities(accessToken, undefined, sixMonthsAgo);
    console.log(`📊 Found ${activities.length} activities in last 6 months`);
    
    // Test activity processing
    const found: Record<number, number> = {};
    const segmentEfforts: Array<{
      activityId: number;
      segmentId: number;
      elapsedTime: number;
      effortDate: string;
      type: string;
    }> = [];
    
    // Helper function to determine leaderboard type
    function groupFor(segId: number): 'overall'|'climbing'|'descending' {
      if (segId === MAIN) return 'overall';
      if (CLIMB.includes(segId)) return 'climbing';
      if (DESC.includes(segId)) return 'descending';
      return 'overall';
    }
    
    // Process first few activities to test
    for (const activity of activities.slice(0, 5)) {
      try {
        console.log(`🔄 Testing activity ${activity.id} (${activity.name})...`);
        
        // Get activity details with segment efforts
        const activityDetails = await stravaAPI.getActivityDetails(activity.id, accessToken);
        
        if (activityDetails.segment_efforts) {
          console.log(`📋 Activity ${activity.id} has ${activityDetails.segment_efforts.length} segment efforts`);
          
          for (const effort of activityDetails.segment_efforts) {
            const segId = Number(effort.segment?.id);
            if (!wanted.has(segId)) continue;
            
            // Count for instrumentation
            found[segId] = (found[segId] ?? 0) + 1;
            
            // Add to results
            segmentEfforts.push({
              activityId: activity.id,
              segmentId: segId,
              elapsedTime: effort.elapsed_time,
              effortDate: effort.start_date,
              type: groupFor(segId)
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
    
    return NextResponse.json({
      success: true,
      athlete: {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`
      },
      activitiesProcessed: Math.min(5, activities.length),
      totalActivities: activities.length,
      segmentsFound: found,
      segmentEfforts: segmentEfforts,
      summary: {
        overall: found[MAIN] || 0,
        climbing: (found[CLIMB[0]] || 0) + (found[CLIMB[1]] || 0),
        descending: (found[DESC[0]] || 0) + (found[DESC[1]] || 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Test sync failed:', error);
    return NextResponse.json(
      { 
        error: 'Test sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
