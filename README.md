# Mayfield Market

The neighborhood marketplace for **Mayfield Gardens C-Block, Sector 50, Gurugram**. Built so residents can buy from — and book services with — the local vendors they already trust, instead of the 10-min apps where quality is hit-or-miss.

Three role-based interfaces, all in one app:

- **Resident** (default) — browse vendors in your block, add to cart, checkout, track orders, book services
- **Vendor** — manage listings, accept and fulfill orders, set storefront hours
- **Admin (RWA)** — approve vendors, manage categories, see all activity

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Styling | Tailwind CSS + custom design tokens |
| Database & auth | Supabase (Postgres with row-level security, email OTP) |
| State | Zustand (cart only — everything else is Server Components) |
| Hosting | Vercel + Supabase |
| Language | TypeScript everywhere |

Why this stack: Vercel + Supabase + Next.js is the fastest way from zero to a real consumer app in India today. RLS gives you multi-tenant safety without writing your own auth middleware. Server Components keep the JS bundle small for residents on slower phones.

---

## Quick start

### Prerequisites

- **Node.js 18.17+** — install from https://nodejs.org (LTS is fine)
- **A Supabase account** — https://supabase.com (free tier works for the MVP)
- **A Vercel account** for production deploy (optional for local dev) — https://vercel.com

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to https://supabase.com → **New Project**.
   - Region: **ap-south-1 (Mumbai)** for low India latency.
   - Pick a strong DB password — you won't need it again.
2. Open the SQL editor → paste in `supabase/migrations/0001_initial.sql` → run.
3. Same place → paste `supabase/seed.sql` → run. This creates the Mayfield society + categories.
4. Go to **Authentication → Providers → Email**: turn ON, turn OFF "Confirm email" (for dev).
5. Go to **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/auth/callback`
6. Go to **Project Settings → API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)

### 3. Create `.env.local`

Copy `.env.example` to `.env.local` and fill in your three Supabase values. Defaults for everything else point to Mayfield C-Block.

```bash
cp .env.example .env.local
# Then edit .env.local
```

### 4. Run dev server

```bash
npm run dev
```

Open http://localhost:3000.

### 5. Seed demo data + log in

The app ships with a hidden `/dev` page (gated by `NEXT_PUBLIC_DEV_LOGIN=1`):

1. Visit http://localhost:3000/dev
2. Click **Seed demo data** — creates 4 test accounts plus 2 sample vendors with listings.
3. Click **Login as Resident** / **Vendor (Sharma Sabziwala)** / **Vendor (Sparkle Clean)** / **Admin** to instantly hop between perspectives.

Demo accounts (password `mayfield-dev-2026`):
- `dev-admin@mayfield.local` — RWA admin
- `dev-resident@mayfield.local` — Resident at T-3, Flat 1204
- `dev-vendor1@mayfield.local` — Sharma's Mandi (produce vendor, approved)
- `dev-vendor2@mayfield.local` — Sparkle Clean (cleaning service, approved)

> **Important:** Set `NEXT_PUBLIC_DEV_LOGIN=0` (or remove it) before going live. The `/dev` page and the demo-seed API both check this flag.

### 6. Promoting a real user to admin

After signing up with your real email through `/login`, run this in Supabase SQL editor:

```sql
update public.profiles
set role = 'admin',
    society_id = (select id from public.societies where slug = 'mayfield-c-block')
