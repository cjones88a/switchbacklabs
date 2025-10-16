// Test script for the my-times API
// Run with: node test-my-times-api.mjs

let fetchImpl = globalThis.fetch;

if (!fetchImpl) {
  const fallback = await import("node-fetch").catch(() => null);

  if (!fallback) {
    console.error(
      "❌ fetch is not available in this Node.js runtime. Install node-fetch or upgrade to Node.js 18+.",
    );
    process.exit(1);
  }

  fetchImpl = fallback.default;
}

// Configuration - replace with your actual values
const CONFIG = {
  // Get these from your browser's dev tools when logged into the race tracker
  riderId: "YOUR_RIDER_ID_HERE",
  domain: "https://your-domain.vercel.app", // Replace with your actual Vercel domain

  // Strava API test
  accessToken: "YOUR_ACCESS_TOKEN_HERE",
  segmentId: 7977451,
};

async function testStravaAPI() {
  console.log("=== Testing Strava API Directly ===");

  try {
    // Test 1: Check token validity
    console.log("1. Testing token validity...");
    const athleteResponse = await fetchImpl("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${CONFIG.accessToken}` },
    });

    if (!athleteResponse.ok) {
      console.error(
        "❌ Token invalid:",
        athleteResponse.status,
        await athleteResponse.text(),
      );
      return false;
    }

    const athlete = await athleteResponse.json();
    console.log("✅ Token valid for:", athlete.firstname, athlete.lastname);

    // Test 2: Get historical segment efforts
    console.log("\n2. Getting historical segment efforts (2014-2025)...");
    const effortsResponse = await fetchImpl(
      `https://www.strava.com/api/v3/segment_efforts?segment_id=${CONFIG.segmentId}&start_date=2014-01-01T00:00:00Z&end_date=2025-12-31T23:59:59Z&per_page=200`,
      {
        headers: { Authorization: `Bearer ${CONFIG.accessToken}` },
      },
    );

    if (!effortsResponse.ok) {
      console.error(
        "❌ Failed to get efforts:",
        effortsResponse.status,
        await effortsResponse.text(),
      );
      return false;
    }

    const efforts = await effortsResponse.json();
    console.log(`✅ Found ${efforts.length} total efforts`);

    if (efforts.length > 0) {
      console.log("Sample effort:", {
        date: efforts[0].start_date,
        time: efforts[0].elapsed_time,
        activity_id: efforts[0].activity.id,
      });
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Error testing Strava API:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

async function testMyTimesAPI() {
  console.log("\n=== Testing Our My-Times API ===");

  try {
    const response = await fetchImpl(`${CONFIG.domain}/api/my-times`, {
      headers: {
        Cookie: `rider_id=${CONFIG.riderId}`,
      },
    });

    if (!response.ok) {
      console.error("❌ My-times API failed:", response.status, await response.text());
      return false;
    }

    const data = await response.json();
    console.log("✅ My-times API response:", JSON.stringify(data, null, 2));

    return true;
  } catch (error) {
    console.error(
      "❌ Error testing my-times API:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

async function main() {
  console.log("Strava API Test Script");
  console.log("=====================\n");

  // Check if config is set
  if (CONFIG.accessToken === "YOUR_ACCESS_TOKEN_HERE") {
    console.log("❌ Please update the CONFIG object with your actual values:");
    console.log("1. Get access token from browser dev tools when logged into race tracker");
    console.log("2. Get rider_id from browser dev tools (Cookie: rider_id=...)");
    console.log("3. Update the domain to your actual Vercel domain");
    return;
  }

  const stravaWorks = await testStravaAPI();

  if (stravaWorks) {
    await testMyTimesAPI();
  }

  console.log("\n=== Summary ===");
  console.log("If Strava API works but my-times API fails, the issue is in our code");
  console.log("If Strava API fails, the issue is with token/permissions");
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
