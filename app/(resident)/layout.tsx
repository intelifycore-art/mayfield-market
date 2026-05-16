import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { BottomNav } from "@/components/resident/bottom-nav";

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.society_id) redirect("/onboarding");

  // Vendor/admin see their own homes, not the resident one
  if (profile.role === "vendor") redirect("/vendor");
  if (profile.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen pb-20 bg-bg">
      <div className="max-w-2xl mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
