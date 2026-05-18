"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rupees } from "@/components/ui/rupees";
import { useCart } from "@/lib/cart-store";

interface Row {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  stock: number;
  vendor: {
    id: string;
    business_name: string;
    photo_url: string | null;
    is_open: boolean;
    delivery_note: string | null;
  };
}

export function CompareResults({ query, rows }: { query: string; rows: Row[] }) {
  const { items, add } = useCart();
  const cheapest = rows.length > 0 ? rows[0].price : null;

  return (
    <div>
      <p className="text-xs text-ink-soft mb-2">
        {rows.length} match{rows.length === 1 ? "" : "es"} for{" "}
        <span className="font-medium text-ink">&ldquo;{query}&rdquo;</span> ·
        sorted by price. Units can differ (kg / dozen / piece) — check before
        comparing.
      </p>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const inCart = items.find((x) => x.listing_id === r.id);
          const isBest = r.price === cheapest;
          return (
            <Card
              key={r.id}
              className={cn(isBest && "border-success/40 bg-success-tint/30")}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-bg-subtle shrink-0">
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium leading-tight truncate">
                      {r.name}
                    </p>
                    {isBest ? (
                      <Badge variant="success">
                        <Trophy className="h-3 w-3" /> Best price
                      </Badge>
                    ) : null}
                  </div>
                  <Link
                    href={`/vendor/${r.vendor.id}`}
                    className="text-xs text-ink-soft hover:underline truncate block"
                  >
                    {r.vendor.business_name}
                    {r.vendor.delivery_note ? ` · ${r.vendor.delivery_note}` : ""}
                  </Link>
                  <p className="tabular text-sm mt-0.5">
                    <Rupees amount={r.price} className="text-ink" size="sm" />
                    <span className="text-2xs text-ink-soft"> /{r.unit}</span>
                  </p>
                </div>
                {r.stock <= 0 ? (
                  <span className="text-2xs uppercase tracking-wider text-ink-faint shrink-0">
                    Out
                  </span>
                ) : inCart ? (
                  <span className="text-xs text-success flex items-center gap-1 tabular shrink-0">
                    <Check className="h-3 w-3" /> {inCart.qty}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={isBest ? "brand" : "soft"}
                    className="shrink-0"
                    onClick={() =>
                      add({
                        listing_id: r.id,
                        vendor_id: r.vendor.id,
                        vendor_name: r.vendor.business_name,
                        name: r.name,
                        unit: r.unit,
                        price: r.price,
                        image_url: r.image_url,
                      })
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
