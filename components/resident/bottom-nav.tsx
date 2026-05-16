"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingBag, Receipt, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

const TABS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/browse", label: "Browse", icon: Grid3x3 },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/orders", label: "Orders", icon: Receipt, requiresAuth: true },
] as const;

export function BottomNav({ signedIn = true }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/95 backdrop-blur pb-safe">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            "exact" in tab && tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const href =
            "requiresAuth" in tab && tab.requiresAuth && !signedIn
              ? `/login?next=${encodeURIComponent(tab.href)}`
              : tab.href;
          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-2xs font-medium transition-colors",
                active ? "text-brand" : "text-ink-soft hover:text-ink",
              )}
            >
              <span className="relative">
                <Icon strokeWidth={1.6} className="h-5 w-5" />
                {"badge" in tab && tab.badge && totalQty > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[10px] font-semibold grid place-items-center tabular">
                    {totalQty > 9 ? "9+" : totalQty}
                  </span>
                ) : null}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
        {/* Profile or Sign in */}
        <Link
          href={signedIn ? "/profile" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2.5 text-2xs font-medium transition-colors",
            (signedIn && pathname.startsWith("/profile")) ||
              (!signedIn && pathname.startsWith("/login"))
              ? "text-brand"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {signedIn ? (
            <>
              <User strokeWidth={1.6} className="h-5 w-5" />
              <span>Profile</span>
            </>
          ) : (
            <>
              <LogIn strokeWidth={1.6} className="h-5 w-5" />
              <span>Sign in</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}
