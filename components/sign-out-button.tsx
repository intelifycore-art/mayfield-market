import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Always-available sign-out. Posts to the /signout route handler (works
 * without JS). Used in the vendor + admin headers so no one gets stuck.
 */
export function SignOutButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <form action="/signout" method="post" className="shrink-0">
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink transition",
          className,
        )}
        aria-label="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
        {compact ? null : <span className="hidden sm:inline">Sign out</span>}
      </button>
    </form>
  );
}
