"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderStatus, BookingStatus } from "@/lib/types";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const updates: Record<string, any> = { status };
  const now = new Date().toISOString();
  if (status === "accepted") updates.accepted_at = now;
  if (status === "delivered") updates.delivered_at = now;
  if (status === "rejected" || status === "cancelled") updates.cancelled_at = now;

  const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/vendor");
  return { ok: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const updates: Record<string, any> = { status };
  const now = new Date().toISOString();
  if (status === "confirmed") updates.confirmed_at = now;
  if (status === "completed") updates.completed_at = now;

  const { error } = await supabase.from("bookings").update(updates).eq("id", bookingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/vendor");
  return { ok: true };
}
