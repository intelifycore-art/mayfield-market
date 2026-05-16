import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminResidentsPage() {
  const supabase = createClient();
  const { data: residents } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-semibold">People</h1>
        <p className="text-sm text-ink-muted">All residents and vendors in your block.</p>
      </div>
      {!residents || residents.length === 0 ? (
        <Empty icon={<Users className="h-8 w-8" />} title="No people yet" />
      ) : (
        <div className="space-y-2">
          {residents.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{p.full_name ?? "—"}</p>
                  <p className="text-xs text-ink-soft">
                    {p.email}
                    {p.flat_no
                      ? ` · ${p.tower ? p.tower + ", " : ""}Flat ${p.flat_no}`
                      : ""}
                    {p.phone ? ` · ${p.phone}` : ""}
                  </p>
                </div>
                <Badge variant={p.role === "vendor" ? "brand" : "default"}>
                  {p.role}
                </Badge>
                <span className="text-xs text-ink-faint tabular hidden sm:inline">
                  {formatDate(p.created_at)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
