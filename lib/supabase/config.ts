/**
 * Public Supabase connection values.
 *
 * SAFE TO COMMIT: the URL is obviously public and the anon key is
 * specifically designed to be embedded in browser JavaScript — it is
 * protected by Row-Level Security (see supabase/migrations/*.sql).
 * Supabase's own docs say the anon key is safe to expose when RLS is on.
 *
 * These are used as defaults so a Vercel deploy needs ZERO env vars for
 * the database to work. Override per-environment by setting
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.
 *
 * NEVER put SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY here — those
 * are true secrets and must only live in Vercel's encrypted env store.
 */
const DEFAULT_SUPABASE_URL = "https://bnzymejhyvtavfkluujh.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuenltZWpoeXZ0YXZma2x1dWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzU4NzgsImV4cCI6MjA5NDUxMTg3OH0.RQSCiRg5y0S0DMM6kqaVr_TPstXPT515Mmj9yj8bL0k";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
