import type { Severity } from "@/lib/db";
import { Droplets, Waves, FlaskConical, Leaf } from "lucide-react";

interface PctProps { label: string; pct: number | null; tone: "water" | "salt" | "canopy"; }

const TONE: Record<PctProps["tone"], { color: string; icon: typeof Droplets; goodHigh?: boolean }> = {
  water: { color: "#3b82c4", icon: Droplets },
  salt: { color: "#c08838", icon: FlaskConical },
  canopy: { color: "#2f6d4f", icon: Leaf, goodHigh: true },
};

export function PctIndicator({ label, pct, tone }: PctProps) {
  const t = TONE[tone];
  const Icon = t.icon;
  const value = pct ?? 0;
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: `${t.color}22`, color: t.color }}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </div>
        <span className="font-display text-xl font-semibold">{pct == null ? ", " : `${value}%`}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: t.color }} />
      </div>
    </div>
  );
}

export function SeverityIndicator({ label, severity }: { label: string; severity: Severity | null }) {
  const tone =
    severity === "high" ? { color: "#c0443b", text: "High" } :
    severity === "medium" ? { color: "#c08838", text: "Medium" } :
    severity === "low" ? { color: "#2f6d4f", text: "Low" } :
    { color: "#888", text: ", " };
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: `${tone.color}22`, color: tone.color }}>
            <Waves className="h-4 w-4" />
          </span>
          {label}
        </div>
        <span className="font-display text-xl font-semibold" style={{ color: tone.color }}>{tone.text}</span>
      </div>
      <div className="mt-3 flex gap-1">
        {["low", "medium", "high"].map((s) => (
          <div key={s} className="h-2 flex-1 rounded-full" style={{ backgroundColor: severity === s ? tone.color : "var(--muted)" }} />
        ))}
      </div>
    </div>
  );
}

export function riskColor(severity: Severity | null | undefined): string {
  if (severity === "high") return "#c0443b";
  if (severity === "medium") return "#c08838";
  if (severity === "low") return "#2f6d4f";
  return "#7c7c7c";
}
