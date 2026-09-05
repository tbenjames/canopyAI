import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { db, type Site, type Plot, type Analysis } from "@/lib/db";
import { SiteMap, type MapPin } from "@/components/SiteMap";
import { riskColor } from "@/components/IndicatorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ArrowLeft, Sprout } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sites/$siteId")({
  component: SiteDetail,
});

function SiteDetail() {
  const { siteId } = useParams({ from: "/_authenticated/sites/$siteId" });
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", center_lat: "", center_lng: "", radius_m: "50" });

  const { data, isLoading } = useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const [{ data: site }, { data: plots }, { data: analyses }] = await Promise.all([
        db.from("sites").select("*").eq("id", siteId).single(),
        db.from("plots").select("*").eq("site_id", siteId),
        db.from("analyses").select("*").eq("status", "complete").order("created_at", { ascending: false }),
      ]);
      return { site: site as Site, plots: (plots ?? []) as Plot[], analyses: (analyses ?? []) as Analysis[] };
    },
  });

  async function createPlot() {
    try {
      const { error } = await db.from("plots").insert({
        site_id: siteId,
        name: form.name,
        center_lat: parseFloat(form.center_lat),
        center_lng: parseFloat(form.center_lng),
        radius_m: parseInt(form.radius_m) || 50,
      });
      if (error) throw error;
      toast.success("Plot created");
      setOpen(false);
      setForm({ name: "", center_lat: "", center_lng: "", radius_m: "50" });
      qc.invalidateQueries({ queryKey: ["site", siteId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  if (isLoading || !data?.site) return <AppShell><div className="p-12 text-center text-muted-foreground">Loading…</div></AppShell>;

  const latestByPlot = new Map<string, Analysis>();
  for (const a of data.analyses) if (a.plot_id && !latestByPlot.has(a.plot_id)) latestByPlot.set(a.plot_id, a);

  const pins: MapPin[] = data.plots.map((p) => ({
    id: p.id,
    lat: p.center_lat,
    lng: p.center_lng,
    label: p.name,
    color: riskColor(latestByPlot.get(p.id)?.risk_level ?? null),
    onClick: () => { window.location.href = `/plots/${p.id}`; },
  }));

  const center: [number, number] = data.site.center_lat != null
    ? [data.site.center_lat, data.site.center_lng ?? -11.78]
    : [8.46, -11.78];

  return (
    <AppShell>
      <Link to="/sites" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" /> All sites</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{data.site.name}</h1>
          <p className="text-sm text-muted-foreground">{data.site.region ?? ""} · {data.site.species_focus}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New plot</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create plot</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plot 3" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Center lat</Label><Input value={form.center_lat} onChange={(e) => setForm({ ...form, center_lat: e.target.value })} placeholder={String(center[0])} /></div>
                <div><Label>Center lng</Label><Input value={form.center_lng} onChange={(e) => setForm({ ...form, center_lng: e.target.value })} placeholder={String(center[1])} /></div>
              </div>
              <div><Label>Radius (m)</Label><Input type="number" value={form.radius_m} onChange={(e) => setForm({ ...form, radius_m: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={createPlot} disabled={!form.name || !form.center_lat}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          {pins.length > 0 ? <SiteMap pins={pins} center={center} zoom={11} />
            : <div className="grid h-[420px] place-items-center text-sm text-muted-foreground">No plots yet.</div>}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-display text-lg font-semibold mb-3">Plots</h2>
          {data.plots.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : (
            <ul className="space-y-2">
              {data.plots.map((p) => {
                const latest = latestByPlot.get(p.id);
                return (
                  <li key={p.id}>
                    <Link to="/plots/$plotId" params={{ plotId: p.id }} className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: riskColor(latest?.risk_level ?? null) }} />
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{latest?.risk_level ?? "no data"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
