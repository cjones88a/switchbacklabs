export const env = {
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID!,
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET!,
  STRAVA_REDIRECT_URI: process.env.STRAVA_REDIRECT_URI!,
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE!,
  NEXT_PUBLIC_SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON!,
  APP_TZ: process.env.APP_TZ || 'America/Denver',
  SEGMENTS: {
    main: Number(process.env.MAIN_SEGMENT_ID!),
    c1: Number(process.env.CLIMB_1!),
    c2: Number(process.env.CLIMB_2!),
    d1: Number(process.env.DESC_1!),
    d2: Number(process.env.DESC_2!),
    d3: Number(process.env.DESC_3!),
  },
};
