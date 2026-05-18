import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { CompareSearch } from "./search";
import { CompareResults } from "./results";
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
  }

  return (
    <>
      <PageHeader
        title="Compare prices"
        subtitle="Same item, every vendor — cheapest first"
        backHref="/browse"
      />
      <div className="px-5 py-5 space-y-4 mb-10">
        <CompareSearch initial={q} />
        {!q ? (
          <Empty
            icon={<Scale className="h-8 w-8" />}
            title="What are you buying?"
            description="Search a fruit, vegetable or any item to see every vendor's price side by side."
          />
        ) : rows.length === 0 ? (
          <Empty
            icon={<Scale className="h-8 w-8" />}
            title={`No vendor has "${q}" right now`}
            description="Try a simpler word, or check the AI assistant on the home page."
          />
        ) : (
          <CompareResults query={q} rows={rows} />
        )}
      </div>
    </>
  );
}
