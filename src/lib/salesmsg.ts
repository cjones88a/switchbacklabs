/**
 * SalesMsg API utility functions
 * 
 * This module provides functions to interact with the SalesMsg API
 * for checking opt-out status of contacts.
 */

export interface SalesMsgContact {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  opted_out?: boolean;
  unsubscribed?: boolean;
  opt_out_reason?: string;
  unsubscribe_reason?: string;
  opt_out_method?: string;
  unsubscribe_method?: string;
  opt_out_date?: string;
  unsubscribe_date?: string;
  status?: string;
  updated_at?: string;
}

export interface SalesMsgOptOutStats {
  totalOptOuts: number;
  stopOptOuts: number;
  contacts: SalesMsgContact[];
}

/**
 * Get the SalesMsg API configuration from environment variables
 */
function getSalesMsgConfig() {
  const apiKey = process.env.SALESMSG_API_KEY;
  const apiUrl = process.env.SALESMSG_API_URL || 'https://api.salesmsg.com/v1';

  if (!apiKey) {
    throw new Error('SALESMSG_API_KEY environment variable is required');
  }

  return { apiKey, apiUrl };
}

/**
 * Fetch opted-out contacts from SalesMsg API
 */
export async function getOptedOutContacts(): Promise<SalesMsgContact[]> {
  const { apiKey, apiUrl } = getSalesMsgConfig();

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const optedOutContacts: SalesMsgContact[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    // Try common API endpoint patterns
    const endpoints = [
      `${apiUrl}/contacts/opted-out?page=${page}`,
      `${apiUrl}/contacts?status=opted-out&page=${page}`,
      `${apiUrl}/optouts?page=${page}`,
      `${apiUrl}/contacts?unsubscribed=true&page=${page}`,
    ];

    let response: Response | null = null;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          break;
        }
      } catch {
        continue;
      }
    }

    if (!response || !response.ok) {
      throw new Error(
        `Failed to fetch opt-outs. Status: ${response?.status || 'No response'}`
      );
    }

    const data = await response.json();

    // Handle different response structures
    let contacts: SalesMsgContact[] = [];
    let currentPage = page;
    let totalPages = 1;

    if (Array.isArray(data)) {
      contacts = data;
      hasMore = data.length > 0;
    } else if (data.data && Array.isArray(data.data)) {
      contacts = data.data;
      currentPage = data.page || data.current_page || page;
      totalPages = data.total_pages || data.last_page || 1;
      hasMore = currentPage < totalPages && contacts.length > 0;
    } else if (data.contacts && Array.isArray(data.contacts)) {
      contacts = data.contacts;
      hasMore = contacts.length > 0 && (data.has_more !== false);
    } else if (data.results && Array.isArray(data.results)) {
      contacts = data.results;
      hasMore = contacts.length > 0 && (data.next !== null);
    } else {
      break;
    }

    optedOutContacts.push(...contacts);
    page++;

    if (page > 100 || contacts.length === 0) {
      hasMore = false;
    }
  }

  return optedOutContacts;
}

/**
 * Filter contacts who opted out specifically by replying "STOP"
 */
export function filterStopOptOuts(contacts: SalesMsgContact[]): SalesMsgContact[] {
  return contacts.filter(contact => {
    const reason = (
      contact.opt_out_reason ||
      contact.unsubscribe_reason ||
      ''
    ).toLowerCase();

    const status = (
      contact.status ||
      ''
    ).toLowerCase();

    return (
      reason.includes('stop') ||
      status.includes('stop') ||
      contact.opt_out_method === 'STOP' ||
      contact.unsubscribe_method === 'STOP' ||
      (contact.opted_out === true && reason.includes('stop')) ||
      (contact.unsubscribed === true && reason.includes('stop'))
    );
  });
}

/**
 * Get statistics about opt-outs, specifically those who replied "STOP"
 */
export async function getOptOutStats(): Promise<SalesMsgOptOutStats> {
  const allOptOuts = await getOptedOutContacts();
  const stopOptOuts = filterStopOptOuts(allOptOuts);

  return {
    totalOptOuts: allOptOuts.length,
    stopOptOuts: stopOptOuts.length,
    contacts: stopOptOuts,
  };
}

/**
 * Count how many contacts have opted out by replying "STOP"
 */
export async function countStopOptOuts(): Promise<number> {
  const stats = await getOptOutStats();
  return stats.stopOptOuts;
}

