import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  ArrowRight,
  Shield,
  Trees,
  Users,
  Mail,
  ArrowLeft,
  Calculator,
  Sprout,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import donateHero from "@/assets/donate-hero.mp4.asset.json";

const VULT_URL = "https://wallet.vultme.io/paytag/828e3e7a-a9ad-422d-b8ad-bf7f51f4b60f";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate · Fund coastal restoration in Sierra Leone" },
      {
        name: "description",
        content:
          "Support mangrove and Moringa restoration in Sierra Leone. Give securely through Vult and track outcomes on your donor dashboard.",
      },
      { property: "og:title", content: "Donate · CanopyStride AI" },
      {
        property: "og:description",
        content: "Support coastal restoration in Sierra Leone through the Tamaraneh Initiative.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/donate" }],
  }),
  component: DonatePage,
});

function DonatePage() {
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
          <Link
            to="/legal"
            search={{ tab: "privacy" }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            How we use funds
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0f2618] text-white">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-45 motion-reduce:hidden"
            src={donateHero.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0f2618]/85 via-[#1A3622]/70 to-[#254a30]/90"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Heart className="h-3 w-3" /> Grant donors and supporters
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Fund the restoration of a vulnerable coastline.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/90">
                Every contribution plants mangroves, protects villages from tidal scouring, and puts
                monitoring tools in the hands of youth stewards in Freetown and beyond.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={VULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A3622] shadow hover:bg-slate-100"
                >
                  Give securely through Vult <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="mailto:supprttmrnhinitiative@gmail.com?subject=Institutional donation enquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" /> Institutional donors
                </a>
              </div>
              <p className="mt-4 text-xs text-white/80">
                Vult is a regulated digital wallet. Your contribution routes to the Tamaraneh
                Initiative.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Trees,
                title: "Seedlings in the ground",
                body: "Rhizophora, Avicennia, Laguncularia, and Moringa oleifera planted with community groups.",
              },
              {
                icon: Users,
                title: "Youth stewards paid",
                body: "Frontline monitors are trained and compensated to survey plots each week.",
              },
              {
                icon: Shield,
                title: "Every dollar tracked",
                body: "Donor dashboards show plot photos, AI health scores, and site outcomes over time.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A3622]/10 text-[#1A3622]">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold text-slate-900">{c.title}</div>
                <p className="mt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Where your gift goes.
                </h2>
                <p className="mt-3 text-slate-700">
                  CanopyStride AI is the monitoring layer for the Tamaraneh Initiative. Donations
                  fund seedlings, community wages, transport across Sierra Leone Estuary sites, and
                  the credits that power the AI vision system that keeps restoration honest.
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Illustrative impact
                </div>
                <ul className="mt-3 flex flex-col gap-3 text-sm text-slate-800">
                  <li className="flex items-baseline justify-between border-b pb-2">
                    <span>$25</span>
                    <span className="text-slate-600">50 mangrove propagules</span>
                  </li>
                  <li className="flex items-baseline justify-between border-b pb-2">
                    <span>$100</span>
                    <span className="text-slate-600">One youth monitor for a week</span>
                  </li>
                  <li className="flex items-baseline justify-between border-b pb-2">
                    <span>$500</span>
                    <span className="text-slate-600">A quarter of monitoring at one plot</span>
                  </li>
                  <li className="flex items-baseline justify-between">
                    <span>$5,000</span>
                    <span className="text-slate-600">A new restoration site, end to end</span>
                  </li>
                </ul>
                <a
                  href={VULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1A3622] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#254a30]"
                >
                  Give now <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <ImpactCalculator />
      </main>

      <SiteFooter />
    </div>
  );
}

function ImpactCalculator() {
  const [amount, setAmount] = useState(100);

  const propagules = Math.floor(amount / 0.5);
  const monitorDays = Math.floor(amount / 20);
  const analyses = Math.floor(amount / 0.75);
  const hectaresMonitored = (amount / 1000).toFixed(1);

  return (
    <section className="border-t bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A3622]/10 text-[#1A3622]">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              See what your gift can do
            </h2>
            <p className="text-sm text-slate-600">Move the slider to estimate impact.</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label htmlFor="gift-amount" className="text-sm font-medium text-slate-700">
              Gift amount
            </label>
            <span className="font-display text-3xl font-bold text-[#1A3622]">${amount}</span>
          </div>
          <input
            id="gift-amount"
            type="range"
            min={25}
            max={5000}
            step={25}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-4 w-full accent-[#1A3622]"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>$25</span>
            <span>$5,000</span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sprout,
                value: propagules.toLocaleString(),
                label: "mangrove propagules",
              },
              {
                icon: Users,
                value: monitorDays.toString(),
                label: "monitor days funded",
              },
              {
                icon: Trees,
                value: analyses.toLocaleString(),
                label: "AI analyses powered",
              },
              {
                icon: Shield,
                value: `${hectaresMonitored} ha`,
                label: "estimated monitoring coverage",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#1A3622]/10 text-[#1A3622]">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-slate-600">{item.label}</div>
              </div>
            ))}
          </div>

          <a
            href={VULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-[#1A3622] px-6 py-3 text-sm font-medium text-white hover:bg-[#254a30]"
          >
            Give ${amount} through Vult <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
