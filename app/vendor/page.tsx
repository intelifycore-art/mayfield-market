import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Rupees } from "@/components/ui/rupees";
import { formatDateTime, relativeTime } from "@/lib/format";
import {
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  ShoppingBag,
  CalendarCheck,
} from "lucide-react";
import { OrderActions, BookingActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/apply");

  if (vendor.status === "pending") {
    const { data: cats } = await supabase
      .from("vendor_categories")
      .select("category:categories(name)")
      .eq("vendor_id", vendor.id);
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <Badge variant="warning" className="mb-3">
              Awaiting approval
            </Badge>
            <h2 className="display text-xl sm:text-2xl font-semibold">
              Hold tight, {vendor.business_name}
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
              The RWA admin usually reviews new vendors within a day. The
              moment you&apos;re approved, residents in your block can find
              you and place orders.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold">What you submitted</h3>

            <Field label="Business">{vendor.business_name}</Field>
            {vendor.tagline ? (
              <Field label="Tagline">{vendor.tagline}</Field>
            ) : null}
            {vendor.description ? (
              <Field label="About">
                <span className="text-ink-muted">{vendor.description}</span>
              </Field>
            ) : null}
            {cats && cats.length > 0 ? (
              <Field label="Categories">
                {cats
                  .map((vc: any) => vc.category?.name)
                  .filter(Boolean)
                  .join(", ")}
              </Field>
            ) : null}
            <Field label="Phone">
              <span className="tabular">{vendor.contact_phone ?? "—"}</span>
            </Field>
            {vendor.whatsapp_phone &&
            vendor.whatsapp_phone !== vendor.contact_phone ? (
              <Field label="WhatsApp">
                <span className="tabular">{vendor.whatsapp_phone}</span>
              </Field>
            ) : null}
            {vendor.payout_upi ? (
              <Field label="UPI">{vendor.payout_upi}</Field>
            ) : null}
            {vendor.delivery_note ? (
              <Field label="Delivery note">{vendor.delivery_note}</Field>
            ) : null}

            <p className="text-2xs text-ink-soft pt-2">
              Spotted a typo? You can edit everything from your{" "}
              <Link
                href="/vendor/profile"
                className="text-brand underline"
              >
                profile page
              </Link>{" "}
              even before approval.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vendor.status === "suspended") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Badge variant="danger" className="mb-3">
            Suspended
          </Badge>
          <h2 className="display text-xl font-semibold">Your storefront is paused</h2>
          <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
            Please contact the RWA admin to discuss reactivation.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Approved — show actionable queue
  const [{ data: openOrders }, { data: pendingBookings }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, items:order_items(qty, name_snapshot, unit, line_total)")
      .eq("vendor_id", vendor.id)
      .in("status", ["placed", "accepted", "out_for_delivery"])
      .order("placed_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("*")
      .eq("vendor_id", vendor.id)
      .in("status", ["requested", "confirmed", "in_progress"])
      .order("created_at", { ascending: false }),
  ]);

  // Fallback KPI computed in app
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total, status, placed_at")
    .eq("vendor_id", vendor.id)
    .gte("placed_at", today.toISOString());

  const todayRevenue = (todayOrders ?? [])
    .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
    .reduce((s, o) => s + Number(o.total), 0);
  const todayCount = (todayOrders ?? []).length;
  const queueCount = (openOrders ?? []).length + (pendingBookings ?? []).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Orders today" value={todayCount.toString()} icon={<ShoppingBag className="h-4 w-4" />} />
        <Stat label="Revenue today" value={<Rupees amount={todayRevenue} size="lg" />} icon={<Package className="h-4 w-4" />} />
        <Stat label="In queue" value={queueCount.toString()} icon={<Truck className="h-4 w-4" />} />
      </div>

      <section>
        <h2 className="display text-lg font-semibold mb-3">Open orders</h2>
        {!openOrders || openOrders.length === 0 ? (
          <Empty
            icon={<ShoppingBag className="h-8 w-8" />}
            title="No orders waiting"
            description="When residents place orders, they'll show up here."
          />
        ) : (
          <div className="space-y-3">
            {openOrders.map((o: any) => (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Order {o.id.slice(0, 8)}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {formatDateTime(o.placed_at)} ·{" "}
                        {o.tower ? `${o.tower}, ` : ""} Flat {o.flat_no}
                      </p>
                    </div>
                    <Badge
                      variant={
                        o.status === "placed"
                          ? "warning"
                          : o.status === "accepted"
                          ? "brand"
                          : "success"
                      }
                    >
                      {o.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {o.items.map((i: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-ink-muted">
                        <span>
                          {i.name_snapshot}{" "}
                          <span className="text-ink-faint tabular">
                            × {i.qty} {i.unit}
                          </span>
                        </span>
                        <span className="tabular">
                          <Rupees amount={i.line_total} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <div>
                      <Rupees amount={o.total} size="lg" />
                      <p className="text-xs text-ink-soft">
                        {o.payment_mode === "cod" ? "Cash on delivery" : "UPI direct"}
                      </p>
                    </div>
                    <OrderActions
                      orderId={o.id}
                      status={o.status}
                      phone={o.contact_phone}
                    />
                  </div>
                  {o.delivery_notes ? (
                    <p className="mt-2 text-xs text-ink-muted">
                      <span className="text-ink-soft">Notes:</span> {o.delivery_notes}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="display text-lg font-semibold mb-3">Service bookings</h2>
        {!pendingBookings || pendingBookings.length === 0 ? (
          <Empty
            icon={<CalendarCheck className="h-8 w-8" />}
            title="No pending bookings"
            description="Service requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((b: any) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{b.service_name_snapshot}</p>
                    <p className="text-xs text-ink-soft">
                      {relativeTime(b.created_at)} ·{" "}
                      {b.tower ? `${b.tower}, ` : ""} Flat {b.flat_no} · {b.contact_phone}
                    </p>
                    {b.preferred_slot ? (
                      <p className="text-xs text-ink-muted mt-1">
                        Preferred: {b.preferred_slot}
                      </p>
                    ) : null}
                    {b.notes ? (
                      <p className="text-xs text-ink-muted mt-1">{b.notes}</p>
                    ) : null}
                  </div>
                  <BookingActions bookingId={b.id} status={b.status} phone={b.contact_phone} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 items-start text-sm">
      <p className="text-2xs uppercase tracking-wider text-ink-soft pt-0.5">
        {label}
      </p>
      <p className="text-ink leading-snug">{children}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="text-ink-soft mb-1">{icon}</div>
        <p className="text-2xs uppercase tracking-wider text-ink-soft leading-tight">
          {label}
        </p>
        <div className="mt-1 text-lg sm:text-xl font-semibold tabular leading-none">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
