# Email OTP — optional Supabase setup

The login page has three sign-in modes:

1. **Password** (default — works out of the box).
2. **OTP code** (the "Sign in with a code" link).
3. **Sign-up** (creates a new email + password account).

The OTP code mode works with **zero** Supabase configuration in the
sense that signups + signins via Supabase's `signInWithOtp` always
succeed. *But* by default Supabase emails a **magic link**, not a
6-digit code. If the resident only sees a link in the email, clicking
the link will sign them in just as well — there's a fallback message
on the OTP code screen telling them this.

If you'd like real 6-digit codes (cleaner for users typing on a phone),
do the one-time Supabase tweak below.

## To enable the 6-digit OTP code (optional)

1. Supabase Dashboard → **Authentication → Emails → Templates**.
2. Pick **Magic Link**.
3. In the template body, make sure the variable `{{ .Token }}` appears
   prominently. A simple template:

   ```html
   <h2>Your Mayfield Market sign-in code</h2>

   <p style="font-size: 28px; letter-spacing: 6px; font-family: monospace;">
     {{ .Token }}
   </p>

   <p>Enter this 6-digit code on the sign-in page. It expires in 1 hour.</p>

   <p style="color: #888; font-size: 12px">
     Or click <a href="{{ .ConfirmationURL }}">this link</a> to sign in
     instantly.
   </p>
   ```

4. Save.

That's it. The same email now carries both the **6-digit code** and the
**magic link** — whichever the resident uses, they get signed in.

## Notes

- Supabase free tier has a rate limit on the built-in mailer (~2 emails
  per hour). Once you're onboarding real residents at scale, plug a
  proper SMTP provider in **Authentication → Emails → SMTP Settings**
  (Resend, Postmark, Brevo all have generous free tiers).
- Phone OTP is a separate feature — needs Twilio / MSG91 in
  **Authentication → Sign In / Providers → Phone**. The app code is
  ready for it (we shipped phone OTP earlier then reverted to keep the
  demo zero-config); switching back later is a small code change.
