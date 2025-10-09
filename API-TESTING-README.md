# Strava API Testing Guide

This guide helps you test the Strava APIs directly to debug why historical data isn't being populated.

## Quick Setup

### 1. Get Your Access Token

1. Go to your race tracker page: `https://your-domain.vercel.app/race-trackingV2`
2. Open browser dev tools (F12)
3. Go to Network tab
4. Click "Connect with Strava" and complete OAuth
5. Look for any API call to `strava.com/api/v3/`
6. In the request headers, copy the `Authorization: Bearer YOUR_TOKEN_HERE`

### 2. Get Your Rider ID

1. In the same browser dev tools
2. Go to Application tab → Cookies
3. Find the `rider_id` cookie value
4. Copy this value

### 3. Test Methods

Choose one of these methods:

## Method 1: Postman Collection

1. Import `postman-strava-test.json` into Postman
2. Update the variables:
   - `access_token`: Your token from step 1
   - `base_url`: `https://www.strava.com/api/v3`
   - `segment_id`: `7977451`
3. Run the requests in order
4. Pay special attention to "Get Historical Segment Efforts (2014-2025)"

## Method 2: Curl Script

1. Update `test-strava-api.sh` with your access token
2. Run: `chmod +x test-strava-api.sh && ./test-strava-api.sh`
3. Check if you get data from the historical efforts call

## Method 3: Node.js Script

1. Install node-fetch: `npm install node-fetch`
2. Update `test-my-times-api.js` with your values:
   - `accessToken`: Your token from step 1
   - `riderId`: Your rider ID from step 2
   - `domain`: Your actual Vercel domain
3. Run: `node test-my-times-api.js`

## What to Look For

### ✅ Success Indicators
- Token validity test returns your name
- Historical efforts call returns an array of efforts
- Each effort has `elapsed_time`, `start_date`, and `activity.id`

### ❌ Failure Indicators
- 401 Unauthorized: Token is invalid/expired
- 403 Forbidden: Missing `activity:read_all` scope
- Empty array: No efforts found for this segment
- 429 Too Many Requests: Rate limited

## Common Issues

### 1. Token Expired
- Re-authenticate with Strava
- Get a fresh token

### 2. Missing Scope
- Ensure OAuth includes `activity:read_all` scope
- Re-authenticate if needed

### 3. No Historical Data
- Check if you actually have efforts on segment 7977451
- Try a different segment ID you know you have data for
- Check date ranges

### 4. Rate Limiting
- Strava has rate limits (100 requests per 15 minutes)
- Wait and try again

## Debugging Our API

If Strava API works but our my-times API fails:

1. Check Vercel function logs
2. Look for our debug logs we added:
   - `[my-times] Fetching efforts for segment...`
   - `[strava] Fetching segment efforts...`
   - `[my-times] Found X total efforts`
   - `[my-times] Found best efforts for X seasons`

## Next Steps

Once you identify the issue:
- If token/scope issue: Re-authenticate
- If no historical data: Check if you have efforts on this segment
- If our API issue: Check the server logs for our debug output
