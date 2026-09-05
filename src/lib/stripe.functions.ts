import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getStripe, getCreditPack, CREDIT_PACKS } from "@/lib/stripe.server";

const originHeader = (req: Request): string => {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
};

// Create a Stripe Checkout Session for a one-time credit pack purchase.
// Uses inline price_data so no Stripe dashboard products need pre-creating.
export const createCreditCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ packId: z.enum(Object.keys(CREDIT_PACKS) as [string, ...string[]]) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { userId, claims } = context;
    const pack = getCreditPack(data.packId);
    const stripe = getStripe();
    const { getRequest } = await import("@tanstack/react-start/server");
    const origin = originHeader(getRequest());

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      customer_email: (claims as { email?: string } | undefined)?.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pack.priceUsd * 100,
            product_data: {
              name: `CanopyStride AI · ${pack.name} pack`,
              description: `${pack.credits} evaluation credits. ${pack.description}`,
            },
          },
        },
      ],
      metadata: {
        userId,
        packId: pack.id,
        credits: String(pack.credits),
      },
      payment_intent_data: {
        metadata: {
          userId,
          packId: pack.id,
          credits: String(pack.credits),
        },
      },
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
      allow_promotion_codes: false,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

// Called by /billing/success. Fetches the session from Stripe and, if paid
// and not yet credited, applies the grant. Belt-and-braces against a delayed
// webhook so users see credits within seconds of returning from Checkout.
export const reconcileStripeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<{ credited: boolean; credits: number }> => {
    const { userId } = context;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.client_reference_id !== userId) {
      throw new Error("Session does not belong to the signed-in user");
    }
    if (session.payment_status !== "paid") return { credited: false, credits: 0 };

    const credits = Number(session.metadata?.credits ?? 0);
    const packId = session.metadata?.packId ?? "";
    if (!credits || !packId) return { credited: false, credits: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("credit_ledger")
      .select("id")
      .contains("metadata", { stripe_session_id: session.id })
      .maybeSingle();
    if (existing) return { credited: false, credits };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.rpc as any)("add_credits", {
      _user: userId,
      _amount: credits,
      _action: "purchase",
      _meta: {
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        packId,
        source: "reconcile",
      },
    });
    if (error) throw error;
    return { credited: true, credits };
  });
