"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Phone, CheckCircle2, XCircle, Truck, MessageCircle, PackageCheck, Loader2 } from "lucide-react";
import { updateOrderStatus, updateBookingStatus } from "./_server";
import type { OrderStatus, BookingStatus } from "@/lib/types";

export function OrderActions({
  orderId,
  status,
  phone,
}: {
  orderId: string;
  status: OrderStatus;
  phone: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  async function set(s: OrderStatus) {
    setBusy(s);
    start(async () => {
      const res = await updateOrderStatus(orderId, s);
      setBusy(null);
      if (!res.ok) {
        toast.error("Couldn't update", res.error);
        return;
      }
      toast.success("Updated", `Order is now ${s.replace("_", " ")}`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <a href={`tel:${phone}`}>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Phone className="h-3.5 w-3.5" />
        </Button>
      </a>
      <a
        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
      >
        <Button variant="outline" size="icon" className="h-9 w-9">
          <MessageCircle className="h-3.5 w-3.5" />
        </Button>
      </a>
      {status === "placed" ? (
        <>
          <Button
            variant="danger"
            size="sm"
            disabled={!!busy}
            onClick={() => set("rejected")}
          >
            {busy === "rejected" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </>
            )}
          </Button>
          <Button
            variant="brand"
            size="sm"
            disabled={!!busy}
            onClick={() => set("accepted")}
          >
            {busy === "accepted" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
              </>
            )}
          </Button>
        </>
      ) : status === "accepted" ? (
        <Button
          variant="brand"
          size="sm"
          disabled={!!busy}
          onClick={() => set("out_for_delivery")}
        >
          {busy === "out_for_delivery" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Truck className="h-3.5 w-3.5" /> On the way
            </>
          )}
        </Button>
      ) : status === "out_for_delivery" ? (
        <Button
          variant="brand"
          size="sm"
          disabled={!!busy}
          onClick={() => set("delivered")}
        >
          {busy === "delivered" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <PackageCheck className="h-3.5 w-3.5" /> Delivered
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}

export function BookingActions({
  bookingId,
  status,
  phone,
}: {
  bookingId: string;
  status: BookingStatus;
  phone: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function set(s: BookingStatus) {
    setBusy(s);
    const res = await updateBookingStatus(bookingId, s);
    setBusy(null);
    if (!res.ok) {
      toast.error("Couldn't update", res.error);
      return;
    }
    toast.success("Updated");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <a
        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
      >
        <Button variant="outline" size="sm">
          <MessageCircle className="h-3.5 w-3.5" /> Reach out
        </Button>
      </a>
      {status === "requested" ? (
        <Button variant="brand" size="sm" disabled={!!busy} onClick={() => set("confirmed")}>
          {busy === "confirmed" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Confirm"
          )}
        </Button>
      ) : status === "confirmed" ? (
        <Button
          variant="brand"
          size="sm"
          disabled={!!busy}
          onClick={() => set("in_progress")}
        >
          Start
        </Button>
      ) : status === "in_progress" ? (
        <Button
          variant="brand"
          size="sm"
          disabled={!!busy}
          onClick={() => set("completed")}
        >
          Mark done
        </Button>
      ) : null}
    </div>
  );
}
