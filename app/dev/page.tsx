import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DevPanel } from "./panel";

export default function DevPage() {
  if (process.env.NEXT_PUBLIC_DEV_LOGIN !== "1") notFound();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="display text-2xl">Dev console</CardTitle>
            <CardDescription>
              Seed demo data and log in as any role. Disable this page in production by
              setting <code>NEXT_PUBLIC_DEV_LOGIN=0</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <DevPanel />
          </CardContent>
        </Card>
        <p className="text-center text-2xs uppercase tracking-wider text-ink-soft">
          <Link href="/login">Back to real login</Link>
        </p>
      </div>
    </div>
  );
}
