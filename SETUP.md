# Setup checklist

Use this as a punch list when standing up a fresh environment.

## Local development

- [ ] Install Node.js 18.17+ (https://nodejs.org)
- [ ] Run `npm install` in this directory
- [ ] Create Supabase project at https://supabase.com (region: `ap-south-1` Mumbai)
- [ ] Run `supabase/migrations/0001_initial.sql` in Supabase SQL editor
- [ ] Run `supabase/seed.sql` in Supabase SQL editor
- [ ] In Supabase, **Authentication → Providers → Email**: enable, turn off "Confirm email"
- [ ] In Supabase, **Authentication → URL Configuration**: set Site URL to `http://localhost:3000`, add `http://localhost:3000/auth/callback` to Redirect URLs
- [ ] Copy `.env.example` to `.env.local` and fill in the three Supabase keys
- [ ] Run `npm run dev` — open http://localhost:3000
- [ ] Visit http://localhost:3000/dev → click "Seed demo data" → log in as any role

## Production deploy (Vercel)

- [ ] Push to GitHub
- [ ] Import repo into Vercel at https://vercel.com/new
- [ ] Add env vars in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_NAME=Mayfield Market`
  - `NEXT_PUBLIC_SOCIETY_SLUG=mayfield-c-block`
  - `NEXT_PUBLIC_SOCIETY_NAME=Mayfield Gardens`
  - `NEXT_PUBLIC_SOCIETY_BLOCK=C-Block`
  - `NEXT_PUBLIC_SOCIETY_LOCATION=Sector 50, Gurugram`
  - `NEXT_PUBLIC_DEV_LOGIN=0`  ← **MUST be 0 in production**
- [ ] Deploy
- [ ] In Supabase, add the Vercel URL to **Authentication → URL Configuration**
- [ ] Sign up via the live URL with your real email
- [ ] In Supabase SQL editor, promote yourself to admin:
  ```sql
  update public.profiles
  set role = 'admin', society_id = (select id from public.societies where slug = 'mayfield-c-block')
  where email = 'you@example.com';
  ```
- [ ] Access `/admin` and start onboarding vendors

## First-week launch playbook

- [ ] Walk door-to-door with a printout of the QR / link — get 10 vendors to apply
- [ ] Approve them via `/admin/vendors`
- [ ] Make sure each vendor has added at least 5 listings
- [ ] Drop a flyer in 50 flats with the URL + a short pitch
- [ ] Watch `/admin` for the first orders
- [ ] WhatsApp the vendor (their contact phone is in the dashboard) the moment their first order lands — coach them through accepting it
- [ ] Collect feedback after week 1: what's missing, what's broken, what surprised them
