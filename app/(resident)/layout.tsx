import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { BottomNav } from "@/components/resident/bottom-nav";
import { FloatingChat } from "@/components/chat/floating-chat";

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  // Authed vendors/admins get bounced to their own dashboards.
  // Anonymous visitors are allowed through.
  if (profile?.role === "vendor") redirect("/vendor");
  if (profile?.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen pb-20 bg-bg">
      <div className="max-w-2xl mx-auto">{children}</div>
      <FloatingChat />
      <BottomNav signedIn={!!profile} />
    </div>
  );
}
