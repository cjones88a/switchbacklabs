# PedalHub

Cycling command center at **switchbacklabsco.com/pedalhub**.

## Phase 1 (current)

- **Dashboard** — stats by discipline (miles, elevation, speed, calories, ride count); recent rides
- **Ride Log** — list, manual add (stub), **GPX import** (client-side parse)
- **Routes** — Fort Collins area routes by discipline; “Navigate” opens map with route
- **Ride (Navigate)** — **Mapbox map**, user location, route line; select route to see it on map
- **Weather** — mock 7-day ride score; Phase 2: real API
- **Toolkit** — tire pressure calculator (weight, tire width, tubeless)

## Env

For real maps, add to `.env.local`:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
```

Get a token at [mapbox.com](https://account.mapbox.com/). Without it, the map area shows a placeholder message.

## Data & auth

- Phase 1: all state is client-side (React state + optional `localStorage`). No backend required.
- **Auth-ready**: types include optional `userId`; Supabase schema is in `supabase/migrations/20260306000000_pedalhub_schema.sql` with standalone tables `pedalhub_rides`, `pedalhub_bikes`, `pedalhub_components`. RLS is commented out until auth is enabled.

## Repo

App lives in the **switchbacklabs** repo. The separate **cyclinghub** GitHub repo was renamed to **pedalhub** for reference; this app is deployed as part of the main site at `/pedalhub`.
