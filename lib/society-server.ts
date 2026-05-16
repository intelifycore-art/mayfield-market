import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SOCIETY } from "@/lib/society";

/**
 * Resolve the active society's UUID from its slug. Cached per-request.
 * Used by anonymous and authenticated routes alike.
 */
export const getActiveSocietyId = cache(async (): Promise<string | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("societies")
    .select("id")
    .eq("slug", SOCIETY.slug)
    .maybeSingle();
  return data?.id ?? null;
});
