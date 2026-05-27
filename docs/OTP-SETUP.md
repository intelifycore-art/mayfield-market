# SMS OTP — Supabase setup

The login page has three sign-in modes:

1. **Password** *(default — works out of the box)*.
2. **SMS code** (the "SMS code instead" link) — phone OTP, the focus of this doc.
3. **Sign-up** (creates a new email + password account).

SMS OTP needs Supabase's Phone provider enabled. Two paths to pick from:

- **Test OTP** — free, instant, no SMS gateway. Hardcode phone numbers
  with fixed codes. Recommended while you demo.
- **Real SMS** — plug in MSG91 (Indian), Twilio, MessageBird or Vonage
  for production. Real residents get real texts.

The app code doesn't change between the two — you just toggle in Supabase.

---

## Path A — Test OTP (recommended for demo)

1. Supabase Dashboard → **Authentication → Sign In / Providers**.
2. Find **Phone**, toggle **Enable Phone provider** ON.
3. Scroll to **Test OTP** (or "Test phone numbers" — wording varies).
4. Add entries like:

   | Phone (E.164) | OTP |
   |---|---|
   | `+919999912345` | `123456` |
   | `+919999912346` | `123456` |
   | `+919876543210` | `654321` |

5. Save.

That's it. Open `/login`, tap **SMS code instead**, enter
`9999912345`, hit Send. Then type `123456` on the next screen → signed in.
No real SMS sent, no credits used.

---

## Path B — Real SMS (production)

Same provider page, **Phone** section. Pick a gateway:

### MSG91 (recommended for India)

- Cheapest per-SMS for Indian numbers.
- Native Supabase integration. Just paste in:
  - **Auth Key** (from MSG91 dashboard → API Key)
  - **Sender ID** (e.g. `MAYFLD` — a 6-character DLT-registered ID)
  - **Template ID** (DLT-approved OTP template ID)
- DLT registration is a one-time TRAI thing — MSG91's onboarding walks
  you through it (typically 2-3 working days for approval).

### Twilio

- Globally easiest. Add **Account SID**, **Auth Token**, and a **Twilio
  Verify Service SID** (recommended over plain Messaging Service to get
  fraud protection).
- Higher per-SMS cost in India than MSG91 (~₹0.40 vs ~₹0.15).

### Vonage / MessageBird

- Both work, similar setup. Pick whichever your team already uses.

Once configured, real users enter their phone, get a real SMS with the
6-digit code, sign in. **No app code change needed** — the form already
calls `signInWithOtp({ phone })` / `verifyOtp(type: 'sms')`.

---

## What the app already does

- `app/(auth)/login/form.tsx` — `SMS code instead` link opens the phone
  flow: `+91` prefix locked, 10-digit input, then 6-digit code screen.
- Onboarding (`/onboarding`) doesn't ask for phone again — Supabase's
  signup trigger (`handle_new_user` in `0001_initial.sql`) syncs
  `auth.users.phone` to `public.profiles.phone` automatically.
- Email + password still works as the primary sign-in path, plus the
  visible demo credentials card.

## Notes

- **Password sign-in keeps working** regardless of SMS setup. The demo
  account (`demo@mayfield.market`) is email + password and is unaffected.
- **No SMS rate limits in Test OTP** — perfect for repeated demos.
- **Production rate limits**: MSG91 ~₹15/100 SMS, Twilio ~₹40/100 SMS.
  Supabase doesn't charge a markup.
- If the Supabase Phone provider isn't enabled and someone clicks
  **SMS code instead**, they'll get an error toast — they can switch
  back to password and still log in.
