# Deploying to Vercel

The repo is built so you can deploy with **almost no configuration**. Most
settings have safe code defaults; the only things that ever go in Vercel are
true secrets, and even those are optional for a first deploy.

## What's baked in (you do NOT set these anywhere)

| Value | Where the default lives | Safe to commit? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/config.ts` | Yes — it's a public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/config.ts` | Yes — anon key is designed for the browser, protected by RLS |
| `NEXT_PUBLIC_SOCIETY_*`, `NEXT_PUBLIC_APP_NAME` | `lib/society.ts` | Yes — just labels |
| `NEXT_PUBLIC_DEV_LOGIN` | defaults to **off** when unset | n/a — off = safe |

So the database, auth, and all the Mayfield branding work on Vercel with
**zero environment variables**.

## What you MUST keep out of git (set in Vercel only, if at all)

| Secret | Needed for | If you don't set it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Smart AI chat (Haiku) | Chat still works, but uses a simple keyword search instead of the LLM |
| `SUPABASE_SERVICE_ROLE_KEY` | The `/dev` demo-seed tool only | Not needed in production at all — `/dev` is disabled in prod |

**Why these can never be committed:** the service-role key bypasses every
security rule and gives full delete access to the database; the Anthropic key
bills your account. Git history is permanent — committing once = leaked
forever.

## Steps

1. Go to **https://vercel.com/new** and sign in with the GitHub account that
   owns the repo (`intelifycore-art`).
2. Import **`intelifycore-art/mayfield-market`**.
3. Framework preset: **Next.js** (auto-detected). Leave build settings default.
4. (Optional but recommended) Add **one** environment variable:
   - `ANTHROPIC_API_KEY` = your Claude key from console.anthropic.com
   - Mark it for Production + Preview.
   - Skip this and the AI still works (keyword mode) — add it anytime later
     and redeploy.
5. Click **Deploy**. You'll get a `https://mayfield-market-xxxx.vercel.app` URL.
6. In **Supabase → Authentication → URL Configuration**:
   - Set **Site URL** to your Vercel URL.
   - Add `https://<your-vercel-url>/auth/callback` to **Redirect URLs**.
   - (This makes the email login codes work in production.)

That's the whole deploy.

## After deploy — make yourself admin

Sign in once on the live site with your real email, then in the Supabase SQL
editor:

```sql
update public.profiles
set role = 'admin',
    society_id = (select id from public.societies where slug = 'mayfield-c-block')
where email = 'you@example.com';
```

Now `/admin` works on the live site.

## Production email (before real residents sign up)

Supabase's built-in mailer is rate-limited (~2 emails/hour) and not meant for
production. Wire a real sender in **Supabase → Authentication → Emails → SMTP**
(Resend / Postmark / Brevo all have free tiers), or switch to phone OTP. See
`supabase/README.md`.

## Custom domain

Vercel → Project → **Settings → Domains** → add e.g. `mayfield.market`. Then
update the Supabase Site URL + Redirect URLs to match.
