// Simple test script to debug my-times API
// Run with: node test-my-times-debug.js

const API_BASE_URL = "http://localhost:3000";

async function testMyTimesAPI() {
  console.log("🔍 Testing My Times API Debug...");
  console.log("=====================================");

  // Test 1: Check if debug endpoint works
  console.log("\n1. Testing debug endpoint...");
  try {
    const debugResponse = await fetch(`${API_BASE_URL}/api/debug/season-windows`);
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log("✅ Debug endpoint works:");
      console.log(JSON.stringify(debugData, null, 2));
    } else {
      console.log(`❌ Debug endpoint failed: ${debugResponse.status} ${debugResponse.statusText}`);
      const errorText = await debugResponse.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Debug endpoint error:", error.message);
  }

  // Test 2: Test my-times with a fake rider_id
  console.log("\n2. Testing my-times with fake rider_id...");
  try {
    const myTimesResponse = await fetch(`${API_BASE_URL}/api/my-times`, {
      headers: {
        "Cookie": "rider_id=fake-rider-id-123"
      }
    });
    
    console.log(`Status: ${myTimesResponse.status} ${myTimesResponse.statusText}`);
    
    if (myTimesResponse.ok) {
      const data = await myTimesResponse.json();
      console.log("✅ My Times API response:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await myTimesResponse.text();
      console.log("❌ My Times API error:");
      console.log(errorText);
    }
  } catch (error) {
    console.log("❌ My Times API error:", error.message);
  }

  // Test 3: Test season-key endpoint
  console.log("\n3. Testing season-key endpoint...");
  try {
    const seasonResponse = await fetch(`${API_BASE_URL}/api/season-key`);
    if (seasonResponse.ok) {
      const seasonData = await seasonResponse.text();
      console.log("✅ Season key:", seasonData);
    } else {
      console.log(`❌ Season key failed: ${seasonResponse.status}`);
    }
  } catch (error) {
    console.log("❌ Season key error:", error.message);
  }

  console.log("\n=====================================");
  console.log("🏁 Debug test complete!");
}

testMyTimesAPI();
