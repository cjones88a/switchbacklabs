-- Fix race_year calculation in DB views.
--
-- Race year label = the Spring/Summer calendar year.
-- Race Year N = (N-1)_FALL + (N-1)_WINTER + N_SPRING + N_SUMMER
--
-- Examples:
--   2025_FALL   → race_year 2026  (FALL year + 1)
--   2025_WINTER → race_year 2026  (WINTER year + 1)
--   2026_SPRING → race_year 2026  (SPRING year as-is)
--   2026_SUMMER → race_year 2026  (SUMMER year as-is)
--
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE VIEW public.individual_attempts_simple AS
  SELECT
    a.rider_id,
    CASE
      WHEN SUBSTRING(a.season_key FROM 6) IN ('FALL', 'WINTER')
        THEN (SUBSTRING(a.season_key FROM 1 FOR 4))::INT + 1
      ELSE (SUBSTRING(a.season_key FROM 1 FOR 4))::INT
    END AS race_year,
    SUBSTRING(a.season_key FROM 6) AS season_name,
    (SUBSTRING(a.season_key FROM 1 FOR 4))::INT AS season_year,
    a.activity_id,
    a.main_ms,
    a.climb_sum_ms,
    a.desc_sum_ms,
    a.created_at
  FROM public.attempts a;

CREATE OR REPLACE VIEW public.rider_yearly_times AS
  SELECT
    rider_id,
    CASE
      WHEN season_key LIKE '%_FALL' OR season_key LIKE '%_WINTER'
        THEN (SUBSTRING(season_key FROM 1 FOR 4))::INT + 1
      ELSE (SUBSTRING(season_key FROM 1 FOR 4))::INT
    END AS race_year,
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
  GROUP BY rider_id,
    CASE
      WHEN season_key LIKE '%_FALL' OR season_key LIKE '%_WINTER'
        THEN (SUBSTRING(season_key FROM 1 FOR 4))::INT + 1
      ELSE (SUBSTRING(season_key FROM 1 FOR 4))::INT
    END;
