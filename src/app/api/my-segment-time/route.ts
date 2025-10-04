import { NextResponse } from 'next/server';

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
      return NextResponse.json({ 
        error: `Athlete API failed: ${athleteResponse.status}` 
      }, { status: athleteResponse.status });
    }
    
    const athlete = await athleteResponse.json();
    console.log('Athlete:', athlete.firstname, athlete.lastname);

    // Get segment efforts for segment 7977451
    const segmentResponse = await fetch(
      `https://www.strava.com/api/v3/segments/7977451/all_efforts?per_page=10`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!segmentResponse.ok) {
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
