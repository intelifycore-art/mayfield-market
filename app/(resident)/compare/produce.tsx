"use client";

import Link from "next/link";
import { Plus, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rupees } from "@/components/ui/rupees";
import { useCart } from "@/lib/cart-store";

interface Offer {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  stock: number;
  vendor: {
    id: string;
    business_name: string;
    is_open: boolean;
    delivery_note: string | null;
  };
}

interface Group {
  /** display name (taken from the first offer) */
  name: string;
  /** offers from all vendors, sorted by price ascending */
  offers: Offer[];
  unit: string;
}

/**
 * Default view of /compare: fruits & vegetables across every vendor, grouped
 * by item name so the resident can compare the same thing side by side.
 */
export function ProduceComparison({ offers }: { offers: Offer[] }) {
  // Group by normalized name (lower + trim + collapse spaces) so that
  // identical names from different vendors merge.
  const map = new Map<string, Group>();
  for (const o of offers) {
    const key = o.name.toLowerCase().replace(/\s+/g, " ").trim();
    const g = map.get(key);
    if (g) {
      g.offers.push(o);
    } else {
      map.set(key, { name: o.name, unit: o.unit, offers: [o] });
    }
  }
  const groups = Array.from(map.values())
    .map((g) => ({
      ...g,
      offers: g.offers.slice().sort((a, b) => a.price - b.price),
    }))
    // multi-vendor items first (the meaningful comparisons), then singles
    .sort((a, b) => {
      const diff = b.offers.length - a.offers.length;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

  if (groups.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No produce listed yet by any vendor.
      </p>
    );
  }

  const multi = groups.filter((g) => g.offers.length > 1);
  const single = groups.filter((g) => g.offers.length === 1);

  return (
    <div className="space-y-5">
      {multi.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="display text-base font-semibold">
              Side-by-side prices
            </h2>
            <span className="text-2xs uppercase tracking-wider text-ink-soft">
              {multi.length} item{multi.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-3">
            {multi.map((g) => (
              <GroupCard key={g.name} group={g} />
            ))}
          </div>
        </section>
      ) : null}

      {single.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-ink-muted mb-2">
            Only at one vendor
          </h3>
          <div className="space-y-2">
            {single.map((g) => (
              <SingleRow key={g.name} group={g} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  const cheapest = group.offers[0]!.price;
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <p className="text-sm font-semibold leading-tight">{group.name}</p>
        <p className="text-2xs text-ink-soft mt-0.5">
          {group.offers.length} vendors · sold by {group.unit}
        </p>
        <div className="mt-2 divide-y divide-line">
          {group.offers.map((o) => (
            <OfferRow key={o.id} offer={o} isBest={o.price === cheapest} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OfferRow({ offer, isBest }: { offer: Offer; isBest: boolean }) {
  const { items, add } = useCart();
  const inCart = items.find((x) => x.listing_id === offer.id);
  const outOfStock = offer.stock <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2",
        isBest && "bg-success-tint/40 -mx-2 px-2 rounded-md",
      )}
    >
      <Link
        href={`/vendor/${offer.vendor.id}`}
        className="flex-1 min-w-0 hover:underline"
      >
        <p className="text-sm font-medium truncate">{offer.vendor.business_name}</p>
        {offer.vendor.delivery_note ? (
          <p className="text-2xs text-ink-soft truncate">
            {offer.vendor.delivery_note}
          </p>
        ) : null}
      </Link>
      <p className="tabular text-sm shrink-0">
        <Rupees amount={offer.price} className="text-ink" size="sm" />
        <span className="text-2xs text-ink-soft"> /{offer.unit}</span>
      </p>
      {isBest ? (
        <Badge variant="success" className="shrink-0">
          <Trophy className="h-3 w-3" />
          Best
        </Badge>
      ) : null}
      {outOfStock ? (
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
              listing_id: offer.id,
              vendor_id: offer.vendor.id,
              vendor_name: offer.vendor.business_name,
              name: offer.name,
              unit: offer.unit,
              price: offer.price,
              image_url: offer.image_url,
            })
          }
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      )}
    </div>
  );
}

function SingleRow({ group }: { group: Group }) {
  return (
    <Card>
      <CardContent className="p-3">
        <OfferRow offer={group.offers[0]!} isBest={false} />
        <p className="text-2xs text-ink-soft mt-1 pl-1">
          {group.name} · only at {group.offers[0]!.vendor.business_name}
        </p>
      </CardContent>
    </Card>
  );
}
