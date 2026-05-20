"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Loader2, Database, LogIn } from "lucide-react";

const DEV_PASSWORD = "mayfield-dev-2026";
const DEV_ACCOUNTS = [
  { role: "admin", email: "dev-admin@mayfield.local", label: "Admin" },
  { role: "vendor", email: "dev-vendor1@mayfield.local", label: "Vendor (Sharma's Mandi)" },
  { role: "vendor", email: "dev-vendor2@mayfield.local", label: "Vendor (Rajesh Plumbing)" },
  { role: "vendor", email: "dev-vendor3@mayfield.local", label: "Vendor (Verma Electricals)" },
  { role: "vendor", email: "dev-vendor4@mayfield.local", label: "Vendor (Patel Vegetables)" },
  { role: "resident", email: "dev-resident@mayfield.local", label: "Resident" },
];

export function DevPanel() {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState<string | null>(null);

  async function seed() {
    setBusy("seed");
    const res = await fetch("/api/dev/seed", { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const text = await res.text();
      toast.error("Seed failed", text);
      return;
    }
    toast.success("Demo data seeded", "You can log in now.");
  }

  async function loginAs(email: string) {
    setBusy(email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: DEV_PASSWORD,
    });
    setBusy(null);
    if (error) {
      toast.error("Couldn't sign in", `${error.message}. Run seed first?`);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <Button onClick={seed} disabled={busy === "seed"} className="w-full" variant="brand">
          {busy === "seed" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Database className="h-4 w-4" />
              Seed demo data (idempotent)
            </>
          )}
        </Button>
        <p className="mt-2 text-xs text-ink-soft">
          Creates 4 demo accounts, 2 sample vendors with listings, and a service provider.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-ink-soft">Quick login</p>
        {DEV_ACCOUNTS.map((acc) => (
          <Button
            key={acc.email}
            onClick={() => loginAs(acc.email)}
            disabled={busy === acc.email}
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {acc.label}
            </span>
            <span className="text-xs text-ink-soft">{acc.email}</span>
          </Button>
        ))}
        <p className="mt-2 text-xs text-ink-soft tabular">
          Password for all dev accounts: <code>{DEV_PASSWORD}</code>
        </p>
      </div>
    </div>
  );
}
