# Supabase setup

## 1. Create the project
1. Go to https://supabase.com → New Project.
2. Pick a region close to India (e.g. `ap-south-1` Mumbai).
3. Save the project URL + anon key + service role key — these go in `.env.local`.

## 2. Run the migration
Open the Supabase SQL editor and paste `migrations/0001_initial.sql`. Run it.
Verify by checking that the `societies`, `profiles`, `vendors`, `listings` etc. tables exist under "Table editor".

## 3. Run the seed
Paste `seed.sql` into the SQL editor and run. This creates:
- The `mayfield-c-block` society
- 8 product categories + 10 service categories

## 4. Configure auth
In **Authentication → Providers**:
- Enable **Email** with "Confirm email" turned OFF for dev. (Turn ON for production.)
- Optionally enable **Phone** + plug in Twilio/MSG91 later. For MVP, email OTP is fine.

In **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (dev) or your Vercel URL (prod).
- Redirect URLs: add `http://localhost:3000/auth/callback` and your Vercel URL with the same suffix.

## 5. Promote yourself to admin (first time only)
After signing up via the app once, run this in the SQL editor:

```sql
update public.profiles
set role = 'admin', society_id = (select id from public.societies where slug = 'mayfield-c-block')
where email = 'YOU@example.com';
```

You can now access `/admin`.

## 6. Add demo vendors + listings (optional, dev only)
With `NEXT_PUBLIC_DEV_LOGIN=1` set, the app exposes `/dev` where you can one-click create three demo accounts (resident, vendor, admin) plus sample vendors and listings. **Disable this in production.**
