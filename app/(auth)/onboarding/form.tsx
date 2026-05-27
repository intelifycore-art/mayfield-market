"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Loader2, Home, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "resident" | "vendor";

export function OnboardingForm({
  societyId,
  initialName,
  initialFlat,
  initialTower,
  forceRole,
}: {
  societyId: string;
  initialName: string | null;
  initialFlat: string | null;
  initialTower: string | null;
  /** If set, hide the role picker and lock the role (e.g. vendor signup). */
  forceRole?: Role;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<Role>(forceRole ?? "resident");
  const [name, setName] = useState(initialName ?? "");
  const [flat, setFlat] = useState(initialFlat ?? "");
  const [tower, setTower] = useState(initialTower ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expired", "Please log in again.");
      setBusy(false);
      return;
    }
    // phone is the auth identifier (OTP login) and already lives on
    // auth.users.phone -> public.profiles.phone via the on-signup trigger;
    // we don't ask for it again here.
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        role,
        society_id: societyId,
        flat_no: role === "resident" ? flat.trim() : null,
        tower: role === "resident" ? tower.trim() || null : null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Couldn't save", error.message);
      return;
    }
    toast.success("You're in", `Welcome, ${name.split(" ")[0]}.`);
    if (role === "vendor") {
      router.replace("/vendor/apply");
    } else {
      router.replace("/");
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {forceRole ? null : (
        <div>
          <Label>I am a</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <RoleTile
              active={role === "resident"}
              onClick={() => setRole("resident")}
              icon={<Home className="h-4 w-4" />}
              title="Resident"
              subtitle="Order from local vendors"
            />
            <RoleTile
              active={role === "vendor"}
              onClick={() => setRole("vendor")}
              icon={<Store className="h-4 w-4" />}
              title="Vendor"
              subtitle="Sell or offer services"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anish Gupta"
          autoComplete="name"
        />
      </div>

      {role === "resident" ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2 col-span-1">
            <Label htmlFor="tower">Tower</Label>
            <Input
              id="tower"
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              placeholder="T-3"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="flat">Flat number</Label>
            <Input
              id="flat"
              required
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              placeholder="1204"
            />
          </div>
        </div>
      ) : null}

      <Button type="submit" disabled={busy} size="lg" className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
      </Button>
    </form>
  );
}

function RoleTile({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-brand bg-brand-tint"
          : "border-line bg-white hover:bg-bg-subtle",
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(active ? "text-brand-dark" : "text-ink-muted")}>{icon}</span>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <p className="text-xs text-ink-soft">{subtitle}</p>
    </button>
  );
}
