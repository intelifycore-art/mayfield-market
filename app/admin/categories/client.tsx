"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { CategoryIcon } from "@/components/category-icon";
import { Loader2, Plus, X, Save } from "lucide-react";
import type { Category, CategoryKind } from "@/lib/types";

const ICON_OPTIONS = [
  "apple",
  "milk",
  "croissant",
  "shopping-basket",
  "fish",
  "flower",
  "cookie",
  "pill",
  "spray-can",
  "utensils-crossed",
  "wrench",
  "plug-zap",
  "hammer",
  "refrigerator",
  "scissors",
  "graduation-cap",
  "paw-print",
  "shield-check",
];

export function CategoriesAdmin({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient();
  const [cats, setCats] = useState(initialCategories);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(data: Partial<Category>, id?: string) {
    setBusy(true);
    if (id) {
      const { data: updated, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select("*")
        .single();
      setBusy(false);
      if (error || !updated) {
        toast.error("Save failed", error?.message);
        return;
      }
      setCats((prev) =>
        prev.map((c) => (c.id === id ? (updated as Category) : c)).sort(bySort),
      );
    } else {
      const { data: created, error } = await supabase
        .from("categories")
        .insert(data)
        .select("*")
        .single();
      setBusy(false);
      if (error || !created) {
        toast.error("Create failed", error?.message);
        return;
      }
      setCats((prev) => [...prev, created as Category].sort(bySort));
    }
    toast.success("Saved");
    setEditing(null);
  }

  async function toggleActive(c: Category) {
    await save({ is_active: !c.is_active }, c.id);
  }

  const products = cats.filter((c) => c.kind === "product");
  const services = cats.filter((c) => c.kind === "service");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-ink-muted">
            Add or hide what residents can browse.
          </p>
        </div>
        <Button variant="brand" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      {editing ? (
        <CategoryForm
          initial={editing === "new" ? null : editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      <section>
        <h2 className="display text-base font-semibold mb-2">Products</h2>
        <CategoryList list={products} onEdit={setEditing} onToggle={toggleActive} />
      </section>
      <section>
        <h2 className="display text-base font-semibold mb-2">Services</h2>
        <CategoryList list={services} onEdit={setEditing} onToggle={toggleActive} />
      </section>
    </div>
  );
}

function CategoryList({
  list,
  onEdit,
  onToggle,
}: {
  list: Category[];
  onEdit: (c: Category) => void;
  onToggle: (c: Category) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {list.map((c) => (
        <button
          key={c.id}
          onClick={() => onEdit(c)}
          className="text-left bg-white border border-line rounded-lg p-3 flex items-center gap-3 hover:border-ink/20 transition"
        >
          <div className="h-10 w-10 rounded-md bg-brand-tint text-brand-dark grid place-items-center">
            <CategoryIcon name={c.icon ?? undefined} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{c.name}</p>
            <p className="text-xs text-ink-soft">{c.slug}</p>
          </div>
          <span
            className={`text-2xs uppercase tracking-wider ${c.is_active ? "text-success" : "text-ink-faint"}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(c);
            }}
          >
            {c.is_active ? "Active" : "Hidden"}
          </span>
        </button>
      ))}
    </div>
  );
}

function CategoryForm({
  initial,
  busy,
  onCancel,
  onSave,
}: {
  initial: Category | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (data: Partial<Category>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [kind, setKind] = useState<CategoryKind>(initial?.kind ?? "product");
  const [icon, setIcon] = useState(initial?.icon ?? "shopping-basket");
  const [sortOrder, setSortOrder] = useState(
    initial?.sort_order != null ? String(initial.sort_order) : "100",
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        kind,
        icon,
        sort_order: Number(sortOrder),
        is_active: true,
      },
      initial?.id,
    );
  }

  return (
    <Card className="border-brand/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{initial ? "Edit category" : "New category"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cn">Name</Label>
              <Input
                id="cn"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs">Slug</Label>
              <Input
                id="cs"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from name"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ck">Type</Label>
              <Select
                id="ck"
                value={kind}
                onChange={(e) => setKind(e.target.value as CategoryKind)}
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci">Icon</Label>
              <Select
                id="ci"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co">Sort order</Label>
              <Input
                id="co"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
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

function bySort(a: Category, b: Category) {
  return a.sort_order - b.sort_order;
}
