import { notFound } from "next/navigation";
import { Star, Languages, Phone, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { householdRateLabel } from "@/lib/policy";
import { RequestMaid } from "./request-form";
import type { HouseholdService } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MaidProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getCurrentProfile();
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: maid } = await supabase
    .from("maids")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!maid || maid.status !== "active") notFound();
  if (societyId && maid.society_id !== societyId) notFound();

  const { data: msRows } = await supabase
    .from("maid_services")
    .select("rate, household_service:household_services(*)")
    .eq("maid_id", maid.id);

  const jobs = (msRows ?? [])
    .map((r: any) => ({
      rate: r.rate as number | null,
      svc: r.household_service as HouseholdService,
    }))
    .filter((j) => j.svc)
    .sort((a, b) => a.svc.sort_order - b.svc.sort_order);

  return (
    <>
      <PageHeader title={maid.full_name} backHref="/maids" />
      <div className="px-5 py-5 space-y-4 mb-10">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-tint text-brand-dark grid place-items-center shrink-0 text-xl font-semibold">
              {maid.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="display text-xl font-semibold">{maid.full_name}</h1>
                <Badge variant="default">{maid.age} yrs</Badge>
                {maid.entry_pass_active ? (
                  <Badge variant="success">
                    <ShieldCheck className="h-3 w-3" /> Entry pass
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-ink-soft flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-warning text-warning" strokeWidth={0} />
                {maid.experience_years} yr
                {maid.experience_years === 1 ? "" : "s"} experience
              </p>
              {maid.languages ? (
                <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
                  <Languages className="h-3 w-3" />
                  {maid.languages}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {maid.about ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-ink-muted">{maid.about}</p>
            </CardContent>
          </Card>
        ) : null}

        <div>
          <h2 className="display text-base font-semibold mb-2">
            Jobs she does
          </h2>
          <div className="space-y-2">
            {jobs.map((j) => (
              <Card key={j.svc.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {j.svc.title}
                    </p>
                    {j.svc.description ? (
                      <p className="text-2xs text-ink-soft mt-0.5">
                        {j.svc.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="tabular text-right shrink-0 whitespace-nowrap text-sm font-medium">
                    {householdRateLabel(j.svc)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No jobs listed for her yet.
              </p>
            ) : null}
          </div>
        </div>

        <RequestMaid
          maidId={maid.id}
          maidName={maid.full_name}
          maidPhone={maid.phone}
          societyId={profile?.society_id ?? societyId ?? ""}
          jobs={jobs.map((j) => ({ id: j.svc.id, title: j.svc.title }))}
          signedIn={!!profile}
          defaultFlat={profile?.flat_no ?? ""}
          defaultTower={profile?.tower ?? ""}
          defaultPhone={profile?.phone ?? ""}
        />
      </div>
    </>
  );
}
