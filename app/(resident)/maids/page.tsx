import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { MaidsBrowser } from "./browser";
import type { HouseholdService, Maid, MaidService } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MaidsPage() {
  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  let services: HouseholdService[] = [];
  let maids: Maid[] = [];
  let links: MaidService[] = [];

  if (societyId) {
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase
        .from("household_services")
        .select("*")
        .eq("society_id", societyId)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("maids")
        .select("*")
        .eq("society_id", societyId)
        .eq("status", "active")
        .order("experience_years", { ascending: false }),
    ]);
    services = (s ?? []) as HouseholdService[];
    maids = (m ?? []) as Maid[];
    if (maids.length > 0) {
      const { data: ms } = await supabase
        .from("maid_services")
        .select("*")
        .in(
          "maid_id",
          maids.map((x) => x.id),
        );
      links = (ms ?? []) as MaidService[];
    }
  }

  return (
    <>
      <PageHeader
        title="Maids & House Help"
        subtitle="RWA-fixed rates · verified staff"
        backHref="/services"
      />
      <MaidsBrowser services={services} maids={maids} links={links} />
    </>
  );
}
