import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sprout,
  ArrowRight,
  Droplets,
  Waves,
  FlaskConical,
  Leaf,
  Compass,
  ClipboardList,
  Users,
  AlertTriangle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { TelemetryBackdrop } from "@/components/TelemetryBackdrop";

const URL = "https://canopystride.dev/guide/mangrove-restoration-best-practices";
const TITLE = "Mangrove Restoration Best Practices";
const DESCRIPTION =
  "Field guide to mangrove restoration: read hydrology first, match species to tidal zone, plant propagules correctly, and monitor canopy health.";

const FAQ = [
  {
    q: "What is the single most common reason mangrove restoration projects fail?",
    a: "Planting the wrong species at the wrong tidal elevation. Hydrology decides survival, get the site right before touching a propagule.",
  },
  {
    q: "How do you plant mangroves the right way?",
    a: "Collect mature propagules from healthy donor stands, plant one third of the length vertically into stable substrate at low tide, space 1 m apart in the intertidal zone matched to the species, and monitor waterlogging weekly for the first 90 days.",
  },
  {
    q: "Why is Rhizophora racemosa a common choice in West African restoration?",
    a: "It tolerates the salinity swings and soft sediment of estuarine coasts, produces long viable propagules, and its stilt roots trap sediment, accelerating substrate recovery on scoured shorelines.",
  },
  {
    q: "How long before a restored plot behaves like a mature mangrove?",
    a: "Canopy closure typically takes 3 to 5 years; full ecological function, fisheries habitat, carbon accumulation, storm buffering, takes 15 to 25 years. Continuous monitoring shortens that curve by catching failures early.",
  },
];

const TOC = [
  { id: "site", label: "Site diagnosis", icon: Compass },
  { id: "species", label: "Species selection", icon: Leaf },
  { id: "planting", label: "Planting protocol", icon: ClipboardList },
  { id: "monitoring", label: "Hydrological monitoring", icon: Droplets },
  { id: "community", label: "Community stewardship", icon: Users },
  { id: "failures", label: "Failure modes", icon: AlertTriangle },
  { id: "faq", label: "FAQ", icon: BookOpen },
];

