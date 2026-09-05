import type { EcoStatus, Suitability } from "./taxonomy";

export interface Recommendation {
  landscape_cover: string;
  unit_scale: string;
  timeline_6_12_months: string;
  immediate_action: string;
}

export function buildRecommendation(input: {
  status: EcoStatus;
  suitability: Suitability;
  hectares?: number;
  species?: string | null;
}): Recommendation {
  const ha = input.hectares ?? 0.4;
  const unit = ha < 0.5 ? `${ha.toFixed(2)} ha micro-plot` : ha < 5 ? `${ha.toFixed(1)} ha pilot block` : `${ha.toFixed(0)} ha landscape block`;
  const isMoringa = (input.species ?? "").includes("moringa");

  const landscape =
    input.status === "Hydrological Alert"
      ? "Saturated intertidal substrate · prop-root exposure visible"
      : input.status === "Biomass Progress"
      ? "Closed-canopy fringe mangrove · stable substrate"
      : isMoringa
      ? "Coastal terrestrial agroforest belt"
      : "Open intertidal mudflat with pioneer cover";

  if (input.suitability === "Unsuitable for Mangroves & Moringa") {
    return {
      landscape_cover: landscape,
      unit_scale: unit,
      timeline_6_12_months: "Pause planting for 6 months; deploy bank stabilization (brushwood groynes) and re-survey after the next dry season.",
      immediate_action: "Halt nursery transplants. Redirect crew to bund repair and erosion-control structures upstream of the plot.",
    };
  }

  if (input.status === "Hydrological Alert") {
    return {
      landscape_cover: landscape,
      unit_scale: unit,
      timeline_6_12_months: "Months 1–3: regrade micro-topography. Months 4–9: enrichment planting with Avicennia germinans pioneers. Months 10–12: re-survey canopy + salinity.",
      immediate_action: "Inspect bank stability and check for exposed Rhizophora prop-roots before the next tide cycle. Reinforce upstream silt traps within 72 hours.",
    };
  }

  if (input.status === "Biomass Progress") {
    return {
      landscape_cover: landscape,
      unit_scale: unit,
      timeline_6_12_months: "Months 1–6: maintenance pruning + invasive Nypa removal. Months 7–12: expand buffer by 15% with mixed Rhizophora + Laguncularia.",
      immediate_action: "Schedule monthly canopy photo-monitoring. Begin baseline carbon stock measurement for donor verification.",
    };
  }

  return {
    landscape_cover: landscape,
    unit_scale: unit,
    timeline_6_12_months: "Months 1–4: complete propagule planting at 1m × 1m spacing. Months 5–8: weed clearing + replacement of failed transplants. Months 9–12: first canopy survey.",
    immediate_action: "Confirm nursery stock health and water trial micro-plot for 4 weeks before scaling to the full block.",
  };
}
