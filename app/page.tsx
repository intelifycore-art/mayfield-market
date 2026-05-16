import Link from "next/link";
import Image from "next/image";
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
import { CategoryTile } from "@/components/resident/category-tile";
import { VendorCard } from "@/components/resident/vendor-card";
import { ChatPanel } from "@/components/chat/chat-panel";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const profile = await getCurrentProfile();
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const [{ data: vendors }, { data: cats }] = await Promise.all([
    societyId
      ? supabase
          .from("vendors")
          .select("*")
          .eq("society_id", societyId)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .limit(12),
  ]);

  const productCats = (cats ?? []).filter((c) => c.kind === "product").slice(0, 8);
  const serviceCats = (cats ?? []).filter((c) => c.kind === "service").slice(0, 4);

  // Personalize the CTA if signed in
  let primaryCta = { href: "/home", label: "Start browsing" };
  if (profile) {
    if (profile.role === "admin") primaryCta = { href: "/admin", label: "Open admin" };
    else if (profile.role === "vendor")
      primaryCta = { href: "/vendor", label: "My storefront" };
    else primaryCta = { href: "/home", label: "Continue shopping" };
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          {profile ? (
            <Link href={primaryCta.href}>
              <Button variant="ghost" size="sm">
                {profile.full_name?.split(" ")[0] ?? "Account"}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login?role=vendor">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Store className="h-4 w-4" />
                  Vendor sign in
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
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

      {/* Hero with chat */}
      <section className="px-5 sm:px-8 pt-4 pb-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 lg:pt-6">
            <Badge variant="brand" className="mb-4 inline-flex">
              <Sparkles className="h-3 w-3" />
              {fullSocietyName()} · {SOCIETY.location}
            </Badge>
            <h1 className="display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              Your block,{" "}
              <span className="text-brand">delivered</span>.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed max-w-md">
              Fresh produce, daily essentials, and trusted help — from the vendors your
              neighbors already use. Just ask, and we&apos;ll find it on your block.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={primaryCta.href}>
                <Button size="lg" variant="brand">
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!profile ? (
                <Link href="/login?role=vendor">
                  <Button size="lg" variant="outline">
                    <Store className="h-4 w-4" />
                    I&apos;m a vendor
                  </Button>
                </Link>
              ) : null}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md text-xs">
              <Feature
                icon={<ShieldCheck className="h-4 w-4" />}
                label="RWA-approved vendors"
              />
              <Feature
                icon={<Truck className="h-4 w-4" />}
                label="Direct from your block"
              />
              <Feature
                icon={<Sparkles className="h-4 w-4" />}
                label="AI shopping help"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ChatPanel variant="hero" />
          </div>
        </div>
      </section>

      {/* Browse strip */}
      <section className="px-5 sm:px-8 py-10 bg-white border-y border-line">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Shop fresh" link={{ href: "/browse", label: "All categories" }} />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {productCats.map((c) => (
              <CategoryTile key={c.id} category={c} size="sm" />
            ))}
          </div>

          <div className="mt-8">
            <SectionHeading
              title="Book a service"
              link={{ href: "/services", label: "All services" }}
            />
            <div className="grid grid-cols-4 gap-2 sm:gap-3 sm:max-w-2xl">
              {serviceCats.map((c) => (
                <CategoryTile
                  key={c.id}
                  category={c}
                  href={`/services?cat=${c.slug}`}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendor teasers */}
      <section className="px-5 sm:px-8 py-12 max-w-6xl mx-auto">
        <SectionHeading
          title={`Vendors in ${SOCIETY.block ?? "your block"}`}
          link={{ href: "/home", label: "See all" }}
        />
        {vendors && vendors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendors.map((v: any) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-line rounded-lg p-8 text-center">
            <p className="text-sm text-ink-muted">
              No vendors approved yet. Are you a local vendor?{" "}
              <Link href="/login?role=vendor" className="text-brand underline">
                Apply to list your business
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* Vendor CTA strip */}
      <section className="px-5 sm:px-8 py-12 bg-brand text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-2xs uppercase tracking-wider opacity-70">For vendors</p>
            <h2 className="display text-2xl sm:text-3xl font-semibold mt-1">
              Run a stall or service near {SOCIETY.block ?? "the block"}?
            </h2>
            <p className="mt-2 text-sm opacity-90">
              List your business with the RWA — sell directly to residents who already
              trust you. No commission, you handle delivery.
            </p>
          </div>
          <Link href="/login?role=vendor">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-brand-dark border-white hover:bg-bg-subtle"
            >
              Apply to list <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="px-5 sm:px-8 py-10 text-center text-2xs uppercase tracking-wider text-ink-soft">
        Made for {fullSocietyName()} · {SOCIETY.location}
      </footer>
    </div>
  );
}

function SectionHeading({
  title,
  link,
}: {
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="display text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
      {link ? (
        <Link
          href={link.href}
          className="text-xs text-ink-muted hover:text-ink flex items-center gap-0.5"
        >
          {link.label} <ChevronRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 text-ink-muted">
      <span className="text-brand">{icon}</span>
      <span className="leading-tight">{label}</span>
    </div>
  );
}
