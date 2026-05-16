import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Clock, Star, CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { ListingCard } from "@/components/resident/listing-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Rupees } from "@/components/ui/rupees";

export const dynamic = "force-dynamic";

export default async function VendorPage({ params }: { params: { id: string } }) {
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!vendor) notFound();
  if (societyId && vendor.society_id !== societyId) notFound();

  const [{ data: listings }, { data: services }, { data: stats }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("services")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("name"),
    supabase.from("vendor_stats").select("*").eq("vendor_id", vendor.id).maybeSingle(),
  ]);

  const phone = vendor.contact_phone ?? "";
  const wa = vendor.whatsapp_phone ?? vendor.contact_phone ?? "";

  return (
    <>
      <PageHeader title={vendor.business_name} backHref="/browse" />

      <div className="relative h-44 bg-bg-subtle">
        {vendor.banner_url || vendor.photo_url ? (
          <Image
            src={(vendor.banner_url || vendor.photo_url)!}
            alt={vendor.business_name}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 640px, 100vw"
          />
        ) : null}
      </div>

      <div className="px-5 -mt-8 relative z-10">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="display text-xl font-semibold tracking-tight leading-tight">
                  {vendor.business_name}
                </h1>
                {vendor.tagline ? (
                  <p className="text-sm text-ink-muted mt-0.5">{vendor.tagline}</p>
                ) : null}
              </div>
              <Badge variant={vendor.is_open ? "success" : "default"}>
                {vendor.is_open ? "Open" : "Closed"}
              </Badge>
            </div>

            {(stats?.review_count ?? 0) > 0 ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-ink-soft tabular">
                <Star className="h-3 w-3 fill-warning text-warning" strokeWidth={0} />
                {Number(stats!.avg_rating).toFixed(1)} ({stats!.review_count} reviews)
              </p>
            ) : null}

            {vendor.delivery_note ? (
              <p className="mt-2 text-xs text-ink-soft flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {vendor.delivery_note}
              </p>
            ) : null}

            {vendor.description ? (
              <p className="mt-3 text-sm text-ink-muted">{vendor.description}</p>
            ) : null}

            <div className="mt-3 flex gap-2">
              {phone ? (
                <a href={`tel:${phone}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </a>
              ) : null}
              {wa ? (
                <a
                  href={`https://wa.me/${wa.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {listings && listings.length > 0 ? (
        <section className="px-5 mt-5">
          <h2 className="display text-base font-semibold mb-1">Products</h2>
          <p className="text-xs text-ink-soft mb-2">
            Add items to your cart, then check out with this vendor.
          </p>
          <div className="bg-white border border-line rounded-lg px-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                vendorId={vendor.id}
                vendorName={vendor.business_name}
              />
            ))}
          </div>
        </section>
      ) : null}

      {services && services.length > 0 ? (
        <section className="px-5 mt-5 mb-10">
          <h2 className="display text-base font-semibold mb-1">Services</h2>
          <p className="text-xs text-ink-soft mb-2">
            Request a booking and {vendor.business_name} will get in touch.
          </p>
          <div className="space-y-2">
            {services.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{s.name}</p>
                      {s.description ? (
                        <p className="text-xs text-ink-muted mt-0.5">{s.description}</p>
                      ) : null}
                      {s.starting_price ? (
                        <p className="text-sm mt-2 tabular">
                          <span className="text-ink-soft text-xs">from </span>
                          <Rupees amount={s.starting_price} />
                          <span className="text-ink-soft text-xs"> / {s.pricing_unit}</span>
                        </p>
                      ) : null}
                    </div>
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
        </section>
      ) : null}

      {(!listings || listings.length === 0) && (!services || services.length === 0) ? (
        <Empty
          title="No listings yet"
          description={`${vendor.business_name} hasn't added any products or services yet.`}
        />
      ) : null}
    </>
  );
}
