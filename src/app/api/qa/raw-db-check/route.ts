import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Get raw data from database
    const { data: efforts, error } = await supabase
      .from('efforts')
      .select('*')
      .order('effort_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by leaderboard_type
    const byType: Record<string, number> = {};
    const bySegment: Record<number, number> = {};
    
    for (const effort of efforts || []) {
      byType[effort.leaderboard_type] = (byType[effort.leaderboard_type] || 0) + 1;
      bySegment[effort.segment_id] = (bySegment[effort.segment_id] || 0) + 1;
    }

    return NextResponse.json({
      totalEfforts: efforts?.length || 0,
      byLeaderboardType: byType,
      bySegmentId: bySegment,
      rawEfforts: efforts?.map(e => ({
        id: e.id,
        participant_id: e.participant_id,
        segment_id: e.segment_id,
        leaderboard_type: e.leaderboard_type,
        stage_index: e.stage_index,
        elapsed_time: e.elapsed_time,
        effort_date: e.effort_date
      })) || []
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
