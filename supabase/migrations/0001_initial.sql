-- =============================================================================
-- Mayfield Market — initial schema
-- Multi-tenant from day one: every row scoped by society_id.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Societies
-- ---------------------------------------------------------------------------
create table public.societies (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  block       text,
  location    text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles — one row per auth.users
-- ---------------------------------------------------------------------------
create type user_role as enum ('resident', 'vendor', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  phone       text,
  email       text,
  full_name   text,
  role        user_role not null default 'resident',
  society_id  uuid references public.societies(id) on delete set null,
  flat_no     text,
  tower       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_society_idx on public.profiles(society_id);
create index profiles_role_idx on public.profiles(role);

-- Auto-create profile when a new auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Categories (shared across societies)
-- ---------------------------------------------------------------------------
create type category_kind as enum ('product', 'service');

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  kind        category_kind not null,
  icon        text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index categories_kind_idx on public.categories(kind) where is_active = true;

-- ---------------------------------------------------------------------------
-- Vendors
-- ---------------------------------------------------------------------------
create type vendor_status as enum ('pending', 'approved', 'suspended');

create table public.vendors (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  society_id      uuid not null references public.societies(id) on delete cascade,
  business_name   text not null,
  tagline         text,
  description     text,
  photo_url       text,
  banner_url      text,
  contact_phone   text,
  whatsapp_phone  text,
  payout_upi      text,
  status          vendor_status not null default 'pending',
  is_open         boolean not null default true,
  delivery_note   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, society_id)
);

create index vendors_society_idx on public.vendors(society_id);
create index vendors_status_idx on public.vendors(status);
create index vendors_user_idx on public.vendors(user_id);

create table public.vendor_categories (
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (vendor_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Listings (products for sale)
-- ---------------------------------------------------------------------------
create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name        text not null,
  description text,
  price       numeric(10, 2) not null,
  unit        text not null default 'piece',
  image_url   text,
  stock       int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index listings_vendor_idx on public.listings(vendor_id);
create index listings_active_idx on public.listings(vendor_id) where is_active = true;

-- ---------------------------------------------------------------------------
-- Services (offerings, slot- or callback-based)
-- ---------------------------------------------------------------------------
create table public.services (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.vendors(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,
  name            text not null,
  description     text,
  starting_price  numeric(10, 2),
  pricing_unit    text not null default 'visit',
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index services_vendor_idx on public.services(vendor_id);

-- ---------------------------------------------------------------------------
-- Orders + items
-- ---------------------------------------------------------------------------
create type order_status as enum (
  'placed', 'accepted', 'rejected', 'out_for_delivery', 'delivered', 'cancelled'
);

create type payment_mode as enum ('cod', 'upi_direct');

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  resident_id     uuid not null references public.profiles(id) on delete restrict,
  vendor_id       uuid not null references public.vendors(id) on delete restrict,
  society_id      uuid not null references public.societies(id) on delete restrict,
  status          order_status not null default 'placed',
  subtotal        numeric(10, 2) not null,
  total           numeric(10, 2) not null,
  flat_no         text not null,
  tower           text,
  contact_phone   text not null,
  delivery_notes  text,
  payment_mode    payment_mode not null default 'cod',
  placed_at       timestamptz not null default now(),
  accepted_at     timestamptz,
  delivered_at    timestamptz,
  cancelled_at    timestamptz,
  cancel_reason   text
);

create index orders_resident_idx on public.orders(resident_id, placed_at desc);
create index orders_vendor_idx on public.orders(vendor_id, placed_at desc);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  listing_id    uuid references public.listings(id) on delete set null,
  name_snapshot text not null,
  unit          text not null,
  qty           int not null check (qty > 0),
  unit_price    numeric(10, 2) not null,
  line_total    numeric(10, 2) not null
);

create index order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- Service bookings
-- ---------------------------------------------------------------------------
create type booking_status as enum (
  'requested', 'confirmed', 'in_progress', 'completed', 'cancelled'
);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  resident_id     uuid not null references public.profiles(id) on delete restrict,
  vendor_id       uuid not null references public.vendors(id) on delete restrict,
  service_id      uuid references public.services(id) on delete set null,
  society_id      uuid not null references public.societies(id) on delete restrict,
  service_name_snapshot text not null,
  flat_no         text not null,
  tower           text,
  contact_phone   text not null,
  preferred_at    timestamptz,
  preferred_slot  text,
  notes           text,
  status          booking_status not null default 'requested',
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  completed_at    timestamptz
);

create index bookings_resident_idx on public.bookings(resident_id, created_at desc);
create index bookings_vendor_idx on public.bookings(vendor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Reviews (post-order, post-booking)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  resident_id   uuid not null references public.profiles(id) on delete cascade,
  vendor_id     uuid not null references public.vendors(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  booking_id    uuid references public.bookings(id) on delete set null,
  rating        int not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now()
);

create index reviews_vendor_idx on public.reviews(vendor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger vendors_touch before update on public.vendors
  for each row execute function public.touch_updated_at();
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers used by RLS
-- ---------------------------------------------------------------------------
create or replace function public.current_role_is(target_role user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = target_role
  );
$$;

create or replace function public.current_society_id()
returns uuid language sql stable security definer set search_path = public as $$
  select society_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_vendor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.vendors where user_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.societies         enable row level security;
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.vendors           enable row level security;
alter table public.vendor_categories enable row level security;
alter table public.listings          enable row level security;
alter table public.services          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.bookings          enable row level security;
alter table public.reviews           enable row level security;

-- societies: everyone can read; only admins can write
create policy societies_read on public.societies for select using (true);
create policy societies_admin_write on public.societies for all
  using (current_role_is('admin'))
  with check (current_role_is('admin'));

-- profiles: read self + same-society profiles (so vendors/admins can see who ordered)
create policy profiles_read_self on public.profiles for select
  using (id = auth.uid() or society_id = current_society_id() or current_role_is('admin'));
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- categories: read all, admin writes
create policy categories_read on public.categories for select using (true);
create policy categories_admin_write on public.categories for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- vendors: residents read approved in their society; vendor reads/edits own; admin all
create policy vendors_read on public.vendors for select using (
  (status = 'approved' and society_id = current_society_id())
  or user_id = auth.uid()
  or current_role_is('admin')
);
create policy vendors_apply on public.vendors for insert with check (
  user_id = auth.uid()
);
create policy vendors_self_update on public.vendors for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy vendors_admin_all on public.vendors for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- vendor_categories: same as vendors
create policy vc_read on public.vendor_categories for select using (
  exists(select 1 from public.vendors v where v.id = vendor_id
         and (v.status = 'approved' or v.user_id = auth.uid() or current_role_is('admin')))
);
create policy vc_write on public.vendor_categories for all using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  or current_role_is('admin')
) with check (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  or current_role_is('admin')
);

-- listings: read if from approved vendor in same society OR if you own the vendor
create policy listings_read on public.listings for select using (
  exists(
    select 1 from public.vendors v
    where v.id = vendor_id
      and ((v.status = 'approved' and v.society_id = current_society_id())
           or v.user_id = auth.uid()
           or current_role_is('admin'))
  )
);
create policy listings_vendor_write on public.listings for all using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
) with check (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy listings_admin on public.listings for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- services: same shape as listings
create policy services_read on public.services for select using (
  exists(
    select 1 from public.vendors v
    where v.id = vendor_id
      and ((v.status = 'approved' and v.society_id = current_society_id())
           or v.user_id = auth.uid()
           or current_role_is('admin'))
  )
);
create policy services_vendor_write on public.services for all using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
) with check (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy services_admin on public.services for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- orders: resident reads own, vendor reads own, admin all
create policy orders_resident_read on public.orders for select
  using (resident_id = auth.uid());
create policy orders_vendor_read on public.orders for select using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy orders_admin_read on public.orders for select using (current_role_is('admin'));

create policy orders_resident_insert on public.orders for insert
  with check (resident_id = auth.uid() and society_id = current_society_id());

create policy orders_vendor_update on public.orders for update using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
) with check (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy orders_resident_update on public.orders for update
  using (resident_id = auth.uid()) with check (resident_id = auth.uid());
create policy orders_admin_all on public.orders for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- order_items: tied to order
create policy order_items_read on public.order_items for select using (
  exists(
    select 1 from public.orders o
    where o.id = order_id
      and (o.resident_id = auth.uid()
           or exists(select 1 from public.vendors v where v.id = o.vendor_id and v.user_id = auth.uid())
           or current_role_is('admin'))
  )
);
create policy order_items_insert on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and o.resident_id = auth.uid())
);

-- bookings: same shape as orders
create policy bookings_resident_read on public.bookings for select
  using (resident_id = auth.uid());
create policy bookings_vendor_read on public.bookings for select using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy bookings_admin_read on public.bookings for select using (current_role_is('admin'));
create policy bookings_resident_insert on public.bookings for insert
  with check (resident_id = auth.uid() and society_id = current_society_id());
create policy bookings_vendor_update on public.bookings for update using (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
) with check (
  exists(select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);
create policy bookings_admin_all on public.bookings for all
  using (current_role_is('admin')) with check (current_role_is('admin'));

-- reviews: resident writes own; everyone reads
create policy reviews_read on public.reviews for select using (true);
create policy reviews_resident_write on public.reviews for insert
  with check (resident_id = auth.uid());
create policy reviews_resident_update on public.reviews for update
  using (resident_id = auth.uid()) with check (resident_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Aggregates view used by the listings page
-- ---------------------------------------------------------------------------
create or replace view public.vendor_stats as
select
  v.id as vendor_id,
  coalesce(avg(r.rating)::numeric(3,2), 0) as avg_rating,
  count(r.id)::int as review_count
from public.vendors v
left join public.reviews r on r.vendor_id = v.id
group by v.id;

grant select on public.vendor_stats to anon, authenticated;
