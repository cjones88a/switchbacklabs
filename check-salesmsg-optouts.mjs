// Check how many contacts have opted out of text messages in SalesMsg
// Run with: node check-salesmsg-optouts.mjs
//
// Requires environment variables:
// - SALESMSG_API_KEY: Your SalesMsg API key
// - SALESMSG_API_URL: Your SalesMsg API base URL (optional, defaults to common endpoint)

const SALESMSG_API_KEY = process.env.SALESMSG_API_KEY;
const SALESMSG_API_URL = process.env.SALESMSG_API_URL || 'https://api.salesmsg.com/v1';

if (!SALESMSG_API_KEY) {
  console.error('❌ Error: SALESMSG_API_KEY environment variable is required');
  console.error('   Set it with: export SALESMSG_API_KEY="your-api-key"');
  process.exit(1);
}

/**
 * Fetch opted-out contacts from SalesMsg API
 * This function attempts multiple common API patterns used by messaging platforms
 */
async function getOptedOutContacts() {
  const headers = {
    'Authorization': `Bearer ${SALESMSG_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const optedOutContacts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      // Try common API endpoint patterns for opt-outs
      // Pattern 1: Direct opt-outs endpoint
      const endpoints = [
        `${SALESMSG_API_URL}/contacts/opted-out?page=${page}`,
        `${SALESMSG_API_URL}/contacts?status=opted-out&page=${page}`,
        `${SALESMSG_API_URL}/optouts?page=${page}`,
        `${SALESMSG_API_URL}/contacts?unsubscribed=true&page=${page}`,
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'GET',
            headers,
          });

          if (response.ok) {
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break;
          } else if (response.status !== 404) {
            // If it's not a 404, the endpoint exists but might have auth issues
            lastError = `HTTP ${response.status}: ${await response.text()}`;
          }
        } catch (error) {
          lastError = error.message;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(
          lastError || 
          `Failed to fetch opt-outs. Status: ${response?.status || 'No response'}`
        );
      }

      const data = await response.json();

      // Handle different response structures
      let contacts = [];
      let total = 0;
      let currentPage = page;
      let totalPages = 1;

      if (Array.isArray(data)) {
        // Response is directly an array
        contacts = data;
        hasMore = data.length > 0;
      } else if (data.data && Array.isArray(data.data)) {
        // Response has data property with array
        contacts = data.data;
        total = data.total || data.count || contacts.length;
        currentPage = data.page || data.current_page || page;
        totalPages = data.total_pages || data.last_page || 1;
        hasMore = currentPage < totalPages && contacts.length > 0;
      } else if (data.contacts && Array.isArray(data.contacts)) {
        // Response has contacts property
        contacts = data.contacts;
        total = data.total || contacts.length;
        hasMore = contacts.length > 0 && (data.has_more !== false);
      } else if (data.results && Array.isArray(data.results)) {
        // Response has results property
        contacts = data.results;
        total = data.total || contacts.length;
        hasMore = contacts.length > 0 && (data.next !== null);
      } else {
        console.warn('⚠️  Unexpected API response structure:', JSON.stringify(data, null, 2));
        break;
      }

      // Filter for contacts who opted out via "STOP" reply
      const stopOptOuts = contacts.filter(contact => {
        // Check various fields that might indicate STOP opt-out
        const reason = (
          contact.opt_out_reason ||
          contact.unsubscribe_reason ||
          contact.reason ||
          contact.status_reason ||
          ''
        ).toLowerCase();

        const status = (
          contact.status ||
          contact.opt_out_status ||
          contact.unsubscribe_status ||
          ''
        ).toLowerCase();

        // Check if reason contains "stop" or status indicates stop
        return (
          reason.includes('stop') ||
          status.includes('stop') ||
          contact.opted_out === true ||
          contact.unsubscribed === true ||
          contact.opt_out_method === 'STOP' ||
          contact.unsubscribe_method === 'STOP'
        );
      });

      optedOutContacts.push(...stopOptOuts);

      console.log(`📄 Page ${currentPage}: Found ${stopOptOuts.length} STOP opt-outs (${contacts.length} total contacts on page)`);

      page++;
      
      // Safety check to prevent infinite loops
      if (page > 100) {
        console.warn('⚠️  Reached maximum page limit (100). Stopping pagination.');
        hasMore = false;
      }

      // If no contacts returned, we're done
      if (contacts.length === 0) {
        hasMore = false;
      }

    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error.message);
      
      // If it's an auth error, provide helpful message
      if (error.message.includes('401') || error.message.includes('403')) {
        console.error('\n💡 Tip: Check that your SALESMSG_API_KEY is correct and has proper permissions.');
      }
      
      // If it's a 404, try alternative approach - query all contacts and filter
      if (error.message.includes('404')) {
        console.log('\n🔄 Trying alternative approach: fetching all contacts and filtering...');
        return await getAllContactsAndFilter(headers);
      }
      
      throw error;
    }
  }

  return optedOutContacts;
}

/**
 * Alternative approach: Fetch all contacts and filter for opt-outs
 * This is used when direct opt-out endpoints don't exist
 */
async function getAllContactsAndFilter(headers) {
  const allContacts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const endpoint = `${SALESMSG_API_URL}/contacts?page=${page}`;
      console.log(`📡 Fetching contacts from: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      let contacts = [];
      if (Array.isArray(data)) {
        contacts = data;
      } else if (data.data && Array.isArray(data.data)) {
        contacts = data.data;
        hasMore = (data.page || 1) < (data.total_pages || 1);
      } else if (data.contacts && Array.isArray(data.contacts)) {
        contacts = data.contacts;
        hasMore = data.has_more !== false;
      } else {
        break;
      }

      allContacts.push(...contacts);
      console.log(`📄 Page ${page}: Fetched ${contacts.length} contacts`);

      page++;
      if (contacts.length === 0 || page > 100) {
        hasMore = false;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      break;
    }
  }

  // Filter for STOP opt-outs
  const stopOptOuts = allContacts.filter(contact => {
    const reason = (
      contact.opt_out_reason ||
      contact.unsubscribe_reason ||
      contact.reason ||
      ''
    ).toLowerCase();

    const status = (
      contact.status ||
      contact.opt_out_status ||
      ''
    ).toLowerCase();

    return (
      reason.includes('stop') ||
      status.includes('stop') ||
      (contact.opted_out === true && reason.includes('stop')) ||
      (contact.unsubscribed === true && reason.includes('stop')) ||
      contact.opt_out_method === 'STOP' ||
      contact.unsubscribe_method === 'STOP'
    );
  });

  return stopOptOuts;
}

