import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Item = z.object({
  listing_id: z.string().uuid().nullable().optional(),
  name_snapshot: z.string().min(1),
  unit: z.string().min(1),
  qty: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  line_total: z.number().nonnegative(),
});

const Body = z.object({
  vendor_id: z.string().uuid(),
  society_id: z.string().uuid(),
  subtotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  flat_no: z.string().min(1),
  tower: z.string().nullable().optional(),
  contact_phone: z.string().min(5),
  delivery_notes: z.string().nullable().optional(),
  payment_mode: z.enum(["cod", "upi_direct"]),
  items: z.array(Item).min(1),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Not signed in", { status: 401 });

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid input", {
      status: 400,
    });
  }
  const b = parsed.data;

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      resident_id: user.id,
      vendor_id: b.vendor_id,
      society_id: b.society_id,
      status: "placed",
      subtotal: b.subtotal,
      total: b.total,
      flat_no: b.flat_no,
      tower: b.tower ?? null,
      contact_phone: b.contact_phone,
      delivery_notes: b.delivery_notes ?? null,
      payment_mode: b.payment_mode,
    })
    .select("id")
    .single();

  if (oErr || !order) {
    return new NextResponse(oErr?.message ?? "Order creation failed", { status: 500 });
  }

  const { error: iErr } = await supabase.from("order_items").insert(
    b.items.map((i) => ({
      order_id: order.id,
      listing_id: i.listing_id ?? null,
      name_snapshot: i.name_snapshot,
      unit: i.unit,
      qty: i.qty,
      unit_price: i.unit_price,
      line_total: i.line_total,
    })),
  );

  if (iErr) {
    // Best-effort rollback
    await supabase.from("orders").delete().eq("id", order.id);
    return new NextResponse(`Items failed: ${iErr.message}`, { status: 500 });
  }

  return NextResponse.json({ id: order.id });
}
