CREATE TABLE public.payment_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_transaction_id text NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (paddle_transaction_id)
);

GRANT SELECT, UPDATE ON public.payment_failures TO authenticated;
GRANT ALL ON public.payment_failures TO service_role;

ALTER TABLE public.payment_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment failures"
  ON public.payment_failures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss own payment failures"
  ON public.payment_failures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_payment_failures_user_unresolved
  ON public.payment_failures(user_id) WHERE resolved_at IS NULL;

CREATE INDEX idx_credit_ledger_adjustment
  ON public.credit_ledger((metadata->>'paddle_adjustment_id'))
  WHERE metadata ? 'paddle_adjustment_id';