"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/vendor", label: "Today" },
  { href: "/vendor/listings", label: "Products" },
  { href: "/vendor/services", label: "Services" },
  { href: "/vendor/profile", label: "Profile" },
];

export function VendorNav() {
  const pathname = usePathname();
  return (
    <nav className="border-t border-line bg-white">
      <div className="max-w-5xl mx-auto px-3 flex gap-1 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => {
          const active =
            tab.href === "/vendor" ? pathname === "/vendor" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-3 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
