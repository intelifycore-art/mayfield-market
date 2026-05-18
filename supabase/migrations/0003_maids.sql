-- =============================================================================
-- 0003_maids.sql
-- RWA-run domestic-staff registry for C-Block, Mayfield Gardens.
--   household_services  — the RWA's official rate card / job catalog
--   maids               — registered domestic staff (18+, status, entry pass)
--   maid_services       — which jobs each maid does (+ her quoted rate)
-- Plus bookings can now reference a maid + household service directly.
-- Safe to run multiple times.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- household_services — official RWA rate card (also the bookable job list)
-- ---------------------------------------------------------------------------
create table if not exists public.household_services (
  id          uuid primary key default gen_random_uuid(),
  society_id  uuid not null references public.societies(id) on delete cascade,
  slug        text not null,
  title       text not null,
  description text,
  rate_min    numeric(10,2),
  rate_max    numeric(10,2),
  rate_unit   text not null default 'month',
  grp         text not null default 'cleaning',  -- cleaning | kitchen | fulltime
  sort_order  int not null default 100,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (society_id, slug)
);

create index if not exists hs_society_idx on public.household_services(society_id);

-- ---------------------------------------------------------------------------
-- maids — RWA staff registry
-- ---------------------------------------------------------------------------
do $$ begin
  create type maid_status as enum ('active', 'blacklisted', 'inactive');
exception when duplicate_object then null; end $$;

create table if not exists public.maids (
  id                uuid primary key default gen_random_uuid(),
  society_id        uuid not null references public.societies(id) on delete cascade,
  full_name         text not null,
  age               int not null check (age >= 18),
  phone             text,
  photo_url         text,
  languages         text,
  experience_years  int not null default 0,
  about             text,
  status            maid_status not null default 'active',
  entry_pass_active boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (society_id, phone)
);

create index if not exists maids_society_idx on public.maids(society_id);
create index if not exists maids_status_idx on public.maids(status);

-- ---------------------------------------------------------------------------
-- maid_services — many-to-many (which jobs a maid does, + her rate)
-- ---------------------------------------------------------------------------
create table if not exists public.maid_services (
  maid_id              uuid not null references public.maids(id) on delete cascade,
  household_service_id uuid not null references public.household_services(id) on delete cascade,
  rate                 numeric(10,2),
  primary key (maid_id, household_service_id)
);

-- ---------------------------------------------------------------------------
-- bookings: allow maid bookings (no vendor). Make vendor link optional.
-- ---------------------------------------------------------------------------
alter table public.bookings alter column vendor_id drop not null;
alter table public.bookings
  add column if not exists maid_id uuid references public.maids(id) on delete set null;
