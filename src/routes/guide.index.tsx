import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Sprout, Camera, Droplets } from "lucide-react";

const URL = "https://canopystride.dev/guide";
const TITLE = "Restoration field guides";
const DESCRIPTION =
  "Practical, field-tested guides for mangrove and Moringa restoration teams. Species selection, planting protocols, monitoring, and canopy analysis.";

const ARTICLES = [
  {
    slug: "mangrove-restoration-best-practices",
    title: "Mangrove restoration best practices",
    summary:
      "Read hydrology first, match species to tidal zone, plant propagules correctly, and monitor canopy health.",
    readingTime: "12 min read",
    icon: Sprout,
    tags: ["Mangroves", "Field protocol"],
  },
  {
    slug: "smartphone-based-mangrove-canopy-monitoring",
    title: "Smartphone-based mangrove canopy monitoring",
    summary:
      "How field teams can produce credible canopy health data using only a phone camera and structured observation.",
    readingTime: "10 min read",
    icon: Camera,
    tags: ["Monitoring", "Photo analysis"],
  },
];

export const Route = createFileRoute("/guide/")({
  head: () => ({
    meta: [
      { title: `${TITLE}, CanopyStride AI` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE}, CanopyStride AI` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          url: URL,
          description: DESCRIPTION,
          hasPart: ARTICLES.map((a) => ({
            "@type": "Article",
            headline: a.title,
            url: `${URL}/${a.slug}`,
            description: a.summary,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://canopystride.dev/" },
            { "@type": "ListItem", position: 2, name: "Field guides", item: URL },
          ],
        }),
      },
    ],
  }),
  component: GuideIndex,
});

function GuideIndex() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1A3622] text-white">
              <Sprout className="h-5 w-5" />
            </span>
            CanopyStride <span className="text-muted-foreground font-medium">AI</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/guide" className="text-muted-foreground hover:text-foreground">
              Field guides
            </Link>
            <Link to="/auth" className="rounded-md bg-[#1A3622] px-4 py-2 font-semibold text-white hover:bg-[#244c30]">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Field guides</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1A3622]">
          <BookOpen className="h-4 w-4" /> Field guides
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Restoration field guides
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Practical guides written for frontline monitors and restoration ecologists working on
          mangroves and Moringa. Each guide is built around what actually happens in the field, not
          textbook theory.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {ARTICLES.map((a) => (
            <a
              key={a.slug}
              href={`/guide/${a.slug}`}
              className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A3622]/10 text-[#1A3622]">
                <a.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-slate-900 group-hover:text-[#1A3622]">
                {a.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{a.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <span>{a.readingTime}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1A3622]">
                Read guide <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#1A3622] to-[#254a30] p-8 text-white">
          <div className="flex items-start gap-4">
            <Droplets className="mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <h3 className="font-display text-xl font-semibold">Turn field photos into ecological signals</h3>
              <p className="mt-2 text-sm text-white/80">
                CanopyStride AI reads waterlogging, salinity stress, scouring, and canopy health from
                the same photos your team already takes. No sensors, no hardware.
              </p>
              <Link
                to="/auth"
                className="mt-4 inline-flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#1A3622] hover:bg-white/90"
              >
                Start analysing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
