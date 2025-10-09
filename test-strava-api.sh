#!/bin/bash

# Strava API Test Script
# Replace these variables with your actual values

ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"
SEGMENT_ID="7977451"
BASE_URL="https://www.strava.com/api/v3"

echo "=== Testing Strava API Access ==="
echo ""

# Test 1: Check if token is valid
echo "1. Testing token validity..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$BASE_URL/athlete" | jq '.id, .firstname, .lastname' 2>/dev/null || echo "Token invalid or jq not installed"
echo ""

# Test 2: Get segment details
echo "2. Getting segment details..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$BASE_URL/segments/$SEGMENT_ID" | jq '.name, .distance, .elevation_high' 2>/dev/null || echo "Failed to get segment details"
echo ""

# Test 3: Get recent efforts (last 30 days)
echo "3. Getting recent segment efforts (last 30 days)..."
THIRTY_DAYS_AGO=$(date -u -d '30 days ago' '+%Y-%m-%dT%H:%M:%SZ')
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$BASE_URL/segment_efforts?segment_id=$SEGMENT_ID&start_date=$THIRTY_DAYS_AGO&per_page=10" | \
  jq 'length, .[0].elapsed_time, .[0].start_date' 2>/dev/null || echo "Failed to get recent efforts"
echo ""

# Test 4: Get historical efforts (2014-2025)
echo "4. Getting historical segment efforts (2014-2025)..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$BASE_URL/segment_efforts?segment_id=$SEGMENT_ID&start_date=2014-01-01T00:00:00Z&end_date=2025-12-31T23:59:59Z&per_page=10" | \
  jq 'length, .[0].elapsed_time, .[0].start_date' 2>/dev/null || echo "Failed to get historical efforts"
echo ""

# Test 5: Test our my-times API (replace with your actual domain)
echo "5. Testing our my-times API..."
# Replace with your actual domain and rider_id
# curl -s -H "Cookie: rider_id=YOUR_RIDER_ID" \
#   "https://your-domain.vercel.app/api/my-times" | jq '.' 2>/dev/null || echo "Failed to call my-times API"
echo "Replace the URL and rider_id above with your actual values"
echo ""

echo "=== Instructions ==="
echo "1. Get your access token from browser dev tools when logged into the race tracker"
echo "2. Replace ACCESS_TOKEN in this script"
echo "3. Run: chmod +x test-strava-api.sh && ./test-strava-api.sh"
echo "4. Check if you get data from the historical efforts call"
