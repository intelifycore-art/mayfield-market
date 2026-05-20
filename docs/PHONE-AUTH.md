# Phone OTP login

The public `/login` is phone-only (10-digit Indian mobile, `+91` prefix is
baked in). The code calls Supabase phone OTP. To make it actually work
you must enable the Phone provider in the Supabase dashboard — I can't
do that part remotely.

## One-time Supabase dashboard setup

1. Open the project → **Authentication → Sign In / Providers**.
2. Find **Phone**, toggle it **ON**.
3. Pick one path below.

### Path A — demo without real SMS (recommended right now)

Use Supabase's **Test OTP** feature: hardcode a few phone numbers that
accept a fixed code. No SMS account, no money, works for the demo.

Still in **Authentication → Sign In / Providers → Phone**, scroll to
**Test OTP** and add rows like:

| Phone (E.164) | OTP |
|---|---|
| `+919999912345` | `123456` |
| `+919999900002` | `123456` |
| `+919999912346` | `123456` |

Save. Now `+91 9999912345` + `123456` on the live login page succeeds
without any SMS being sent.

### Path B — real SMS (for production)

In the same Phone provider page, pick an SMS gateway and paste creds.
Best fits for India:

- **MSG91** — Indian provider, free trial credits, supported natively.
- **Twilio** — global, easy to set up, but per-SMS cost.
- **Vonage / MessageBird** — also supported.

Once configured, real residents enter their phone, get a real SMS, type
the code in. The app code doesn't change.

## What the app already does for you

- `app/(auth)/login/form.tsx` — phone-only UI with the `+91` chip,
  10-digit validation, sends to Supabase as `+91XXXXXXXXXX`.
- Onboarding form no longer asks for phone (already known from auth).
- The `handle_new_user` trigger in `supabase/migrations/0001_initial.sql`
  copies `auth.users.phone` → `public.profiles.phone` on signup, so the
  rest of the app keeps working unchanged.

## Notes

- **Internal `/dev` login** still uses email + password — it's an
  engineer tool that bypasses OTP entirely. That's fine; it's only
  active when `NEXT_PUBLIC_DEV_LOGIN=1`.
- If a resident tries to log in with a phone that exists in `auth.users`
  but whose `profiles` row hasn't been onboarded (no flat number),
  they'll be sent to `/onboarding` after the OTP succeeds — same flow
  as before.
- If Supabase says "phone provider not enabled" when you press
  **Send code**, you've skipped step 2 above.
