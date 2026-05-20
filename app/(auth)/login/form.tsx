"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { fullSocietyName } from "@/lib/society";
import { Loader2, ArrowRight, Store, Mail, KeyRound, Sparkles } from "lucide-react";

// Demo credentials — provisioned by the dev seed. Visible on the login page
// for the demo phase; hide by setting NEXT_PUBLIC_SHOW_DEMO_LOGIN=0 in Vercel.
const DEMO_EMAIL = "demo@mayfield.market";
const DEMO_PASSWORD = "mayfield2026";

export function LoginForm({
  next,
  role,
}: {
  next?: string;
  role?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isVendor = role === "vendor";
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN !== "0";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (error) {
        toast.error("Couldn't sign in", error.message);
        return;
      }
      const target = next ?? (isVendor ? "/vendor" : "/");
      router.replace(target);
      router.refresh();
      return;
    }

    // signup
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't create account", error.message);
      return;
    }
    toast.success("Account created", "One last step.");
    router.replace("/onboarding");
    router.refresh();
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setMode("signin");
  }

  return (
    <div className="space-y-3">
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
                Sign in to manage your storefront at {fullSocietyName()}. New
                vendors will be prompted to apply after signing up.
              </CardDescription>
            </>
          ) : next ? (
            <>
              <CardTitle className="text-2xl display">Sign in to continue</CardTitle>
              <CardDescription>
                Sign in so the vendor can deliver to your flat.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl display">Welcome to your block</CardTitle>
              <CardDescription>
                {mode === "signin"
                  ? `Sign in to start shopping with vendors in ${fullSocietyName()}.`
                  : `Create your account to start shopping in ${fullSocietyName()}.`}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-0 sm:pt-0">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  placeholder={mode === "signup" ? "at least 6 characters" : "••••••••"}
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={busy || !email.trim() || !password}
              className="w-full"
              size="lg"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signin" ? (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-ink-soft">
              {mode === "signin" ? (
                <>
                  New to {fullSocietyName()}?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-brand underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-brand underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {!isVendor ? (
              <p className="text-center text-2xs text-ink-soft">
                Vendor or service provider?{" "}
                <Link href="/login?role=vendor" className="text-brand underline">
                  Sign in here
                </Link>
              </p>
            ) : (
              <p className="text-center text-2xs text-ink-soft">
                Looking to shop instead?{" "}
                <Link href="/login" className="text-brand underline">
                  Resident sign in
                </Link>
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {showDemo ? (
        <Card className="border-brand/25 bg-brand-tint/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-brand text-white grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-dark">
                Try the demo account
              </p>
              <p className="text-xs text-brand-dark/80 tabular mt-0.5 break-all">
                {DEMO_EMAIL} · {DEMO_PASSWORD}
              </p>
              <Button
                type="button"
                variant="brand"
                size="sm"
                className="mt-2"
                onClick={fillDemo}
              >
                Fill demo credentials
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
