"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { fullSocietyName } from "@/lib/society";
import { Loader2, ArrowRight, Store } from "lucide-react";

const COUNTRY = "+91"; // India only for the MVP

export function LoginForm({
  next,
  role,
}: {
  next?: string;
  role?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"phone" | "code">("phone");
  // 10-digit local number; the +91 prefix is added when sending
  const [local, setLocal] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const isVendor = role === "vendor";
  const fullPhone = COUNTRY + local;
  const phoneReady = /^\d{10}$/.test(local);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneReady) {
      toast.error("Enter a 10-digit mobile number");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't send the code", error.message);
      return;
    }
    toast.success("Code sent", `SMS to ${fullPhone}`);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: code,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error("Wrong or expired code", error.message);
      return;
    }
    const target = next ?? (isVendor ? "/vendor" : "/");
    router.replace(target);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        {isVendor ? (
          <>
            <div className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-brand-dark bg-brand-tint rounded-full px-2 py-0.5 w-fit mb-1">
              <Store className="h-3 w-3" />
              Vendor sign in
            </div>
            <CardTitle className="text-2xl display">List your business</CardTitle>
            <CardDescription>
              Sign in with your mobile number to manage your storefront at{" "}
              {fullSocietyName()}. New vendors will be prompted to apply.
            </CardDescription>
          </>
        ) : next ? (
          <>
            <CardTitle className="text-2xl display">Sign in to continue</CardTitle>
            <CardDescription>
              We need your mobile number so the vendor can reach you for delivery.
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl display">Welcome to your block</CardTitle>
            <CardDescription>
              Sign in with your mobile number to start shopping with vendors in{" "}
              {fullSocietyName()}.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        {step === "phone" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <div className="flex items-stretch rounded-md border border-line bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
                <span className="px-3 grid place-items-center text-sm text-ink-muted bg-bg-subtle border-r border-line rounded-l-md tabular">
                  {COUNTRY}
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  className="border-0 focus-visible:ring-0 focus-visible:border-0 rounded-l-none tabular"
                  value={local}
                  onChange={(e) =>
                    setLocal(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
              </div>
              <p className="text-xs text-ink-soft">
                We&apos;ll text you a 6-digit code. No password to remember.
              </p>
            </div>
            <Button
              type="submit"
              disabled={busy || !phoneReady}
              className="w-full"
              size="lg"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send code <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            {!isVendor ? (
              <p className="text-center text-xs text-ink-soft">
                Vendor or service provider?{" "}
                <Link href="/login?role=vendor" className="text-brand underline">
                  Sign in here
                </Link>
              </p>
            ) : (
              <p className="text-center text-xs text-ink-soft">
                Looking to shop instead?{" "}
                <Link href="/login" className="text-brand underline">
                  Resident sign in
                </Link>
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                placeholder="123456"
                className="text-center text-lg tabular tracking-[0.4em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-ink-soft">
                Sent to {fullPhone}.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                  }}
                >
                  Use a different number
                </button>
              </p>
            </div>
            <Button
              type="submit"
              disabled={busy || code.length < 6}
              className="w-full"
              size="lg"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
