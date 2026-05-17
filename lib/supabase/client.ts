import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// NOTE: intentionally untyped. The hand-maintained Database type in
// lib/types.ts isn't a valid Supabase GenericSchema, which made the typed
// query-builder resolve write payloads to `never`. Our own code uses the
// Profile/Vendor/etc. interfaces for shaping data instead.
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
