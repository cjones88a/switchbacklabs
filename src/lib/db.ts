import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Returns an anon-key Supabase client (safe for browser reads)
export function getSupabaseAnon(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Returns a service-role Supabase client (server only, for writes)
export function getSupabaseService(): SupabaseClient | null {
  if (typeof window !== 'undefined') return null; // never expose service key in browser
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}


