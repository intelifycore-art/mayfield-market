import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rupees } from "@/components/ui/rupees";
import type { Service } from "@/lib/types";

export function ServiceTile({
  service,
  vendorName,
}: {
  service: Pick<
    Service,
    "id" | "name" | "description" | "starting_price" | "pricing_unit"
  >;
  vendorName: string;
}) {
  return (
    <div className="bg-white border border-line rounded-lg p-3 flex flex-col gap-1.5">
      <p className="text-2xs uppercase tracking-wider text-ink-soft truncate">
        {vendorName}
      </p>
      <p className="text-sm font-medium leading-tight">{service.name}</p>
      {service.description ? (
        <p className="text-xs text-ink-muted line-clamp-2">{service.description}</p>
      ) : null}
      <div className="mt-auto pt-2 flex items-center justify-between gap-2">
        {service.starting_price ? (
          <p className="tabular text-sm">
            <span className="text-2xs text-ink-soft">from </span>
            <Rupees amount={service.starting_price} className="text-ink" size="sm" />
            <span className="text-2xs text-ink-soft"> /{service.pricing_unit}</span>
          </p>
        ) : (
          <span className="text-xs text-ink-soft">on request</span>
        )}
        <Link href={`/services/${service.id}`}>
          <Button size="sm" variant="brand" className="h-7 px-2">
            <CalendarPlus className="h-3 w-3" />
            Book
          </Button>
        </Link>
      </div>
    </div>
  );
}
