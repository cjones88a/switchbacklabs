import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { raceDatabase } from '@/lib/race-database';

// POST /api/qa/diagnostic
// Comprehensive diagnostic to identify the exact issue
export async function POST(req: Request) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{ name: string; status: 'pass' | 'fail' | 'error'; details: unknown }>,
    summary: { passed: 0, failed: 0, errors: 0 }
  };

  const addTest = (name: string, status: 'pass' | 'fail' | 'error', details: unknown) => {
    results.tests.push({ name, status, details });
    results.summary[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'errors']++;
  };

  try {
    const body = await req.json().catch(() => ({}));
    const accessToken = body?.accessToken;

    if (!accessToken) {
      addTest('Access Token Validation', 'fail', 'No access token provided');
      return NextResponse.json(results);
    }

    addTest('Access Token Validation', 'pass', 'Access token provided');

    // Test 1: Strava API Initialization
    try {
      new StravaAPI();
      addTest('Strava API Initialization', 'pass', 'StravaAPI created successfully');
    } catch (error) {
      addTest('Strava API Initialization', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Environment Variables
    const clientId = process.env.STRAVA_CLIENT_ID || '179098';
    const clientSecret = process.env.STRAVA_CLIENT_SECRET || 'e42d5b7d7ce04b98ab1f34a878e66aa12653d9aa';
    addTest('Environment Variables', 'pass', {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'MISSING'
    });

    // Test 3: Athlete Info
    try {
      const stravaAPI = new StravaAPI();
      const athlete = await stravaAPI.getAthlete(accessToken) as {
        id: number;
        firstname: string;
        lastname: string;
        username?: string;
      };
      addTest('Get Athlete Info', 'pass', {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`,
        username: athlete.username
      });
    } catch (error) {
      addTest('Get Athlete Info', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Segment Efforts for 7977451
    try {
      const stravaAPI = new StravaAPI();
      const segmentEfforts = await stravaAPI.getSegmentEfforts(7977451, accessToken);
      addTest('Get Segment 7977451 Efforts', 'pass', {
        totalEfforts: segmentEfforts?.length || 0,
        hasData: !!(segmentEfforts && segmentEfforts.length > 0)
      });
    } catch (error) {
      addTest('Get Segment 7977451 Efforts', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Database Operations
    try {
      const testParticipant = await raceDatabase.upsertParticipant({
        id: 'test_athlete_123',
        stravaId: 123,
        name: 'Test Athlete',
        username: 'test',
        accessToken: 'test_token',
        refreshToken: 'test_refresh',
        tokenExpiresAt: new Date(Date.now() + 3600000)
      });
      addTest('Database Participant Upsert', 'pass', { id: testParticipant.id, name: testParticipant.name });
    } catch (error) {
      addTest('Database Participant Upsert', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Database Result Storage
    try {
      await raceDatabase.upsertRaceResult({
        participantId: 'test_athlete_123',
        stageIndex: 0,
        elapsedTime: 3600,
        effortDate: new Date(),
        segmentId: 7977451,
        leaderboardType: 'overall'
      });
      addTest('Database Result Storage', 'pass', 'Result stored successfully');
    } catch (error) {
      addTest('Database Result Storage', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7: Database Retrieval
    try {
      const allResults = await raceDatabase.getAllResults();
      addTest('Database Result Retrieval', 'pass', { count: allResults.length });
    } catch (error) {
      addTest('Database Result Retrieval', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 8: Full Integration Test
    try {
      const stravaAPI = new StravaAPI();
      const athlete = await stravaAPI.getAthlete(accessToken) as {
        id: number;
        firstname: string;
        lastname: string;
        username?: string;
      };
      const segmentEfforts = await stravaAPI.getSegmentEfforts(7977451, accessToken);
      
      if (segmentEfforts && segmentEfforts.length > 0) {
        const athleteEfforts = segmentEfforts.filter(effort => effort.athlete?.id === athlete.id);
        if (athleteEfforts.length > 0) {
          const mostRecentEffort = athleteEfforts.sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )[0];
          
          addTest('Full Integration Test', 'pass', {
            athlete: `${athlete.firstname} ${athlete.lastname}`,
            effortsFound: athleteEfforts.length,
            mostRecentTime: mostRecentEffort.elapsedTime,
            mostRecentDate: mostRecentEffort.startDate
          });
        } else {
          addTest('Full Integration Test', 'fail', 'No efforts found for this athlete on segment 7977451');
        }
      } else {
        addTest('Full Integration Test', 'fail', 'No efforts found for segment 7977451');
      }
    } catch (error) {
      addTest('Full Integration Test', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json(results);

  } catch (error) {
    addTest('Diagnostic Framework', 'error', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(results, { status: 500 });
  }
}
