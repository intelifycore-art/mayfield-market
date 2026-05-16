import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSocietyId } from "@/lib/society-server";
import { PageHeader } from "@/components/resident/page-header";
import { CheckoutClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: { vendorId: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${params.vendorId}`)}`);
  }
  // Residents need flat number to check out
  if (!profile.flat_no) redirect("/onboarding");

  const societyId = await getActiveSocietyId();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", params.vendorId)
    .single();

  if (!vendor) notFound();
  if (societyId && vendor.society_id !== societyId) notFound();

  return (
    <>
      <PageHeader title="Checkout" subtitle={vendor.business_name} backHref="/cart" />
      <CheckoutClient
        vendorId={vendor.id}
        societyId={profile.society_id ?? societyId ?? ""}
        defaultFlat={profile.flat_no ?? ""}
        defaultTower={profile.tower ?? ""}
        defaultPhone={profile.phone ?? ""}
        vendorUpi={vendor.payout_upi ?? ""}
        vendorName={vendor.business_name}
      />
    </>
  );
}
