import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { OnboardingForm } from "./form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SOCIETY, fullSocietyName } from "@/lib/society";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();
  const { data: society } = await supabase
    .from("societies")
    .select("*")
    .eq("slug", SOCIETY.slug)
    .single();

  if (!society) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup required</CardTitle>
          <CardDescription>
            The society <code className="text-ink">{SOCIETY.slug}</code> hasn&apos;t been
            seeded yet. Run <code className="text-ink">supabase/seed.sql</code> in your
            Supabase SQL editor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Skip if already onboarded
  if (profile.society_id && (profile.role !== "resident" || profile.flat_no)) {
    if (profile.role === "admin") redirect("/admin");
    if (profile.role === "vendor") redirect("/vendor");
    redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl display">Last step</CardTitle>
        <CardDescription>
          Welcome to {fullSocietyName()}. Tell us a little about you so we can show the
          right marketplace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm
          societyId={society.id}
          initialName={profile.full_name}
          initialFlat={profile.flat_no}
          initialTower={profile.tower}
        />
      </CardContent>
    </Card>
  );
}
