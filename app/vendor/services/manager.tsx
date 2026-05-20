"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Rupees } from "@/components/ui/rupees";
import { toast } from "@/components/ui/toast";
import { Plus, Pencil, Trash2, Wrench, Loader2, X, Save } from "lucide-react";
import type { Service, Category } from "@/lib/types";

export function ServicesManager({
  vendorId,
  initialServices,
  categories,
}: {
  vendorId: string;
  initialServices: Service[];
  categories: Pick<Category, "id" | "name" | "slug" | "kind">[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(data: Partial<Service>, id?: string) {
    setBusy(true);
    if (id) {
      const { data: updated, error } = await supabase
        .from("services")
        .update(data)
        .eq("id", id)
        .select("*")
        .single();
      setBusy(false);
      if (error || !updated) {
        toast.error("Save failed", error?.message);
        return;
      }
      setServices((prev) => prev.map((s) => (s.id === id ? (updated as Service) : s)));
    } else {
      const { data: created, error } = await supabase
        .from("services")
        .insert({ ...data, vendor_id: vendorId })
        .select("*")
        .single();
      setBusy(false);
      if (error || !created) {
        toast.error("Create failed", error?.message);
        return;
      }
      setServices((prev) => [created as Service, ...prev]);
    }
    toast.success("Saved");
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed", error.message);
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-semibold">Services</h1>
          <p className="text-sm text-ink-muted">Bookable offerings residents can request.</p>
        </div>
        <Button variant="brand" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      {editing ? (
        <ServiceForm
          initial={editing === "new" ? null : editing}
          categories={categories}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      {services.length === 0 ? (
        <Empty
          icon={<Wrench className="h-8 w-8" />}
          title="No services yet"
          description="Offer house cleaning, plumbing, tuition — whatever you provide."
          action={
            <Button variant="brand" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> Add your first service
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{s.name}</p>
                  {s.starting_price ? (
                    <p className="text-xs text-ink-soft tabular">
                      from <Rupees amount={s.starting_price} className="text-ink" /> /{" "}
                      {s.pricing_unit}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditing(s)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({
  initial,
  categories,
  busy,
  onCancel,
  onSave,
}: {
  initial: Service | null;
  categories: Pick<Category, "id" | "name" | "slug" | "kind">[];
  busy: boolean;
  onCancel: () => void;
  onSave: (data: Partial<Service>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial?.starting_price != null ? String(initial.starting_price) : "",
  );
  const [unit, setUnit] = useState(initial?.pricing_unit ?? "visit");
  const [catId, setCatId] = useState(initial?.category_id ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        name: name.trim(),
        description: description.trim() || null,
        starting_price: price ? Number(price) : null,
        pricing_unit: unit.trim(),
        category_id: catId || null,
        is_active: true,
      },
      initial?.id,
    );
  }

  return (
    <Card className="border-brand/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{initial ? "Edit service" : "New service"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="sname">Name *</Label>
            <Input id="sname" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sdesc">Description</Label>
            <Textarea
              id="sdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sprice">Starting price</Label>
              <Input
                id="sprice"
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sunit">Per</Label>
              <Input
                id="sunit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="visit / month / hour"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scat">Category</Label>
            <Select id="scat" value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} variant="brand" className="flex-1">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
