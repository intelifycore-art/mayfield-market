import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-bg-subtle text-ink-muted",
        brand: "bg-brand-tint text-brand-dark",
        success: "bg-success-tint text-success",
        warning: "bg-warning-tint text-warning",
        danger: "bg-danger-tint text-danger",
        outline: "border border-line text-ink-muted bg-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
