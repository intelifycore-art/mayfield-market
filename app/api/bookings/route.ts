import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  service_id: z.string().uuid(),
  service_name: z.string().min(1),
  vendor_id: z.string().uuid(),
  society_id: z.string().uuid(),
  flat_no: z.string().min(1),
  tower: z.string().nullable().optional(),
  contact_phone: z.string().min(5),
  preferred_slot: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Not signed in", { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid input", {
      status: 400,
    });
  }
  const b = parsed.data;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      resident_id: user.id,
      vendor_id: b.vendor_id,
      service_id: b.service_id,
      service_name_snapshot: b.service_name,
      society_id: b.society_id,
      flat_no: b.flat_no,
      tower: b.tower ?? null,
      contact_phone: b.contact_phone,
      preferred_slot: b.preferred_slot ?? null,
      notes: b.notes ?? null,
      status: "requested",
    })
    .select("id")
    .single();

  if (error || !data) {
    return new NextResponse(error?.message ?? "Booking failed", { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
