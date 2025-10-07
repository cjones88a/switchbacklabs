import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | undefined;

/** Lazily create and cache the server-only Supabase admin client. */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY; // accept either name
  if (!url || !key) {
    throw new Error('Supabase admin env missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  }
  _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _admin;
}
