import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SOCIETY } from "@/lib/society";

const DEV_PASSWORD = "mayfield-dev-2026";

interface DevAccount {
  email: string;
  /** Optional per-account password override; defaults to DEV_PASSWORD. */
  password?: string;
  role: "admin" | "vendor" | "resident";
  full_name: string;
  flat_no?: string;
  tower?: string;
  phone?: string;
  vendor?: {
    business_name: string;
    tagline?: string;
    description?: string;
    photo_url?: string;
    contact_phone?: string;
    whatsapp_phone?: string;
    delivery_note?: string;
    category_slugs: string[];
    listings?: Array<{
      name: string;
      description?: string;
      price: number;
      unit: string;
      stock: number;
      image_url?: string;
      category_slug?: string;
    }>;
    services?: Array<{
      name: string;
      description?: string;
      starting_price?: number;
      pricing_unit: string;
      category_slug?: string;
    }>;
  };
}

const ACCOUNTS: DevAccount[] = [
  // Public-facing demo account — referenced by the login page hint card.
  // Pre-onboarded resident so anyone can sign in and shop immediately.
  {
    email: "demo@mayfield.market",
    password: "mayfield2026",
    role: "resident",
    full_name: "Demo Resident",
    tower: "T-3",
    flat_no: "1204",
    phone: "9990000000",
  },
  {
    email: "dev-admin@mayfield.local",
    role: "admin",
    full_name: "RWA Admin",
    phone: "9999900001",
  },
  {
    email: "dev-resident@mayfield.local",
    role: "resident",
    full_name: "Anish (Resident)",
    tower: "T-3",
    flat_no: "1204",
    phone: "9999900002",
  },
  {
    email: "dev-vendor1@mayfield.local",
    role: "vendor",
    full_name: "Sharma",
    phone: "9999900003",
    vendor: {
      business_name: "Sharma's Mandi",
      tagline: "Farm-fresh fruits & vegetables, twice a day",
      description:
        "Family-run mandi sourcing daily from Azadpur. We deliver to your door within 2 hours.",
      photo_url:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
      contact_phone: "9999900003",
      whatsapp_phone: "9999900003",
      delivery_note: "Same-day if ordered before 6 PM. Free above ₹300.",
      category_slugs: ["fruits-vegetables"],
      listings: [
        {
          name: "Tomatoes (red, premium)",
          description: "Hand-picked, ripe, ideal for cooking",
          price: 40,
          unit: "kg",
          stock: 50,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
        },
        {
          name: "Onions (nashik)",
          description: "Medium-sized, less spicy",
          price: 35,
          unit: "kg",
          stock: 60,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
        },
        {
          name: "Potatoes (chipsona)",
          description: "Perfect for tikkis and curries",
          price: 28,
          unit: "kg",
          stock: 80,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=400&q=80",
        },
        {
          name: "Bananas (yelakki)",
          description: "Small, sweet, finger-sized",
          price: 60,
          unit: "dozen",
          stock: 30,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
        },
        {
          name: "Lady's finger",
          description: "Tender, freshly cut today",
          price: 50,
          unit: "kg",
          stock: 25,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&q=80",
        },
        {
          name: "Apple (Shimla)",
          description: "Crisp, sweet-tart",
          price: 180,
          unit: "kg",
          stock: 40,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80",
        },
      ],
    },
  },
  {
    email: "dev-vendor2@mayfield.local",
    role: "vendor",
    full_name: "Rajesh Kumar",
    phone: "9999900004",
    vendor: {
      business_name: "Rajesh Plumbing",
      tagline: "On-call plumber · 12 years in Sector 50",
      description:
        "Leaks, blockages, fittings, geyser and tank work. Same-day response within C-Block. Charges quoted before work starts.",
      photo_url:
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80",
      contact_phone: "9999900004",
      whatsapp_phone: "9999900004",
      delivery_note: "Same-day · 8am–8pm",
      category_slugs: ["plumber"],
      services: [
        {
          name: "Tap / leak repair",
          description: "Dripping taps, pipe leaks, washer replacement.",
          starting_price: 250,
          pricing_unit: "visit",
          category_slug: "plumber",
        },
        {
          name: "Drain / blockage clearing",
          description: "Kitchen, bathroom or balcony drain unclogging.",
          starting_price: 400,
          pricing_unit: "visit",
          category_slug: "plumber",
        },
        {
          name: "Geyser / tank fitting",
          description: "Install or service geyser, overhead tank, motor.",
          starting_price: 600,
          pricing_unit: "visit",
          category_slug: "plumber",
        },
      ],
    },
  },
  {
    email: "dev-vendor3@mayfield.local",
    role: "vendor",
    full_name: "Verma Electricals",
    phone: "9999900005",
    vendor: {
      business_name: "Verma Electricals",
      tagline: "Licensed electrician · wiring, repairs, appliances",
      description:
        "Switchboards, fans, lights, inverter and MCB work. Licensed and RWA-listed. Free inspection before quoting.",
      photo_url:
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80",
      contact_phone: "9999900005",
      whatsapp_phone: "9999900005",
      delivery_note: "Same-day · 9am–7pm",
      category_slugs: ["electrician"],
      services: [
        {
          name: "Switch / socket / fan repair",
          description: "Faulty switches, sockets, ceiling/exhaust fans.",
          starting_price: 200,
          pricing_unit: "visit",
          category_slug: "electrician",
        },
        {
          name: "Light / fixture installation",
          description: "Install lights, chandeliers, LED panels.",
          starting_price: 350,
          pricing_unit: "visit",
          category_slug: "electrician",
        },
        {
          name: "Inverter / MCB work",
          description: "Inverter setup, battery, MCB and wiring faults.",
          starting_price: 500,
          pricing_unit: "visit",
          category_slug: "electrician",
        },
      ],
    },
  },
  {
    email: "dev-vendor4@mayfield.local",
    role: "vendor",
    full_name: "Patel Vegetables",
    phone: "9999900006",
    vendor: {
      business_name: "Patel Vegetables",
      tagline: "Daily veggies and fruits, direct from Sabzi Mandi",
      description:
        "Fresh produce sourced every morning from Khandsa Mandi. Good prices on staples, plus seasonal items.",
      photo_url:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80",
      contact_phone: "9999900006",
      whatsapp_phone: "9999900006",
      delivery_note: "Same-day before 7 PM. Free above Rs 250.",
      category_slugs: ["fruits-vegetables"],
      listings: [
        {
          name: "Tomatoes (red, premium)",
          description: "Mandi pick, slightly larger size.",
          price: 45,
          unit: "kg",
          stock: 40,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
        },
        {
          name: "Onions (nashik)",
          description: "Sorted, no bruising.",
          price: 32,
          unit: "kg",
          stock: 80,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
        },
        {
          name: "Potatoes (chipsona)",
          description: "Big-size chipsona, ideal for fries.",
          price: 26,
          unit: "kg",
          stock: 100,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=400&q=80",
        },
        {
          name: "Bananas (yelakki)",
          description: "Ripe, ready to eat.",
          price: 55,
          unit: "dozen",
          stock: 25,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
        },
        {
          name: "Apple (Shimla)",
          description: "Hand-picked, no bruising.",
          price: 190,
          unit: "kg",
          stock: 30,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80",
        },
        {
          name: "Coriander",
          description: "Fresh bunch, harvested same morning.",
          price: 15,
          unit: "bunch",
          stock: 40,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?w=400&q=80",
        },
        {
          name: "Lemons",
          description: "Juicy thin-skin lemons.",
          price: 40,
          unit: "kg",
          stock: 25,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
        },
        {
          name: "Capsicum (green)",
          description: "Crisp, dark green.",
          price: 60,
          unit: "kg",
          stock: 20,
          category_slug: "fruits-vegetables",
          image_url: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&q=80",
        },
      ],
    },
  },
];

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEV_LOGIN !== "1") {
    return new NextResponse("Dev seed disabled", { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(
      "SUPABASE_SERVICE_ROLE_KEY missing — add it to .env.local",
      { status: 500 },
    );
  }

  const admin = createAdminClient();

  // 1. Resolve society
  const { data: society, error: socErr } = await admin
    .from("societies")
    .select("id")
    .eq("slug", SOCIETY.slug)
    .single();
  if (socErr || !society) {
    return new NextResponse(
      `Society "${SOCIETY.slug}" not found. Run supabase/seed.sql first.`,
      { status: 500 },
    );
  }

  // 2. Resolve categories
  const { data: cats } = await admin.from("categories").select("id, slug");
  const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

  // 3. For each account
  const created: string[] = [];
  for (const acc of ACCOUNTS) {
    const password = acc.password ?? DEV_PASSWORD;
    // Look up existing user by email
    const { data: existing } = await admin.auth.admin.listUsers();
    let userId = existing?.users.find((u) => u.email === acc.email)?.id;

    if (!userId) {
      const { data: createRes, error } = await admin.auth.admin.createUser({
        email: acc.email,
        password,
        email_confirm: true,
      });
      if (error || !createRes.user) {
        return new NextResponse(
          `Failed creating ${acc.email}: ${error?.message}`,
          { status: 500 },
        );
      }
      userId = createRes.user.id;
      created.push(acc.email);
    } else {
      // Reset password in case it was changed
      await admin.auth.admin.updateUserById(userId, { password });
    }

    // Upsert profile
    await admin.from("profiles").upsert({
      id: userId,
      email: acc.email,
      full_name: acc.full_name,
      role: acc.role,
      society_id: society.id,
      flat_no: acc.flat_no ?? null,
      tower: acc.tower ?? null,
      phone: acc.phone ?? null,
    });

    // Vendor record if applicable
    if (acc.vendor) {
      const { data: vRows, error: vErr } = await admin
        .from("vendors")
        .upsert(
          {
            user_id: userId,
            society_id: society.id,
            business_name: acc.vendor.business_name,
            tagline: acc.vendor.tagline ?? null,
            description: acc.vendor.description ?? null,
            photo_url: acc.vendor.photo_url ?? null,
            contact_phone: acc.vendor.contact_phone ?? null,
            whatsapp_phone: acc.vendor.whatsapp_phone ?? null,
            delivery_note: acc.vendor.delivery_note ?? null,
            status: "approved",
            is_open: true,
          },
          { onConflict: "user_id,society_id" },
        )
        .select("id")
        .single();
      if (vErr || !vRows) {
        return new NextResponse(`Vendor upsert failed: ${vErr?.message}`, { status: 500 });
      }
      const vendorId = vRows.id;

      // Vendor-categories — clear and re-insert (idempotent; prevents a
      // repurposed demo vendor from lingering under its old category)
      await admin.from("vendor_categories").delete().eq("vendor_id", vendorId);
      const catIds = acc.vendor.category_slugs
        .map((s) => catBySlug.get(s))
        .filter(Boolean) as string[];
      if (catIds.length) {
        await admin
          .from("vendor_categories")
          .insert(catIds.map((cid) => ({ vendor_id: vendorId, category_id: cid })));
      }

      // Listings — always clear, then re-insert if any.
      // Always-clear lets a repurposed demo vendor (e.g. swapped from
      // services to listings) shed its old rows cleanly.
      await admin.from("listings").delete().eq("vendor_id", vendorId);
      if (acc.vendor.listings && acc.vendor.listings.length) {
        await admin.from("listings").insert(
          acc.vendor.listings.map((l) => ({
            vendor_id: vendorId,
            category_id: l.category_slug ? (catBySlug.get(l.category_slug) ?? null) : null,
            name: l.name,
            description: l.description ?? null,
            price: l.price,
            unit: l.unit,
            stock: l.stock,
            image_url: l.image_url ?? null,
            is_active: true,
          })),
        );
      }

      // Services — same pattern: always clear, re-insert if any.
      await admin.from("services").delete().eq("vendor_id", vendorId);
      if (acc.vendor.services && acc.vendor.services.length) {
        await admin.from("services").insert(
          acc.vendor.services.map((s) => ({
            vendor_id: vendorId,
            category_id: s.category_slug ? (catBySlug.get(s.category_slug) ?? null) : null,
            name: s.name,
            description: s.description ?? null,
            starting_price: s.starting_price ?? null,
            pricing_unit: s.pricing_unit,
            is_active: true,
          })),
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    accounts: ACCOUNTS.map((a) => ({ email: a.email, role: a.role })),
  });
}
