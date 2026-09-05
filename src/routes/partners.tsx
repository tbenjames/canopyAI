import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Handshake,
  ArrowLeft,
  Trees,
  Microscope,
  Heart,
  Building2,
  Globe2,
  Users,
  Send,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteFooter } from "@/components/SiteFooter";
import { submitPartnerInquiry } from "@/lib/partners.functions";
import { cn } from "@/lib/utils";

type PartnershipType =
  | "ngo_pilot"
  | "research_collab"
  | "government"
  | "carbon_project"
  | "donor_funding"
  | "enterprise"
  | "other";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partner with CanopyStride AI · Restoration monitoring" },
      {
        name: "description",
        content:
          "Partner with CanopyStride AI for community-led mangrove and Moringa restoration monitoring. NGOs, researchers, government teams, and carbon projects welcome.",
      },
      { property: "og:title", content: "Partner with CanopyStride AI" },
      {
        property: "og:description",
        content:
          "Smartphone-based ecological monitoring for restoration teams, researchers, and funders in Sierra Leone and beyond.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/partners" }],
  }),
  component: PartnersPage,
});

const PARTNER_TYPES = [
  { id: "ngo_pilot", label: "NGO or community pilot", icon: Users },
  { id: "research_collab", label: "Research collaboration", icon: Microscope },
  { id: "government", label: "Government or municipal", icon: Building2 },
  { id: "carbon_project", label: "Carbon / blue-carbon project", icon: Globe2 },
  { id: "donor_funding", label: "Donor or funder", icon: Heart },
  { id: "enterprise", label: "Enterprise or institution", icon: Building2 },
  { id: "other", label: "Other", icon: Handshake },
] as const;

function PartnersPage() {
  const submit = useServerFn(submitPartnerInquiry);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await submit({
        data: {
          organisationName: String(fd.get("organisationName") ?? ""),
          contactName: String(fd.get("contactName") ?? ""),
          email: String(fd.get("email") ?? ""),
          partnershipType: String(fd.get("partnershipType") ?? "") as PartnershipType,
          country: String(fd.get("country") ?? ""),
          message: String(fd.get("message") ?? ""),
          website: String(fd.get("website") ?? "") || null,
          estimatedSites: fd.get("estimatedSites") ? Number(fd.get("estimatedSites")) : null,
          honeypot: String(fd.get("website_confirm") ?? "") || null,
        },
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#1A3622]"
          >
            <ArrowLeft className="h-4 w-4" /> CanopyStride AI
          </Link>
          <Link to="/donate" className="text-xs text-muted-foreground hover:text-foreground">
            Support the mission
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0f2618] text-white">
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464039397837-272a9a0e08ef?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-center opacity-20"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0f2618]/90 via-[#1A3622]/80 to-[#254a30]/95"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Handshake className="h-3 w-3" /> Partnerships and collaborations
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Monitor more restoration sites with less hardware.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/90">
                CanopyStride AI turns smartphone photos into waterlogging, scouring, salinity, and
                canopy health signals. We partner with NGOs, researchers, government teams, and
                carbon projects to make community-led monitoring scalable.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Who we partner with
              </h2>
              <p className="mt-3 text-slate-700">
                Our model works best when field teams, scientists, and funders share the same
                picture of what is happening on the ground.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Users,
                    title: "NGOs and community groups",
                    body: "Run a 90-day pilot with your field teams. We train monitors, provide credits, and co-publish a site health report.",
                  },
                  {
                    icon: Microscope,
                    title: "Researchers and universities",
                    body: "Validate AI proxies against your field measurements. Co-author methodology papers and share anonymised datasets.",
                  },
                  {
                    icon: Building2,
                    title: "Government and municipalities",
                    body: "Use CanopyStride as a low-cost national monitoring layer for coastal resilience and restoration reporting.",
                  },
                  {
                    icon: Globe2,
                    title: "Carbon and blue-carbon projects",
                    body: "Add smartphone-based MRV to your methodology. Reduce verification costs while keeping community ownership.",
                  },
                  {
                    icon: Heart,
                    title: "Donors and funders",
                    body: "Fund a verified site and receive a private dashboard with photos, health scores, and alerts over time.",
                  },
                  {
                    icon: Trees,
                    title: "Enterprises and institutions",
                    body: "Deploy across multiple sites with team management, data export, and priority support.",
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A3622]/10 text-[#1A3622]">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border bg-slate-50 p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  What partners receive
                </h3>
                <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  {[
                    "Free pilot credits for qualifying NGOs",
                    "Training for field monitors",
                    "Co-branded impact report",
                    "Private dashboard access",
                    "Data export for grant reporting",
                    "Slack or email support during the pilot",
                  ].map((item) => (
                    <li key={item} className="inline-flex items-start gap-2">
                      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#1A3622]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Start a conversation
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Tell us about your project and we will reply within two business days.
              </p>

              {status === "success" ? (
                <div className="mt-8 rounded-xl bg-[#f2f7f4] p-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#1A3622]" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    Inquiry received
                  </h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Thank you. We have sent your message to the CanopyStride team and will be in
                    touch soon.
                  </p>
                  <Button variant="outline" className="mt-5" onClick={() => setStatus("idle")}>
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="organisationName">Organisation name</Label>
                      <Input
                        id="organisationName"
                        name="organisationName"
                        placeholder="e.g. West Africa Blue"
                        required
                        minLength={1}
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="e.g. Sierra Leone"
                        required
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactName">Contact name</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        placeholder="Full name"
                        required
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@organisation.org"
                        required
                        maxLength={250}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="partnershipType">Partnership type</Label>
                    <Select name="partnershipType" required>
                      <SelectTrigger id="partnershipType">
                        <SelectValue placeholder="Select the partnership that fits you" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNER_TYPES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="website">Website (optional)</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://..."
                        maxLength={300}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="estimatedSites">Estimated sites or hectares (optional)</Label>
                      <Input
                        id="estimatedSites"
                        name="estimatedSites"
                        type="number"
                        min={0}
                        max={10000}
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Tell us about your project</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What are you restoring, how many people are in the field, and what would you like CanopyStride to help you measure?"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={5}
                    />
                  </div>

                  {/* Honeypot field hidden from real users */}
                  <div className="sr-only hidden" aria-hidden="true">
                    <Input
                      name="website_confirm"
                      tabIndex={-1}
                      autoComplete="off"
                      placeholder="Leave this empty"
                    />
                  </div>

                  {status === "error" && errorMsg && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className={cn(
                      "w-full bg-[#1A3622] text-white hover:bg-[#254a30]",
                      status === "submitting" && "opacity-70",
                    )}
                  >
                    <Send className="h-4 w-4" />
                    {status === "submitting" ? "Sending…" : "Send inquiry"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    By submitting, you agree that we can contact you about this partnership inquiry.
                    Read our{" "}
                    <Link
                      to="/legal"
                      search={{ tab: "privacy" }}
                      className="underline hover:text-foreground"
                    >
                      privacy notice
                    </Link>{" "}
                    for details.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
