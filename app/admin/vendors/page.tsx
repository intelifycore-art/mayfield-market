import { createClient } from "@/lib/supabase/server";
import { VendorsAdmin } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const supabase = createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select(
      "*, profile:profiles(full_name, email, phone, flat_no, tower), categories:vendor_categories(category:categories(name, kind))",
    )
    .order("created_at", { ascending: false });

  return <VendorsAdmin initialVendors={vendors ?? []} />;
}
