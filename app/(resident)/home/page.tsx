import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSocietyId } from "@/lib/society-server";
import { ResidentHeader } from "@/components/resident/header";
import { CategoryTile } from "@/components/resident/category-tile";
import { VendorCard } from "@/components/resident/vendor-card";
import { OrderStatusBadge } from "@/components/resident/order-status";
import { Card, CardContent } from "@/components/ui/card";
import { Rupees } from "@/components/ui/rupees";
import { relativeTime } from "@/lib/format";
import { fullSocietyName } from "@/lib/society";

export const dynamic = "force-dynamic";

function greeting(name?: string | null) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name?.trim().split(" ")[0];
  return first ? `${time}, ${first}` : `${time}, neighbor`;
}

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const [{ data: productCats }, { data: serviceCats }, { data: vendors }, { data: recentOrders }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("kind", "product")
        .eq("is_active", true)
        .order("sort_order")
        .limit(8),
      supabase
        .from("categories")
        .select("*")
        .eq("kind", "service")
        .eq("is_active", true)
        .order("sort_order")
        .limit(4),
      societyId
        ? supabase
            .from("vendors")
            .select("*")
            .eq("society_id", societyId)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(6)
        : Promise.resolve({ data: [] as any[] }),
      profile
        ? supabase
            .from("orders")
            .select("id, status, total, placed_at, vendor:vendors(business_name)")
            .eq("resident_id", profile.id)
            .order("placed_at", { ascending: false })
            .limit(3)
        : Promise.resolve({ data: [] as any[] }),
    ]);

  const flatLabel =
    profile?.tower && profile?.flat_no
      ? `${profile.tower} · ${profile.flat_no}`
      : profile?.flat_no;

  return (
    <>
      <ResidentHeader greeting={greeting(profile?.full_name)} flatLabel={flatLabel} />

      <section className="px-5 mt-1">
        <Card className="bg-brand-tint border-brand/15">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-brand text-white grid place-items-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-dark">
                Buying from your neighbors
              </p>
              <p className="text-xs text-brand-dark/80">
                Every order supports a vendor at {fullSocietyName()}.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {recentOrders && recentOrders.length > 0 ? (
        <section className="mt-6 px-5">
          <SectionHeading title="Recent orders" linkHref="/orders" />
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-line hover:border-ink/20 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {o.vendor?.business_name ?? "Order"}
                  </p>
                  <p className="text-xs text-ink-soft">{relativeTime(o.placed_at)}</p>
                </div>
                <Rupees amount={o.total} />
                <OrderStatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 px-5">
        <SectionHeading title="Shop fresh" linkHref="/browse" />
        <div className="grid grid-cols-4 gap-2">
          {(productCats ?? []).map((c) => (
            <CategoryTile key={c.id} category={c} size="sm" />
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <SectionHeading title="Book a service" linkHref="/services" />
        <div className="grid grid-cols-4 gap-2">
          {(serviceCats ?? []).map((c) => (
            <CategoryTile
              key={c.id}
              category={c}
              href={`/services?cat=${c.slug}`}
              size="sm"
            />
          ))}
        </div>
      </section>

      <section className="mt-6 mb-10 px-5">
        <SectionHeading title="Vendors in your block" linkHref="/browse" />
        {!vendors || vendors.length === 0 ? (
          <div className="bg-white border border-line rounded-lg p-6 text-center">
            <p className="text-sm text-ink-muted">
              No vendors yet. Once vendors are approved, they&apos;ll show up here.
            </p>
          </div>
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

function SectionHeading({ title, linkHref }: { title: string; linkHref?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="display text-lg font-semibold tracking-tight">{title}</h2>
      {linkHref ? (
        <Link
          href={linkHref}
          className="text-xs text-ink-muted hover:text-ink flex items-center gap-0.5"
        >
          See all <ChevronRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}
