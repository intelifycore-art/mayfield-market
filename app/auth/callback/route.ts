import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Optional handler for OAuth or magic-link callbacks. The email-OTP flow
 * doesn't actually go through here (it verifies in the browser), but this
 * route is required if you later enable any OAuth provider.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
