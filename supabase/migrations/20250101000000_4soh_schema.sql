-- 4SOH Race Tracker – Supabase schema
-- Run this in the SQL Editor of your new Supabase project.

-- =============================================================================
-- RIDERS (Strava athletes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_athlete_id BIGINT NOT NULL UNIQUE,
  firstname TEXT,
  lastname TEXT,
  profile TEXT,
  consent_public BOOLEAN DEFAULT false,
  consent_public_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riders_strava_athlete_id ON public.riders(strava_athlete_id);

-- =============================================================================
-- OAUTH TOKENS (one per rider for Strava API)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  rider_id UUID NOT NULL PRIMARY KEY REFERENCES public.riders(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ATTEMPTS (best time per rider per season; used by record + leaderboard)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.attempts (
  rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  season_key TEXT NOT NULL,
  activity_id BIGINT NOT NULL,
  main_ms BIGINT NOT NULL,
  climb_sum_ms BIGINT,
  desc_sum_ms BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (rider_id, season_key)
);

CREATE INDEX IF NOT EXISTS idx_attempts_season_key ON public.attempts(season_key);
CREATE INDEX IF NOT EXISTS idx_attempts_rider_id ON public.attempts(rider_id);

-- =============================================================================
-- SEASON WINDOWS (base window per season, e.g. 2025_FALL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.season_windows (
  season_key TEXT NOT NULL PRIMARY KEY,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT season_windows_dates CHECK (end_at > start_at)
);

-- =============================================================================
-- SEASON OVERRIDES (extra windows for the same season, e.g. make-up dates)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.season_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_key TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT season_overrides_dates CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_season_overrides_season_key ON public.season_overrides(season_key);

-- =============================================================================
-- VIEW: Effective windows (base + overrides) for a season
-- =============================================================================
CREATE OR REPLACE VIEW public.season_effective_windows AS
  SELECT season_key, start_at, end_at, 'base'::TEXT AS source, NULL::UUID AS override_id
  FROM public.season_windows
  UNION ALL
  SELECT season_key, start_at, end_at, 'override'::TEXT AS source, id AS override_id
  FROM public.season_overrides;

-- =============================================================================
-- VIEW: Individual attempts with race year and season name (for my-times UI)
-- =============================================================================
CREATE OR REPLACE VIEW public.individual_attempts_simple AS
  SELECT
    a.rider_id,
    (SUBSTRING(a.season_key FROM 1 FOR 4))::INT AS race_year,
    SUBSTRING(a.season_key FROM 6) AS season_name,
    (SUBSTRING(a.season_key FROM 1 FOR 4))::INT AS season_year,
    a.activity_id,
    a.main_ms,
    a.climb_sum_ms,
    a.desc_sum_ms,
    a.created_at
  FROM public.attempts a;

-- =============================================================================
-- VIEW: Rider yearly aggregates (for my-times summary)
-- =============================================================================
CREATE OR REPLACE VIEW public.rider_yearly_times AS
  SELECT
    rider_id,
    (SUBSTRING(season_key FROM 1 FOR 4))::INT AS race_year,
    MAX(CASE WHEN season_key LIKE '%_FALL'   THEN main_ms END) AS fall_ms,
    MAX(CASE WHEN season_key LIKE '%_WINTER' THEN main_ms END) AS winter_ms,
    MAX(CASE WHEN season_key LIKE '%_SPRING' THEN main_ms END) AS spring_ms,
    MAX(CASE WHEN season_key LIKE '%_SUMMER' THEN main_ms END) AS summer_ms,
    SUM(main_ms) AS total_ms,
    MAX(CASE WHEN season_key LIKE '%_FALL'   THEN climb_sum_ms END) AS fall_climb_ms,
    MAX(CASE WHEN season_key LIKE '%_WINTER' THEN climb_sum_ms END) AS winter_climb_ms,
    MAX(CASE WHEN season_key LIKE '%_SPRING' THEN climb_sum_ms END) AS spring_climb_ms,
    MAX(CASE WHEN season_key LIKE '%_SUMMER' THEN climb_sum_ms END) AS summer_climb_ms,
    SUM(climb_sum_ms) AS total_climb_ms,
    MAX(CASE WHEN season_key LIKE '%_FALL'   THEN desc_sum_ms END) AS fall_desc_ms,
    MAX(CASE WHEN season_key LIKE '%_WINTER' THEN desc_sum_ms END) AS winter_desc_ms,
    MAX(CASE WHEN season_key LIKE '%_SPRING' THEN desc_sum_ms END) AS spring_desc_ms,
    MAX(CASE WHEN season_key LIKE '%_SUMMER' THEN desc_sum_ms END) AS summer_desc_ms,
    SUM(desc_sum_ms) AS total_desc_ms
  FROM public.attempts
  GROUP BY rider_id, (SUBSTRING(season_key FROM 1 FOR 4))::INT;

-- =============================================================================
-- RLS (optional: enable if you use anon key from client)
-- =============================================================================
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_overrides ENABLE ROW LEVEL SECURITY;

-- Policy: service role bypasses RLS. For anon/authenticated, allow read on public data.
CREATE POLICY "Allow read attempts" ON public.attempts FOR SELECT USING (true);
CREATE POLICY "Allow read riders" ON public.riders FOR SELECT USING (true);
CREATE POLICY "Allow read season_windows" ON public.season_windows FOR SELECT USING (true);
CREATE POLICY "Allow read season_overrides" ON public.season_overrides FOR SELECT USING (true);

-- Service role (used by the app) bypasses RLS. These policies only affect anon/authenticated.
-- Restrict writes to service role by not defining INSERT/UPDATE/DELETE for anon.

-- =============================================================================
-- SEED: Example season windows (edit dates for your race calendar)
-- Run in SQL Editor after migration, or add more INSERTs here.
-- =============================================================================
-- Example for 2025 (FALL/WINTER/SPRING/SUMMER). Adjust start_at/end_at to your windows.
INSERT INTO public.season_windows (season_key, start_at, end_at) VALUES
  ('2025_FALL',   '2025-09-01T00:00:00Z', '2025-11-30T23:59:59Z'),
  ('2025_WINTER', '2025-12-01T00:00:00Z', '2026-02-28T23:59:59Z'),
  ('2026_SPRING', '2026-03-01T00:00:00Z', '2026-05-31T23:59:59Z'),
  ('2026_SUMMER', '2026-06-01T00:00:00Z', '2026-08-31T23:59:59Z')
ON CONFLICT (season_key) DO NOTHING;