export const Route = createFileRoute("/guide/mangrove-restoration-best-practices")({
  head: () => ({
    meta: [
      { title: `${TITLE} | CanopyStride AI` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "article:section", content: "Restoration" },
      { property: "article:tag", content: "mangrove restoration" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          mainEntityOfPage: URL,
          author: { "@type": "Organization", name: "CanopyStride AI" },
          publisher: {
            "@type": "Organization",
            name: "CanopyStride AI",
            parentOrganization: { "@type": "Organization", name: "The-Venture (Tamaraneh Initiative)" },
          },
          about: [
            { "@type": "Thing", name: "Mangrove restoration" },
            { "@type": "Thing", name: "Rhizophora racemosa" },
            { "@type": "Thing", name: "Hydrological monitoring" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://canopystride.dev/" },
            { "@type": "ListItem", position: 2, name: "Field guide", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: GuidePage,
});

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out will-change-transform ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function SectionCard({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: typeof Sprout;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section
        id={id}
        className="group scroll-mt-24 rounded-3xl border border-slate-200/70 bg-card p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1A3622]/30 hover:shadow-xl sm:p-10"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1A3622]/10 text-[#1A3622] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A3622]/80">
              {eyebrow}
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {title}
            </h2>
          </div>
        </div>
        <div className="mt-6 text-[17px] leading-relaxed text-foreground/90">{children}</div>
      </section>
    </Reveal>
  );
}

function GuidePage() {
  const [activeId, setActiveId] = useState<string>(TOC[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    TOC.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1A3622] text-white">
              <Sprout className="h-5 w-5" />
            </span>
            CanopyStride <span className="font-medium text-muted-foreground">AI</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link
              to="/guide"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              All guides
            </Link>
            <Link
              to="/auth"
              className="inline-flex min-h-[44px] items-center gap-1 rounded-md bg-[#1A3622] px-4 py-2 text-sm font-semibold text-white hover:bg-[#244c30]"
            >
              Try telemetry <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b">
          <TelemetryBackdrop className="text-[#1A3622]" intensity={0.16} />
          <div className="relative mx-auto max-w-5xl px-4 pt-16 pb-14 lg:pt-24">
            <Reveal>
              <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span>Field guide</span>
              </nav>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <BookOpen className="h-3.5 w-3.5" /> Field guide · 12 min read
              </span>
              <h1
                className="mt-4 max-w-3xl font-display font-bold leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 1.4rem + 3vw, 3.25rem)" }}
              >
                Mangrove restoration best practices: hydrology, species, and monitoring
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Most failed mangrove projects fail for the same reason: seedlings were planted where
                the site would never let them survive. This guide walks through the sequence that
                actually works, read the hydrology first, match the species to the zone, plant the
                propagule the right way, and keep monitoring long after the crew leaves the shoreline.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                {[
                  "Rhizophora racemosa",
                  "Avicennia germinans",
                  "Laguncularia racemosa",
                  "Moringa oleifera",
                ].map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full border border-[#1A3622]/20 bg-[#1A3622]/5 px-3 py-1 font-medium text-[#1A3622]"
                  >
                    <Leaf className="h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CONTENT + TOC */}
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                On this page
              </div>
              <ul className="mt-4 flex flex-col gap-1 border-l border-slate-200">
                {TOC.map((t) => {
                  const active = activeId === t.id;
                  return (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className={`group -ml-px flex items-center gap-2 border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                          active
                            ? "border-[#1A3622] font-semibold text-[#1A3622]"
                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                        }`}
                      >
                        <t.icon
                          className={`h-3.5 w-3.5 transition-transform ${
                            active ? "scale-110" : "group-hover:scale-110"
                          }`}
                        />
                        {t.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <article className="flex flex-col gap-8">
            {/* Key takeaways */}
            <Reveal>
              <div className="rounded-3xl border border-[#1A3622]/20 bg-gradient-to-br from-[#1A3622]/5 via-white to-[#22C55E]/5 p-7 shadow-sm">
                <div className="flex items-center gap-2 text-[#1A3622]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Key takeaways
                  </span>
                </div>
                <ul className="mt-4 grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
                  <li>Read hydrology before you touch a propagule.</li>
                  <li>Match species to tidal elevation, not to the crew's preference.</li>
                  <li>The first 90 days after planting decide long-term survival.</li>
                  <li>No stewards on the ground means no plot in five years.</li>
                </ul>
              </div>
            </Reveal>

            <SectionCard id="site" icon={Compass} eyebrow="Step 1" title="Start with the site, not the seedling">
              <p>
                A mangrove is a hydrological organism first and a plant second. Before any restoration
                crew unloads propagules, the site itself needs a diagnosis: tidal range, inundation
                frequency, salinity profile, sediment stability, and freshwater inputs. When these are
                wrong, no species selection can compensate.
              </p>
              <p className="mt-4">
                Walk the shoreline across a full tidal cycle. Note where water sits after the tide
                falls, persistent standing water above 20 cm for more than 12 hours is a red flag for
                waterlogging stress. Look at the sediment: soft, unconsolidated mud that shifts under
                boot prints will not hold a propagule through the first spring tide. Where you see
                active undercutting on the seaward edge, scouring will strip young seedlings before
                roots take hold.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { i: Droplets, t: "Waterlogging", d: "Standing water > 20 cm for > 12 h signals poor drainage." },
                  { i: Waves, t: "Scouring", d: "Active undercutting on the seaward edge kills young stems." },
                  { i: FlaskConical, t: "Salinity stress", d: "Hypersaline zones (> 45 ppt) exclude most species." },
                  { i: Leaf, t: "Canopy reference", d: "Compare to a nearby healthy stand of the same tidal position." },
                ].map((c, i) => (
                  <Reveal key={c.t} delay={i * 80}>
                    <div className="h-full rounded-xl border bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1A3622]/40 hover:shadow-md">
                      <div className="flex items-center gap-2 text-[#1A3622]">
                        <c.i className="h-4 w-4" />
                        <span className="font-semibold">{c.t}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              id="species"
              icon={Leaf}
              eyebrow="Step 2"
              title="Species selection and the Rhizophora racemosa case"
            >
              <p>
                Mangroves zone themselves by tidal position. In West African estuaries, including the
                Sierra Leonean coast where the Tamaraneh Initiative works, <em>Rhizophora racemosa</em>{" "}
                occupies the low intertidal, taking the brunt of daily tides. <em>Avicennia germinans</em>{" "}
                sits slightly higher, tolerating saltier, more oxidised soils. <em>Laguncularia racemosa</em>{" "}
                takes the landward fringe. Planting the wrong species at the wrong elevation is the
                single most common failure mode in restoration.
              </p>
              <p className="mt-4">
                <em>Rhizophora racemosa</em> is the workhorse species for scoured or eroding shorelines.
                Its stilt roots trap sediment on incoming tides and stabilise the substrate for the
                seedlings that follow. Propagules are long (15–30 cm), viviparous, and remain buoyant
                for weeks, meaning donor stands can be tens of kilometres from the restoration site.
              </p>
              <p className="mt-4">
                Collect propagules only from mature, healthy donor trees, never from stands already
                under stress. Take no more than 10% of the propagules from any single tree, and never
                strip an entire crown. Field crews should reject any propagule that is discoloured,
                hollow-sounding, or shorter than 15 cm, these are unlikely to establish and will
                inflate the failure rate.
              </p>
            </SectionCard>

            <SectionCard
              id="planting"
              icon={ClipboardList}
              eyebrow="Step 3"
              title="How to plant mangroves, a step-by-step protocol"
            >
              <ol className="space-y-4 pl-6 marker:font-semibold marker:text-[#1A3622]" style={{ listStyleType: "decimal" }}>
                <li>
                  <strong>Time the tide.</strong> Plant at low tide during a neap cycle. Spring tides
                  in the first week uproot fresh propagules; neaps give the propagule 5–7 days of
                  gentler inundation to anchor.
                </li>
                <li>
                  <strong>Match the elevation.</strong> Confirm the planting line sits at the tidal
                  band of the target species, for <em>Rhizophora racemosa</em>, mid-to-low intertidal,
                  flooded on every high tide but exposed for 4+ hours daily.
                </li>
                <li>
                  <strong>Insert vertically.</strong> Push the propagule one third of its length into
                  the substrate, radicle end down, kept vertical. Angled propagules snap in the first
                  storm.
                </li>
                <li>
                  <strong>Space for the future canopy.</strong> One metre apart in a triangular grid
                  gives ~10,000 stems per hectare, enough for early canopy closure without competition
                  suppressing growth at year three.
                </li>
                <li>
                  <strong>Mark the plot.</strong> Bamboo stakes with GPS coordinates on every 20th
                  propagule make the monitoring transects meaningful six months later. Unmarked plots
                  become invisible to anyone who wasn't there on planting day.
                </li>
                <li>
                  <strong>Photo-log every plot.</strong> A geotagged photo per stake at planting
                  establishes the baseline. Every future canopy or waterlogging reading is compared
                  against this.
                </li>
              </ol>
            </SectionCard>

            <SectionCard
              id="monitoring"
              icon={Droplets}
              eyebrow="Step 4"
              title="Hydrological monitoring, the first 90 days decide everything"
            >
              <p>
                More propagules die from bad hydrology in the first three months than from any other
                cause combined. A weekly monitoring cadence for the first 90 days, then monthly through
                year one, catches waterlogging and scouring failures while there is still time to
                intervene, replant lost sections, adjust local drainage, or accept that a plot's
                elevation is wrong and move the crew elsewhere.
              </p>
              <p className="mt-4">
                The classic monitoring stack, pressure transducers, salinity probes, canopy laser
                scanners, is out of reach for most community restoration groups. That is the gap
                CanopyStride closes: our vision model reads waterlogging depth, scouring signals,
                salinity stress markers, and canopy health from standard smartphone photos, so a
                weekly walk-through by a field worker produces the same telemetry a research station
                would collect.
              </p>
              <div className="mt-6 rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="font-display text-lg font-semibold">Monitoring checkpoints</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    · <strong className="text-foreground">Day 7:</strong> propagule uprooting rate, if{" "}
                    &gt; 15%, re-evaluate substrate stability.
                  </li>
                  <li>
                    · <strong className="text-foreground">Day 30:</strong> radicle emergence and leaf
                    flush, no flush by week 5 signals hypoxic soil.
                  </li>
                  <li>
                    · <strong className="text-foreground">Day 90:</strong> stem survival, target &gt;
                    70% for a plot to be considered viable without infill planting.
                  </li>
                  <li>
                    · <strong className="text-foreground">Month 12:</strong> canopy cover from overhead
                    photos, establishes trajectory to closure.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard
              id="community"
              icon={Users}
              eyebrow="Step 5"
              title="Community stewardship and the Tamaraneh model"
            >
              <p>
                No mangrove restoration succeeds without the community that lives beside the shoreline.
                Charcoal cutting, fish smoking, and clearing for rice bunds account for most restored
                area lost within five years. Restoration protocols that fail to include the fisher and
                farmer households on the adjacent land are quietly signing their plots' death warrants.
              </p>
              <p className="mt-4">
                <strong>Tamaraneh</strong>, the indigenous Temne vow of collective, crisis-driven
                solidarity, is the operational model behind our work with community restoration groups.
                Every plot has named stewards. Every telemetry alert routes to a person who can walk to
                the shoreline. Every alternative-livelihood commitment (improved fish-smoking kilns,
                community-managed nurseries) is tied to a monitored restoration area. The technology
                is the smallest part; the accountability structure around it is what keeps trees
                standing.
              </p>
            </SectionCard>

            <SectionCard
              id="failures"
              icon={AlertTriangle}
              eyebrow="Watch-outs"
              title="Common failure modes, and how to avoid them"
            >
              <ul className="space-y-3">
                <li>
                  <strong>Planting above the tidal frame.</strong> Seedlings desiccate in the first dry
                  season. Fix: survey elevation before propagule collection.
                </li>
                <li>
                  <strong>Monoculture at the wrong zone.</strong> A single species planted across all
                  tidal bands leaves half the plot mismatched. Fix: zone the plot and use 2–3 species
                  matched to elevation.
                </li>
                <li>
                  <strong>No baseline photos.</strong> Without day-zero imagery, month-six canopy
                  readings are ungrounded. Fix: geotag one photo per bamboo stake at planting.
                </li>
                <li>
                  <strong>Handover without stewards.</strong> Consultants leave; the plot is grazed
                  within a year. Fix: name stewards before the first propagule goes in.
                </li>
                <li>
                  <strong>Ignoring upstream freshwater changes.</strong> A new upstream dam or dyke can
                  shift salinity beyond species tolerance. Fix: annual salinity mapping across the
                  catchment, not just the plot.
                </li>
              </ul>
            </SectionCard>

            <SectionCard id="faq" icon={BookOpen} eyebrow="Reference" title="Frequently asked questions">
              <dl className="space-y-4">
                {FAQ.map((f, i) => (
                  <Reveal key={f.q} delay={i * 60}>
                    <div className="rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1A3622]/30 hover:shadow-md">
                      <dt className="font-display text-lg font-semibold">{f.q}</dt>
                      <dd className="mt-2 text-muted-foreground">{f.a}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </SectionCard>

            {/* CTA */}
            <Reveal>
              <div className="rounded-3xl border border-[#1A3622]/20 bg-gradient-to-br from-[#1A3622]/10 via-[#22C55E]/10 to-secondary p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h2 className="font-display text-2xl font-bold">Turn the walk-through into telemetry</h2>
                <p className="mt-3 text-muted-foreground">
                  CanopyStride reads waterlogging, scouring, salinity stress, and canopy health from
                  the field photos your team already takes, no extra sensors, no lab.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/auth"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-md bg-[#1A3622] px-6 py-3 text-base font-semibold text-white hover:bg-[#244c30]"
                  >
                    Open the dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/guide"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-md border px-6 py-3 text-base font-medium hover:bg-white"
                  >
                    More guides
                  </Link>
                </div>
              </div>
            </Reveal>
          </article>
        </div>
      </main>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="font-medium text-foreground">Powered by CanopyStride Intelligence</div>
        <div className="mt-2 text-xs">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">·</span>
          <Link to="/guide" className="hover:text-foreground">
            All guides
          </Link>
          <span className="mx-2">·</span>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
