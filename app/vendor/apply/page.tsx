import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { ApplyForm } from "./form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const profile = await requireProfile();
  if (!profile.society_id) redirect("/onboarding");

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existing) redirect("/vendor");

  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl display">Open a storefront</CardTitle>
        <CardDescription>
          Tell us about your business. The RWA admin will approve you and then your block
          can find you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ApplyForm
          societyId={profile.society_id}
          categories={cats ?? []}
          defaultPhone={profile.phone ?? ""}
        />
      </CardContent>
    </Card>
  );
}
