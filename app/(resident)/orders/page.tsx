import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/resident/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge, BookingStatusBadge } from "@/components/resident/order-status";
import { Rupees } from "@/components/ui/rupees";
import { Empty } from "@/components/ui/empty";
import { Receipt, CalendarCheck } from "lucide-react";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const profile = await requireProfile({ next: "/orders" });
  const supabase = createClient();

  const [{ data: orders }, { data: bookings }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, status, total, placed_at, vendor:vendors(business_name), items:order_items(qty)",
      )
      .eq("resident_id", profile.id)
      .order("placed_at", { ascending: false })
      .limit(50),
    supabase
      .from("bookings")
      .select(
        "id, status, created_at, service_name_snapshot, vendor:vendors(business_name)",
      )
      .eq("resident_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <>
      <PageHeader title="Orders & bookings" backHref="/" />
      <div className="px-5 py-5 space-y-6 mb-10">
        <section>
          <h2 className="display text-base font-semibold mb-3">Orders</h2>
          {!orders || orders.length === 0 ? (
            <Empty
              icon={<Receipt className="h-8 w-8" />}
              title="No orders yet"
              description="Your past orders will appear here."
            />
          ) : (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <Link key={o.id} href={`/orders/${o.id}`}>
                  <Card className="hover:border-ink/20 transition">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {o.vendor?.business_name ?? "Vendor"}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? "" : "s"} ·{" "}
                          {relativeTime(o.placed_at)}
                        </p>
                      </div>
                      <Rupees amount={o.total} />
                      <OrderStatusBadge status={o.status} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="display text-base font-semibold mb-3">Service bookings</h2>
          {!bookings || bookings.length === 0 ? (
            <Empty
              icon={<CalendarCheck className="h-8 w-8" />}
              title="No bookings yet"
              description="Service requests you make will appear here."
            />
          ) : (
            <div className="space-y-2">
              {bookings.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {b.service_name_snapshot}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {b.vendor?.business_name} · {relativeTime(b.created_at)}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
