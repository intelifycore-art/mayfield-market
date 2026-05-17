import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Service-role Supabase client. Bypasses RLS — only use from server routes
 * that have already authorized the caller. NEVER import from a Client Component.
 *
 * Intentionally untyped — see note in lib/supabase/client.ts. The service
 * role key has no safe default and must come from the env (only the /dev
 * seed route uses this, and that route is disabled in production).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
