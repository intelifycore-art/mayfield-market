import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MapPin } from "lucide-react";
import { SOCIETY } from "@/lib/society";

export function ResidentHeader({
  greeting,
  flatLabel,
}: {
  greeting?: string;
  flatLabel?: string | null;
}) {
  return (
    <header className="px-5 pt-5 pb-3 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <Link href="/home">
          <Logo size="sm" />
        </Link>
        <div className="text-right">
          <p className="text-2xs uppercase tracking-wider text-ink-soft flex items-center gap-1 justify-end">
            <MapPin className="h-3 w-3" />
            {SOCIETY.name} {SOCIETY.block}
          </p>
          {flatLabel ? (
            <p className="text-xs text-ink-muted mt-0.5">{flatLabel}</p>
          ) : null}
        </div>
      </div>
      {greeting ? (
        <h1 className="display text-2xl sm:text-3xl font-semibold mt-5 tracking-tight">
          {greeting}
        </h1>
      ) : null}
    </header>
  );
}
