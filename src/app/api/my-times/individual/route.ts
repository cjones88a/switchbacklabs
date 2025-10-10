import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const rider_id = cookieStore.get('rider_id')?.value
    
    if (!rider_id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sb = supabaseAdmin()

    // Get individual attempts with climb/descent details
    console.log(`[individual] Fetching attempts for rider: ${rider_id}`)
    
    // First, let's check what rider_ids exist
    const { data: allRiders } = await sb
      .from('attempts')
      .select('rider_id')
      .limit(5)
    console.log(`[individual] Available rider_ids:`, allRiders)
    
    const { data, error } = await sb
      .from('individual_attempts_simple')
      .select(`
        race_year,
        season_name,
        season_year,
        activity_id,
        main_ms,
        climb_sum_ms,
        desc_sum_ms,
        created_at
      `)
      .eq('rider_id', rider_id)
      .order('race_year', { ascending: false })
      .order('season_name', { ascending: true })
      .order('main_ms', { ascending: true })
    
    console.log(`[individual] Query result:`, { data: data?.length || 0, error })

    if (error) {
      console.error('Error fetching individual attempts:', error)
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: unknown) {
    console.error('Error in individual attempts API:', err)
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Internal server error' 
    }, { status: 500 })
  }
}
