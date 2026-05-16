import { createClient } from "@/lib/supabase/server";
import type { Profile, Vendor } from "@/lib/types";
import { redirect } from "next/navigation";

/**
 * Returns the current profile or null. Does NOT redirect.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data ?? null;
}

/**
 * Like getCurrentProfile but redirects to /login if not signed in.
 */
export async function requireProfile(redirectTo = "/login"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(redirectTo);
  return profile;
}

/**
 * Redirects to /login if not signed in, or to /onboarding if profile isn't set up yet
 * (no society + flat for residents, no business name for vendors).
 */
export async function requireOnboarded(): Promise<Profile> {
  const profile = await requireProfile();
  if (!profile.society_id || (profile.role === "resident" && !profile.flat_no)) {
    redirect("/onboarding");
  }
  return profile;
}

export async function requireRole(role: Profile["role"]): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect("/");
  return profile;
}

export async function getCurrentVendor(): Promise<Vendor | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  return data ?? null;
}
