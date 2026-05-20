"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { Plus, Pencil, X, Save, Loader2, Ban, ShieldCheck, Users } from "lucide-react";
import type { HouseholdService, Maid, MaidService } from "@/lib/types";

interface Draft {
  full_name: string;
  age: string;
  phone: string;
  photo_url: string;
  languages: string;
  experience_years: string;
  about: string;
  jobs: Record<string, { on: boolean; rate: string }>;
}

function emptyDraft(services: HouseholdService[]): Draft {
  return {
    full_name: "",
    age: "",
    phone: "",
    photo_url: "",
    languages: "",
    experience_years: "0",
    about: "",
    jobs: Object.fromEntries(services.map((s) => [s.id, { on: false, rate: "" }])),
  };
}

export function MaidsAdmin({
  societyId,
  services,
  initialMaids,
  initialLinks,
}: {
  societyId: string;
  services: HouseholdService[];
  initialMaids: Maid[];
  initialLinks: MaidService[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [maids, setMaids] = useState(initialMaids);
  const [links, setLinks] = useState(initialLinks);
  const [editing, setEditing] = useState<Maid | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  const linksByMaid = new Map<string, MaidService[]>();
  for (const l of links) {
    if (!linksByMaid.has(l.maid_id)) linksByMaid.set(l.maid_id, []);
    linksByMaid.get(l.maid_id)!.push(l);
  }
  const svcById = new Map(services.map((s) => [s.id, s]));

  async function setStatus(m: Maid, status: Maid["status"]) {
    const { error } = await supabase
      .from("maids")
      .update({
        status,
        entry_pass_active: status === "active",
      })
      .eq("id", m.id);
    if (error) {
      toast.error("Update failed", error.message);
      return;
    }
    setMaids((prev) =>
      prev.map((x) =>
        x.id === m.id
          ? { ...x, status, entry_pass_active: status === "active" }
          : x,
      ),
    );
    toast.success(status === "blacklisted" ? "Blacklisted, entry pass withdrawn" : "Updated");
    router.refresh();
  }

  async function save(draft: Draft, existing?: Maid) {
    if (!draft.full_name.trim()) {
      toast.error("Name required");
      return;
    }
    const age = Number(draft.age);
    if (!age || age < 18) {
      toast.error("Age must be 18 or above", "RWA rule: only staff above 18.");
      return;
    }
    setBusy(true);
    const payload = {
      society_id: societyId,
      full_name: draft.full_name.trim(),
      age,
      phone: draft.phone.trim() || null,
      photo_url: draft.photo_url.trim() || null,
      languages: draft.languages.trim() || null,
      experience_years: Number(draft.experience_years || 0),
      about: draft.about.trim() || null,
    };

    let maidId = existing?.id;
    if (existing) {
      const { error } = await supabase
        .from("maids")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        setBusy(false);
        toast.error("Save failed", error.message);
        return;
      }
      setMaids((prev) =>
        prev.map((x) => (x.id === existing.id ? { ...x, ...payload } : x)),
      );
    } else {
      const { data, error } = await supabase
        .from("maids")
        .insert(payload)
        .select("*")
        .single();
      if (error || !data) {
        setBusy(false);
        toast.error("Create failed", error?.message);
        return;
      }
      maidId = data.id;
      setMaids((prev) => [data as Maid, ...prev]);
    }

    // Rebuild service links
    if (maidId) {
      await supabase.from("maid_services").delete().eq("maid_id", maidId);
      const rows = Object.entries(draft.jobs)
        .filter(([, v]) => v.on)
        .map(([sid, v]) => ({
          maid_id: maidId!,
          household_service_id: sid,
          rate: v.rate ? Number(v.rate) : null,
        }));
      if (rows.length) await supabase.from("maid_services").insert(rows);
      setLinks((prev) => [
        ...prev.filter((l) => l.maid_id !== maidId),
        ...rows,
      ]);
    }

    setBusy(false);
    toast.success("Saved");
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl font-semibold">Domestic staff</h1>
          <p className="text-sm text-ink-muted">
            RWA registry · {maids.length} on file
          </p>
        </div>
        <Button variant="brand" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add maid
        </Button>
      </div>

      {editing ? (
        <MaidForm
          services={services}
          initial={editing === "new" ? null : editing}
          initialLinks={
            editing === "new"
              ? []
              : (linksByMaid.get((editing as Maid).id) ?? [])
          }
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      {maids.length === 0 ? (
        <Empty
          icon={<Users className="h-8 w-8" />}
          title="No staff registered"
          description="Add maids so residents can find and request them."
          action={
            <Button variant="brand" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> Add the first maid
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {maids.map((m) => {
            const jobs = (linksByMaid.get(m.id) ?? [])
              .map((l) => svcById.get(l.household_service_id)?.title)
              .filter(Boolean);
            return (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{m.full_name}</p>
                        <Badge variant="default">{m.age} yrs</Badge>
                        <Badge
                          variant={
                            m.status === "active"
                              ? "success"
                              : m.status === "blacklisted"
                              ? "danger"
                              : "default"
                          }
                        >
                          {m.status}
                        </Badge>
                        {m.entry_pass_active ? (
                          <Badge variant="brand">
                            <ShieldCheck className="h-3 w-3" /> pass
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-ink-soft mt-1">
                        {m.experience_years} yrs exp
                        {m.languages ? ` · ${m.languages}` : ""}
                        {m.phone ? ` · ${m.phone}` : ""}
                      </p>
                      {jobs.length > 0 ? (
                        <p className="text-2xs text-ink-soft mt-1">
                          {jobs.join(" · ")}
                        </p>
                      ) : (
                        <p className="text-2xs text-warning mt-1">
                          No jobs assigned yet
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditing(m)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {m.status === "blacklisted" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatus(m, "active")}
                        >
                          Reinstate
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Blacklist ${m.full_name} and withdraw her entry pass? (RWA rule: 2+ written complaints)`,
                              )
                            )
                              setStatus(m, "blacklisted");
                          }}
                        >
                          <Ban className="h-3.5 w-3.5" /> Blacklist
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MaidForm({
  services,
  initial,
  initialLinks,
  busy,
  onCancel,
  onSave,
}: {
  services: HouseholdService[];
  initial: Maid | null;
  initialLinks: MaidService[];
  busy: boolean;
  onCancel: () => void;
  onSave: (d: Draft, existing?: Maid) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => {
    const base = emptyDraft(services);
    if (!initial) return base;
    const jobs = { ...base.jobs };
    for (const l of initialLinks) {
      if (jobs[l.household_service_id]) {
        jobs[l.household_service_id] = {
          on: true,
          rate: l.rate != null ? String(l.rate) : "",
        };
      }
    }
    return {
      full_name: initial.full_name,
      age: String(initial.age),
      phone: initial.phone ?? "",
      photo_url: initial.photo_url ?? "",
      languages: initial.languages ?? "",
      experience_years: String(initial.experience_years),
      about: initial.about ?? "",
      jobs,
    };
  });

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  return (
    <Card className="border-brand/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{initial ? "Edit maid" : "Add maid"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft, initial ?? undefined);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fn">Full name *</Label>
              <Input
                id="fn"
                required
                value={draft.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age * (18+)</Label>
              <Input
                id="age"
                required
                type="number"
                min="18"
                value={draft.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ph">Phone</Label>
              <Input
                id="ph"
                type="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp">Experience (years)</Label>
              <Input
                id="exp"
                type="number"
                min="0"
                value={draft.experience_years}
                onChange={(e) => set("experience_years", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lang">Languages</Label>
            <Input
              id="lang"
              value={draft.languages}
              onChange={(e) => set("languages", e.target.value)}
              placeholder="Hindi, Bengali"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={draft.photo_url}
              onChange={(e) => set("photo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              rows={2}
              value={draft.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="Works in 6 flats, very thorough..."
            />
          </div>

          <div className="space-y-2">
            <Label>Jobs she can do</Label>
            <p className="text-2xs text-ink-soft">
              Tick a job; optionally set her rate (RWA card shown for
              reference).
            </p>
            <div className="border border-line rounded-lg divide-y divide-line">
              {services.map((s) => {
                const j = draft.jobs[s.id] ?? { on: false, rate: "" };
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={j.on}
                      onChange={(e) =>
                        set("jobs", {
                          ...draft.jobs,
                          [s.id]: { ...j, on: e.target.checked },
                        })
                      }
                      className="h-4 w-4 accent-brand shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight">{s.title}</p>
                      <p className="text-2xs text-ink-soft">
                        RWA: ₹{s.rate_min}
                        {s.rate_max && s.rate_max !== s.rate_min
                          ? `–${s.rate_max}`
                          : ""}{" "}
                        /{s.rate_unit}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="rate"
                      disabled={!j.on}
                      value={j.rate}
                      onChange={(e) =>
                        set("jobs", {
                          ...draft.jobs,
                          [s.id]: { ...j, rate: e.target.value },
                        })
                      }
                      className="h-8 w-24 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              variant="brand"
              className="flex-1"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save maid
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
