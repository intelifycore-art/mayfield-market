"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Rupees } from "@/components/ui/rupees";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { ChatListing, ChatVendor } from "@/lib/chat";

export function ChatListings({ listings }: { listings: ChatListing[] }) {
  if (listings.length === 0) return null;
  return (
    <div className="space-y-2">
      {listings.map((l) => (
        <ChatListingRow key={l.id} listing={l} />
      ))}
    </div>
  );
}

function ChatListingRow({ listing }: { listing: ChatListing }) {
  const { items, add } = useCart();
  const inCart = items.find((i) => i.listing_id === listing.id);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-line">
      <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-bg-subtle">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : null}
      </div>
      <Link
        href={`/vendor/${listing.vendor.id}`}
        className="flex-1 min-w-0 hover:underline"
      >
        <p className="text-sm font-medium leading-tight truncate">{listing.name}</p>
        <p className="text-xs text-ink-soft truncate">
          {listing.vendor.business_name} · <Rupees amount={listing.price} className="text-ink-soft" /> / {listing.unit}
        </p>
      </Link>
      {inCart ? (
        <span className="text-xs text-success flex items-center gap-1 tabular">
          <Check className="h-3 w-3" /> {inCart.qty}
        </span>
      ) : (
        <Button
          size="sm"
          variant="soft"
          onClick={() =>
            add({
              listing_id: listing.id,
              vendor_id: listing.vendor.id,
              vendor_name: listing.vendor.business_name,
              name: listing.name,
              unit: listing.unit,
              price: listing.price,
              image_url: listing.image_url,
            })
          }
        >
          <Plus className="h-3 w-3" /> Add
        </Button>
      )}
    </div>
  );
}

export function ChatVendors({ vendors }: { vendors: ChatVendor[] }) {
  if (vendors.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {vendors.map((v) => (
        <Link
          key={v.id}
          href={`/vendor/${v.id}`}
          className="rounded-lg bg-white border border-line p-2 hover:border-ink/20 transition"
        >
          <p className="text-xs font-medium truncate">{v.business_name}</p>
          <p className="text-2xs text-ink-soft truncate">{v.tagline ?? v.delivery_note}</p>
        </Link>
      ))}
    </div>
  );
}
