// src/lib/seasons.ts
import 'server-only';
import { createClient as createServerClient } from '@supabase/supabase-js';

export function adminSb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  return createServerClient(url, key, { auth: { persistSession: false } });
}

export async function seasonKeyFor(dateIso: string) {
  const sb = adminSb();
  const d = new Date(dateIso).toISOString();
  const { data, error } = await sb
    .from('season_windows')
    .select('season_key, start_at, end_at')
    .lte('start_at', d)
    .gte('end_at', d)
    .maybeSingle();
  if (error) throw error;
  return data?.season_key ?? null;
}

export function raceYearFromSeasonKey(seasonKey: string): number {
  // Race Year N = (N-1)_FALL + (N-1)_WINTER + N_SPRING + N_SUMMER
  // FALL/WINTER calendar year N → race year N+1
  // SPRING/SUMMER calendar year N → race year N
  const calYear = Number(seasonKey.slice(0, 4));
  const season = seasonKey.slice(5); // 'FALL', 'WINTER', 'SPRING', 'SUMMER'
  return (season === 'FALL' || season === 'WINTER') ? calYear + 1 : calYear;
}
