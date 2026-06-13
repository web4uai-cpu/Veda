import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for browser-side usage.
 *
 * Uses NEXT_PUBLIC_ environment variables which are embedded in the client bundle.
 * For server-side operations, use createServerClient from @supabase/ssr instead.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);
