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
import { Loader2, Mail, ArrowRight, Store } from "lucide-react";

export function LoginForm({
  next,
  role,
}: {
  next?: string;
  role?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const isVendor = role === "vendor";

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't send the code", error.message);
      return;
    }
    toast.success("Code sent", `Check ${email} for a 6-digit code.`);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setBusy(false);
    if (error) {
      toast.error("Wrong or expired code", error.message);
      return;
    }
    // Decide where to send them. role=vendor lands on the vendor app
    // (apply page if no record, dashboard otherwise).
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
              Sign in with email to manage your storefront at {fullSocietyName()}. New
              vendors will be prompted to apply.
            </CardDescription>
          </>
        ) : next ? (
          <>
            <CardTitle className="text-2xl display">Sign in to continue</CardTitle>
            <CardDescription>
              We need to know who you are so the vendor can deliver to your flat.
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl display">Welcome to your block</CardTitle>
            <CardDescription>
              Sign in with your email to start shopping with vendors in {fullSocietyName()}.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-ink-soft">
                We&apos;ll email you a 6-digit code. No password to remember.
              </p>
            </div>
            <Button type="submit" disabled={busy || !email} className="w-full" size="lg">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
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
                Sent to {email}.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                  }}
                >
                  Use a different email
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
