import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rupees } from "@/components/ui/rupees";
import { Empty } from "@/components/ui/empty";
import {
  Users,
  Store,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { formatDateTime, relativeTime } from "@/lib/format";
import { OrderStatusBadge } from "@/components/resident/order-status";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: vendorCount },
    { count: pendingCount },
    { count: residentCount },
    { data: todayOrders },
    { data: pendingVendors },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "resident"),
    supabase
      .from("orders")
      .select("total, status")
      .gte("placed_at", today.toISOString()),
    supabase
      .from("vendors")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select(
        "id, total, status, placed_at, vendor:vendors(business_name), resident:profiles(full_name, flat_no, tower)",
      )
      .order("placed_at", { ascending: false })
      .limit(10),
  ]);

  const todayRevenue = (todayOrders ?? [])
    .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-ink-muted">
          Snapshot of activity in your block today.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          label="Vendors approved"
          value={String((vendorCount ?? 0) - (pendingCount ?? 0))}
          icon={<Store className="h-4 w-4" />}
        />
        <Stat
          label="Pending approvals"
          value={String(pendingCount ?? 0)}
          icon={<AlertCircle className="h-4 w-4" />}
          accent={(pendingCount ?? 0) > 0}
        />
        <Stat
          label="Residents"
          value={String(residentCount ?? 0)}
          icon={<Users className="h-4 w-4" />}
        />
        <Stat
          label="Today's order volume"
          value={<Rupees amount={todayRevenue} size="lg" />}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="display text-lg font-semibold">Pending vendor approvals</h2>
          <Link
            href="/admin/vendors"
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-0.5"
          >
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {!pendingVendors || pendingVendors.length === 0 ? (
          <Empty
            title="All caught up"
            description="No vendor applications waiting."
            icon={<Store className="h-8 w-8" />}
          />
        ) : (
          <div className="space-y-2">
            {pendingVendors.map((v) => (
              <Link key={v.id} href={`/admin/vendors`}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{v.business_name}</p>
                      <p className="text-xs text-ink-soft truncate">
                        {v.tagline ?? v.contact_phone ?? "—"}
                      </p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="display text-lg font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-0.5"
          >
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <Empty
            title="No orders yet"
            description="Once residents start ordering, you'll see activity here."
            icon={<ShoppingBag className="h-8 w-8" />}
          />
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{o.vendor?.business_name}</span>{" "}
                      <span className="text-ink-soft">to</span>{" "}
                      <span className="font-medium">
                        {o.resident?.full_name}
                        {o.resident?.flat_no ? ` · ${o.resident.flat_no}` : ""}
                      </span>
                    </p>
                    <p className="text-xs text-ink-soft">
                      {relativeTime(o.placed_at)} · {formatDateTime(o.placed_at)}
                    </p>
                  </div>
                  <Rupees amount={o.total} />
                  <OrderStatusBadge status={o.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-warning/30 bg-warning-tint/30" : undefined}>
      <CardContent className="p-4">
        <div className="text-ink-soft mb-1.5">{icon}</div>
        <p className="text-2xs uppercase tracking-wider text-ink-soft">{label}</p>
        <div className="mt-1 text-xl font-semibold tabular">{value}</div>
      </CardContent>
    </Card>
  );
}
