"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, groupByVendor } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Rupees } from "@/components/ui/rupees";
import { toast } from "@/components/ui/toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PayMode = "cod" | "upi_direct";

export function CheckoutClient({
  vendorId,
  societyId,
  defaultFlat,
  defaultTower,
  defaultPhone,
  vendorUpi,
  vendorName,
}: {
  vendorId: string;
  societyId: string;
  defaultFlat: string;
  defaultTower: string;
  defaultPhone: string;
  vendorUpi: string;
  vendorName: string;
}) {
  const router = useRouter();
  const { items, clearVendor } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const groups = mounted ? groupByVendor(items) : [];
  const group = groups.find((g) => g.vendor_id === vendorId);

  const [flat, setFlat] = useState(defaultFlat);
  const [tower, setTower] = useState(defaultTower);
  const [phone, setPhone] = useState(defaultPhone);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<PayMode>("cod");
  const [busy, setBusy] = useState(false);

  const subtotal = useMemo(() => group?.subtotal ?? 0, [group]);

  if (mounted && !group) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-ink-muted">Nothing in cart for this vendor.</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: vendorId,
        society_id: societyId,
        subtotal,
        total: subtotal,
        flat_no: flat,
        tower: tower || null,
        contact_phone: phone,
        delivery_notes: notes || null,
        payment_mode: mode,
        items: group.items.map((i) => ({
          listing_id: i.listing_id,
          name_snapshot: i.name,
          unit: i.unit,
          qty: i.qty,
          unit_price: i.price,
          line_total: i.price * i.qty,
        })),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const text = await res.text();
      toast.error("Couldn't place order", text);
      return;
    }
    const { id } = await res.json();
    clearVendor(vendorId);
    toast.success("Order placed", `${vendorName} will confirm shortly.`);
    router.replace(`/orders/${id}`);
  }

  return (
    <form onSubmit={submit} className="px-5 py-5 space-y-4 mb-10">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold">Items</h3>
          <ul className="mt-2 space-y-1.5">
            {group?.items.map((i) => (
              <li
                key={i.listing_id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-ink-muted">
                  {i.name}{" "}
                  <span className="text-ink-faint tabular">× {i.qty}</span>
                </span>
                <span className="tabular">
                  <Rupees amount={i.price * i.qty} />
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line mt-3 pt-3 flex justify-between">
            <span className="text-sm font-semibold">Total</span>
            <Rupees amount={subtotal} size="lg" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Deliver to</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="tower">Tower</Label>
              <Input
                id="tower"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="flat">Flat</Label>
              <Input
                id="flat"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact phone</Label>
            <Input
              id="phone"
              required
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please ring bell once, leave with guard if no one's home..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Payment</h3>
          <div className="grid grid-cols-2 gap-2">
            <PayOption
              active={mode === "cod"}
              onClick={() => setMode("cod")}
              title="Cash on delivery"
              subtitle="Pay vendor when items arrive"
            />
            <PayOption
              active={mode === "upi_direct"}
              onClick={() => setMode("upi_direct")}
              disabled={!vendorUpi}
              title="UPI direct"
              subtitle={vendorUpi || "Vendor hasn't added UPI yet"}
            />
          </div>
          {mode === "upi_direct" && vendorUpi ? (
            <p className="text-xs text-ink-soft">
              Pay to <code className="text-ink">{vendorUpi}</code> after the vendor accepts.
              You can also pay via WhatsApp link they share.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={busy || !group}
        size="lg"
        variant="brand"
        className="w-full"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Place order · <Rupees amount={subtotal} className="text-white" />
          </>
        )}
      </Button>
      <p className="text-xs text-ink-soft text-center">
        Your vendor will accept and deliver. You&apos;ll see updates under Orders.
      </p>
    </form>
  );
}

function PayOption({
  active,
  onClick,
  title,
  subtitle,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border p-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed",
        active ? "border-brand bg-brand-tint" : "border-line bg-white hover:bg-bg-subtle",
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{subtitle}</p>
    </button>
  );
}
