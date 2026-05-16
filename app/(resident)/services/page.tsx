import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { CategoryTile } from "@/components/resident/category-tile";
import { ChatPanel } from "@/components/chat/chat-panel";
import { SERVICE_CHAT_SUGGESTIONS } from "@/lib/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Rupees } from "@/components/ui/rupees";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { CalendarPlus, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .eq("kind", "service")
    .eq("is_active", true)
    .order("sort_order");

  let categoryId: string | undefined;
  let activeCat: any = undefined;
  if (searchParams.cat) {
    activeCat = (cats ?? []).find((c) => c.slug === searchParams.cat);
    categoryId = activeCat?.id;
  }

  let services: any[] = [];
  if (societyId) {
    let query = supabase
      .from("services")
      .select(
        "id, name, description, starting_price, pricing_unit, vendor:vendors!inner(id, business_name, society_id, status, photo_url, is_open)",
      )
      .eq("is_active", true)
      .eq("vendor.society_id", societyId)
      .eq("vendor.status", "approved");
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data } = await query.order("name").limit(50);
    services = data ?? [];
  }

  return (
    <>
      <PageHeader title="Services" subtitle="Help & expertise in your block" />

      <section className="px-5 mt-4">
        <ChatPanel
          variant="inline"
          title="Need help with something?"
          subtitle="Describe what you need and I'll match you"
          placeholder="e.g. a daily maid for 2 hours..."
          emptyPrompt="Try one of these:"
          suggestions={SERVICE_CHAT_SUGGESTIONS}
        />
      </section>

      <section className="px-5 mt-6">
        <h2 className="display text-base font-semibold mb-3">Browse by type</h2>
        <div className="grid grid-cols-4 gap-2">
          {(cats ?? []).map((c) => (
            <CategoryTile
              key={c.id}
              category={c}
              href={`/services?cat=${c.slug}`}
              size="sm"
            />
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 mb-10">
        <h2 className="display text-base font-semibold mb-3">
          {activeCat ? activeCat.name : "All services"}
        </h2>
        {services.length === 0 ? (
          <Empty
            icon={<Wrench className="h-8 w-8" />}
            title="No services yet"
            description="Try another category or check back soon."
          />
        ) : (
          <div className="space-y-2">
            {services.map((s: any) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <p className="text-xs text-ink-soft">{s.vendor.business_name}</p>
                  <p className="font-medium text-sm mt-0.5">{s.name}</p>
                  {s.description ? (
                    <p className="text-xs text-ink-muted mt-0.5">{s.description}</p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between">
                    {s.starting_price ? (
                      <p className="tabular text-sm">
                        <span className="text-ink-soft text-xs">from </span>
                        <Rupees amount={s.starting_price} />
                        <span className="text-ink-soft text-xs"> / {s.pricing_unit}</span>
                      </p>
                    ) : (
                      <span />
                    )}
                    <Link href={`/services/${s.id}`}>
                      <Button size="sm" variant="brand">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Book
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
