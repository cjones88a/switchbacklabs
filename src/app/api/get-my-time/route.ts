import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// POST /api/get-my-time
// Simple endpoint to get just one segment time for the authenticated user
export async function POST(req: Request) {
  try {
    console.log('🔄 Getting my time for segment 7977451...');
    
    const body = await req.json().catch(() => ({}));
    const accessToken = body?.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access token required' 
      }, { status: 400 });
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

    // Get segment efforts for segment 7977451 (Overall Loop)
    console.log('🔄 Fetching segment 7977451 efforts...');
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

    // Format time
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved segment time',
      athlete: {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`
      },
      segment: {
        id: 7977451,
        name: 'Four Seasons of Horsetooth Challenge'
      },
      effort: {
        elapsedTime: mostRecentEffort.elapsedTime,
        formattedTime: formatTime(mostRecentEffort.elapsedTime),
        startDate: mostRecentEffort.startDate,
        prRank: mostRecentEffort.prRank
      }
    });

  } catch (error) {
    console.error('💥 Get my time error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
