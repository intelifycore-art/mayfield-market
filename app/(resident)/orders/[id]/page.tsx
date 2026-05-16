import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/resident/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/resident/order-status";
import { Rupees } from "@/components/ui/rupees";
import { formatDateTime } from "@/lib/format";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireOnboarded();
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "*, items:order_items(*), vendor:vendors(id, business_name, contact_phone, whatsapp_phone, photo_url)",
    )
    .eq("id", params.id)
    .single();

  if (!order || order.resident_id !== profile.id) notFound();
  const vendor = (order as any).vendor;

  return (
    <>
      <PageHeader
        title={`Order ${order.id.slice(0, 8)}`}
        subtitle={vendor?.business_name}
        backHref="/orders"
        right={<OrderStatusBadge status={order.status} />}
      />
      <div className="px-5 py-5 space-y-4 mb-10">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-2xs uppercase tracking-wider text-ink-soft">
                Placed on
              </p>
              <p className="text-sm">{formatDateTime(order.placed_at)}</p>
            </div>

            <div className="border-t border-line pt-3">
              <h3 className="text-sm font-semibold">Items</h3>
              <ul className="mt-2 space-y-1.5">
                {(order as any).items.map((i: any) => (
                  <li
                    key={i.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-ink-muted">
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
              <div className="border-t border-line mt-3 pt-3 flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <Rupees amount={order.total} size="lg" />
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-2xs uppercase tracking-wider text-ink-soft">
                Delivery
              </p>
              <p className="text-sm flex items-start gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-ink-soft" />
                <span>
                  {order.tower ? `${order.tower}, ` : ""}
                  Flat {order.flat_no}
                </span>
              </p>
              {order.delivery_notes ? (
                <p className="text-xs text-ink-muted mt-1">{order.delivery_notes}</p>
              ) : null}
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-2xs uppercase tracking-wider text-ink-soft">Payment</p>
              <p className="text-sm">
                {order.payment_mode === "cod" ? "Cash on delivery" : "UPI direct"}
              </p>
            </div>
          </CardContent>
        </Card>

        {vendor && (vendor.contact_phone || vendor.whatsapp_phone) ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Need to reach the vendor?</p>
              <div className="flex gap-2">
                {vendor.contact_phone ? (
                  <a href={`tel:${vendor.contact_phone}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  </a>
                ) : null}
                {vendor.whatsapp_phone ? (
                  <a
                    href={`https://wa.me/${vendor.whatsapp_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
