"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShieldCheck, Star, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rupees } from "@/components/ui/rupees";
import { Empty } from "@/components/ui/empty";
import { RWA_STAFF_POLICY, HOUSEHOLD_GROUP_LABELS } from "@/lib/policy";
import type { HouseholdService, Maid, MaidService } from "@/lib/types";

function rateLabel(s: HouseholdService) {
  if (s.rate_min == null) return "On request";
  if (s.rate_max != null && s.rate_max !== s.rate_min) {
    return (
      <>
        <Rupees amount={s.rate_min} size="sm" className="text-ink" />–
        <Rupees amount={s.rate_max} size="sm" className="text-ink" />
        <span className="text-2xs text-ink-soft"> /{s.rate_unit}</span>
      </>
    );
  }
  return (
    <>
      <Rupees amount={s.rate_min} size="sm" className="text-ink" />
      <span className="text-2xs text-ink-soft"> /{s.rate_unit}</span>
    </>
  );
}

export function MaidsBrowser({
  services,
  maids,
  links,
}: {
  services: HouseholdService[];
  maids: Maid[];
  links: MaidService[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [showRates, setShowRates] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const servicesById = new Map(services.map((s) => [s.id, s]));
  const maidServiceIds = new Map<string, Set<string>>();
  for (const l of links) {
    if (!maidServiceIds.has(l.maid_id)) maidServiceIds.set(l.maid_id, new Set());
    maidServiceIds.get(l.maid_id)!.add(l.household_service_id);
  }

  const filteredMaids =
    filter === "all"
      ? maids
      : maids.filter((m) => maidServiceIds.get(m.id)?.has(filter));

  // group services for the rate card
  const groups = Array.from(new Set(services.map((s) => s.grp)));

  return (
    <div className="px-5 py-5 space-y-5 mb-10">
      {/* Official rate card */}
      <Card>
        <button
          onClick={() => setShowRates((v) => !v)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <div>
              <p className="text-sm font-semibold">RWA official rate card</p>
              <p className="text-2xs text-ink-soft">
                Fixed by C-Block RWA · fair-price reference
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-soft transition-transform",
              showRates && "rotate-180",
            )}
          />
        </button>
        {showRates ? (
          <CardContent className="pt-0 space-y-4">
            <p className="text-xs text-ink-muted">{RWA_STAFF_POLICY.intro()}</p>
            {groups.map((g) => (
              <div key={g}>
                <p className="text-2xs uppercase tracking-wider text-ink-soft mb-1.5">
                  {HOUSEHOLD_GROUP_LABELS[g] ?? g}
                </p>
                <div className="divide-y divide-line border border-line rounded-lg">
                  {services
                    .filter((s) => s.grp === g)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-start justify-between gap-3 p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {s.title}
                          </p>
                          {s.description ? (
                            <p className="text-2xs text-ink-soft mt-0.5">
                              {s.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="tabular text-right shrink-0 whitespace-nowrap">
                          {rateLabel(s)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        ) : null}
      </Card>

      {/* House rules */}
      <Card>
        <button
          onClick={() => setShowRules((v) => !v)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <p className="text-sm font-semibold">House rules for hired staff</p>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-soft transition-transform",
              showRules && "rotate-180",
            )}
          />
        </button>
        {showRules ? (
          <CardContent className="pt-0 space-y-2.5">
            {RWA_STAFF_POLICY.rules.map((r) => (
              <div key={r.title} className="text-sm">
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{r.detail}</p>
              </div>
            ))}
          </CardContent>
        ) : null}
      </Card>

      {/* Filter + maid list */}
      <div>
        <h2 className="display text-base font-semibold mb-2">Available staff</h2>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            All ({maids.length})
          </Chip>
          {services.map((s) => {
            const count = maids.filter((m) =>
              maidServiceIds.get(m.id)?.has(s.id),
            ).length;
            if (count === 0) return null;
            return (
              <Chip
                key={s.id}
                active={filter === s.id}
                onClick={() => setFilter(s.id)}
              >
                {s.title} ({count})
              </Chip>
            );
          })}
        </div>

        {filteredMaids.length === 0 ? (
          <Empty
            title="No staff listed yet"
            description="The RWA hasn't added staff for this job yet. Check back soon."
          />
        ) : (
          <div className="space-y-2 mt-2">
            {filteredMaids.map((m) => {
              const sids = maidServiceIds.get(m.id) ?? new Set();
              const jobNames = Array.from(sids)
                .map((id) => servicesById.get(id)?.title)
                .filter(Boolean)
                .slice(0, 3);
              return (
                <Link key={m.id} href={`/maids/${m.id}`}>
                  <Card className="hover:border-ink/20 transition">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-bg-subtle shrink-0">
                        {m.photo_url ? (
                          <Image
                            src={m.photo_url}
                            alt={m.full_name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-ink-faint text-sm font-medium">
                            {m.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">
                            {m.full_name}
                          </p>
                          <Badge variant="default">{m.age} yrs</Badge>
                        </div>
                        <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 fill-warning text-warning" strokeWidth={0} />
                          {m.experience_years} yr
                          {m.experience_years === 1 ? "" : "s"} experience
                          {m.languages ? (
                            <>
                              <span className="text-ink-faint">·</span>
                              <Languages className="h-3 w-3" />
                              {m.languages}
                            </>
                          ) : null}
                        </p>
                        {jobNames.length > 0 ? (
                          <p className="text-2xs text-ink-soft mt-1 truncate">
                            {jobNames.join(" · ")}
                            {sids.size > 3 ? ` +${sids.size - 3} more` : ""}
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition shrink-0",
        active
          ? "bg-brand text-white"
          : "bg-bg-subtle text-ink-muted hover:bg-bg-muted",
      )}
    >
      {children}
    </button>
  );
}
