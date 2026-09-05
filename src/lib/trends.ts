// Deterministic change detection over a plot's analysis history.
// No model prose: every statement below comes from measured deltas.

import { TREND_INDICATORS } from "./indicators";

export interface TrendPoint {
  id: string;
  created_at: string;
  canopy_health_pct: number | null;
  waterlogging_pct: number | null;
  salinity_stress_pct: number | null;
  invasive_coverage_pct: number | null;
}

export interface IndicatorDelta {
  key: string;
  label: string;
  from: number | null;
  to: number | null;
  delta: number | null;
  direction: "improved" | "worsened" | "stable" | "unknown";
  color: string;
}

const MATERIAL_CHANGE = 5;

export function computeDeltas(from: TrendPoint, to: TrendPoint): IndicatorDelta[] {
  return TREND_INDICATORS.map((ind) => {
    const a = from[ind.key as keyof TrendPoint] as number | null;
    const b = to[ind.key as keyof TrendPoint] as number | null;
    if (a === null || a === undefined || b === null || b === undefined) {
      return { key: ind.key, label: ind.label, from: a ?? null, to: b ?? null, delta: null, direction: "unknown" as const, color: ind.color };
    }
    const delta = b - a;
    let direction: IndicatorDelta["direction"] = "stable";
    if (Math.abs(delta) >= MATERIAL_CHANGE) {
      const better = ind.higherIsBetter ? delta > 0 : delta < 0;
      direction = better ? "improved" : "worsened";
    }
    return { key: ind.key, label: ind.label, from: a, to: b, delta, direction, color: ind.color };
  });
}

export type TrendVerdict = "improving" | "stable" | "declining" | "insufficient";

export interface TrendSummary {
  verdict: TrendVerdict;
  headline: string;
  driver: string | null;
  readings: number;
}

export function summariseTrend(points: TrendPoint[]): TrendSummary {
  if (points.length < 2) {
    return {
      verdict: "insufficient",
      headline: "At least two readings are needed before change can be measured on this plot.",
      driver: null,
      readings: points.length,
    };
  }
  const first = points[0];
  const last = points[points.length - 1];
  const deltas = computeDeltas(first, last);
  const scored = deltas.filter((d) => d.delta !== null);
  const improved = scored.filter((d) => d.direction === "improved");
  const worsened = scored.filter((d) => d.direction === "worsened");

  const strongest = [...scored].sort(
    (a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0),
  )[0];
  const driver = strongest && Math.abs(strongest.delta ?? 0) >= MATERIAL_CHANGE
    ? `${strongest.label} moved ${(strongest.delta ?? 0) > 0 ? "up" : "down"} ${Math.abs(strongest.delta ?? 0)} points`
    : null;

  let verdict: TrendVerdict = "stable";
  if (worsened.length > improved.length) verdict = "declining";
  else if (improved.length > worsened.length) verdict = "improving";

  const span = `${points.length} readings between ${new Date(first.created_at).toLocaleDateString("en-GB")} and ${new Date(last.created_at).toLocaleDateString("en-GB")}`;
  const headline =
    verdict === "improving"
      ? `Conditions on this plot are improving across ${span}.`
      : verdict === "declining"
        ? `Conditions on this plot are declining across ${span}.`
        : `Conditions on this plot are broadly stable across ${span}.`;

  return { verdict, headline, driver, readings: points.length };
}

/** Sustained decline: canopy health falls on each of the last three readings. */
export function hasSustainedCanopyDecline(points: TrendPoint[]): boolean {
  const values = points
    .map((p) => p.canopy_health_pct)
    .filter((v): v is number => typeof v === "number");
  if (values.length < 3) return false;
  const [a, b, c] = values.slice(-3);
  return b < a && c < b && a - c >= MATERIAL_CHANGE;
}
