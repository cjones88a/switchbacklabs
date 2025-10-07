import { getSupabaseAdmin } from "./supabase";

export type SeasonWindow = { start_at: string; end_at: string };

export async function getWindowsForSeason(season_key: string): Promise<SeasonWindow[]> {
  const supabase = getSupabaseAdmin();
  const [base, overrides] = await Promise.all([
    supabase.from("season_windows").select("start_at, end_at").eq("season_key", season_key).maybeSingle(),
    supabase.from("season_overrides").select("start_at, end_at").eq("season_key", season_key),
  ]);

  const out: SeasonWindow[] = [];
  if (base.data) out.push(base.data as SeasonWindow);
  if (overrides.data) out.push(...(overrides.data as SeasonWindow[]));
  return out;
}
