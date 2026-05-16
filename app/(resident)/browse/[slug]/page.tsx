import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
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
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) notFound();

  const { data: vendorIds } = await supabase
    .from("vendor_categories")
    .select("vendor_id")
    .eq("category_id", category.id);

  const ids = (vendorIds ?? []).map((v) => v.vendor_id);

  const { data: vendors } = societyId
    ? await supabase
        .from("vendors")
        .select("*")
        .eq("society_id", societyId)
        .eq("status", "approved")
        .in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"])
    : { data: [] as any[] };

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
            {vendors.map((v: any) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
