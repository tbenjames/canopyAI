// Server-only Stripe helpers. Never import from client bundles.
import Stripe from "stripe";

let _client: Stripe | null = null;
export function getStripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _client = new Stripe(key, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  return _client;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  description: string;
}

// Single source of truth for credit packs, keyed by short id. Used by both
// the checkout server fn (to build inline price_data) and the billing UI.
export const CREDIT_PACKS: Record<string, CreditPack> = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 20,
    priceUsd: 9,
    description: "20 photo analyses for solo monitors piloting the tool.",
  },
  field: {
    id: "field",
    name: "Field",
    credits: 100,
    priceUsd: 39,
    description: "A month of restoration monitoring for one community team.",
  },
  restoration: {
    id: "restoration",
    name: "Restoration",
    credits: 500,
    priceUsd: 149,
    description: "Multi-site programmes and institutional deployments.",
  },
};

export function getCreditPack(id: string): CreditPack {
  const p = CREDIT_PACKS[id];
  if (!p) throw new Error(`Unknown credit pack: ${id}`);
  return p;
}
