import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseAdmin = createClient(env.SUPABASE_URL || 'https://placeholder.supabase.co', env.SUPABASE_SERVICE_ROLE || 'placeholder-key', {
  auth: { persistSession: false, autoRefreshToken: false },
});
