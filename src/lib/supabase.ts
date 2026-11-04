import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isFetchFailureMessage, normalizeEnvValue, supabaseUrlIssue } from './trainingGate';

let _admin: SupabaseClient | undefined;

/** Lazily create and cache the server-only Supabase admin client. */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = normalizeEnvValue(process.env.SUPABASE_URL);
  const key =
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE) ||
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const urlIssue = supabaseUrlIssue(url);
  if (urlIssue || !key) {
    throw new Error(
      urlIssue ??
        'Supabase admin env missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)'
    );
  }
  _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _admin;
}

/** User-facing text for a Supabase/client fetch failure. Does not include URLs or keys. */
export function friendlySupabaseMessage(message: string): string {
  if (isFetchFailureMessage(message)) {
    return 'Could not reach Supabase. In Vercel, set SUPABASE_URL to the Project URL (https://<project-ref>.supabase.co) and SUPABASE_SERVICE_ROLE to that project’s service_role key. Restore the project if it is paused.';
  }
  return message;
}
