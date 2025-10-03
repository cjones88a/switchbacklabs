# 4SOH Race Tracker Setup Guide

This guide will help you set up the automated race tracking system that integrates with Strava segments.

## Prerequisites

1. **Strava API Access**
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Create a new application
   - Note your Client ID and Client Secret

2. **Supabase Database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Note your project URL and API keys

## Setup Steps

### 1. Environment Configuration

Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Strava API Configuration
STRAVA_CLIENT_ID=your_actual_client_id
STRAVA_CLIENT_SECRET=your_actual_client_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://switchbacklabsco.com
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://switchbacklabsco.com

# Race Configuration
RACE_BONUS_MINUTES=10
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL script to create all tables and policies

### 3. Strava Application Configuration

In your Strava API application settings, set:
- **Authorization Callback Domain**: `switchbacklabsco.com`
- **Website**: `https://switchbacklabsco.com`
- **Application Description**: `4SOH Race Tracker - Automated race time tracking`

### 4. Update Race Stages

Edit the race stages in your Supabase database:

1. Go to Table Editor → `race_stages`
2. Update the `strava_segment_id` values with actual Strava segment IDs
3. Update the `start_date` and `end_date` for each stage
4. Ensure `is_active` is set to `true` for active stages

### 5. Deploy to Production

The application is already deployed to Vercel and will automatically update when you push changes to GitHub.

## How It Works

### Participant Flow
1. Athletes visit `/race-tracker` and click "Connect Strava Account"
2. They authorize the app to access their Strava data
3. Their account is created/updated in the database
4. When they complete race segments, times are automatically tracked

### Automatic Time Tracking
- The system periodically checks Strava for new segment efforts
- Only activities completed during official race dates are counted
- The best time for each stage is automatically recorded
- Results appear on the leaderboard in real-time

### Scoring System
- Each stage shows individual leaderboards
- Overall leaderboard combines all stages
- 10-minute bonus is automatically applied for completing all 4 stages
- Results are sorted by total time (including bonus)

## API Endpoints

- `GET /api/strava/initiate` - Start Strava OAuth flow
- `GET /api/strava/auth` - Handle Strava OAuth callback
- `GET /api/leaderboard` - Get leaderboard data
  - Query params: `stageId` (optional), `includeBonus` (boolean)

## Database Tables

- `participants` - Strava user data and tokens
- `race_config` - Race configuration and bonus rules
- `race_stages` - Individual race stages with Strava segment IDs
- `race_results` - Recorded race times and validation status

## Next Steps

1. **Set up automated data sync** - Create a cron job or webhook to periodically fetch new Strava activities
2. **Add notifications** - Send email/push notifications when times are recorded
3. **Enhanced analytics** - Add year-over-year comparisons and detailed statistics
4. **Mobile app** - Consider building a mobile app for better participant experience

## Troubleshooting

### Common Issues

1. **Strava authentication fails**
   - Check that your callback URL matches exactly
   - Verify Client ID and Secret are correct
   - Ensure the app has proper permissions

2. **Times not appearing**
   - Verify segment IDs are correct
   - Check that activities are public or visible to followers
   - Ensure activities are within the race date range

3. **Database connection issues**
   - Verify Supabase credentials
   - Check that RLS policies are properly configured
   - Ensure service role key has proper permissions

### Support

For technical support or questions, contact the development team or check the project documentation.
