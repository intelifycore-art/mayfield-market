import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";

export function Rupees({
  amount,
  className,
  compact = false,
  decimals = 0,
  size = "md",
}: {
  amount: number;
  className?: string;
  compact?: boolean;
  decimals?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  }[size];
  return (
    <span className={cn("tabular font-medium", sizeClass, className)}>
      {inr(amount, { compact, decimals })}
    </span>
  );
}
