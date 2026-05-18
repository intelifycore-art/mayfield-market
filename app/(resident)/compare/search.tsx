"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const QUICK = ["Tomato", "Onion", "Potato", "Banana", "Apple", "Milk"];

export function CompareSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function go(term?: string) {
    const v = (term ?? q).trim();
    if (!v) {
      router.push("/compare");
      return;
    }
    router.push(`/compare?q=${encodeURIComponent(v)}`);
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search an item — tomato, milk, apples..."
            className="pl-9 pr-9"
            autoFocus={!initial}
          />
          {q ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                router.push("/compare");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Button type="submit" variant="brand">
          Compare
        </Button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((t) => (
          <button
            key={t}
            onClick={() => {
              setQ(t);
              go(t);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-bg-subtle text-ink-muted hover:bg-brand-tint hover:text-brand-dark transition"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
