import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE 
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