/**
 * Main function to count opt-outs
 */
async function countOptOuts() {
  console.log('🔍 Checking SalesMsg for contacts who opted out via "STOP"...\n');

  try {
    const optedOutContacts = await getOptedOutContacts();

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Total contacts who opted out via "STOP": ${optedOutContacts.length}`);

    if (optedOutContacts.length > 0) {
      console.log('\n📋 Sample opt-out contacts (first 5):');
      optedOutContacts.slice(0, 5).forEach((contact, index) => {
        console.log(`\n${index + 1}. ${contact.name || contact.first_name + ' ' + contact.last_name || 'Unknown'}`);
        console.log(`   Phone: ${contact.phone || contact.phone_number || 'N/A'}`);
        console.log(`   Email: ${contact.email || 'N/A'}`);
        console.log(`   Opt-out reason: ${contact.opt_out_reason || contact.unsubscribe_reason || 'STOP'}`);
        console.log(`   Opt-out date: ${contact.opt_out_date || contact.unsubscribe_date || contact.updated_at || 'N/A'}`);
      });

      if (optedOutContacts.length > 5) {
        console.log(`\n... and ${optedOutContacts.length - 5} more`);
      }
    }

    return optedOutContacts.length;
  } catch (error) {
    console.error('\n❌ Failed to fetch opt-outs:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Verify your SALESMSG_API_KEY is correct');
    console.error('   2. Check that your API key has permissions to read contacts');
    console.error('   3. Verify the SALESMSG_API_URL is correct (if using custom URL)');
    console.error('   4. Check SalesMsg API documentation for the correct endpoint');
    process.exit(1);
  }
}

void countOptOuts();

