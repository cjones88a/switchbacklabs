// Get the actual rider_id from the database
// Run with: node get-rider-id.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gpgeqifprvrsqrlsxsju.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZ2VxaWZwcnZyc3FybHN4c2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1MDAyMCwiZXhwIjoyMDc0ODI2MDIwfQ.UrlDZnEnolqLFZnGJdgnFPkfk6a_cR_i63FiYV5-ylE';

async function getRiderId() {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    // Get rider_id from oauth_tokens
    const { data: tokens, error } = await sb
      .from("oauth_tokens")
      .select("rider_id, expires_at")
      .limit(1);

    if (error) {
      console.log("❌ Error getting oauth tokens:", error.message);
      return;
    }

    if (!tokens || tokens.length === 0) {
      console.log("❌ No oauth tokens found");
      return;
    }

    const token = tokens[0];
    console.log("✅ Found rider_id:", token.rider_id);
    console.log("Token expires at:", token.expires_at);
    
    // Check if token is still valid
    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    if (expiresAt > now) {
      console.log("✅ Token is still valid");
    } else {
      console.log("❌ Token has expired");
    }

    return token.rider_id;

  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

getRiderId();
