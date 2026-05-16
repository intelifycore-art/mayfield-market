import { cn } from "@/lib/utils";
import { SOCIETY } from "@/lib/society";

export function Logo({
  size = "md",
  className,
  showTagline = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}) {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-lg bg-brand text-white grid place-items-center shadow-sm",
          dim,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-1/2 w-1/2"
        >
          <path
            d="M4 8L12 4L20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V20H9V14Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn("display font-semibold text-ink", textSize)}>
          {SOCIETY.appName}
        </span>
        {showTagline ? (
          <span className="text-2xs uppercase tracking-wider text-ink-soft">
            {SOCIETY.name} {SOCIETY.block}
          </span>
        ) : null}
      </div>
    </div>
  );
}
