import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  accent = "primary",
  badge,
  children,
  valueColor,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  suffix?: ReactNode;
  accent?: "primary" | "gold" | "danger";
  badge?: ReactNode;
  children?: ReactNode;
  valueColor?: string;
}) {
  const accentVar =
    accent === "gold" ? "var(--color-gold)" :
    accent === "danger" ? "var(--color-destructive)" :
    "var(--color-primary)";
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklab, ${accentVar} 14%, transparent)`, color: accentVar }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold leading-none" style={{ color: valueColor }}>{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {badge && <div className="mt-2">{badge}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function Sparkline({ points, color = "var(--color-primary)" }: { points: number[]; color?: string }) {
  if (points.length < 2) return <div className="h-10" />;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 140, h = 38;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
