import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { VendorNav } from "@/components/vendor/nav";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/sign-out-button";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.society_id) redirect("/onboarding");
  if (profile.role === "admin") redirect("/admin");
  // Residents are allowed through so they can apply to become a vendor.
  // Once they have a vendor record, page.tsx pulls them into the dashboard.

  const supabase = createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <Link href="/vendor">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {vendor ? (
              <div className="text-right min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {vendor.business_name}
                </p>
                <p className="text-2xs uppercase tracking-wider text-ink-soft mt-0.5">
                  {vendor.status}
                </p>
              </div>
            ) : (
              <span className="text-sm text-ink-muted truncate">
                {profile.full_name ?? "Vendor"}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
        {vendor ? <VendorNav /> : null}
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-5 sm:py-6">{children}</main>
    </div>
  );
}
