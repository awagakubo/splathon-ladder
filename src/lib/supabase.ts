import { createClient } from '@supabase/supabase-js'

// Public client for server components/routes that only need read access
export const supabaseAnon = () => {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  return createClient(url, anonKey, { auth: { persistSession: false } })
}

// Admin client for route handlers that need write access
export const supabaseAdmin = () => {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

