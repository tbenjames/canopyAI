import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { db, type Site, type Plot } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trees, MapPin, X } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "scientist", label: "Scientist" },
  { value: "admin", label: "Admin" },
  { value: "field_worker", label: "Field Worker / Coordinator" },
  { value: "field_manager", label: "Field Manager" },
];

export const Route = createFileRoute("/_authenticated/sites")({
  head: () => ({
    meta: [
      { title: "Sites, CanopyStride AI" },
      { name: "description", content: "Manage restoration sites and plots, configure species focus, region, and monitoring coordinates." },
      { property: "og:title", content: "Sites, CanopyStride AI" },
      { property: "og:url", content: "https://canopystride.dev/sites" },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/sites" }],
  }),
  component: SitesPage,
});

function SitesPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const initialForm = { name: "", region: "", description: "", species_focus: "mangrove", species_focus_other: "", center_lat: "8.46", center_lng: "-11.78", roles: [] as string[] };
  const [form, setForm] = useState(initialForm);

  function toggleRole(value: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(value) ? f.roles.filter((r) => r !== value) : [...f.roles, value],
    }));
  }

  const { data, isLoading } = useQuery({
    queryKey: ["sites-with-plots"],
    queryFn: async () => {
      const [{ data: sites }, { data: plots }] = await Promise.all([
        db.from("sites").select("*").order("created_at", { ascending: false }),
        db.from("plots").select("*"),
      ]);
      return { sites: (sites ?? []) as Site[], plots: (plots ?? []) as Plot[] };
    },
  });

  async function createSite() {
    setCreating(true);
    try {
      const speciesValue = form.species_focus === "__other"
        ? (form.species_focus_other.trim() || "other")
        : form.species_focus;
      const { error } = await db.from("sites").insert({
        name: form.name,
        region: form.region || null,
        description: form.description || null,
        species_focus: speciesValue,
        center_lat: form.center_lat ? parseFloat(form.center_lat) : null,
        center_lng: form.center_lng ? parseFloat(form.center_lng) : null,
        roles: form.roles,
      });
      if (error) throw error;
      toast.success("Site created");
      setOpen(false);
      setForm(initialForm);
      qc.invalidateQueries({ queryKey: ["sites-with-plots"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Need scientist or admin role to create sites");
    } finally { setCreating(false); }
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Sites &amp; Plots</h1>
          <p className="text-sm text-muted-foreground">Restoration sites grouped by region, with their plots.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New site</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create restoration site</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Yawri Bay" /></div>
              <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Western Area Rural" /></div>
              <div><Label>Species focus</Label>
                <Select value={form.species_focus} onValueChange={(v) => setForm({ ...form, species_focus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mangrove">Mangrove</SelectItem>
                    <SelectItem value="moringa">Moringa</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="__other">Other (type your own)…</SelectItem>
                  </SelectContent>
                </Select>
                {form.species_focus === "__other" && (
                  <Input
                    className="mt-2"
                    placeholder="e.g. Conocarpus erectus, Sesbania grandiflora"
                    value={form.species_focus_other}
                    onChange={(e) => setForm({ ...form, species_focus_other: e.target.value })}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Center latitude</Label><Input value={form.center_lat} onChange={(e) => setForm({ ...form, center_lat: e.target.value })} /></div>
                <div><Label>Center longitude</Label><Input value={form.center_lng} onChange={(e) => setForm({ ...form, center_lng: e.target.value })} /></div>
              </div>
              <div>
                <Label>Site roles</Label>
                <p className="text-xs text-muted-foreground mb-2">Which role types operate at this site (informational tag).</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const active = form.roles.includes(r.value);
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => toggleRole(r.value)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition min-h-[36px] ${
                          active
                            ? "bg-[#1A3622] text-white border-[#1A3622]"
                            : "bg-card text-foreground border-input hover:bg-secondary"
                        }`}
                      >
                        {r.label}
                        {active && <X className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={createSite} disabled={creating || !form.name}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading || !data ? (
        <div className="p-12 text-center text-muted-foreground">Loading…</div>
      ) : data.sites.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Trees className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No sites yet. Create your first restoration site.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.sites.map((s) => {
            const plots = data.plots.filter((p) => p.site_id === s.id);
            return (
              <button
                key={s.id}
                onClick={() => router.navigate({ to: "/sites/$siteId", params: { siteId: s.id } })}
                className="text-left rounded-xl border bg-card p-5 transition hover:border-primary hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{s.name}</h2>
                    <p className="text-xs text-muted-foreground">{s.region ?? ", "}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide">{s.species_focus}</span>
                </div>
                {s.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Trees className="h-3 w-3" /> {plots.length} plots</span>
                  {s.center_lat != null && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.center_lat.toFixed(3)}, {s.center_lng?.toFixed(3)}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
