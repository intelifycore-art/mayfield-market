import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { BookingForm } from "./form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rupees } from "@/components/ui/rupees";
import { LogIn } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiceBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getCurrentProfile();
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, description, starting_price, pricing_unit, vendor:vendors(id, business_name, society_id, status)",
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();
  const vendor = service.vendor as any;
  if (societyId && vendor.society_id !== societyId) notFound();

  return (
    <>
      <PageHeader title="Book service" backHref="/services" />
      <div className="px-5 py-5 space-y-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-ink-soft">{vendor.business_name}</p>
            <p className="font-medium text-base mt-0.5">{service.name}</p>
            {service.description ? (
              <p className="text-sm text-ink-muted mt-1">{service.description}</p>
            ) : null}
            {service.starting_price ? (
              <p className="mt-3 tabular text-sm">
                <span className="text-ink-soft text-xs">from </span>
                <Rupees amount={service.starting_price} />
                <span className="text-ink-soft text-xs"> / {service.pricing_unit}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        {profile ? (
          <BookingForm
            serviceId={service.id}
            serviceName={service.name}
            vendorId={vendor.id}
            societyId={profile.society_id ?? societyId ?? ""}
            defaultFlat={profile.flat_no ?? ""}
            defaultTower={profile.tower ?? ""}
            defaultPhone={profile.phone ?? ""}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm font-medium">Sign in to book</p>
              <p className="text-xs text-ink-muted">
                We need your flat number and a contact phone to send the request to the
                vendor.
              </p>
              <Link href={`/login?next=${encodeURIComponent(`/services/${service.id}`)}`}>
                <Button variant="brand" size="lg" className="w-full">
                  <LogIn className="h-4 w-4" />
                  Sign in to continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
