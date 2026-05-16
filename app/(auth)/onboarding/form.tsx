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
}: {
  societyId: string;
  initialName: string | null;
  initialFlat: string | null;
  initialTower: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<Role>("resident");
  const [name, setName] = useState(initialName ?? "");
  const [flat, setFlat] = useState(initialFlat ?? "");
  const [tower, setTower] = useState(initialTower ?? "");
  const [phone, setPhone] = useState("");
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
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        role,
        society_id: societyId,
        flat_no: role === "resident" ? flat.trim() : null,
        tower: role === "resident" ? tower.trim() || null : null,
        phone: phone.trim() || null,
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
      router.replace("/home");
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (for orders)</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9999912345"
          autoComplete="tel"
        />
      </div>

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
