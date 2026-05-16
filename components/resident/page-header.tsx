"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backHref,
  className,
  right,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  className?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-line",
        className,
      )}
    >
      <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-2">
        {backHref ? (
          <Link href={backHref} className="-ml-2 p-1.5 hover:bg-bg-subtle rounded-md">
            <ChevronLeft className="h-5 w-5 text-ink-muted" />
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            className="-ml-2 p-1.5 hover:bg-bg-subtle rounded-md"
          >
            <ChevronLeft className="h-5 w-5 text-ink-muted" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-ink-muted truncate">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}
