// Reviewable indicator definitions. Shared by the verification panel, the
// validation dashboard and the change-detection views so a corrected value
// always uses the same vocabulary as the model output.

export type IndicatorKind = "pct" | "severity" | "enum" | "bool";

export interface IndicatorDef {
  key: string;
  label: string;
  kind: IndicatorKind;
  options?: { value: string; label: string }[];
  /** Higher value is better (used for trend direction). */
  higherIsBetter?: boolean;
}

const SEVERITY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const INDICATORS: IndicatorDef[] = [
  {
    key: "site_type",
    label: "Site classification",
    kind: "enum",
    options: [
      { value: "natural_pond", label: "Natural pond" },
      { value: "artificial_pond", label: "Artificial pond" },
      { value: "swamp_marsh", label: "Swamp / marsh" },
      { value: "intertidal_mudflat", label: "Intertidal mudflat" },
      { value: "mangrove_fringe", label: "Mangrove fringe" },
      { value: "terrestrial_agroforest", label: "Terrestrial agroforest" },
      { value: "other", label: "Other landscape" },
    ],
  },
  { key: "waterlogging_pct", label: "Waterlogging and ponding", kind: "pct", higherIsBetter: false },
  { key: "scouring_severity", label: "Tidal scouring and erosion", kind: "severity", options: SEVERITY },
  { key: "salinity_stress_pct", label: "Salinity stress", kind: "pct", higherIsBetter: false },
  { key: "canopy_health_pct", label: "Canopy health", kind: "pct", higherIsBetter: true },
  { key: "detected_species", label: "Species detection", kind: "enum" },
  {
    key: "establishment_stage",
    label: "Seedling establishment",
    kind: "enum",
    options: [
      { value: "none_visible", label: "None visible" },
      { value: "propagule", label: "Propagule" },
      { value: "seedling", label: "Seedling" },
      { value: "sapling", label: "Sapling" },
      { value: "established", label: "Established" },
      { value: "mature", label: "Mature" },
    ],
  },
  { key: "invasive_present", label: "Weed or invasive presence", kind: "bool" },
  { key: "invasive_coverage_pct", label: "Invasive cover", kind: "pct", higherIsBetter: false },
  {
    key: "bank_integrity",
    label: "Bank and bund integrity",
    kind: "enum",
    options: [
      { value: "intact", label: "Intact" },
      { value: "minor_erosion", label: "Minor erosion" },
      { value: "undercut", label: "Undercut" },
      { value: "breached", label: "Breached" },
      { value: "not_visible", label: "Not visible" },
    ],
  },
  {
    key: "water_body_condition",
    label: "Water body condition",
    kind: "enum",
    options: [
      { value: "not_applicable", label: "Not applicable" },
      { value: "open_clear_water", label: "Open, clear water" },
      { value: "turbid", label: "Turbid" },
      { value: "algal_bloom", label: "Algal bloom" },
      { value: "stagnant", label: "Stagnant" },
      { value: "sedimented", label: "Sedimented" },
      { value: "dry", label: "Dry" },
    ],
  },
  { key: "structural_risk", label: "Structural risk", kind: "severity", options: SEVERITY },
];

export const INDICATOR_KEYS = INDICATORS.map((i) => i.key);

export function indicatorLabel(key: string): string {
  return INDICATORS.find((i) => i.key === key)?.label ?? key.replace(/_/g, " ");
}

export type VerdictStatus = "confirmed" | "corrected" | "not_assessable";

export interface Verdict {
  status: VerdictStatus;
  /** Present only when status is "corrected". */
  value?: string | number | boolean | null;
}

export type Verdicts = Record<string, Verdict>;

/** Trend-relevant numeric indicators used for the plot timeline and deltas. */
export const TREND_INDICATORS = [
  { key: "canopy_health_pct", label: "Canopy health", higherIsBetter: true, color: "#2f6d4f" },
  { key: "waterlogging_pct", label: "Waterlogging", higherIsBetter: false, color: "#3b82c4" },
  { key: "salinity_stress_pct", label: "Salinity stress", higherIsBetter: false, color: "#c08838" },
  { key: "invasive_coverage_pct", label: "Invasive cover", higherIsBetter: false, color: "#8b5cf6" },
] as const;
