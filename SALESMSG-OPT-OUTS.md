# SalesMsg Opt-Out Tracking

This directory contains code to track and count contacts who have opted out of text messages by replying "STOP" in SalesMsg.

## Setup

1. **Set Environment Variables**

   Add the following to your `.env.local` file (or set as environment variables):

   ```bash
   SALESMSG_API_KEY=your-api-key-here
   SALESMSG_API_URL=https://api.salesmsg.com/v1  # Optional, defaults to this
   ```

2. **Get Your SalesMsg API Key**

   - Log in to your SalesMsg account
   - Navigate to Settings > API
   - Generate or copy your API key

## Usage

### Option 1: Standalone Script

Run the script directly from the command line:

```bash
node check-salesmsg-optouts.mjs
```

This will:
- Connect to the SalesMsg API
- Fetch all contacts who have opted out
- Filter for those who replied "STOP"
- Display the count and sample contacts

### Option 2: API Endpoint

Use the Next.js API endpoint:

```bash
# Get full statistics
curl http://localhost:3000/api/salesmsg/optouts

# Get only the count
curl http://localhost:3000/api/salesmsg/optouts?countOnly=true
```

Response format:
```json
{
  "totalOptOuts": 150,
  "stopOptOuts": 45,
  "contacts": [
    {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "opt_out_reason": "STOP",
      "opt_out_date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Option 3: Use in Your Code

Import and use the utility functions:

```typescript
import { countStopOptOuts, getOptOutStats } from '@/lib/salesmsg';

// Get just the count
const count = await countStopOptOuts();
console.log(`${count} contacts opted out via STOP`);

// Get full statistics
const stats = await getOptOutStats();
console.log(`Total opt-outs: ${stats.totalOptOuts}`);
console.log(`STOP opt-outs: ${stats.stopOptOuts}`);
console.log(`Contacts:`, stats.contacts);
```

## How It Works

The code:

1. **Fetches opted-out contacts** from SalesMsg API using common endpoint patterns
2. **Filters for "STOP" opt-outs** by checking:
   - `opt_out_reason` or `unsubscribe_reason` contains "stop"
   - `opt_out_method` or `unsubscribe_method` equals "STOP"
   - Status fields indicating STOP opt-out
3. **Handles pagination** automatically to get all contacts
4. **Returns statistics** including total count and contact details

## Troubleshooting

### "SALESMSG_API_KEY environment variable is required"

Make sure you've set the environment variable:
```bash
export SALESMSG_API_KEY="your-key-here"
```

Or add it to your `.env.local` file.

### "Failed to fetch opt-outs. Status: 401"

- Verify your API key is correct
- Check that your API key has permissions to read contacts
- Ensure the API key hasn't expired

### "Failed to fetch opt-outs. Status: 404"

The script will automatically try alternative endpoints. If all fail:
- Check the SalesMsg API documentation for the correct endpoint
- Update `SALESMSG_API_URL` if your instance uses a different base URL
- The script will fall back to fetching all contacts and filtering

### No contacts found

- Verify contacts have actually opted out in SalesMsg
- Check that opt-out reasons are properly recorded
- Some platforms may use different field names; you may need to adjust the filtering logic

## Files

- `check-salesmsg-optouts.mjs` - Standalone script to run from command line
- `src/lib/salesmsg.ts` - Utility functions for use in your application
- `src/app/api/salesmsg/optouts/route.ts` - Next.js API endpoint

