"use client";

import Link from "next/link";
import { useCart, groupByVendor } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rupees } from "@/components/ui/rupees";
import { Empty } from "@/components/ui/empty";
import { PageHeader } from "@/components/resident/page-header";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, inc, dec, remove } = useCart();

  // Avoid hydration mismatch from persisted localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const grouped = mounted ? groupByVendor(items) : [];

  return (
    <>
      <PageHeader title="Cart" backHref="/" />
      <div className="px-5 py-5 space-y-4 mb-10">
        {!mounted ? null : grouped.length === 0 ? (
          <Empty
            icon={<ShoppingBag className="h-10 w-10" />}
            title="Cart is empty"
            description="Browse vendors and add some essentials."
            action={
              <Link href="/browse">
                <Button variant="brand">Browse vendors</Button>
              </Link>
            }
          />
        ) : (
          <>
            {grouped.map((g) => (
              <Card key={g.vendor_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Link
                      href={`/vendor/${g.vendor_id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {g.vendor_name}
                    </Link>
                    <Rupees amount={g.subtotal} className="text-base" />
                  </div>
                  <div className="divide-y divide-line">
                    {g.items.map((i) => (
                      <div key={i.listing_id} className="flex items-center gap-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-tight truncate">{i.name}</p>
                          <p className="text-xs text-ink-soft tabular">
                            ₹{i.price} / {i.unit} × {i.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => dec(i.listing_id)}
                            className="h-7 w-7 rounded-md border border-line hover:bg-bg-subtle grid place-items-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm tabular font-medium">
                            {i.qty}
                          </span>
                          <button
                            onClick={() => inc(i.listing_id)}
                            className="h-7 w-7 rounded-md border border-line hover:bg-bg-subtle grid place-items-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => remove(i.listing_id)}
                            className="h-7 w-7 rounded-md hover:bg-danger-tint text-ink-soft hover:text-danger grid place-items-center ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={`/checkout/${g.vendor_id}`} className="block mt-3">
                    <Button variant="brand" className="w-full">
                      Checkout from {g.vendor_name} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            <p className="text-xs text-ink-soft text-center">
              Orders are placed per-vendor. Each vendor handles their own delivery.
            </p>
          </>
        )}
      </div>
    </>
  );
}
