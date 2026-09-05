// Untyped table access helper. The generated Database type is empty because
// types.ts is auto-managed; we add domain types here.
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as unknown as SupabaseClient<any, "public", any>;

export type SpeciesFocus = "mangrove" | "moringa" | "mixed";
export type Severity = "low" | "medium" | "high";
export type UploadKind = "photo" | "video";
export type AnalysisStatus = "pending" | "processing" | "complete" | "failed";
export type AppRole = "admin" | "scientist" | "field_worker";

export interface Site {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  species_focus: SpeciesFocus;
  center_lat: number | null;
  center_lng: number | null;
  created_at: string;
}
export interface Plot {
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  center_lat: number;
  center_lng: number;
  radius_m: number;
  planted_at: string | null;
  created_at: string;
}
export type LocationSource = "exif" | "device_gps" | "manual_pin" | "none";
export interface Upload {
  id: string;
  plot_id: string | null;
  uploaded_by: string;
  kind: UploadKind;
  storage_path: string;
  captured_lat: number | null;
  captured_lng: number | null;
  captured_at: string | null;
  notes: string | null;
  location_source: LocationSource | null;
  quality_score_pct?: number | null;
  quality_flags?: string[] | null;
  created_at: string;
}
export interface Analysis {
  id: string;
  upload_id: string;
  plot_id: string | null;
  status: AnalysisStatus;
  waterlogging_pct: number | null;
  scouring_severity: Severity | null;
  salinity_stress_pct: number | null;
  canopy_health_pct: number | null;
  overall_confidence_pct: number | null;
  risk_level: Severity | null;
  rationale: string | null;
  suggested_action: string | null;
  model: string | null;
  error: string | null;
  created_at: string;
  site_type?: string | null;
  detected_species?: string | null;
  establishment_stage?: string | null;
  invasive_present?: boolean | null;
  invasive_coverage_pct?: number | null;
  bank_integrity?: string | null;
  water_body_condition?: string | null;
  structural_risk?: Severity | null;
}
export interface Alert {
  id: string;
  plot_id: string;
  analysis_id: string | null;
  kind: "waterlogging" | "scouring" | "salinity" | "canopy_decline";
  severity: Severity;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data } = await db.storage.from("restoration-media").createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
