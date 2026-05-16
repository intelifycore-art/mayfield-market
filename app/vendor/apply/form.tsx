"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export function ApplyForm({
  societyId,
  categories,
  defaultPhone,
}: {
  societyId: string;
  categories: Category[];
  defaultPhone: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [whatsapp, setWhatsapp] = useState(defaultPhone);
  const [upi, setUpi] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCats.length === 0) {
      toast.error("Pick at least one category");
      return;
    }
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expired");
      setBusy(false);
      return;
    }

    // 1. Update profile role to vendor
    await supabase.from("profiles").update({ role: "vendor" }).eq("id", user.id);

    // 2. Create vendor
    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert({
        user_id: user.id,
        society_id: societyId,
        business_name: businessName.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        contact_phone: phone.trim() || null,
        whatsapp_phone: whatsapp.trim() || null,
        payout_upi: upi.trim() || null,
        delivery_note: deliveryNote.trim() || null,
        photo_url: photo.trim() || null,
        status: "pending",
        is_open: true,
      })
      .select("id")
      .single();

    if (error || !vendor) {
      setBusy(false);
      toast.error("Couldn't submit", error?.message);
      return;
    }

    // 3. Link categories
    await supabase
      .from("vendor_categories")
      .insert(selectedCats.map((cid) => ({ vendor_id: vendor.id, category_id: cid })));

    setBusy(false);
    toast.success("Application submitted", "We'll notify you when approved.");
    router.replace("/vendor");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bn">Business name *</Label>
        <Input
          id="bn"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Sharma's Mandi"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tg">One-line tagline</Label>
        <Input
          id="tg"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Farm-fresh fruits & vegetables, twice a day"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Where you source from, hours, what makes you different..."
          rows={3}
        />
      </div>

      <div>
        <Label>Categories *</Label>
        <p className="text-xs text-ink-soft mb-2">Pick all that apply.</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => toggleCat(c.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition",
                selectedCats.includes(c.id)
                  ? "bg-brand text-white border-brand"
                  : "bg-white border-line text-ink-muted hover:border-ink/30",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ph">Phone *</Label>
          <Input
            id="ph"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9999912345"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wa">WhatsApp</Label>
          <Input
            id="wa"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Same as phone if blank"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="upi">Payout UPI ID</Label>
        <Input
          id="upi"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          placeholder="sharma@okhdfcbank"
        />
        <p className="text-xs text-ink-soft">
          Residents who pay via UPI will send directly here. Cash on delivery doesn&apos;t
          need this.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dn">Delivery note</Label>
        <Input
          id="dn"
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="Same-day if ordered before 6 PM. Free above ₹300."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ph2">Photo URL (optional)</Label>
        <Input
          id="ph2"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-ink-soft">
          Upload to Supabase Storage or paste any image URL. We&apos;ll add native uploads
          in v2.
        </p>
      </div>

      <Button type="submit" disabled={busy} size="lg" variant="brand" className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit application"}
      </Button>
    </form>
  );
}
