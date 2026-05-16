import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { ProfileForm } from "./form";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function VendorProfilePage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/apply");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-semibold">Business profile</h1>
        <p className="text-sm text-ink-muted">
          Edit how residents see your storefront.
        </p>
      </div>
      <Card>
        <CardContent className="p-5">
          <ProfileForm vendor={vendor} />
        </CardContent>
      </Card>
      <form action="/signout" method="post">
        <button
          type="submit"
          className="text-xs text-ink-soft hover:text-ink underline underline-offset-2"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
