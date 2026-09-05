import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any, any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): SupabaseClient<any, any> {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

const SITE_NAME = "CanopyStride AI";
const FROM_DOMAIN = "canopystride.dev";
const SENDER_DOMAIN = "notify.canopystride.dev";
const ROOT_URL = "https://canopystride.dev";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enqueueEmail(supabase: any, to: string, subject: string, heading: string, bodyHtml: string, label: string) {
  if (!to) return;
  const messageId = crypto.randomUUID();
  const html = `<!doctype html><html><body style="font-family:Inter,system-ui,sans-serif;background:#f7f7f5;padding:24px;color:#1A3622">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e7eb">
    <h1 style="font-size:20px;margin:0 0 12px 0;color:#1A3622">${heading}</h1>
    <div style="font-size:14px;line-height:1.6;color:#334155">${bodyHtml}</div>
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b">
      <a href="${ROOT_URL}/billing" style="color:#1A3622">Open Billing</a> &middot; ${SITE_NAME}
    </div>
  </div></body></html>`;
  const text = `${heading}\n\n${bodyHtml.replace(/<[^>]+>/g, "")}\n\nOpen billing: ${ROOT_URL}/billing`;
  try {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: label,
      recipient_email: to,
      status: "pending",
    });
    await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        run_id: crypto.randomUUID(),
        message_id: messageId,
        to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label,
        queued_at: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("[stripe-webhook] email enqueue failed", label, e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserEmail(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
  return (data?.email as string | undefined) ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const userId = session.metadata?.userId || session.client_reference_id || "";
  const credits = Number(session.metadata?.credits ?? 0);
  const packId = session.metadata?.packId ?? "";
  if (!userId || !credits) {
    console.warn("[stripe-webhook] checkout.session.completed missing metadata", session.id);
    return;
  }
  const supabase = getSupabase();

  // Idempotency by session id.
  const { data: existing } = await supabase
    .from("credit_ledger")
    .select("id")
    .contains("metadata", { stripe_session_id: session.id })
    .maybeSingle();
  if (existing) {
    console.log("[stripe-webhook] session already credited", session.id);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("add_credits", {
    _user: userId,
    _amount: credits,
    _action: "purchase",
    _meta: {
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      packId,
    },
  });
  if (error) {
    console.error("[stripe-webhook] add_credits failed", error, session.id);
    throw error;
  }

  const piId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (piId) {
    await supabase
      .from("payment_failures")
      .update({ resolved_at: new Date().toISOString() })
      .eq("provider_transaction_id", piId)
      .is("resolved_at", null);
  }

  const email = await getUserEmail(supabase, userId);
  if (email) {
    await enqueueEmail(
      supabase,
      email,
      `Your ${credits} CanopyStride credits are ready`,
      "Payment received",
      `<p>We just added <strong>${credits} credits</strong> to your account.</p>
       <p>Pack: ${packId}</p>
       <p>Head to the dashboard whenever you are ready to analyze more field uploads.</p>`,
      "purchase_receipt",
    );
  }
  console.log(`[stripe-webhook] granted ${credits} credits to ${userId} (${session.id})`);
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const userId = pi.metadata?.userId;
  if (!userId) return;
  const supabase = getSupabase();
  const reason =
    pi.last_payment_error?.decline_code ||
    pi.last_payment_error?.code ||
    pi.last_payment_error?.message ||
    "declined";

  await supabase
    .from("payment_failures")
    .upsert(
      {
        user_id: userId,
        provider: "stripe",
        provider_transaction_id: pi.id,
        environment: pi.livemode ? "live" : "sandbox",
        reason,
      },
      { onConflict: "provider_transaction_id" },
    );
  console.warn(`[stripe-webhook] payment failed for ${userId} (${pi.id}): ${reason}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;
  const supabase = getSupabase();

  // Idempotency by charge id.
  const { data: existing } = await supabase
    .from("credit_ledger")
    .select("id")
    .contains("metadata", { stripe_charge_id: charge.id, stripe_event: "refund" })
    .maybeSingle();
  if (existing) return;

  const { data: original } = await supabase
    .from("credit_ledger")
    .select("id, user_id, amount")
    .contains("metadata", { stripe_payment_intent: piId })
    .eq("action_type", "purchase")
    .maybeSingle();
  if (!original || !original.user_id) {
    console.warn("[stripe-webhook] refund without matching purchase", charge.id, piId);
    return;
  }

  const reverseAmount = Math.abs(original.amount as number);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("add_credits", {
    _user: original.user_id,
    _amount: -reverseAmount,
    _action: "refund_reversal",
    _meta: {
      stripe_charge_id: charge.id,
      stripe_payment_intent: piId,
      stripe_event: "refund",
      amount_refunded: charge.amount_refunded,
    },
  });
  if (error) {
    console.error("[stripe-webhook] refund reversal failed", error, charge.id);
    throw error;
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("evaluation_credits")
    .eq("id", original.user_id)
    .maybeSingle();
  if (prof && (prof.evaluation_credits as number) < 0) {
    await supabase.from("profiles").update({ evaluation_credits: 0 }).eq("id", original.user_id);
  }

  const email = await getUserEmail(supabase, original.user_id as string);
  if (email) {
    await enqueueEmail(
      supabase,
      email,
      `Refund processed on your CanopyStride purchase`,
      "Refund confirmed",
      `<p>Your recent purchase has been refunded. We removed <strong>${reverseAmount} credits</strong> from your account to match.</p>
       <p>If you believe this was a mistake, reply to this email or contact <a href="mailto:supprttmrnhinitiative@gmail.com">supprttmrnhinitiative@gmail.com</a>.</p>`,
      "refund_notice",
    );
  }
  console.log(`[stripe-webhook] reversed ${reverseAmount} credits for ${original.user_id} (charge ${charge.id})`);
}

async function handleDispute(dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
  const supabase = getSupabase();
  const stripeSecret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const charge = await stripe.charges.retrieve(chargeId);
  await handleChargeRefunded({ ...charge, amount_refunded: charge.amount } as Stripe.Charge);
}

export const Route = createFileRoute("/api/public/payments/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const stripeSecret = process.env.STRIPE_SECRET_KEY;
        if (!secret || !stripeSecret) {
          console.error("[stripe-webhook] missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY");
          return new Response("Server misconfigured", { status: 500 });
        }
        const signature = request.headers.get("stripe-signature") ?? "";
        const rawBody = await request.text();

        let event: Stripe.Event;
        try {
          const stripe = new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
          event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
        } catch (e) {
          console.error("[stripe-webhook] signature verify failed", e);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
              await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
              break;
            case "checkout.session.async_payment_failed":
            case "payment_intent.payment_failed":
              await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
              break;
            case "charge.refunded":
              await handleChargeRefunded(event.data.object as Stripe.Charge);
              break;
            case "charge.dispute.created":
            case "charge.dispute.closed":
              await handleDispute(event.data.object as Stripe.Dispute);
              break;
            default:
              console.log("[stripe-webhook] unhandled event:", event.type);
          }
        } catch (e) {
          console.error("[stripe-webhook] handler error", event.type, e);
          // Return 200 to avoid Stripe retry-storming on transient issues that already logged.
          // Signature failures above return 400 so Stripe retries.
        }
        return Response.json({ received: true });
      },
    },
  },
});
