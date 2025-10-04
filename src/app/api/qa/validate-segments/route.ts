import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/qa/validate-segments?accessToken=xxx
// QA endpoint to validate Colt Jones segment times against actual Strava data
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [QA] Segment validation started');
    
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required for QA validation' },
        { status: 401 }
      );
    }

    const stravaAPI = new StravaAPI();
    
    // Get athlete info
    const athlete = await stravaAPI.getAthlete(accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
    };
    
    console.log('✅ QA: Athlete info fetched:', { id: athlete.id, name: `${athlete.firstname} ${athlete.lastname}` });
    
    // Define segments to validate
    const segmentsToValidate = [
      { id: 7977451, name: 'Overall Loop', type: 'overall' },
      { id: 9589287, name: 'Climbing Segment 1', type: 'climbing' },
      { id: 18229887, name: 'Climbing Segment 2', type: 'climbing' },
      { id: 2105607, name: 'Descending Segment 1', type: 'descending' },
      { id: 1359027, name: 'Descending Segment 2', type: 'descending' }
    ];
    
    const validationResults = [];
    
    for (const segment of segmentsToValidate) {
      try {
        console.log(`🔄 QA: Fetching segment ${segment.id} (${segment.name})...`);
        
        const segmentEfforts = await stravaAPI.getSegmentEfforts(segment.id, accessToken);
        
        // Filter for current athlete and get most recent effort
        const athleteEfforts = segmentEfforts
          .filter(effort => effort.athlete?.id === athlete.id)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
        const mostRecentEffort = athleteEfforts[0];
        
        if (mostRecentEffort) {
          // Get activity details
          const activity = await stravaAPI.getActivity(mostRecentEffort.activityId, accessToken);
          
          validationResults.push({
            segmentId: segment.id,
            segmentName: segment.name,
            segmentType: segment.type,
            actualTime: mostRecentEffort.elapsedTime,
            actualTimeFormatted: formatTime(mostRecentEffort.elapsedTime),
            activityId: activity.id,
            activityName: activity.name,
            activityDate: activity.startDate,
            prRank: mostRecentEffort.prRank,
            totalEfforts: athleteEfforts.length
          });
          
          console.log(`✅ QA: Segment ${segment.id} - ${formatTime(mostRecentEffort.elapsedTime)}`);
        } else {
          validationResults.push({
            segmentId: segment.id,
            segmentName: segment.name,
            segmentType: segment.type,
            actualTime: null,
            actualTimeFormatted: 'No effort found',
            error: 'No efforts found for this athlete on this segment'
          });
          
          console.log(`❌ QA: Segment ${segment.id} - No effort found`);
        }
        
      } catch (error) {
        console.error(`❌ QA: Error fetching segment ${segment.id}:`, error);
        validationResults.push({
          segmentId: segment.id,
          segmentName: segment.name,
          segmentType: segment.type,
          actualTime: null,
          actualTimeFormatted: 'Error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Calculate totals for climbing and descending
    const climbingSegments = validationResults.filter(r => r.segmentType === 'climbing' && r.actualTime);
    const descendingSegments = validationResults.filter(r => r.segmentType === 'descending' && r.actualTime);
    
    const climbingTotal = climbingSegments.reduce((sum, seg) => sum + (seg.actualTime || 0), 0);
    const descendingTotal = descendingSegments.reduce((sum, seg) => sum + (seg.actualTime || 0), 0);
    
    const qaReport = {
      athlete: {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`
      },
      validationTimestamp: new Date().toISOString(),
      segments: validationResults,
      totals: {
        climbing: {
          totalTime: climbingTotal,
          totalTimeFormatted: formatTime(climbingTotal),
          segments: climbingSegments.length
        },
        descending: {
          totalTime: descendingTotal,
          totalTimeFormatted: formatTime(descendingTotal),
          segments: descendingSegments.length
        }
      },
      summary: {
        overallLoop: validationResults.find(r => r.segmentId === 7977451),
        climbingTotal: formatTime(climbingTotal),
        descendingTotal: formatTime(descendingTotal)
      }
    };
    
    console.log('✅ QA: Validation complete');
    return NextResponse.json(qaReport);
    
  } catch (error) {
    console.error('❌ QA: Validation failed:', error);
    return NextResponse.json(
      { 
        error: 'QA validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
