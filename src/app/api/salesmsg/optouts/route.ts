import { NextResponse } from 'next/server';
import { getOptOutStats, countStopOptOuts } from '@/lib/salesmsg';

/**
 * GET /api/salesmsg/optouts
 * 
 * Returns statistics about contacts who have opted out of text messages,
 * specifically those who replied "STOP"
 * 
 * Query parameters:
 * - countOnly: if true, returns only the count (default: false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const count = await countStopOptOuts();
      return NextResponse.json({ count });
    }

    const stats = await getOptOutStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching opt-out stats:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch opt-out statistics',
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}

