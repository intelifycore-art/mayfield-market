"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingBag, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Grid3x3 },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/95 backdrop-blur pb-safe">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/home"
              ? pathname === "/home" || pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-2xs font-medium transition-colors",
                active ? "text-brand" : "text-ink-soft hover:text-ink",
              )}
            >
              <span className="relative">
                <Icon strokeWidth={1.6} className="h-5 w-5" />
                {tab.badge && totalQty > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[10px] font-semibold grid place-items-center tabular">
                    {totalQty > 9 ? "9+" : totalQty}
                  </span>
                ) : null}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
