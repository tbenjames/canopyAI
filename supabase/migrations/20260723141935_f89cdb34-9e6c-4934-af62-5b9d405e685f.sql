
ALTER TABLE public.payment_failures RENAME COLUMN paddle_transaction_id TO provider_transaction_id;
ALTER TABLE public.payment_failures ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'stripe';
UPDATE public.payment_failures SET provider = 'paddle' WHERE provider = 'stripe' AND environment IN ('sandbox','live');
