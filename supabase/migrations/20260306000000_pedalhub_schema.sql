-- PedalHub — standalone schema (auth-ready).
-- Separate from 4SOH; run in same Supabase project or a dedicated one.
-- When auth is added: link tables via user_id (e.g. auth.uid()).

-- =============================================================================
-- USERS (optional; use auth.users when Supabase Auth is enabled)
-- =============================================================================
-- When using Supabase Auth, rides/bikes reference auth.uid() and this table
-- can be omitted or used as profile extension.

-- =============================================================================
-- RIDES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pedalhub_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL CHECK (discipline IN ('mountain', 'road', 'gravel')),
  date DATE NOT NULL,
  distance_mi NUMERIC(8,2) NOT NULL,
  elevation_ft INT NOT NULL,
  duration_interval INTERVAL,
  duration_text TEXT,
  avg_speed_mph NUMERIC(6,2),
  heart_rate_avg INT,
  calories INT,
  notes TEXT,
  rating SMALLINT CHECK (rating >= 0 AND rating <= 5),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'gpx', 'strava', 'garmin', 'wahoo')),
  raw_gpx TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedalhub_rides_user_id ON public.pedalhub_rides(user_id);
CREATE INDEX IF NOT EXISTS idx_pedalhub_rides_discipline ON public.pedalhub_rides(discipline);
CREATE INDEX IF NOT EXISTS idx_pedalhub_rides_date ON public.pedalhub_rides(date DESC);

-- =============================================================================
-- BIKES (auth-ready)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pedalhub_bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL CHECK (discipline IN ('mountain', 'road', 'gravel')),
  year SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedalhub_bikes_user_id ON public.pedalhub_bikes(user_id);

-- =============================================================================
-- COMPONENTS (gear wear per bike)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pedalhub_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES public.pedalhub_bikes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  life_miles NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_miles NUMERIC(10,2) NOT NULL,
  last_service_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedalhub_components_bike_id ON public.pedalhub_components(bike_id);

-- =============================================================================
-- RLS (enable when auth is on)
-- =============================================================================
-- ALTER TABLE public.pedalhub_rides ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pedalhub_bikes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pedalhub_components ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY pedalhub_rides_user ON public.pedalhub_rides
--   FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY pedalhub_bikes_user ON public.pedalhub_bikes
--   FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY pedalhub_components_via_bike ON public.pedalhub_components
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM public.pedalhub_bikes b WHERE b.id = bike_id AND b.user_id = auth.uid())
--   );
