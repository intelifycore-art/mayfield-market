import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/resident/page-header";
import { BookingForm } from "./form";
import { Card, CardContent } from "@/components/ui/card";
import { Rupees } from "@/components/ui/rupees";

export const dynamic = "force-dynamic";

export default async function ServiceBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireOnboarded();
  const supabase = createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, description, starting_price, pricing_unit, vendor:vendors(id, business_name, society_id, status)",
    )
    .eq("id", params.id)
    .single();

  if (!service || (service.vendor as any).society_id !== profile.society_id) {
    notFound();
  }
  const vendor = service.vendor as any;

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

        <BookingForm
          serviceId={service.id}
          serviceName={service.name}
          vendorId={vendor.id}
          societyId={profile.society_id!}
          defaultFlat={profile.flat_no ?? ""}
          defaultTower={profile.tower ?? ""}
          defaultPhone={profile.phone ?? ""}
        />
      </div>
    </>
  );
}
