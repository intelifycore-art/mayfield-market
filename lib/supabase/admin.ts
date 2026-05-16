import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Service-role Supabase client. Bypasses RLS — only use from server routes
 * that have already authorized the caller. NEVER import from a Client Component.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
