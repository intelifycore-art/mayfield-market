"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

export function RequestMaid({
  maidId,
  maidName,
  maidPhone,
  societyId,
  jobs,
  signedIn,
  defaultFlat,
  defaultTower,
  defaultPhone,
}: {
  maidId: string;
  maidName: string;
  maidPhone: string | null;
  societyId: string;
  jobs: { id: string; title: string }[];
  signedIn: boolean;
  defaultFlat: string;
  defaultTower: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [flat, setFlat] = useState(defaultFlat);
  const [tower, setTower] = useState(defaultTower);
  const [phone, setPhone] = useState(defaultPhone);
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!signedIn) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-medium">Sign in to request {maidName}</p>
          <p className="text-xs text-ink-muted">
            We need your flat and a contact number so the RWA can arrange a
            trial.
          </p>
          <Link href={`/login?next=${encodeURIComponent(`/maids/${maidId}`)}`}>
            <Button variant="brand" size="lg" className="w-full">
              <LogIn className="h-4 w-4" />
              Sign in to continue
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const job = jobs.find((j) => j.id === jobId);
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expired", "Please sign in again.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("bookings").insert({
      resident_id: user.id,
      society_id: societyId,
      maid_id: maidId,
      household_service_id: jobId || null,
      service_name_snapshot: job
        ? `${maidName} — ${job.title}`
        : `${maidName} — household help`,
      flat_no: flat,
      tower: tower || null,
      contact_phone: phone,
      preferred_slot: slot || null,
      notes: notes || null,
      status: "requested",
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't send request", error.message);
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
            The RWA will arrange a trial with {maidName} and contact you on{" "}
            {phone}.
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              View requests
            </Button>
            <Button variant="brand" onClick={() => router.push("/maids")}>
              Back to staff
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="display text-base font-semibold mb-3">
          Request {maidName}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          {jobs.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="job">Which job?</Label>
              <Select
                id="job"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
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
            <Label htmlFor="slot">Preferred timing (optional)</Label>
            <Input
              id="slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              placeholder="Mornings before 10am"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Anything else? (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="3 BHK, family of 4..."
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            size="lg"
            variant="brand"
            className="w-full"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send request to RWA"
            )}
          </Button>
          <p className="text-xs text-center text-ink-soft">
            The RWA arranges a trial — no payment now. Rates follow the official
            card.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
