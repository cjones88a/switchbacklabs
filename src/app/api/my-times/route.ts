import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSb } from "@/lib/seasons";

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[my-times] Starting GET request');
  
  const cookieStore = await cookies();
  const rider_id = cookieStore.get('rider_id')?.value;
  if (!rider_id) {
    console.log('[my-times] No rider_id found in cookies');
    return NextResponse.json({ ok: false, error: 'no_rider' }, { status: 401 });
  }

  console.log(`[my-times] Processing rider: ${rider_id}`);

  const sb = adminSb();
  
  try {
    const { data, error } = await sb
      .from('rider_yearly_times')
      .select('race_year, fall_ms, winter_ms, spring_ms, summer_ms')
      .eq('rider_id', rider_id)
      .order('race_year', { ascending: false });

    if (error) {
      console.error('[my-times] Database error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log(`[my-times] Found ${data?.length || 0} yearly time records`);
    return NextResponse.json({ ok: true, items: data || [] });

  } catch (error) {
    console.error('[my-times] Unexpected error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
