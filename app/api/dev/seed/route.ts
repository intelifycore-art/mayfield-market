import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SOCIETY } from "@/lib/society";

const DEV_PASSWORD = "mayfield-dev-2026";

interface DevAccount {
  email: string;
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
          image_url: "https://images.unsplash.com/photo-1546470427-a1a4d2b27f50?w=400&q=80",
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
    full_name: "Sparkle Clean Services",
    phone: "9999900004",
    vendor: {
      business_name: "Sparkle Clean",
      tagline: "Trained, verified house help — by the visit or monthly",
      description:
        "RWA-approved cleaning, dish-wash, and laundry help. Background-checked staff. Same person every visit if you book monthly.",
      photo_url:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
      contact_phone: "9999900004",
      whatsapp_phone: "9999900004",
      category_slugs: ["home-cleaning"],
      services: [
        {
          name: "Daily housekeeping (1 hour)",
          description: "Sweep, mop, dust, dish-wash. Same time each day.",
          starting_price: 3500,
          pricing_unit: "monthly",
          category_slug: "home-cleaning",
        },
        {
          name: "Deep cleaning (one-time)",
          description: "Full apartment, including kitchen + bathrooms. 4-6 hours.",
          starting_price: 1800,
          pricing_unit: "visit",
          category_slug: "home-cleaning",
        },
        {
          name: "Bathroom-only deep clean",
          description: "Scale, grout, fittings. One bathroom.",
          starting_price: 450,
          pricing_unit: "visit",
          category_slug: "home-cleaning",
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
    // Look up existing user by email
    const { data: existing } = await admin.auth.admin.listUsers();
    let userId = existing?.users.find((u) => u.email === acc.email)?.id;

    if (!userId) {
      const { data: createRes, error } = await admin.auth.admin.createUser({
        email: acc.email,
        password: DEV_PASSWORD,
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
      await admin.auth.admin.updateUserById(userId, { password: DEV_PASSWORD });
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

      // Vendor-categories
      const catIds = acc.vendor.category_slugs
        .map((s) => catBySlug.get(s))
        .filter(Boolean) as string[];
      if (catIds.length) {
        await admin
          .from("vendor_categories")
          .upsert(catIds.map((cid) => ({ vendor_id: vendorId, category_id: cid })));
      }

      // Listings — clear and re-insert (idempotent)
      if (acc.vendor.listings) {
        await admin.from("listings").delete().eq("vendor_id", vendorId);
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

      // Services
      if (acc.vendor.services) {
        await admin.from("services").delete().eq("vendor_id", vendorId);
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
