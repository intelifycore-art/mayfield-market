-- =============================================================================
-- 0002_public_browse.sql
-- Allow anonymous users to browse approved vendors + their listings/services.
-- Personal data (orders, profiles, bookings) remains locked behind auth.
-- =============================================================================

-- Vendors: anyone can see approved ones. Vendor owner + admin can see all.
drop policy if exists vendors_read on public.vendors;
create policy vendors_read on public.vendors for select using (
  status = 'approved' or user_id = auth.uid() or current_role_is('admin')
);

-- Vendor-categories: visible iff parent vendor is visible
drop policy if exists vc_read on public.vendor_categories;
create policy vc_read on public.vendor_categories for select using (
  exists(
    select 1 from public.vendors v
    where v.id = vendor_id
      and (v.status = 'approved' or v.user_id = auth.uid() or current_role_is('admin'))
  )
);

-- Listings: visible iff parent vendor is approved (or you own it)
drop policy if exists listings_read on public.listings;
create policy listings_read on public.listings for select using (
  exists(
    select 1 from public.vendors v
    where v.id = vendor_id
      and (v.status = 'approved' or v.user_id = auth.uid() or current_role_is('admin'))
  )
);

-- Services: same
drop policy if exists services_read on public.services;
create policy services_read on public.services for select using (
  exists(
    select 1 from public.vendors v
    where v.id = vendor_id
      and (v.status = 'approved' or v.user_id = auth.uid() or current_role_is('admin'))
  )
);

-- Categories are already publicly readable from 0001.
-- Societies are already publicly readable from 0001.
-- Profiles, orders, bookings, reviews stay locked to authed users.
