// Identity ↔ role mapping for CanopyStride AI
// Users choose one of three identities at sign-up; it becomes their permanent role.

export type Identity = "field_worker" | "scientist" | "donor";

export interface IdentityConfig {
  id: Identity;
  label: string;
  tagline: string;
  description: string;
  icon: "sprout" | "microscope" | "heart";
}

export const IDENTITIES: IdentityConfig[] = [
  {
    id: "field_worker",
    label: "Frontline Youth Monitors & Local Communities",
    tagline: "Capture · Monitor · Report",
    description:
      "For youth stewards, village monitors, and community groups uploading field photos from restoration plots.",
    icon: "sprout",
  },
  {
    id: "scientist",
    label: "Advanced Field Ecologists & Restorers",
    tagline: "Analyse · Verify · Advise",
    description:
      "For ecologists, agronomists, and restoration leads validating telemetry, tuning models, and issuing recommendations.",
    icon: "microscope",
  },
  {
    id: "donor",
    label: "Grant Donors & Support Institutions",
    tagline: "Fund · Track · Attribute",
    description:
      "For grant makers, foundations, and support institutions tracking outcomes and impact across funded sites.",
    icon: "heart",
  },
];

export function identityLabel(id: string | null | undefined): string {
  return IDENTITIES.find((i) => i.id === id)?.label ?? "Team member";
}

export function isIdentity(v: string | null | undefined): v is Identity {
  return v === "field_worker" || v === "scientist" || v === "donor";
}
