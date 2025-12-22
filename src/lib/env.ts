export const env = {
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID || '',
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || '',
  STRAVA_REDIRECT_URI: process.env.STRAVA_REDIRECT_URI || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE || '',
  NEXT_PUBLIC_SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON || '',
  APP_TZ: process.env.APP_TZ || 'America/Denver',
  SALESMSG_API_KEY: process.env.SALESMSG_API_KEY || '',
  SALESMSG_API_URL: process.env.SALESMSG_API_URL || 'https://api.salesmsg.com/v1',
  SEGMENTS: {
    main: Number(process.env.MAIN_SEGMENT_ID || '7977451'),
    c1: Number(process.env.CLIMB_1 || '9589287'),
    c2: Number(process.env.CLIMB_2 || '18229887'),
    d1: Number(process.env.DESC_1 || '21056071'),
    d2: Number(process.env.DESC_2 || '19057702'),
    d3: Number(process.env.DESC_3 || '13590275'),
  },
};
