export type SpeciesGroup =
  | "Mangrove (Primary)"
  | "Mangrove (Extended)"
  | "Moringa"
  | "Other restoration";

export interface Species {
  value: string;
  label: string;
  group: SpeciesGroup;
  notes?: string;
}

export const SPECIES: Species[] = [
  // Primary mangroves (West Africa focus)
  { value: "rhizophora_racemosa", label: "Rhizophora racemosa (Red mangrove)", group: "Mangrove (Primary)" },
  { value: "rhizophora_harrisonii", label: "Rhizophora harrisonii", group: "Mangrove (Primary)" },
  { value: "laguncularia_racemosa", label: "Laguncularia racemosa (White mangrove)", group: "Mangrove (Primary)" },
  { value: "avicennia_germinans", label: "Avicennia germinans (Black mangrove)", group: "Mangrove (Primary)" },
  { value: "conocarpus_erectus", label: "Conocarpus erectus (Buttonwood)", group: "Mangrove (Primary)" },

  // Extended mangrove taxa for broader restoration
  { value: "rhizophora_mangle", label: "Rhizophora mangle", group: "Mangrove (Extended)" },
  { value: "rhizophora_mucronata", label: "Rhizophora mucronata (Indo-Pacific)", group: "Mangrove (Extended)" },
  { value: "avicennia_marina", label: "Avicennia marina (Grey mangrove)", group: "Mangrove (Extended)" },
  { value: "avicennia_africana", label: "Avicennia africana", group: "Mangrove (Extended)" },
  { value: "bruguiera_gymnorrhiza", label: "Bruguiera gymnorrhiza", group: "Mangrove (Extended)" },
  { value: "sonneratia_alba", label: "Sonneratia alba", group: "Mangrove (Extended)" },
  { value: "ceriops_tagal", label: "Ceriops tagal", group: "Mangrove (Extended)" },
  { value: "xylocarpus_granatum", label: "Xylocarpus granatum", group: "Mangrove (Extended)" },
  { value: "heritiera_littoralis", label: "Heritiera littoralis", group: "Mangrove (Extended)" },
  { value: "nypa_fruticans", label: "Nypa fruticans (Invasive in West Africa — flag)", group: "Mangrove (Extended)", notes: "invasive" },

  // Moringa
  { value: "moringa_oleifera", label: "Moringa oleifera", group: "Moringa" },
  { value: "moringa_stenopetala", label: "Moringa stenopetala", group: "Moringa" },
  { value: "moringa_peregrina", label: "Moringa peregrina", group: "Moringa" },

  // Open category
  { value: "other_restoration", label: "Other / General restoration species", group: "Other restoration" },
];

export const SPECIES_GROUPS: SpeciesGroup[] = [
  "Mangrove (Primary)",
  "Mangrove (Extended)",
  "Moringa",
  "Other restoration",
];

export type SpeciesValue = string;

export function speciesLabel(v?: string | null): string {
  if (!v) return "—";
  return SPECIES.find((s) => s.value === v)?.label ?? v;
}

/** Map CanopyStride's 4 indicators to the 3 explicit ecological statuses. */
export type EcoStatus = "Healthy Adaptation" | "Hydrological Alert" | "Biomass Progress";

export function deriveEcoStatus(a: {
  waterlogging_pct?: number | null;
  scouring_severity?: "low" | "medium" | "high" | null;
  salinity_stress_pct?: number | null;
  canopy_health_pct?: number | null;
}): EcoStatus {
  const hydro = (a.waterlogging_pct ?? 0) >= 55 || a.scouring_severity === "high";
  if (hydro) return "Hydrological Alert";
  if ((a.canopy_health_pct ?? 0) >= 70) return "Biomass Progress";
  return "Healthy Adaptation";
}

export function threatLevel(healthScore: number, hydro: boolean): {
  label: "None - Healthy Adaptive Growth" | "Moderate - Scouring Action Needed" | "Critical - Root Rot Infestation";
  tone: "ok" | "warn" | "danger";
} {
  if (hydro && healthScore < 45) return { label: "Critical - Root Rot Infestation", tone: "danger" };
  if (hydro || healthScore < 60) return { label: "Moderate - Scouring Action Needed", tone: "warn" };
  return { label: "None - Healthy Adaptive Growth", tone: "ok" };
}

export function carbonMultiplierVector(healthScorePct: number): number {
  return +(1.85 * (healthScorePct / 100) * (0.85 + Math.random() * 0.15)).toFixed(3);
}

/** Suitability verdict for the site, derived from indicators. */
export type Suitability =
  | "Suitable"
  | "Marginal"
  | "Unsuitable for Mangroves & Moringa"
  | "Suitable for general restoration only";

export function deriveSuitability(a: {
  waterlogging_pct?: number | null;
  salinity_stress_pct?: number | null;
  canopy_health_pct?: number | null;
  scouring_severity?: "low" | "medium" | "high" | null;
}): { verdict: Suitability; reason: string } {
  const w = a.waterlogging_pct ?? 0;
  const s = a.salinity_stress_pct ?? 0;
  const c = a.canopy_health_pct ?? 0;
  const scour = a.scouring_severity ?? "low";

  if (w > 85 && scour === "high") {
    return {
      verdict: "Unsuitable for Mangroves & Moringa",
      reason: "Extreme waterlogging combined with severe tidal scouring will dislodge propagules and Moringa saplings before establishment.",
    };
  }
  if (s > 80) {
    return {
      verdict: "Suitable for general restoration only",
      reason: "Visible salinity stress is too high for Moringa; only salt-tolerant pioneers (Avicennia, Sesuvium) are viable here.",
    };
  }
  if (w > 65 || scour === "high" || c < 30) {
    return {
      verdict: "Marginal",
      reason: "Site shows stress markers; recommend pilot micro-plot before scaling.",
    };
  }
  return {
    verdict: "Suitable",
    reason: "Indicators fall within healthy planting envelopes for mangrove + Moringa restoration.",
  };
}

/** Humanized impact narrative for a healthy analysis. */
export function humanizeImpact(input: {
  species?: string | null;
  healthScore: number;
  hectares?: number;
  status: EcoStatus;
}): string {
  const label = speciesLabel(input.species);
  const jobs = Math.max(2, Math.round((input.hectares ?? 1) * 12 * (input.healthScore / 100)));
  if (input.status === "Biomass Progress" || (input.status === "Healthy Adaptation" && input.healthScore >= 65)) {
    return `AI Analysis Complete: This hectare of ${label} is thriving. This progress secures ~${jobs} local green jobs and protects the adjacent fishing community from coastal erosion.`;
  }
  if (input.status === "Hydrological Alert") {
    return `AI Analysis Complete: ${label} stand is under hydrological stress. Acting now safeguards ~${jobs} livelihoods downstream and prevents propagule loss in the next tide cycle.`;
  }
  return `AI Analysis Complete: ${label} stand is establishing. Continued monitoring will lock in ecological gains for ~${jobs} community members within the next planting season.`;
}
