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
import {
  Loader2,
  ArrowRight,
  Store,
  Mail,
  KeyRound,
  Sparkles,
  MessageSquare,
} from "lucide-react";

// Demo credentials — provisioned by the dev seed. Visible on the login page
// for the demo phase; hide by setting NEXT_PUBLIC_SHOW_DEMO_LOGIN=0 in Vercel.
const DEMO_EMAIL = "demo@mayfield.market";
const DEMO_PASSWORD = "mayfield2026";

// India only for the MVP — +91 prefix is fixed.
const COUNTRY = "+91";

type Mode = "password" | "signup" | "otp-phone" | "otp-code";

export function LoginForm({
  next,
  role,
}: {
  next?: string;
  role?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /** 10-digit local mobile number (+91 prefix added at send time). */
  const [phoneLocal, setPhoneLocal] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const fullPhone = COUNTRY + phoneLocal;
  const phoneReady = /^\d{10}$/.test(phoneLocal);

  const isVendor = role === "vendor";
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN !== "0";

  function targetAfterLogin() {
    return next ?? (isVendor ? "/vendor" : "/");
  }

  async function passwordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't sign in", error.message);
      return;
    }
    router.replace(targetAfterLogin());
    router.refresh();
  }

  async function signupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setBusy(true);
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
    // Carry the vendor intent through so onboarding pre-selects the role
    router.replace(`/onboarding${isVendor ? "?role=vendor" : ""}`);
    router.refresh();
  }

  async function sendOtp(e: React.FormEvent) {
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
    toast.success("SMS sent", `6-digit code on its way to ${fullPhone}`);
    setMode("otp-code");
  }

  async function verifyOtp(e: React.FormEvent) {
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
    router.replace(targetAfterLogin());
    router.refresh();
  }

  function fillDemo() {
    setMode("password");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  // ---------- header copy ----------
  const headerCopy = () => {
    if (isVendor) {
      return {
        eyebrow: (
          <div className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-brand-dark bg-brand-tint rounded-full px-2 py-0.5 w-fit mb-1">
            <Store className="h-3 w-3" />
            Vendor sign in
          </div>
        ),
        title: "List your business",
        desc: `Sign in to manage your storefront at ${fullSocietyName()}. New vendors will be prompted to apply after signing up.`,
      };
    }
    if (next) {
      return {
        title: "Sign in to continue",
        desc: "Sign in so the vendor can deliver to your flat.",
      };
    }
    if (mode === "signup") {
      return {
        title: "Create your account",
        desc: `New to ${fullSocietyName()}? Set up an email and password to start shopping.`,
      };
    }
    if (mode === "otp-phone" || mode === "otp-code") {
      return {
        title: "Sign in with a code",
        desc: "Enter your mobile number — we'll text a 6-digit code.",
      };
    }
    return {
      title: "Welcome to your block",
      desc: `Sign in to start shopping with vendors in ${fullSocietyName()}.`,
    };
  };
  const h = headerCopy();

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          {"eyebrow" in h && h.eyebrow ? h.eyebrow : null}
          <CardTitle className="text-2xl display">{h.title}</CardTitle>
          <CardDescription>{h.desc}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 sm:pt-0">
          {mode === "password" ? (
            <form onSubmit={passwordSubmit} className="space-y-4">
              <EmailField email={email} setEmail={setEmail} />
              <PasswordField password={password} setPassword={setPassword} />
              <Button
                type="submit"
                disabled={busy || !email.trim() || !password}
                className="w-full"
                size="lg"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                <button
                  type="button"
                  onClick={() => setMode("otp-phone")}
                  className="inline-flex items-center gap-1 text-brand underline"
                >
                  <MessageSquare className="h-3 w-3" />
                  SMS code instead
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-brand underline"
                >
                  Create account
                </button>
              </div>
            </form>
          ) : mode === "signup" ? (
            <form onSubmit={signupSubmit} className="space-y-4">
              <EmailField email={email} setEmail={setEmail} />
              <PasswordField
                password={password}
                setPassword={setPassword}
                placeholder="at least 6 characters"
                hint="Pick something memorable. You'll use it every time you log in."
              />
              <Button
                type="submit"
                disabled={busy || !email.trim() || password.length < 6}
                className="w-full"
                size="lg"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-ink-soft">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="text-brand underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          ) : mode === "otp-phone" ? (
            <form onSubmit={sendOtp} className="space-y-4">
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
                    value={phoneLocal}
                    onChange={(e) =>
                      setPhoneLocal(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
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
              <p className="text-center text-xs text-ink-soft">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="text-brand underline"
                >
                  Use password instead
                </button>
              </p>
            </form>
          ) : (
            // otp-code
            <form onSubmit={verifyOtp} className="space-y-4">
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
                  Sent by SMS to {fullPhone}.
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
              <p className="text-center text-xs text-ink-soft">
                <button
                  type="button"
                  onClick={() => {
                    setMode("otp-phone");
                    setCode("");
                  }}
                  className="underline"
                >
                  Use a different number
                </button>
              </p>
            </form>
          )}

          {!isVendor && (mode === "password" || mode === "signup") ? (
            <p className="text-center text-2xs text-ink-soft mt-4">
              Vendor or service provider?{" "}
              <Link href="/login?role=vendor" className="text-brand underline">
                Sign in here
              </Link>
            </p>
          ) : null}
          {isVendor && (mode === "password" || mode === "signup") ? (
            <p className="text-center text-2xs text-ink-soft mt-4">
              Looking to shop instead?{" "}
              <Link href="/login" className="text-brand underline">
                Resident sign in
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {showDemo && (mode === "password" || mode === "signup") ? (
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

function EmailField({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (s: string) => void;
}) {
  return (
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
  );
}

function PasswordField({
  password,
  setPassword,
  placeholder = "••••••••",
  hint,
}: {
  password: string;
  setPassword: (s: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder={placeholder}
          className="pl-9"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
