import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryTile({
  category,
  href,
  size = "md",
}: {
  category: Pick<Category, "name" | "slug" | "icon" | "kind">;
  href?: string;
  size?: "sm" | "md";
}) {
  const finalHref = href ?? `/browse/${category.slug}`;
  return (
    <Link
      href={finalHref}
      className={cn(
        "group flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-line hover:border-ink/20 hover:shadow-card transition",
        size === "sm" ? "p-2" : "p-3",
      )}
    >
      <div
        className={cn(
          "grid place-items-center rounded-md bg-brand-tint text-brand-dark group-hover:bg-brand group-hover:text-white transition",
          size === "sm" ? "h-10 w-10" : "h-12 w-12",
        )}
      >
        <CategoryIcon
          name={category.icon ?? undefined}
          className={size === "sm" ? "h-5 w-5" : "h-6 w-6"}
        />
      </div>
      <p
        className={cn(
          "text-center leading-tight font-medium text-ink",
          size === "sm" ? "text-xs" : "text-xs",
        )}
      >
        {category.name}
      </p>
    </Link>
  );
}
