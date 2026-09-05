import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Sprout, ArrowRight, Leaf, BookOpen } from "lucide-react";

const URL = "https://canopystride.dev/guide/smartphone-based-mangrove-canopy-monitoring";
const TITLE = "Smartphone-based mangrove canopy monitoring";
const DESCRIPTION =
  "How field teams can produce credible mangrove canopy health data using only a phone camera, structured observation, and simple protocols.";

export const Route = createFileRoute("/guide/smartphone-based-mangrove-canopy-monitoring")({
  head: () => ({
    meta: [
      { title: `${TITLE}, CanopyStride AI` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "article:section", content: "Monitoring" },
      { property: "article:tag", content: "canopy monitoring" },
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
          datePublished: "2026-07-23",
          author: { "@type": "Organization", name: "CanopyStride AI" },
          publisher: {
            "@type": "Organization",
            name: "CanopyStride AI",
            parentOrganization: { "@type": "Organization", name: "The-Venture (Tamaraneh Initiative)" },
          },
          about: [
            { "@type": "Thing", name: "Mangrove canopy monitoring" },
            { "@type": "Thing", name: "Smartphone photography" },
            { "@type": "Thing", name: "Restoration ecology" },
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
            { "@type": "ListItem", position: 2, name: "Field guides", item: "https://canopystride.dev/guide" },
            { "@type": "ListItem", position: 3, name: TITLE, item: URL },
          ],
        }),
      },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
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
              All guides
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to="/auth" className="rounded-md bg-[#1A3622] px-4 py-2 font-semibold text-white hover:bg-[#244c30]">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/guide" className="hover:text-foreground">Field guides</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Canopy monitoring</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#1A3622]">
          <Camera className="h-4 w-4" /> Monitoring protocol
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {TITLE}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Restoration teams do not need drones, satellites, or specialist sensors to track how a
          mangrove canopy is doing. A smartphone, a repeatable protocol, and a habit of shooting from
          the same spots is enough to catch problems weeks before they become losses.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">10 min read</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Field protocol</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Monitoring</span>
        </div>

        <article className="prose prose-slate mt-12 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-slate-700">
          <h2 id="why">Why canopy matters more than height</h2>
          <p>
            New restoration teams often measure success by seedling height. It is easy to record,
            easy to graph, and easy to report. But height is a lagging indicator. By the time a
            seedling stops growing, the stress that caused it, waterlogging, salinity spike,
            herbivory, has already been present for weeks. Canopy condition is the earliest visible
            signal. Leaves yellow, thin out, or curl before growth slows.
          </p>
          <p>
            For <em>Rhizophora racemosa</em>, <em>Avicennia germinans</em>, and{" "}
            <em>Laguncularia racemosa</em> stands, the canopy is where photosynthesis, transpiration,
            and salt exclusion all show their outcomes. A photo of a canopy is a snapshot of every
            physiological process a mangrove is running. That is why a monitoring protocol built
            around canopy photography beats a protocol built around a tape measure.
          </p>

          <h2 id="setup">Set up a photo point once, use it forever</h2>
          <p>
            The single most important decision is fixing your photo points. A photo point is a
            precise location, direction, and framing that you return to every visit. Without fixed
            points, week-to-week photos are not comparable and the whole exercise collapses into
            impressions.
          </p>
          <p>To set up a photo point:</p>
          <ol>
            <li>
              Pick a location with a clear line of sight to a representative section of canopy,
              roughly 5 to 10 metres away.
            </li>
            <li>
              Drive a stake or place a permanent marker (a painted rock, a numbered plate on a
              nearby tree).
            </li>
            <li>Record the GPS coordinates using your phone's compass or a GNSS app.</li>
            <li>
              Note the compass bearing you are facing. On the first visit, take a reference photo and
              save the bearing in the caption or filename.
            </li>
            <li>
              Plan for four to eight photo points per hectare, arranged so they cover the range of
              hydrological conditions on your site, high, mid, and low intertidal.
            </li>
          </ol>

          <h2 id="shooting">Shooting protocol</h2>
          <p>
            Consistency beats resolution. A blurry photo shot from the same spot every week is more
            useful than a sharp photo shot from a slightly different angle each time.
          </p>
          <h3>Time of day</h3>
          <p>
            Shoot within the same two-hour window each visit. Mid-morning (roughly 9:00 to 11:00
            local time) gives even light on most West African coasts without harsh shadows. Avoid
            noon (washed-out colours) and late afternoon (long shadows distort canopy density).
          </p>
          <h3>Framing</h3>
          <p>
            Hold the phone horizontally at chest height. Frame so the canopy fills the upper two
            thirds of the image and the ground or water fills the lower third. This gives the analyst
            (or the AI model) a reference for scale and light.
          </p>
          <h3>Focus and exposure</h3>
          <p>
            Tap the canopy in the middle of the frame to lock focus and exposure. Do not use HDR,
            filters, or portrait mode. These modify colour and contrast in ways that are invisible to
            you but ruin comparability across dates.
          </p>
          <h3>Metadata</h3>
          <p>
            Keep GPS on. Every modern phone embeds coordinates and timestamps in the photo file
            (EXIF). CanopyStride AI reads these automatically. If you are archiving manually, add the
            photo point number, date, and any weather notes to the filename.
          </p>

          <h2 id="reading">Reading the canopy</h2>
          <p>Look for four categories of signal, in this order:</p>
          <ol>
            <li>
              <strong>Colour.</strong> A healthy mangrove canopy is deep, saturated green. Pale
              yellow-green suggests nitrogen limitation or salinity stress. Bronze or red-tinted
              leaves in{" "}
              <em>Avicennia</em>{" "}
              are a salt-excretion sign, common but worth tracking if it intensifies.
            </li>
            <li>
              <strong>Density.</strong> Thinning canopy, where you can see through to sky or water
              through the leaf layer, indicates leaf drop, herbivory, or dieback. Compare against
              your reference photo from the same point.
            </li>
            <li>
              <strong>Uniformity.</strong> Patchy canopy (healthy leaves next to dead branches on the
              same tree) usually points to physical damage, storm scarring, boat wash, or debris
              accumulation.
            </li>
            <li>
              <strong>New growth.</strong> Fresh leaves are lighter green with a slight sheen. A
              canopy with visible new growth at the branch tips is actively expanding. A canopy with
              no visible new growth for four consecutive weeks in the growing season warrants
              investigation.
            </li>
          </ol>

          <h2 id="cadence">How often to shoot</h2>
          <p>
            Weekly for the first 90 days after planting or a major disturbance. Fortnightly for the
            following six months. Monthly after that, for as long as the site is under active
            management. Add an extra visit within 48 hours of any storm, spring tide, or upstream
            flood event.
          </p>
          <p>
            Discipline matters more than frequency. A team that reliably shoots monthly for two years
            will spot slow-onset problems (salinity intrusion, gradual erosion) that a team shooting
            weekly for the first month and then never again will miss entirely.
          </p>

          <h2 id="analysis">Turning photos into signals</h2>
          <p>
            Photos are inputs, not outputs. To convert a folder of canopy shots into a monitoring
            record, you need three things: a fixed vocabulary for what you are describing, a way to
            aggregate observations across photo points, and a trigger for action when a threshold is
            crossed.
          </p>
          <p>
            CanopyStride AI provides the first two automatically. Every uploaded photo is scored on
            waterlogging, salinity stress proxy, tidal scouring, and canopy health, with a short
            written note per indicator. Scores aggregate by plot and site so a project manager can
            scan a dashboard rather than a folder. The third piece, action triggers, is decided by
            your team: "if canopy health drops two levels in four weeks, dispatch an ecologist" is a
            reasonable starting rule.
          </p>

          <h2 id="pitfalls">Common pitfalls</h2>
          <ul>
            <li>
              <strong>Rotating photographers without a handover.</strong> Two people framing the same
              scene differently produces noise that looks like a change in the canopy. Walk through
              the protocol together at least once when handing over.
            </li>
            <li>
              <strong>Skipping the reference photo.</strong> Without a first-visit photo, later
              images have nothing to compare against.
            </li>
            <li>
              <strong>Shooting only healthy patches.</strong> The tempting patches to photograph are
              the beautiful ones. The valuable patches to photograph are the stressed ones.
            </li>
            <li>
              <strong>Deleting failed sites.</strong> A photo record of a failed restoration is more
              valuable than no record at all, it tells the next attempt what not to do.
            </li>
          </ul>

          <h2 id="scale">Scaling beyond a single site</h2>
          <p>
            Once one site is running well, the protocol scales laterally without much change. Two
            teams working two sites can compare notes because the vocabulary is the same. A donor
            reviewing five sites across the initiative can look at a single dashboard because the
            photo points, cadence, and scoring are consistent. The value of a monitoring protocol
            compounds with every additional site that adopts it.
          </p>
          <p>
            That compounding is why we recommend picking a small number of protocols and using them
            everywhere, rather than reinventing the monitoring approach for each new plot.
          </p>
        </article>

        <div className="mt-16 rounded-2xl border bg-gradient-to-br from-[#1A3622] to-[#254a30] p-8 text-white">
          <div className="flex items-start gap-4">
            <Leaf className="mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <h3 className="font-display text-xl font-semibold">Skip the manual scoring</h3>
              <p className="mt-2 text-sm text-white/80">
                Upload your canopy photos to CanopyStride AI and get consistent scoring on
                waterlogging, salinity stress, scouring, and canopy health in seconds. One credit per
                photo.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#1A3622] hover:bg-white/90"
                >
                  Open the dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/guide"
                  className="inline-flex items-center gap-1 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <BookOpen className="h-3.5 w-3.5" /> More guides
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
