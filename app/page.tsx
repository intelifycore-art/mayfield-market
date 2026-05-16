import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.society_id) redirect("/onboarding");

  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "vendor") redirect("/vendor");
  redirect("/home");
}
