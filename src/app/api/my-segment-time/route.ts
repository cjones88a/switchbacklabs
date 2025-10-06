import { NextResponse } from 'next/server';
import { raceDatabase } from '@/lib/race-database';

// POST /api/my-segment-time
// Absolute simplest endpoint to get segment time
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = body.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    // Get athlete info
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!athleteResponse.ok) {
      if (athleteResponse.status === 429) {
        const retryAfter = athleteResponse.headers.get('Retry-After') || '900'; // 15 min default
        return NextResponse.json({
          error: 'Rate limit exceeded',
          retryAfter: parseInt(retryAfter),
          message: `Strava API rate limit exceeded. Please try again in ${Math.ceil(parseInt(retryAfter) / 60)} minutes.`
        }, { status: 429 });
      }
      return NextResponse.json({ 
        error: `Athlete API failed: ${athleteResponse.status}` 
      }, { status: athleteResponse.status });
    }
    
    const athlete = await athleteResponse.json();
    console.log('Athlete:', athlete.firstname, athlete.lastname);

    // Get segment efforts for segment 7977451
    const segmentId = 7977451;
    const segmentResponse = await fetch(
      `https://www.strava.com/api/v3/segments/${segmentId}/all_efforts?per_page=10`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!segmentResponse.ok) {
      if (segmentResponse.status === 429) {
        const retryAfter = segmentResponse.headers.get('Retry-After') || '900'; // 15 min default
        return NextResponse.json({
          error: 'Rate limit exceeded',
          retryAfter: parseInt(retryAfter),
          message: `Strava API rate limit exceeded. Please try again in ${Math.ceil(parseInt(retryAfter) / 60)} minutes.`
        }, { status: 429 });
      }
      return NextResponse.json({ 
        error: `Segment API failed: ${segmentResponse.status}` 
      }, { status: segmentResponse.status });
    }
    
    const efforts = await segmentResponse.json();
    console.log('Total efforts found:', efforts.length);

    // Filter for this athlete
    const myEfforts = efforts.filter((effort: { athlete: { id: number } }) => effort.athlete.id === athlete.id);
    console.log('My efforts found:', myEfforts.length);

    if (myEfforts.length === 0) {
      return NextResponse.json({ 
        error: 'No efforts found for this athlete on segment 7977451' 
      });
    }

    // Get most recent effort
    const mostRecent = myEfforts.sort((a: { start_date: string }, b: { start_date: string }) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )[0];

    // Format time
    const seconds = mostRecent.elapsed_time;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedTime = hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

    // Persist to DB so leaderboards can populate (overall loop only)
    try {
      // Map date to season index (0..3)
      const dt = new Date(mostRecent.start_date);
      const m = dt.getUTCMonth(); // 0=Jan
      const stageIndex = (m >= 8 && m <= 10) ? 0 // Sep-Nov: Fall
                        : (m === 11 || m <= 1) ? 1 // Dec-Feb: Winter
                        : (m >= 2 && m <= 4) ? 2   // Mar-May: Spring
                        : 3;                       // Jun-Aug: Summer

      await raceDatabase.upsertParticipant({
        id: `athlete_${athlete.id}`,
        stravaId: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`,
        username: athlete.username || '',
        accessToken,
        refreshToken: '',
        tokenExpiresAt: new Date(Date.now() + 6*60*60*1000)
      });

      await raceDatabase.upsertRaceResult({
        participantId: `athlete_${athlete.id}`,
        stageIndex,
        elapsedTime: seconds,
        effortDate: new Date(mostRecent.start_date),
        segmentId: segmentId,
        prRank: mostRecent.pr_rank ?? undefined,
        leaderboardType: 'overall'
      });
    } catch (e) {
      console.error('DB upsert failed (non-fatal):', e);
    }

    return NextResponse.json({
      success: true,
      athlete: `${athlete.firstname} ${athlete.lastname}`,
      segment: 'Four Seasons of Horsetooth Challenge (7977451)',
      time: formattedTime,
      seconds: seconds,
      date: mostRecent.start_date,
      prRank: mostRecent.pr_rank
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
