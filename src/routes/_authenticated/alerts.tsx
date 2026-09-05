import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { db, type Alert, type Plot } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";
import { riskColor } from "@/components/IndicatorCard";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Alerts, CanopyStride AI" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["alerts-page"],
    queryFn: async () => {
      const [{ data: alerts }, { data: plots }] = await Promise.all([
        db.from("alerts").select("*").order("created_at", { ascending: false }).limit(100),
        db.from("plots").select("id, name, site_id"),
      ]);
      return { alerts: (alerts ?? []) as Alert[], plots: (plots ?? []) as Plot[] };
    },
  });

  async function ack(id: string) {
    const { error } = await db.from("alerts").update({ acknowledged: true }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Acknowledged"); qc.invalidateQueries({ queryKey: ["alerts-page"] }); }
  }

  if (isLoading || !data) return <AppShell><div className="p-12 text-center text-muted-foreground">Loading…</div></AppShell>;

  const open = data.alerts.filter((a) => !a.acknowledged);
  const closed = data.alerts.filter((a) => a.acknowledged);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Alerts</h1>
      <p className="text-sm text-muted-foreground">High-risk plot indicators flagged by AI analysis.</p>

      <h2 className="mt-6 font-display text-lg font-semibold">Open ({open.length})</h2>
      {open.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          <Bell className="mx-auto mb-2 h-6 w-6" /> All clear.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {open.map((a) => {
            const plot = data.plots.find((p) => p.id === a.plot_id);
            return (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: riskColor(a.severity) }} />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{a.kind.replace("_", " ")} · {a.severity}</span>
                  </div>
                  <p className="mt-1 text-sm">{a.message}</p>
                  {plot && <Link to="/plots/$plotId" params={{ plotId: plot.id }} className="text-xs text-primary underline">{plot.name}</Link>}
                </div>
                <Button size="sm" variant="outline" onClick={() => ack(a.id)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Acknowledge
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {closed.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-lg font-semibold">Acknowledged ({closed.length})</h2>
          <ul className="mt-3 space-y-2">
            {closed.slice(0, 20).map((a) => (
              <li key={a.id} className="rounded-lg border bg-card/60 p-3 text-sm text-muted-foreground">
                <span className="uppercase text-[10px] tracking-wide mr-2">{a.kind.replace("_", " ")}</span>
                {a.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
