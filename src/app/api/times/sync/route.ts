import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// POST /api/times/sync
// Exchange Strava code for token, fetch segment efforts, and upsert to database
export async function POST(req: Request) {
  try {
    console.log('🔄 Times sync API called');
    
    const body = await req.json().catch(() => ({}));
    console.log('📋 Request body:', { hasCode: !!body?.code });
    
    if (!body?.code) {
      console.error('❌ Missing authorization code in sync request');
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const stravaAPI = new StravaAPI();
    const redirectUri = process.env.STRAVA_REDIRECT_URI!;
    
    console.log('🔧 Environment check:', { 
      redirectUri: redirectUri ? 'present' : 'missing' 
    });

    if (!redirectUri) {
      console.error('❌ STRAVA_REDIRECT_URI not configured');
      return NextResponse.json({ error: 'Redirect URI not configured' }, { status: 500 });
    }

    console.log('🔄 Exchanging code for tokens...');
    // Exchange code for tokens
    const tokenData = await stravaAPI.exchangeCodeForToken(body.code, redirectUri);
    console.log('✅ Token exchange successful');
    
    // Get athlete information
    const athlete = await stravaAPI.getAthlete(tokenData.accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      username?: string;
    };

    // For now, we'll mock the segment efforts since we don't have the real segments configured
    // In production, you would fetch actual segment efforts for each stage
    const mockEfforts = [
      { stageIndex: 0, elapsedTime: 3600 + 1200, effortDate: new Date().toISOString() }, // 1:20:00
      { stageIndex: 1, elapsedTime: 3600 + 1800, effortDate: new Date().toISOString() }, // 1:30:00
      { stageIndex: 2, elapsedTime: 3600 + 900, effortDate: new Date().toISOString() },  // 1:15:00
    ];

    // Mock participant data - in production this would be stored in database
    const participant = {
      id: `athlete_${athlete.id}`,
      stravaId: athlete.id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      username: athlete.username || '',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresAt,
      efforts: mockEfforts,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In production, you would:
    // 1. Upsert participant to database
    // 2. Upsert efforts to database
    // 3. Calculate scores (best 3, bonus, final)
    
    console.log('Mock participant created:', {
      id: participant.id,
      name: participant.name,
      effortsCount: participant.efforts.length
    });

    return NextResponse.json({ 
      ok: true, 
      participant: {
        id: participant.id,
        name: participant.name,
        effortsCount: participant.efforts.length
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync times',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
