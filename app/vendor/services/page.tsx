import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { ServicesManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function VendorServicesPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/apply");

  const [{ data: services }, { data: cats }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, kind")
      .eq("kind", "service")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <ServicesManager
      vendorId={vendor.id}
      initialServices={services ?? []}
      categories={cats ?? []}
    />
  );
}
