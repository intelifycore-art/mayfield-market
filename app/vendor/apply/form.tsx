"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Loader2, Info, CheckCircle2 } from "lucide-react";
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

  // 1 — business
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  // 2 — what they do
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  // 3 — contact
  const [phone, setPhone] = useState(defaultPhone);
  const [whatsapp, setWhatsapp] = useState(defaultPhone);
  // 4 — payment + delivery
  const [upi, setUpi] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  // 5 — photo (optional)
  const [photo, setPhoto] = useState("");

  const [busy, setBusy] = useState(false);

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function isValidPhone(p: string) {
    return /^\d{10}$/.test(p.trim());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Business name required");
      return;
    }
    if (selectedCats.length === 0) {
      toast.error("Pick at least one category", "What do you sell or offer?");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Enter a 10-digit phone number");
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

    // 1. Promote profile role to vendor (in case onboarding set it as resident)
    await supabase.from("profiles").update({ role: "vendor" }).eq("id", user.id);

    // 2. Create the vendor record (status=pending)
    const wa = whatsapp.trim() || phone.trim();
    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert({
        user_id: user.id,
        society_id: societyId,
        business_name: businessName.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        contact_phone: phone.trim(),
        whatsapp_phone: wa,
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

    // 3. Link selected categories
    await supabase
      .from("vendor_categories")
      .insert(selectedCats.map((cid) => ({ vendor_id: vendor.id, category_id: cid })));

    setBusy(false);
    toast.success("Application submitted", "The RWA admin will review it soon.");
    router.replace("/vendor");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Tiny progress hint */}
      <div className="flex items-start gap-2 text-xs text-ink-soft bg-bg-subtle rounded-md px-3 py-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ink-muted" />
        <p>
          Takes 2 minutes. The RWA admin usually reviews new vendors the same
          day. You can edit everything after approval.
        </p>
      </div>

      {/* SECTION 1 — business */}
      <Section index={1} title="Your business" hint="Shown to residents on your storefront card.">
        <div className="space-y-2">
          <Label htmlFor="bn">Business name *</Label>
          <Input
            id="bn"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sharma's Mandi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tg">One-line tagline</Label>
          <Input
            id="tg"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Farm-fresh vegetables, twice a day"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">About (optional)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Where you source from, hours you work, anything residents should know..."
            rows={3}
          />
        </div>
      </Section>

      {/* SECTION 2 — categories */}
      <Section
        index={2}
        title="What do you offer? *"
        hint="Pick all that fit. Residents filter by these."
      >
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const on = selectedCats.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs border transition inline-flex items-center gap-1.5",
                  on
                    ? "bg-brand text-white border-brand"
                    : "bg-white border-line text-ink-muted hover:border-ink/30",
                )}
              >
                {on ? <CheckCircle2 className="h-3 w-3" /> : null}
                {c.name}
              </button>
            );
          })}
        </div>
        {selectedCats.length === 0 ? (
          <p className="text-2xs text-ink-soft mt-2">
            Tap one or more above. (Example: a vegetable seller picks
            &quot;Fruits &amp; Vegetables&quot;.)
          </p>
        ) : (
          <p className="text-2xs text-ink-soft mt-2">
            {selectedCats.length} selected.
          </p>
        )}
      </Section>

      {/* SECTION 3 — contact */}
      <Section
        index={3}
        title="How residents reach you"
        hint="Order alerts come on WhatsApp / call. Both numbers can be the same."
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ph">Phone *</Label>
            <Input
              id="ph"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9999912345"
              className="tabular"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">WhatsApp</Label>
            <Input
              id="wa"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Same as phone if blank"
              className="tabular"
            />
          </div>
        </div>
      </Section>

      {/* SECTION 4 — payment + delivery */}
      <Section
        index={4}
        title="Payment + delivery"
        hint="Cash on delivery works without any setup. UPI is optional."
      >
        <div className="space-y-2">
          <Label htmlFor="upi">UPI ID (optional)</Label>
          <Input
            id="upi"
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            placeholder="e.g. sharma@okhdfcbank"
          />
          <p className="text-2xs text-ink-soft">
            If set, residents can pay you directly via UPI after you accept
            their order. Leave blank for cash on delivery only.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dn">Delivery / hours note</Label>
          <Input
            id="dn"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="e.g. Same-day if ordered before 6 PM. Free above Rs 300."
          />
        </div>
      </Section>

      {/* SECTION 5 — photo */}
      <Section
        index={5}
        title="Storefront photo (optional)"
        hint="A photo of your shop, cart or staff makes residents click."
      >
        <div className="space-y-2">
          <Label htmlFor="ph2">Image URL</Label>
          <Input
            id="ph2"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-2xs text-ink-soft">
            Paste any public image URL — your Google Drive share link, an
            Unsplash link, etc. (Native uploads coming soon.) You can also
            skip and add it later from your profile.
          </p>
        </div>
      </Section>

      <Button type="submit" disabled={busy} size="lg" variant="brand" className="w-full">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Submit application"
        )}
      </Button>
      <p className="text-center text-xs text-ink-soft">
        By submitting you agree to the RWA&apos;s vendor code of conduct.
      </p>
    </form>
  );
}

function Section({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand-tint text-brand-dark grid place-items-center text-2xs font-semibold tabular">
            {index}
          </span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {hint ? <p className="text-xs text-ink-soft mt-0.5 pl-7">{hint}</p> : null}
      </div>
      <div className="space-y-3 pl-7 border-l border-line ml-[10px] pb-1">
        {children}
      </div>
    </section>
  );
}
