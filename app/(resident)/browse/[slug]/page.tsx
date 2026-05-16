import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { VendorCard } from "@/components/resident/vendor-card";
import { PageHeader } from "@/components/resident/page-header";
import { Empty } from "@/components/ui/empty";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await requireOnboarded();
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) notFound();

  // Find vendors who either: have a listing in this category (product), OR are categorized as such
  const { data: vendorIds } = await supabase
    .from("vendor_categories")
    .select("vendor_id")
    .eq("category_id", category.id);

  const ids = (vendorIds ?? []).map((v) => v.vendor_id);

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .eq("society_id", profile.society_id!)
    .eq("status", "approved")
    .in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);

  return (
    <>
      <PageHeader
        title={category.name}
        subtitle={category.kind === "service" ? "Service providers" : "Vendors"}
        backHref="/browse"
      />
      <section className="px-5 py-5">
        {!vendors || vendors.length === 0 ? (
          <Empty
            icon={<Store className="h-8 w-8" />}
            title="No vendors here yet"
            description={`Once vendors offering ${category.name.toLowerCase()} are approved by the RWA, they'll show up here.`}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