where email = 'you@example.com';
```

You can now access `/admin`.

---

## Project structure

```
mayfield-market/
├─ app/
│  ├─ (auth)/              # Login, onboarding, signout
│  ├─ (resident)/          # Resident-facing app (default landing)
│  │  ├─ home, browse, vendor/[id], services, cart,
│  │  │  checkout, orders, profile
│  ├─ vendor/              # Vendor dashboard (apply, today, listings, services, profile)
│  ├─ admin/               # RWA admin (overview, vendors, categories, orders, residents)
│  ├─ api/                 # Order + booking endpoints
│  ├─ dev/                 # Dev-only seed/login console
│  ├─ auth/callback/       # OAuth callback (future)
│  ├─ layout.tsx, page.tsx, not-found.tsx, globals.css
├─ components/
│  ├─ ui/                  # Button, Card, Input, Badge, etc. (shadcn-style primitives)
│  ├─ brand/               # Logo
│  ├─ resident/            # BottomNav, VendorCard, ListingCard, CategoryTile, etc.
│  ├─ vendor/, admin/      # Role-specific shared components
│  └─ category-icon.tsx    # Lucide icon resolver
├─ lib/
│  ├─ supabase/            # client.ts, server.ts, admin.ts, middleware.ts
│  ├─ auth.ts              # getCurrentProfile, requireOnboarded, requireRole
│  ├─ cart-store.ts        # Zustand cart with localStorage persistence
│  ├─ format.ts            # INR (lakhs/crores), relative time
│  ├─ society.ts           # Per-society identity (env-driven)
│  ├─ types.ts             # Hand-maintained DB types
│  └─ utils.ts             # cn() helper
├─ supabase/
│  ├─ migrations/0001_initial.sql   # Schema, triggers, RLS, views
│  ├─ seed.sql                       # Mayfield society + categories
│  └─ README.md
├─ middleware.ts            # Supabase session refresh
├─ tailwind.config.ts, next.config.mjs, tsconfig.json, package.json
└─ .env.example
```

---

## Deployment

### Vercel

1. Push this repo to GitHub.
2. https://vercel.com/new → import the repo.
3. Add environment variables (copy from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SOCIETY_*` values (or accept defaults)
   - `NEXT_PUBLIC_APP_NAME=Mayfield Market`
   - `NEXT_PUBLIC_DEV_LOGIN=0` ← **important, turn off in prod**
   - `NEXT_PUBLIC_SUPPORT_WHATSAPP=` (optional support number)
4. Deploy. Vercel gives you a URL like `mayfield-market.vercel.app`.
5. In Supabase → **Authentication → URL Configuration**, add the Vercel URL as Site URL and to Redirect URLs.

### Custom domain (when you have one)

In Vercel → **Settings → Domains**, add e.g. `mayfield.market` and follow DNS instructions. Update Supabase URL config to match.

---

## Forking for another society/block

The app is multi-tenant — all data is scoped by `society_id` — but each deployment also has a society identity baked in via env vars. To launch for, say, Mayfield D-Block:

1. Insert a new row into `societies` (different `slug`).
2. Spin up a new Vercel project pointing at the same repo.
3. Set `NEXT_PUBLIC_SOCIETY_SLUG=mayfield-d-block` + matching name/block/location.
4. Done. Same Supabase project, different domain, different brand identity.

(For a different RWA / different society entirely, just give them their own Supabase project too — clean separation.)

---

## What's next (Phase 2 — post-MVP)

These were deliberately left out so we can ship MVP. In priority order:

1. **Razorpay (UPI/cards in-app)** — currently orders are COD or "UPI direct to vendor". Add Razorpay once volume justifies KYC effort.
2. **Image uploads** — vendors paste image URLs today. Wire Supabase Storage for native uploads.
3. **Push / WhatsApp notifications** — order-placed → vendor, order-accepted → resident, etc. Either MSG91 webhooks or a Supabase Edge function calling WhatsApp Cloud API.
4. **Reviews** — schema is already there; build the UI.
5. **Phone OTP** — email works for MVP but Indian residents will expect phone. Plug Twilio/MSG91 into Supabase auth.
6. **Repeat-order shortcuts** — "Buy again" on the home screen for residents who order the same things weekly.
7. **Inventory sync** — when an order is placed, decrement stock automatically (currently manual).
8. **Vendor analytics** — daily/weekly revenue, top items, repeat customer rate.

---

## Design system

- **Background**: warm off-white (`#fbfaf7`), not pure white. Feels less SaaS, more shop.
- **Accent**: deep forest green (`#16695a`). Sparingly used.
- **Text**: warm ink (`#1c1917`).
- **Type**: Inter for UI, **Fraunces** for display headings — gives it editorial warmth.
- **Indian formatting**: ₹ symbol, lakhs/crores aware (see `lib/format.ts`).
- **No emojis** in product UI. Lucide stroke icons throughout.
- **Mobile-first** — every layout is designed for a phone first, desktop is a constrained max-width.

---

## Known limitations / gotchas

- **Image hosting in MVP** — vendors paste image URLs. Production should wire up Supabase Storage uploads.
- **No real-time** — order status changes need a page refresh. Easy to upgrade later via Supabase Realtime.
- **No payment reconciliation** — COD relies on the vendor honest-reporting that they were paid. Acceptable for tight-knit block; add Razorpay before scaling.
- **First user must be promoted to admin manually** via SQL — see step 6 above. We can add an "RWA invite code" flow later.

---

## Support / contributing

This is a one-society MVP — keep scope tight, validate with real residents and vendors, *then* add features. If you find a bug or have an idea, drop it in an issue.
