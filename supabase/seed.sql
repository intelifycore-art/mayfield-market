-- =============================================================================
-- Mayfield Market — seed data
-- Safe to run multiple times (uses upserts where possible).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- The society — Mayfield Gardens C-Block, Sector 50, Gurugram
-- ---------------------------------------------------------------------------
insert into public.societies (slug, name, block, location)
values ('mayfield-c-block', 'Mayfield Gardens', 'C-Block', 'Sector 50, Gurugram')
on conflict (slug) do update set
  name = excluded.name,
  block = excluded.block,
  location = excluded.location;

-- ---------------------------------------------------------------------------
-- Categories — products
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, kind, icon, sort_order) values
  ('fruits-vegetables', 'Fruits & Vegetables', 'product', 'apple', 10),
  ('dairy-eggs',       'Dairy & Eggs',         'product', 'milk',  20),
  ('bakery',           'Bakery',               'product', 'croissant', 30),
  ('grocery',          'Grocery & Staples',    'product', 'shopping-basket', 40),
  ('meat-fish',        'Meat & Fish',          'product', 'fish',  50),
  ('flowers-pooja',    'Flowers & Pooja',      'product', 'flower', 60),
  ('snacks-sweets',    'Snacks & Sweets',      'product', 'cookie', 70),
  ('pharmacy',         'Pharmacy',             'product', 'pill',  80)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Categories — services
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, kind, icon, sort_order) values
  ('home-cleaning',    'Home Cleaning',        'service', 'spray-can', 110),
  ('cook-tiffin',      'Cook & Tiffin',        'service', 'utensils-crossed', 120),
  ('plumber',          'Plumber',              'service', 'wrench', 130),
  ('electrician',      'Electrician',          'service', 'plug-zap', 140),
  ('carpenter',        'Carpenter',            'service', 'hammer', 150),
  ('appliance-repair', 'Appliance Repair',     'service', 'refrigerator', 160),
  ('salon-grooming',   'Salon & Grooming',     'service', 'scissors', 170),
  ('tuition-classes',  'Tuition & Classes',    'service', 'graduation-cap', 180),
  ('pet-care',         'Pet Care',             'service', 'paw-print', 190),
  ('rwa-services',     'RWA Services',         'service', 'shield-check', 200)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order;
