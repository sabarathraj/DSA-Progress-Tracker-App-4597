import { createClient } from '@supabase/supabase-js'

// Updated with correct project credentials
const SUPABASE_URL = 'https://gxpmuacofsgpqxwerjgx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cG11YWNvZnNncHF4d2Vyamd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNDA5MTYsImV4cCI6MjA2NzcxNjkxNn0.bDmKLf6bKptltlycrnk15fK8IiZ0mn_JSimXla-xv1g'

if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export default supabase