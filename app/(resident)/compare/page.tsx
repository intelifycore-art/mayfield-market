import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { CompareSearch } from "./search";
import { CompareResults } from "./results";
import { ProduceComparison } from "./produce";
import { Empty } from "@/components/ui/empty";
import { Scale } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  let rows: any[] = [];
  let produce: any[] = [];

  if (q && societyId) {
    const tokens = q
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1)
      .flatMap((t) =>
        t.length > 4 && t.endsWith("es")
          ? [t, t.slice(0, -2)]
          : t.length > 4 && t.endsWith("s")
          ? [t, t.slice(0, -1)]
          : [t],
      );
    const or = Array.from(new Set(tokens))
      .flatMap((t) => [`name.ilike.%${t}%`, `description.ilike.%${t}%`])
      .join(",");
    const { data } = await supabase
      .from("listings")
      .select(
        "id, name, description, price, unit, image_url, stock, vendor:vendors!inner(id, business_name, photo_url, society_id, status, is_open, delivery_note)",
      )
      .eq("is_active", true)
      .eq("vendor.society_id", societyId)
      .eq("vendor.status", "approved")
      .or(or)
      .order("price", { ascending: true })
      .limit(40);
    rows = data ?? [];
  } else if (societyId) {
    // Default view: every fruits-vegetables listing across all vendors,
    // grouped by item name. The ProduceComparison client component handles
    // the grouping + per-vendor side-by-side rendering.
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "fruits-vegetables")
      .maybeSingle();
    if (cat?.id) {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, name, price, unit, image_url, stock, vendor:vendors!inner(id, business_name, society_id, status, is_open, delivery_note)",
        )
        .eq("is_active", true)
        .eq("category_id", cat.id)
        .eq("vendor.society_id", societyId)
        .eq("vendor.status", "approved")
        .order("price", { ascending: true })
        .limit(200);
      produce = data ?? [];
    }
  }

  return (
    <>
      <PageHeader
        title="Compare prices"
        subtitle="Fruits & vegetables across every vendor — side by side"
        backHref="/browse"
      />
      <div className="px-5 py-5 space-y-4 mb-10">
        <CompareSearch initial={q} />
        {q ? (
          rows.length === 0 ? (
            <Empty
              icon={<Scale className="h-8 w-8" />}
              title={`No vendor has "${q}" right now`}
              description="Clear the search to see all fruits & vegetables side by side, or try a simpler word."
            />
          ) : (
            <CompareResults query={q} rows={rows} />
          )
        ) : produce.length === 0 ? (
          <Empty
            icon={<Scale className="h-8 w-8" />}
            title="No produce listed yet"
            description="Once vendors add fruits & vegetables, you'll see them here ranked by price."
          />
        ) : (
          <ProduceComparison offers={produce} />
        )}
      </div>
    </>
  );
}
