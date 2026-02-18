import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const rider_id = cookieStore.get('RID')?.value ?? cookieStore.get('rider_id')?.value

    if (!rider_id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null

    const sb = supabaseAdmin()

    let query = sb
      .from('individual_attempts_simple')
      .select('race_year, season_name, season_year, activity_id, main_ms, climb_sum_ms, desc_sum_ms, created_at')
      .eq('rider_id', rider_id)
      .order('race_year', { ascending: false })
      .order('season_name', { ascending: true })
      .order('main_ms', { ascending: true })

    if (year) {
      query = query.eq('race_year', year)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Internal server error'
    }, { status: 500 })
  }
}
