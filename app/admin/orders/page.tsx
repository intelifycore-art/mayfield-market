import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Rupees } from "@/components/ui/rupees";
import { OrderStatusBadge } from "@/components/resident/order-status";
import { ShoppingBag } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "*, items:order_items(qty), vendor:vendors(business_name), resident:profiles(full_name, flat_no, tower)",
    )
    .order("placed_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-ink-muted">Last 100 orders across all vendors.</p>
      </div>
      {!orders || orders.length === 0 ? (
        <Empty
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No orders yet"
        />
      ) : (
        <div className="space-y-2">
          {orders.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{o.vendor?.business_name}</span>{" "}
                    <span className="text-ink-soft">·</span>{" "}
                    <span className="text-ink-muted">
                      {o.resident?.full_name}
                      {o.resident?.flat_no ? ` · ${o.resident.flat_no}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-ink-soft">
                    {formatDateTime(o.placed_at)} · {o.items?.length ?? 0} items
                  </p>
                </div>
                <Rupees amount={o.total} />
                <OrderStatusBadge status={o.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
