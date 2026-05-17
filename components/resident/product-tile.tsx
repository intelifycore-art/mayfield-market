"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rupees } from "@/components/ui/rupees";
import { useCart } from "@/lib/cart-store";
import type { Listing } from "@/lib/types";

/**
 * Compact vertical product card for grid layouts (landing page,
 * search results). For row-style listings inside a vendor page use
 * ListingCard instead.
 */
export function ProductTile({
  listing,
  vendorId,
  vendorName,
}: {
  listing: Pick<Listing, "id" | "name" | "description" | "price" | "unit" | "image_url" | "stock">;
  vendorId: string;
  vendorName: string;
}) {
  const { items, add } = useCart();
  const inCart = items.find((i) => i.listing_id === listing.id);

  return (
    <div className="bg-white border border-line rounded-lg overflow-hidden flex flex-col">
      <Link
        href={`/vendor/${vendorId}`}
        className="relative aspect-square bg-bg-subtle block"
      >
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-faint text-xs px-2 text-center">
            {listing.name}
          </div>
        )}
      </Link>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <Link href={`/vendor/${vendorId}`} className="block">
          <p className="text-2xs uppercase tracking-wider text-ink-soft truncate">
            {vendorName}
          </p>
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {listing.name}
          </p>
        </Link>
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-1">
          <p className="tabular">
            <Rupees amount={listing.price} className="text-ink" size="sm" />
            <span className="text-2xs text-ink-soft"> /{listing.unit}</span>
          </p>
          {inCart ? (
            <span className="text-xs text-success flex items-center gap-1 tabular shrink-0">
              <Check className="h-3 w-3" /> {inCart.qty}
            </span>
          ) : (
            <Button
              size="sm"
              variant="soft"
              className="h-7 px-2"
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
              <Plus className="h-3 w-3" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
