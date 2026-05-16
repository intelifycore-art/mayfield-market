"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Loader2, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/lib/types";

export function ProfileForm({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const supabase = createClient();
  const [businessName, setBusinessName] = useState(vendor.business_name);
  const [tagline, setTagline] = useState(vendor.tagline ?? "");
  const [description, setDescription] = useState(vendor.description ?? "");
  const [phone, setPhone] = useState(vendor.contact_phone ?? "");
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp_phone ?? "");
  const [upi, setUpi] = useState(vendor.payout_upi ?? "");
  const [photo, setPhoto] = useState(vendor.photo_url ?? "");
  const [deliveryNote, setDeliveryNote] = useState(vendor.delivery_note ?? "");
  const [isOpen, setIsOpen] = useState(vendor.is_open);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("vendors")
      .update({
        business_name: businessName.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        contact_phone: phone.trim() || null,
        whatsapp_phone: whatsapp.trim() || null,
        payout_upi: upi.trim() || null,
        photo_url: photo.trim() || null,
        delivery_note: deliveryNote.trim() || null,
        is_open: isOpen,
      })
      .eq("id", vendor.id);
    setBusy(false);
    if (error) {
      toast.error("Save failed", error.message);
      return;
    }
    toast.success("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-lg border p-3 flex items-center gap-3 transition",
          isOpen
            ? "bg-success-tint border-success/30"
            : "bg-bg-subtle border-line",
        )}
      >
        <Power
          className={cn("h-4 w-4", isOpen ? "text-success" : "text-ink-soft")}
        />
        <div className="text-left flex-1">
          <p className="text-sm font-medium">
            Storefront is {isOpen ? "open" : "closed"}
          </p>
          <p className="text-xs text-ink-soft">
            {isOpen
              ? "Residents can place orders now"
              : "Residents see your stall but can't order"}
          </p>
        </div>
      </button>

      <div className="space-y-2">
        <Label htmlFor="bn">Business name</Label>
        <Input
          id="bn"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tg">Tagline</Label>
        <Input
          id="tg"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ph">Phone</Label>
          <Input
            id="ph"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wa">WhatsApp</Label>
          <Input
            id="wa"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="upi">Payout UPI ID</Label>
        <Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dn">Delivery note</Label>
        <Input
          id="dn"
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ph2">Photo URL</Label>
        <Input id="ph2" value={photo} onChange={(e) => setPhoto(e.target.value)} />
      </div>
      <Button type="submit" disabled={busy} variant="brand" size="lg" className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
      </Button>
    </form>
  );
}
