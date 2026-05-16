import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/resident/page-header";
import { CheckoutClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: { vendorId: string } }) {
  const profile = await requireOnboarded();
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", params.vendorId)
    .single();

  if (!vendor || vendor.society_id !== profile.society_id) notFound();

  return (
    <>
      <PageHeader title="Checkout" subtitle={vendor.business_name} backHref="/cart" />
      <CheckoutClient
        vendorId={vendor.id}
        societyId={profile.society_id!}
        defaultFlat={profile.flat_no ?? ""}
        defaultTower={profile.tower ?? ""}
        defaultPhone={profile.phone ?? ""}
        vendorUpi={vendor.payout_upi ?? ""}
        vendorName={vendor.business_name}
      />
    </>
  );
}
