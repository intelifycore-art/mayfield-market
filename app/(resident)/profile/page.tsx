import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/resident/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { LogOut, HelpCircle, Store } from "lucide-react";
import Link from "next/link";
import { SOCIETY, fullSocietyName } from "@/lib/society";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await requireOnboarded();

  return (
    <>
      <PageHeader title="Profile" />
      <div className="px-5 py-5 space-y-4 mb-10">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-2xs uppercase tracking-wider text-ink-soft">Name</p>
              <p className="text-sm font-medium">{profile.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-ink-soft">Email</p>
              <p className="text-sm">{profile.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-ink-soft">Address</p>
              <p className="text-sm">
                {fullSocietyName()}
                {profile.tower ? `, ${profile.tower}` : ""}
                {profile.flat_no ? `, Flat ${profile.flat_no}` : ""}
              </p>
              <p className="text-xs text-ink-soft">{SOCIETY.location}</p>
            </div>
            {profile.phone ? (
              <div>
                <p className="text-2xs uppercase tracking-wider text-ink-soft">Phone</p>
                <p className="text-sm tabular">{profile.phone}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            <Link
              href="/vendor/apply"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-bg-subtle transition"
            >
              <Store className="h-4 w-4 text-ink-muted" />
              <div className="flex-1">
                <p className="text-sm font-medium">Become a vendor</p>
                <p className="text-xs text-ink-soft">
                  Sell produce, run a stall, or offer a service
                </p>
              </div>
            </Link>
            {SOCIETY.supportWhatsapp ? (
              <a
                href={`https://wa.me/${SOCIETY.supportWhatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-bg-subtle transition"
              >
                <HelpCircle className="h-4 w-4 text-ink-muted" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Support</p>
                  <p className="text-xs text-ink-soft">WhatsApp the RWA team</p>
                </div>
              </a>
            ) : null}
          </CardContent>
        </Card>

        <form action="/signout" method="post">
          <Button variant="outline" className="w-full" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>

        <div className="pt-2 flex justify-center">
          <Logo size="sm" />
        </div>
      </div>
    </>
  );
}
