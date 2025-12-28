import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Creates a Supabase browser client for use in Client Components.
 * Uses singleton pattern to ensure only one client instance exists.
 */
export function createClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return client
}
