"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Rupees } from "@/components/ui/rupees";
import { toast } from "@/components/ui/toast";
import { Plus, Pencil, Trash2, Package, Loader2, X, Save } from "lucide-react";
import type { Listing, Category } from "@/lib/types";

export function ListingsManager({
  vendorId,
  initialListings,
  categories,
}: {
  vendorId: string;
  initialListings: Listing[];
  categories: Pick<Category, "id" | "name" | "slug" | "kind">[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [listings, setListings] = useState(initialListings);
  const [editing, setEditing] = useState<Listing | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(data: Partial<Listing>, id?: string) {
    setBusy(true);
    if (id) {
      const { data: updated, error } = await supabase
        .from("listings")
        .update(data)
        .eq("id", id)
        .select("*")
        .single();
      setBusy(false);
      if (error || !updated) {
        toast.error("Save failed", error?.message);
        return;
      }
      setListings((prev) => prev.map((l) => (l.id === id ? (updated as Listing) : l)));
      toast.success("Saved");
    } else {
      const { data: created, error } = await supabase
        .from("listings")
        .insert({ ...data, vendor_id: vendorId })
        .select("*")
        .single();
      setBusy(false);
      if (error || !created) {
        toast.error("Create failed", error?.message);
        return;
      }
      setListings((prev) => [created as Listing, ...prev]);
      toast.success("Created");
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed", error.message);
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Deleted");
  }

  async function toggleActive(l: Listing) {
    await save({ is_active: !l.is_active }, l.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-ink-muted">
            Manage what residents can order from your storefront.
          </p>
        </div>
        <Button variant="brand" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {editing ? (
        <ListingForm
          initial={editing === "new" ? null : editing}
          categories={categories}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      {listings.length === 0 ? (
        <Empty
          icon={<Package className="h-8 w-8" />}
          title="No products yet"
          description="Add tomatoes, that special dal, anything you sell."
          action={
            <Button variant="brand" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> Add your first product
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{l.name}</p>
                  <p className="text-xs text-ink-soft tabular">
                    <Rupees amount={l.price} className="text-ink" /> / {l.unit} · stock{" "}
                    {l.stock}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(l)}
                  className={`text-xs px-2 py-1 rounded-full ${l.is_active ? "bg-success-tint text-success" : "bg-bg-subtle text-ink-soft"}`}
                >
                  {l.is_active ? "Active" : "Hidden"}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditing(l)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(l.id)}
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

function ListingForm({
  initial,
  categories,
  busy,
  onCancel,
  onSave,
}: {
  initial: Listing | null;
  categories: Pick<Category, "id" | "name" | "slug" | "kind">[];
  busy: boolean;
  onCancel: () => void;
  onSave: (data: Partial<Listing>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [unit, setUnit] = useState(initial?.unit ?? "kg");
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : "0");
  const [catId, setCatId] = useState(initial?.category_id ?? "");
  const [image, setImage] = useState(initial?.image_url ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        unit: unit.trim(),
        stock: Number(stock || 0),
        category_id: catId || null,
        image_url: image.trim() || null,
        is_active: true,
      },
      initial?.id,
    );
  }

  return (
    <Card className="border-brand/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{initial ? "Edit product" : "New product"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="lname">Name *</Label>
            <Input id="lname" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ldesc">Description</Label>
            <Textarea
              id="ldesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lprice">Price *</Label>
              <Input
                id="lprice"
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunit">Unit</Label>
              <Input
                id="lunit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg / piece / dozen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lstock">Stock</Label>
              <Input
                id="lstock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lcat">Category</Label>
            <Select id="lcat" value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limg">Image URL</Label>
            <Input
              id="limg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
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
