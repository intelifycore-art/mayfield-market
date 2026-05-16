import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { CategoryTile } from "@/components/resident/category-tile";
import { VendorCard } from "@/components/resident/vendor-card";
import { PageHeader } from "@/components/resident/page-header";
import { ChatPanel } from "@/components/chat/chat-panel";
import { PRODUCT_CHAT_SUGGESTIONS } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const [{ data: cats }, { data: vendors }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("kind", "product")
      .eq("is_active", true)
      .order("sort_order"),
    societyId
      ? supabase
          .from("vendors")
          .select("*")
          .eq("society_id", societyId)
          .eq("status", "approved")
      : Promise.resolve({ data: [] as any[] }),
  ]);

  return (
    <>
      <PageHeader title="Browse" subtitle="Categories and vendors near you" />

      <section className="px-5 mt-4">
        <ChatPanel
          variant="inline"
          title="Looking for something?"
          subtitle="Tell me and I'll find it on the block"
          placeholder="e.g. milk, bread, fresh paneer..."
          emptyPrompt="Try one of these:"
          suggestions={PRODUCT_CHAT_SUGGESTIONS}
        />
      </section>

      <section className="px-5 mt-6">
        <h2 className="display text-base font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-2">
          {(cats ?? []).map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 mb-10">
        <h2 className="display text-base font-semibold mb-3">All vendors</h2>
        {!vendors || vendors.length === 0 ? (
          <p className="text-sm text-ink-muted">No approved vendors yet.</p>
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
