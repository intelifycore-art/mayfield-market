import { Badge } from "@/components/ui/badge";
import type { OrderStatus, BookingStatus } from "@/lib/types";

const ORDER_LABELS: Record<OrderStatus, { label: string; variant: "default" | "brand" | "success" | "warning" | "danger" }> = {
  placed: { label: "Placed", variant: "warning" },
  accepted: { label: "Accepted", variant: "brand" },
  rejected: { label: "Rejected", variant: "danger" },
  out_for_delivery: { label: "On the way", variant: "brand" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "default" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = ORDER_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const BOOKING_LABELS: Record<BookingStatus, { label: string; variant: "default" | "brand" | "success" | "warning" | "danger" }> = {
  requested: { label: "Requested", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "brand" },
  in_progress: { label: "In progress", variant: "brand" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "default" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = BOOKING_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
