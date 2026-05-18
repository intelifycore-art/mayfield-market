import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { MaidsAdmin } from "./client";
import type { HouseholdService, Maid, MaidService } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMaidsPage() {
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
        .order("sort_order"),
      supabase
        .from("maids")
        .select("*")
        .eq("society_id", societyId)
        .order("created_at", { ascending: false }),
    ]);
    services = (s ?? []) as HouseholdService[];
    maids = (m ?? []) as Maid[];
    const { data: ms } = await supabase.from("maid_services").select("*");
    links = (ms ?? []) as MaidService[];
  }

  return (
    <MaidsAdmin
      societyId={societyId ?? ""}
      services={services}
      initialMaids={maids}
      initialLinks={links}
    />
  );
}
