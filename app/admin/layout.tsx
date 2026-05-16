import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { AdminNav } from "@/components/admin/nav";
import { Logo } from "@/components/brand/logo";
import { fullSocietyName } from "@/lib/society";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link href="/admin">
            <Logo size="sm" />
          </Link>
          <div className="text-right">
            <p className="text-2xs uppercase tracking-wider text-ink-soft">Admin</p>
            <p className="text-sm font-medium leading-tight">{fullSocietyName()}</p>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="max-w-6xl mx-auto px-5 py-6">{children}</main>
    </div>
  );
}
