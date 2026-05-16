import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/lib/types";

export function VendorCard({
  vendor,
  rating,
  reviewCount,
  className,
}: {
  vendor: Pick<
    Vendor,
    "id" | "business_name" | "tagline" | "photo_url" | "is_open" | "delivery_note"
  >;
  rating?: number;
  reviewCount?: number;
  className?: string;
}) {
  return (
    <Link
      href={`/vendor/${vendor.id}`}
      className={cn(
        "group block bg-white border border-line rounded-lg overflow-hidden hover:border-ink/20 hover:shadow-card transition",
        className,
      )}
    >
      <div className="relative aspect-[16/9] bg-bg-subtle">
        {vendor.photo_url ? (
          <Image
            src={vendor.photo_url}
            alt={vendor.business_name}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-faint text-xs">
            {vendor.business_name}
          </div>
        )}
        {!vendor.is_open ? (
          <div className="absolute inset-0 bg-ink/40 grid place-items-center">
            <Badge variant="outline" className="bg-white">
              Closed
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm tracking-tight leading-tight line-clamp-1">
          {vendor.business_name}
        </h3>
        {vendor.tagline ? (
          <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{vendor.tagline}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
          {rating !== undefined && rating > 0 ? (
            <span className="flex items-center gap-1 tabular">
              <Star className="h-3 w-3 fill-warning text-warning" strokeWidth={0} />
              {rating.toFixed(1)}{" "}
              {reviewCount ? <span className="text-ink-faint">({reviewCount})</span> : null}
            </span>
          ) : (
            <span className="text-ink-faint">No reviews yet</span>
          )}
          {vendor.delivery_note ? (
            <span className="flex items-center gap-1 truncate">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{vendor.delivery_note}</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
