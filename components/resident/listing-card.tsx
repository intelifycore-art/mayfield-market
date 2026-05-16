"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Rupees } from "@/components/ui/rupees";
import type { Listing } from "@/lib/types";

export function ListingCard({
  listing,
  vendorId,
  vendorName,
}: {
  listing: Listing;
  vendorId: string;
  vendorName: string;
}) {
  const { items, add, inc, dec } = useCart();
  const inCart = items.find((i) => i.listing_id === listing.id);
  const outOfStock = listing.stock <= 0;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-line last:border-0">
      <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-bg-subtle">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate">{listing.name}</p>
        {listing.description ? (
          <p className="text-xs text-ink-soft line-clamp-1">{listing.description}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-1">
          <Rupees amount={listing.price} className="text-ink" />
          <span className="text-xs text-ink-soft">/ {listing.unit}</span>
        </div>
      </div>
      <div className="shrink-0">
        {outOfStock ? (
          <span className="text-2xs uppercase tracking-wider text-ink-faint">
            Out of stock
          </span>
        ) : inCart ? (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => dec(listing.id)}
              className="h-8 w-8"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-semibold tabular">
              {inCart.qty}
            </span>
            <Button
              size="icon"
              variant="brand"
              onClick={() => inc(listing.id)}
              className="h-8 w-8"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="soft"
            onClick={() =>
              add({
                listing_id: listing.id,
                vendor_id: vendorId,
                vendor_name: vendorName,
                name: listing.name,
                unit: listing.unit,
                price: listing.price,
                image_url: listing.image_url,
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}
