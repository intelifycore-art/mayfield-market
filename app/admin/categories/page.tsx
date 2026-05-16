import { createClient } from "@/lib/supabase/server";
import { CategoriesAdmin } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return <CategoriesAdmin initialCategories={cats ?? []} />;
}
