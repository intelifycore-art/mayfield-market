"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export function BookingForm({
  serviceId,
  serviceName,
  vendorId,
  societyId,
  defaultFlat,
  defaultTower,
  defaultPhone,
}: {
  serviceId: string;
  serviceName: string;
  vendorId: string;
  societyId: string;
  defaultFlat: string;
  defaultTower: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const [flat, setFlat] = useState(defaultFlat);
  const [tower, setTower] = useState(defaultTower);
  const [phone, setPhone] = useState(defaultPhone);
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        service_name: serviceName,
        vendor_id: vendorId,
        society_id: societyId,
        flat_no: flat,
        tower: tower || null,
        contact_phone: phone,
        preferred_slot: slot || null,
        notes: notes || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const text = await res.text();
      toast.error("Couldn't book", text);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
          <h3 className="display text-lg font-semibold mt-2">Request sent</h3>
          <p className="text-sm text-ink-muted mt-1">
            {serviceName} — the vendor will WhatsApp / call you on {phone} to confirm.
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              View bookings
            </Button>
            <Button variant="brand" onClick={() => router.push("/")}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
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
          placeholder="9999912345"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slot">Preferred time (optional)</Label>
        <Input
          id="slot"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          placeholder="Tomorrow morning, before noon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anything else? (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Bathroom is on the second floor, leakage in the basin..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={busy} size="lg" className="w-full" variant="brand">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request booking"}
      </Button>
      <p className="text-xs text-center text-ink-soft">
        This is a request — the vendor will confirm by call or WhatsApp.
      </p>
    </form>
  );
}
