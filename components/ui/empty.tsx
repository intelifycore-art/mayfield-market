import * as React from "react";
import { cn } from "@/lib/utils";

export function Empty({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className,
      )}
    >
      {icon ? <div className="mb-3 text-ink-faint">{icon}</div> : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-ink-muted max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
