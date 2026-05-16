import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { ListingsManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function VendorListingsPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/apply");

  const [{ data: listings }, { data: cats }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, kind")
      .eq("kind", "product")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <ListingsManager
      vendorId={vendor.id}
      initialListings={listings ?? []}
      categories={cats ?? []}
    />
  );
}
