# 4SOH Race Tracker – New Supabase Project Setup

Your previous Supabase project was paused. Follow these steps to use a **new** project and point the 4SOH tracker at it.

---

## 1. Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your org, name the project (e.g. `switchback-4soh`), set a database password, and pick a region.
4. Wait for the project to finish provisioning.

---

## 2. Run the schema migration

1. In the new project, open **SQL Editor**.
2. Copy the contents of **`supabase/migrations/20250101000000_4soh_schema.sql`**.
3. Paste into a new query and click **Run**.
4. Confirm there are no errors. This creates:
   - **Tables:** `riders`, `oauth_tokens`, `attempts`, `season_windows`, `season_overrides`
   - **Views:** `season_effective_windows`, `individual_attempts_simple`, `rider_yearly_times`
   - **RLS** (row level security) and read-only policies for anon.

---

## 3. Get your project credentials

1. In the Supabase dashboard, go to **Project Settings** (gear) → **API**.
2. Note:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON` if you use it)
   - **service_role** key (for server-side writes; keep this secret)

---

## 4. Set environment variables

In your app (Vercel, `.env.local`, or wherever you run the app), set:

```bash
# Required for 4SOH tracker
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key_here

# Optional (for client-side Supabase if you add it later)
NEXT_PUBLIC_SUPABASE_ANON=your_anon_key_here
```

**Important:** Use the **new** project URL and **new** `service_role` key. Do not reuse keys from the paused project.

---

## 5. (Optional) Seed season windows

The migration inserts example 2025/2026 season windows. To change them or add more:

1. **SQL Editor** → run something like:

```sql
-- Replace or add season windows (season_key format: YYYY_FALL | YYYY_WINTER | YYYY_SPRING | YYYY_SUMMER)
INSERT INTO public.season_windows (season_key, start_at, end_at) VALUES
  ('2026_FALL', '2026-09-01T00:00:00Z', '2026-11-30T23:59:59Z')
ON CONFLICT (season_key) DO UPDATE SET start_at = EXCLUDED.start_at, end_at = EXCLUDED.end_at;
```

2. Or use the **admin API** (with `ADMIN_API_KEY` and `x-admin-key` header) to create/update base windows and overrides.

---

## 6. Backfill / “My Times” note

- **Record flow** (Strava connect → record attempt): uses `attempts` with one row per `(rider_id, season_key)`. This matches the migration.
- **Backfill API** (`/api/my-times/backfill`) in the codebase uses `onConflict: 'rider_id,activity_id'`. The current schema has a single unique on `(rider_id, season_key)`. So:
  - Either run backfill only when you’re okay replacing the best time per season (e.g. delete then re-backfill), or
  - Adjust the backfill logic to work with `(rider_id, season_key)` (e.g. fetch current best, then upsert only if the new effort is better).

---

## 7. Verify

1. Deploy or run the app with the new env vars.
2. Open the 4SOH tracker, connect with Strava, and record an effort (or use the record API).
3. Check **Leaderboard** and **My Times** to confirm data is read correctly.
4. Optional: call `/api/debug/season-windows` (or your debug route) to confirm DB connection and tables.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create new Supabase project at supabase.com |
| 2 | Run `supabase/migrations/20250101000000_4soh_schema.sql` in SQL Editor |
| 3 | Copy Project URL and service_role key from Project Settings → API |
| 4 | Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in your app env |
| 5 | (Optional) Adjust season windows via SQL or admin API |
| 6 | Deploy and test Strava connect + record + leaderboard |

You cannot “unpause” a project that’s been paused 90+ days; creating a new project and re-running this schema is the supported path.
