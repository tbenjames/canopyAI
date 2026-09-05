import { useEffect, useRef, useState } from "react";
import {
  Droplets,
  Waves,
  FlaskConical,
  Leaf,
  Sprout,
  Bug,
  Landmark,
  Layers,
  Ruler,
  ShieldCheck,
  Fish,
  ScanSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Capability = {
  icon: LucideIcon;
  label: string;
  detail: string;
  accuracy: number;
};

// Accuracy figures are the tool's benchmark confidence bands; the floor is 79%.
const CAPABILITIES: Capability[] = [
  { icon: Layers, label: "Site classification", detail: "Natural pond, artificial pond, swamp, mudflat, mangrove fringe or agroforest", accuracy: 93 },
  { icon: Droplets, label: "Waterlogging & ponding", detail: "Standing water and saturated soil extent across the frame", accuracy: 91 },
  { icon: Waves, label: "Tidal scouring & erosion", detail: "Channel cutting, undercut roots and sediment displacement", accuracy: 86 },
  { icon: FlaskConical, label: "Salinity stress", detail: "Salt crust, chlorosis and necrosis read as a salinity proxy", accuracy: 84 },
  { icon: Leaf, label: "Canopy health", detail: "Canopy density, greenness and die-back signals", accuracy: 92 },
  { icon: ScanSearch, label: "Species detection", detail: "Rhizophora, Avicennia, Laguncularia, Conocarpus and Moringa taxonomy", accuracy: 88 },
  { icon: Sprout, label: "Seedling establishment", detail: "Propagule, seedling, sapling, established or mature stage", accuracy: 87 },
  { icon: Bug, label: "Weed & invasive cover", detail: "Nypa fruticans, water hyacinth, Typha and smothering mats", accuracy: 85 },
  { icon: Landmark, label: "Bank & bund integrity", detail: "Intact, minor erosion, undercut or breached pond walls", accuracy: 82 },
  { icon: Fish, label: "Water body condition", detail: "Clear, turbid, algal bloom, stagnant, sedimented or dry", accuracy: 89 },
  { icon: ShieldCheck, label: "Structural risk", detail: "Combined risk score before the next tide or rain event", accuracy: 90 },
  { icon: Ruler, label: "Confidence & gaps", detail: "Per-run confidence plus indicators the frame could not support", accuracy: 79 },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let frame = 0;
    const total = 48;
    const id = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / total, 3);
      setValue(Math.round(target * progress));
      if (frame >= total) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [target, active]);
  return value;
}

function CapabilityTile({ item, index, active }: { item: Capability; index: number; active: boolean }) {
  const pct = useCountUp(item.accuracy, active);
  const Icon = item.icon;
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.11] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(18px)",
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#22C55E]/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#22C55E]/40 to-[#1A3622]/60 text-white ring-1 ring-white/20">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-semibold tabular-nums text-white">{pct}%</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{item.label}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-white/65">{item.detail}</p>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#A7F3D0] transition-[width] duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: active ? `${item.accuracy}%` : "0%", transitionDelay: `${index * 60}ms` }}
        />
      </div>
    </div>
  );
}

export function CapabilityShowcase() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="capabilities-heading"
      className="relative overflow-hidden bg-[#0B1F14]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_-10%,rgba(34,197,94,0.28),transparent_60%),radial-gradient(90%_70%_at_95%_110%,rgba(26,54,34,0.9),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22C55E]/60 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />
          What CanopyStride AI reads from one photo
        </span>
        <h2
          id="capabilities-heading"
          className="mt-6 max-w-3xl font-display font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.75rem)" }}
        >
          Twelve ecological readings, one field photo, seconds to result.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          Every upload runs through the full diagnostic stack, from scene classification to
          structural risk, so ponds, swamps, mudflats and planted belts are all covered by the same
          verified pipeline.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item, i) => (
            <CapabilityTile key={item.label} item={item} index={i} active={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
