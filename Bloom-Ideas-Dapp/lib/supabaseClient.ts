// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensure these are defined in your .env.local and in Vercel/Netlify env settings:
 * NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
  )
}

/** 
 * Supabase client for all browser & server use (with RLS)
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    // Opt into auto-realtime subscriptions
    realtime: { params: { eventsPerSecond: 10 } },
    // Always send Auth headers if user is signed in
    auth: { persistSession: true, detectSessionInUrl: true },
  }
)
