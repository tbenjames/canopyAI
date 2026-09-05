import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  Map as MapIcon,
  Activity,
  ArrowRight,
  Leaf,
  Waves,
  Droplets,
  FlaskConical,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { CapabilityShowcase } from "@/components/CapabilityShowcase";
import { TypingCarousel } from "@/components/TypingCarousel";
import { TelemetryBackdrop } from "@/components/TelemetryBackdrop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CanopyStride AI, Verifiable Restoration Telemetry" },
      {
        name: "description",
        content:
          "Turn field photos into verifiable mangrove and Moringa restoration signals, waterlogging, salinity, scouring, and canopy health in seconds.",
      },
      { property: "og:title", content: "CanopyStride AI, Verifiable Restoration Telemetry" },
      {
        property: "og:description",
        content:
          "Field photos in. Verified ecological signals out. Built for restoration teams working on mangroves and Moringa.",
      },
      { property: "og:url", content: "https://canopystride.dev/" },
      { name: "twitter:title", content: "CanopyStride AI, Verifiable Restoration Telemetry" },
      {
        name: "twitter:description",
        content:
          "Field photos in. Verified ecological signals out. Built for Restoration and Regenerative teams.",
      },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "CanopyStride AI",
          url: "https://canopystride.dev/",
          description:
            "AI ecological telemetry for the Tamaraneh Initiative, turning field photos into verifiable mangrove and Moringa restoration signals.",
          brand: "CanopyStride",
          parentOrganization: {
            "@type": "Organization",
            name: "The-Venture (Tamaraneh Initiative)",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CanopyStride AI",
          url: "https://canopystride.dev/",
          description: "Ecological telemetry for mangrove and Moringa restoration.",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-display font-bold">
            <AppLogo variant="mark" className="h-9 w-9" />
            CanopyStride <span className="text-muted-foreground font-medium">AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/partners"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Partners
            </Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 rounded-md bg-[#1A3622] px-4 py-2 text-sm font-semibold text-white hover:bg-[#244c30] min-h-[44px]"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <TelemetryBackdrop className="text-[#1A3622]" intensity={0.18} />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                For Restoration / Regenerative teams
              </span>
              <h1
                className="mt-6 font-display font-bold leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 1.4rem + 3vw, 3.75rem)" }}
              >
                Every field photo becomes a{" "}
                <span className="text-[#1A3622]">verified ecological signal</span>, closing the data
                gap between restoration ambition and measurable outcomes.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                CanopyStride vision AI reads waterlogging, tidal scouring, salinity stress, and
                canopy health, and maps them across every restoration plot site.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-md bg-[#1A3622] px-6 py-3 text-base font-semibold text-white hover:bg-[#244c30] min-h-[48px]"
                >
                  Open the dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-md border bg-card px-6 py-3 text-base font-semibold hover:bg-secondary min-h-[48px]"
                >
                  How it works
                </a>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                First user becomes the admin · No physical sensors required
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl border bg-gradient-to-br from-[#1A3622]/15 via-[#22C55E]/10 to-secondary p-6 shadow-xl">
                <div className="grid h-full grid-cols-2 gap-3">
                  {[
                    { i: Droplets, l: "Waterlogging", v: "62%", c: "#3b82c4" },
                    { i: Waves, l: "Scouring", v: "High", c: "#c0443b" },
                    { i: FlaskConical, l: "Salinity stress", v: "41%", c: "#c08838" },
                    { i: Leaf, l: "Canopy health", v: "78%", c: "#1A3622" },
                  ].map((m, idx) => (
                    <div key={idx} className="rounded-xl bg-card/90 backdrop-blur p-4 shadow-sm">
                      <div
                        className="grid h-8 w-8 place-items-center rounded-md"
                        style={{ backgroundColor: `${m.c}22`, color: m.c }}
                      >
                        <m.i className="h-4 w-4" />
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">{m.l}</div>
                      <div className="font-display text-2xl font-semibold" style={{ color: m.c }}>
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <CapabilityShowcase />

        {/* WORKFLOW */}
        <section id="how" className="relative border-t bg-card/40 overflow-hidden">
          <TelemetryBackdrop className="text-[#1A3622]" intensity={0.08} />
          <div className="relative mx-auto max-w-6xl px-4 py-20">
            <h2
              className="font-mono font-bold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.5rem)" }}
            >
              <TypingCarousel
                phrases={[
                  "Efficiency beats patience.",
                  "From photo to insight in seconds.",
                  "Field-grade intelligence, instantly.",
                ]}
                className="text-[#1A3622]"
              />
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground font-mono">
              <TypingCarousel
                phrases={[
                  "A simple three-step workflow your field teams can run efficiently.",
                  "Capture · Analyze · Act, built for crews in the field.",
                ]}
                typeSpeed={28}
                holdMs={2500}
              />
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  i: Camera,
                  t: "1. Capture",
                  d: "Field worker photographs a plot. GPS is read automatically from the image or video.",
                },
                {
                  i: Activity,
                  t: "2. Analyze",
                  d: "CanopyStride Intelligence vision model returns restoration ecosystems, landscapes, waterlogging, scouring, salinity-stress, and canopy indicators with a confidence score.",
                },
                {
                  i: MapIcon,
                  t: "3. Map & Act",
                  d: "Plots glow red, amber, or green on the live map. High-risk plots auto-generate alerts and recommended interventions.",
                },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#1A3622]/10 text-[#1A3622]">
                    <s.i className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAPABILITY */}
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.5rem)" }}
            >
              Maximizing Field Intelligence, Minimizing Costs
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              CanopyStride transforms standard field photos and videos into powerful,
              high-confidence data models. Our AI instantly analyzes critical visual indicators,
              such as waterlogging, salinity stress, tidal scouring, and canopy decline, delivering
              real-time ecological insights at a fraction of the cost of traditional hardware. Built
              to scale with you, CanopyStride seamlessly integrates with physical IoT sensors over
              time, continuously sharpening its predictive intelligence to secure your restoration
              outcomes.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md bg-[#1A3622] px-6 py-3 text-base font-semibold text-white hover:bg-[#244c30] min-h-[48px]"
              >
                Try the demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="font-medium text-foreground">Powered by CanopyStride Intelligence</div>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <li>✓ Built for the field team</li>
          <li>✓ Built for community group restoration initiatives</li>
          <li>✓ Built for Regenerative / Restoration projects</li>
          <li>✓ Built for enterprises &amp; Institutions</li>
        </ul>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
          <Link
            to="/guide/mangrove-restoration-best-practices"
            className="hover:text-foreground underline underline-offset-4"
          >
            Field guide: mangrove restoration best practices
          </Link>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <Link
            to="/legal"
            search={{ tab: "privacy" }}
            className="hover:text-foreground underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <Link
            to="/legal"
            search={{ tab: "terms" }}
            className="hover:text-foreground underline underline-offset-4"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