alter table public.bookings
  add column if not exists household_service_id uuid references public.household_services(id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at trigger for maids
-- ---------------------------------------------------------------------------
drop trigger if exists maids_touch on public.maids;
create trigger maids_touch before update on public.maids
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.household_services enable row level security;
alter table public.maids              enable row level security;
alter table public.maid_services      enable row level security;

drop policy if exists hs_read on public.household_services;
create policy hs_read on public.household_services for select using (true);
drop policy if exists hs_admin on public.household_services;
create policy hs_admin on public.household_services for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- Anyone can see active maids; admin can see/manage all
drop policy if exists maids_read on public.maids;
create policy maids_read on public.maids for select
  using (status = 'active' or current_role_is('admin'));
drop policy if exists maids_admin on public.maids;
create policy maids_admin on public.maids for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

drop policy if exists ms_read on public.maid_services;
create policy ms_read on public.maid_services for select using (
  exists(select 1 from public.maids m where m.id = maid_id
         and (m.status = 'active' or current_role_is('admin')))
);
drop policy if exists ms_admin on public.maid_services;
create policy ms_admin on public.maid_services for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- =============================================================================
-- SEED — official RWA rate card for C-Block, Mayfield Gardens
-- =============================================================================
do $$
declare soc uuid;
begin
  select id into soc from public.societies where slug = 'mayfield-c-block';
  if soc is null then
    raise notice 'Society mayfield-c-block not found — run seed.sql first';
    return;
  end if;

  insert into public.household_services
    (society_id, slug, title, description, rate_min, rate_max, rate_unit, grp, sort_order)
  values
    (soc,'sweep-mop-2bhk','Sweeping & mopping — 2 BHK','Inclusive of balconies and the staircase in front of the house.',1000,1500,'month','cleaning',10),
    (soc,'sweep-mop-3bhk','Sweeping & mopping — 3 BHK','Inclusive of balconies and the staircase in front of the house.',1500,2000,'month','cleaning',11),
    (soc,'sweep-mop-4bhk','Sweeping & mopping — 4 BHK','Inclusive of balconies and the staircase in front of the house.',2000,2500,'month','cleaning',12),
    (soc,'utensils','Utensil cleaning (twice a day)','For a family of 3–4 members. More members on pro-rata basis.',1200,1500,'month','kitchen',20),
    (soc,'dusting','Dusting (1 hour daily)','Full-house dusting, about an hour each day.',1500,1500,'month','cleaning',30),
    (soc,'laundry','Clothes washing + dry & fold','Machine wash, drying, folding.',500,500,'month','cleaning',40),
    (soc,'kitchen-prep','Kitchen preparation','Daily kitchen prep / chopping support.',1000,1000,'month','kitchen',50),
    (soc,'bathroom','Bathroom cleaning','WC, basin, mirror, floor. Rate is per bathroom.',250,250,'per bathroom / month','cleaning',60),
    (soc,'cook','Cook (3 meals)','Breakfast, lunch and dinner for a family of 4.',5500,5500,'month','kitchen',70),
    (soc,'fulltime-8','Full-time maid — 8 hours','8 hours a day.',8000,8000,'month','fulltime',80),
    (soc,'fulltime-10','Full-time maid — 10 hours','10 hours a day.',10000,10000,'month','fulltime',81),
    (soc,'fulltime-12','Full-time maid — 12 hours','12 hours a day.',12000,12000,'month','fulltime',82)
  on conflict (society_id, slug) do update set
    title = excluded.title, description = excluded.description,
    rate_min = excluded.rate_min, rate_max = excluded.rate_max,
    rate_unit = excluded.rate_unit, grp = excluded.grp,
    sort_order = excluded.sort_order, is_active = true;

  -- ---- demo maids -------------------------------------------------------
  insert into public.maids
    (society_id, full_name, age, phone, photo_url, languages, experience_years, about, status)
  values
    (soc,'Sunita Devi',34,'9810000011','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80','Hindi, Bengali',9,'Works in 6 flats in C-Block. Punctual, very thorough with mopping.','active'),
    (soc,'Lakshmi R',29,'9810000012','https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&q=80','Hindi, Tamil',5,'Specialises in kitchen + utensils. Available mornings.','active'),
    (soc,'Reena Kumari',41,'9810000013',null,'Hindi',15,'Senior help, can run a full household. Trusted by 4 families.','active'),
    (soc,'Anjali S',23,'9810000014','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=80','Hindi, English',3,'Younger, energetic. Good for full-time 8–10 hr roles.','active')
  on conflict (society_id, phone) do update set
    full_name = excluded.full_name, age = excluded.age,
    photo_url = excluded.photo_url, languages = excluded.languages,
    experience_years = excluded.experience_years, about = excluded.about;

  -- ---- link demo maids to services -------------------------------------
  -- rate is left NULL on purpose: the official RWA rate card is the single
  -- source of truth shown on every card. (Admin may optionally set a
  -- maid-specific rate later; demos follow the document exactly.)

  insert into public.maid_services (maid_id, household_service_id, rate)
  select m.id, h.id, null
  from public.maids m, public.household_services h
  where m.society_id = soc and m.phone = '9810000011'
    and h.society_id = soc
    and h.slug in ('sweep-mop-2bhk','sweep-mop-3bhk','sweep-mop-4bhk','dusting','bathroom')
  on conflict do nothing;

  insert into public.maid_services (maid_id, household_service_id, rate)
  select m.id, h.id, null
  from public.maids m, public.household_services h
  where m.society_id = soc and m.phone = '9810000012'
    and h.society_id = soc and h.slug in ('utensils','kitchen-prep','cook')
  on conflict do nothing;

  insert into public.maid_services (maid_id, household_service_id, rate)
  select m.id, h.id, null
  from public.maids m, public.household_services h
  where m.society_id = soc and m.phone = '9810000013'
    and h.society_id = soc
    and h.slug in ('fulltime-8','fulltime-10','fulltime-12','sweep-mop-3bhk','sweep-mop-4bhk')
  on conflict do nothing;

  insert into public.maid_services (maid_id, household_service_id, rate)
  select m.id, h.id, null
  from public.maids m, public.household_services h
  where m.society_id = soc and m.phone = '9810000014'
    and h.society_id = soc and h.slug in ('fulltime-8','fulltime-10','laundry')
  on conflict do nothing;
end $$;
