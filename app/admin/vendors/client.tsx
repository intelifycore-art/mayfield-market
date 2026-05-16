"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import {
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Store,
  Phone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import type { VendorStatus } from "@/lib/types";

interface AdminVendor {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  status: VendorStatus;
  contact_phone: string | null;
  whatsapp_phone: string | null;
  description: string | null;
  delivery_note: string | null;
  is_open: boolean;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    flat_no: string | null;
    tower: string | null;
  };
  categories: { category: { name: string; kind: string } }[];
}

export function VendorsAdmin({ initialVendors }: { initialVendors: AdminVendor[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [vendors, setVendors] = useState(initialVendors);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: VendorStatus) {
    setBusy(id + status);
    const { error } = await supabase
      .from("vendors")
      .update({ status })
      .eq("id", id);
    setBusy(null);
    if (error) {
      toast.error("Update failed", error.message);
      return;
    }
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    toast.success(`Vendor ${status}`);
    router.refresh();
  }

  const filtered = vendors.filter((v) =>
    filter === "all" ? true : v.status === filter,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-semibold">Vendors</h1>
        <p className="text-sm text-ink-muted">Approve, suspend, and review vendors.</p>
      </div>

      <div className="flex gap-1 border-b border-line">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              filter === f
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs text-ink-faint tabular">
              {vendors.filter((v) => f === "all" || v.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon={<Store className="h-8 w-8" />}
          title={
            filter === "pending"
              ? "No pending applications"
              : filter === "approved"
              ? "No approved vendors yet"
              : "No vendors"
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{v.business_name}</h3>
                      <Badge
                        variant={
                          v.status === "approved"
                            ? "success"
                            : v.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {v.status}
                      </Badge>
                      {v.status === "approved" ? (
                        <Badge variant={v.is_open ? "brand" : "default"}>
                          {v.is_open ? "Open" : "Closed"}
                        </Badge>
                      ) : null}
                    </div>
                    {v.tagline ? (
                      <p className="text-xs text-ink-muted mt-0.5">{v.tagline}</p>
                    ) : null}
                    <p className="text-xs text-ink-soft mt-1">
                      Owner: {v.profile?.full_name} ({v.profile?.email})
                      {v.profile?.flat_no
                        ? ` · ${v.profile.tower ? v.profile.tower + ", " : ""}Flat ${v.profile.flat_no}`
                        : ""}
                    </p>
                    {v.description ? (
                      <p className="text-xs text-ink-muted mt-2">{v.description}</p>
                    ) : null}
                    {v.categories?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {v.categories.map((vc, i) => (
                          <Badge key={i} variant="outline">
                            {vc.category.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {v.contact_phone ? (
                      <a href={`tel:${v.contact_phone}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : null}
                    {v.whatsapp_phone ? (
                      <a
                        href={`https://wa.me/${v.whatsapp_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2 flex-wrap">
                  {v.status === "pending" ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={!!busy}
                        onClick={() => setStatus(v.id, "suspended")}
                      >
                        {busy === v.id + "suspended" ? (
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
                        onClick={() => setStatus(v.id, "approved")}
                      >
                        {busy === v.id + "approved" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </>
                        )}
                      </Button>
                    </>
                  ) : v.status === "approved" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!busy}
                      onClick={() => setStatus(v.id, "suspended")}
                    >
                      <Pause className="h-3.5 w-3.5" /> Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="brand"
                      size="sm"
                      disabled={!!busy}
                      onClick={() => setStatus(v.id, "approved")}
                    >
                      <Play className="h-3.5 w-3.5" /> Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
