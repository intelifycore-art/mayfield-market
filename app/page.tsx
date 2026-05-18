import Link from "next/link";
import {
  ArrowRight,
  Store,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { getCurrentProfile } from "@/lib/auth";
import { SOCIETY, fullSocietyName } from "@/lib/society";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VendorCard } from "@/components/resident/vendor-card";
import { ProductTile } from "@/components/resident/product-tile";
import { ServiceTile } from "@/components/resident/service-tile";
import { ChatPanel } from "@/components/chat/chat-panel";
import { BottomNav } from "@/components/resident/bottom-nav";
import { OrderStatusBadge } from "@/components/resident/order-status";
import { Rupees } from "@/components/ui/rupees";
import { relativeTime, inr } from "@/lib/format";
import { householdRateLabel } from "@/lib/policy";

export const dynamic = "force-dynamic";

function greeting(name?: string | null) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name?.trim().split(" ")[0];
  return first ? `${time}, ${first}` : time;
}

export default async function LandingPage() {
  const profile = await getCurrentProfile();

  // Vendors and admins can still view the public marketplace — we just
  // surface a banner pointing them to their dashboard (no hard redirect).
  const dashboard =
    profile?.role === "vendor"
      ? { href: "/vendor", label: "Go to your storefront" }
      : profile?.role === "admin"
      ? { href: "/admin", label: "Go to admin console" }
      : null;

  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const [
    { data: vendors },
    { data: listings },
    { data: services },
    { data: recentOrders },
  ] = await Promise.all([
    societyId
      ? supabase
          .from("vendors")
          .select("*")
          .eq("society_id", societyId)
          .eq("status", "approved")
          .eq("is_open", true)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    societyId
      ? supabase
          .from("listings")
          .select(
            "id, name, description, price, unit, image_url, stock, vendor:vendors!inner(id, business_name, society_id, status, is_open)",
          )
          .eq("is_active", true)
          .eq("vendor.society_id", societyId)
          .eq("vendor.status", "approved")
          .order("created_at", { ascending: false })
          .limit(24)
      : Promise.resolve({ data: [] as any[] }),
    societyId
      ? supabase
          .from("services")
          .select(
            "id, name, description, starting_price, pricing_unit, vendor:vendors!inner(id, business_name, society_id, status)",
          )
          .eq("is_active", true)
          .eq("vendor.society_id", societyId)
          .eq("vendor.status", "approved")
          .order("created_at", { ascending: false })
          .limit(12)
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

  // RWA household-service rate card preview (separate query so a missing
  // migration 0003 doesn't break the rest of the landing).
  let household: any[] = [];
  if (societyId) {
    const { data: hh } = await supabase
      .from("household_services")
      .select("slug, title, rate_min, rate_max, rate_unit, grp, sort_order")
      .eq("society_id", societyId)
      .eq("is_active", true)
      .order("sort_order");
    household = hh ?? [];
  }
  const hhMin = household.length
    ? Math.min(...household.map((h) => Number(h.rate_min ?? Infinity)))
    : null;
  const hhMax = household.length
    ? Math.max(
        ...household.map((h) => Number(h.rate_max ?? h.rate_min ?? 0)),
      )
    : null;
  const hhPreview = ["sweep-mop-2bhk", "cook", "fulltime-8", "bathroom"]
    .map((s) => household.find((h) => h.slug === s))
    .filter(Boolean);

  const hasRecent = recentOrders && recentOrders.length > 0;
  const hasListings = listings && listings.length > 0;
  const hasServices = services && services.length > 0;
  const hasHousehold = household.length > 0;
  const hasVendors = vendors && vendors.length > 0;

  return (
    <div className="min-h-screen pb-24 bg-bg">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {dashboard ? (
            <Link href={dashboard.href}>
              <Button variant="primary" size="sm">
                {dashboard.label}
              </Button>
            </Link>
          ) : profile ? (
            <span className="text-sm text-ink-muted hidden sm:inline">
              {profile.full_name?.split(" ")[0] ?? "You"}
            </span>
          ) : (
            <>
              <Link href="/login?role=vendor" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <Store className="h-4 w-4" />
                  Vendor sign in
                </Button>
              </Link>
              <Link href="/login?role=vendor" className="sm:hidden">
                <Button variant="ghost" size="icon">
                  <Store className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {dashboard ? (
        <div className="px-5 max-w-6xl mx-auto">
          <Link
            href={dashboard.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-brand/20 bg-brand-tint px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-tint/70 transition"
          >
            <span>
              You&apos;re signed in as{" "}
              <strong>{profile?.role}</strong> — this is the public marketplace.
            </span>
            <span className="flex items-center gap-1 font-medium shrink-0">
              {dashboard.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      ) : null}

      {/* Hero with chat */}
      <section className="px-5 pt-2 pb-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-2 lg:pt-4">
            <Badge variant="brand" className="mb-3 inline-flex">
              <Sparkles className="h-3 w-3" />
              {fullSocietyName()}
            </Badge>
            {profile ? (
              <h1 className="display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
                {greeting(profile.full_name)}.
              </h1>
            ) : (
              <h1 className="display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
                Your block,{" "}
                <span className="text-brand">delivered</span>.
              </h1>
            )}
            <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed max-w-md">
              {profile
                ? `Ask the AI below, or scroll to see what's available right now.`
                : "Fresh produce and trusted help — from vendors your neighbors already use. Just ask, or scroll to browse."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#vendors">
                <Button size="md" variant="brand">
                  Browse vendors
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              {!profile ? (
                <Link href="/login?role=vendor">
                  <Button size="md" variant="outline">
                    <Store className="h-4 w-4" />
                    I&apos;m a vendor
                  </Button>
                </Link>
              ) : null}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 max-w-md text-2xs">
              <Feature
                icon={<ShieldCheck className="h-4 w-4" />}
                label="RWA-approved"
              />
              <Feature
                icon={<Truck className="h-4 w-4" />}
                label="From your block"
              />
              <Feature
                icon={<Sparkles className="h-4 w-4" />}
                label="AI help"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ChatPanel variant="hero" />
          </div>
        </div>
      </section>

      {/* Recent orders for signed-in residents */}
      {hasRecent ? (
        <section className="px-5 pb-6 max-w-6xl mx-auto">
          <SectionHeading title="Your recent orders" link={{ href: "/orders", label: "All" }} />
          <div className="grid sm:grid-cols-3 gap-2">
            {recentOrders!.map((o: any) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-line hover:border-ink/20 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {o.vendor?.business_name ?? "Order"}
                  </p>
                  <p className="text-xs text-ink-soft">{relativeTime(o.placed_at)}</p>
                </div>
                <Rupees amount={o.total} size="sm" />
                <OrderStatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Fresh products */}
      {hasListings ? (
        <section className="px-5 py-8 bg-white border-y border-line">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="On the block today"
              subtitle="Fresh produce and daily essentials from your local vendors"
              link={{ href: "/browse", label: "Browse all" }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {listings!.slice(0, 12).map((l: any) => (
                <ProductTile
                  key={l.id}
                  listing={l}
                  vendorId={l.vendor.id}
                  vendorName={l.vendor.business_name}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Services — Maids & House Help is the hero */}
      <section className="px-5 py-8 max-w-6xl mx-auto">
        <SectionHeading
          title="Services on the block"
          subtitle="RWA-managed household staff, plus trusted local help"
          link={{ href: "/services", label: "All services" }}
        />

        {/* Maids hero */}
        <Link
          href="/maids"
          className="block rounded-2xl border border-brand/25 bg-brand-tint overflow-hidden hover:border-brand/40 transition group"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-brand-dark/80 bg-white/60 rounded-full px-2.5 py-1">
                  <ShieldCheck className="h-3 w-3" />
                  RWA-managed · official fixed rates
                </span>
                <h3 className="display text-2xl sm:text-3xl font-semibold text-brand-dark mt-3">
                  Maids &amp; House Help
                </h3>
                <p className="text-sm text-brand-dark/80 mt-1 max-w-lg">
                  Verified domestic staff at the rates fixed by the C-Block
                  RWA. Sweeping, cooking, full-time maids and more — request a
                  trial in a tap.
                </p>
              </div>
              <span className="hidden sm:grid h-10 w-10 rounded-full bg-brand text-white place-items-center shrink-0 group-hover:scale-105 transition">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>

            {hasHousehold ? (
              <>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {hhPreview.map((h: any) => (
                    <div
                      key={h.slug}
                      className="rounded-lg bg-white/70 px-3 py-2.5"
                    >
                      <p className="text-2xs text-brand-dark/70 leading-tight line-clamp-1">
                        {h.title}
                      </p>
                      <p className="text-sm font-semibold text-brand-dark tabular mt-0.5">
                        {householdRateLabel(h)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-brand-dark/80 tabular">
                    {household.length} household jobs ·{" "}
                    {hhMin != null && hhMax != null
                      ? `${inr(hhMin)}–${inr(hhMax)} / month`
                      : "fixed rate card"}
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand text-white text-sm font-medium px-4 py-2 group-hover:bg-brand-dark transition">
                    See all rates &amp; staff
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-brand-dark/80">
                  Official rate card · verified staff · request a trial
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand text-white text-sm font-medium px-4 py-2 group-hover:bg-brand-dark transition">
                  Open Maids &amp; Help
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Other local help */}
        {hasServices ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink-muted mb-3">
              Other help — plumbers, electricians, tutors &amp; more
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {services!.slice(0, 6).map((s: any) => (
                <ServiceTile
                  key={s.id}
                  service={s}
                  vendorName={s.vendor.business_name}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Vendors */}
      <section id="vendors" className="px-5 py-8 max-w-6xl mx-auto scroll-mt-4">
        <SectionHeading
          title={`Vendors in ${SOCIETY.block ?? "your block"}`}
          subtitle="Tap any vendor to see their full storefront"
        />
        {hasVendors ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendors!.map((v: any) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-line rounded-lg p-8 text-center">
            <p className="text-sm text-ink-muted">
              No vendors approved yet.{" "}
              <Link href="/login?role=vendor" className="text-brand underline">
                Apply to list your business
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* Vendor CTA — only for anon */}
      {!profile ? (
        <section className="px-5 py-10 bg-brand text-white">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-2xs uppercase tracking-wider opacity-70">For vendors</p>
              <h2 className="display text-xl sm:text-2xl font-semibold mt-1">
                Run a stall or service near {SOCIETY.block ?? "the block"}?
              </h2>
              <p className="mt-2 text-sm opacity-90">
                List with the RWA — sell directly to residents. No commission.
              </p>
            </div>
            <Link href="/login?role=vendor">
              <Button
                size="md"
                variant="outline"
                className="bg-white text-brand-dark border-white hover:bg-bg-subtle"
              >
                Apply to list <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      ) : null}

      <footer className="px-5 py-8 text-center text-2xs uppercase tracking-wider text-ink-soft">
        Made for {fullSocietyName()} · {SOCIETY.location}
      </footer>

      <BottomNav signedIn={!!profile} />
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="display text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
        {link ? (
          <Link
            href={link.href}
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-0.5 shrink-0"
          >
            {link.label} <ChevronRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
      {subtitle ? (
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1 text-ink-muted">
      <span className="text-brand">{icon}</span>
      <span className="leading-tight">{label}</span>
    </div>
  );
}
