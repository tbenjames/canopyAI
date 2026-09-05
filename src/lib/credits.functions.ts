import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Return credit balance and recent ledger for the signed-in user.
export const getCreditsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("evaluation_credits, account_tier")
      .eq("id", userId)
      .maybeSingle();

    const { data: ledger } = await supabase
      .from("credit_ledger")
      .select("id, amount, action_type, created_at, metadata")
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = ledger ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const usedThisMonth = rows
      .filter((r) => new Date(r.created_at) >= monthStart && r.amount < 0)
      .reduce((sum, r) => sum + Math.abs(r.amount), 0);
    const addedThisMonth = rows
      .filter((r) => new Date(r.created_at) >= monthStart && r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      balance: profile?.evaluation_credits ?? 0,
      tier: profile?.account_tier ?? "trial",
      usedThisMonth,
      addedThisMonth,
      ledger: rows,
    };
  });

// List unresolved payment failures for the signed-in user (for the billing banner).
export const listPaymentFailures = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("payment_failures")
      .select("id, provider_transaction_id, reason, created_at, provider")
      .eq("user_id", userId)
      .is("resolved_at", null)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// Let a user dismiss a failure banner after they have addressed it.
export const dismissPaymentFailure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("payment_failures")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });
