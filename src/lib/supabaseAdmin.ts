import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
// accept either name to avoid typos/mismatch
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE

export function supabaseAdmin() {
  console.log('[supabaseAdmin] Environment check:', {
    SUPABASE_URL: SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? 'SET' : 'MISSING',
  })
  
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL is required.')
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    // give a very explicit error for logs
    throw new Error('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE) is required.')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })
}
