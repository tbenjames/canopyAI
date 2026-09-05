# Open access, new capability showcase, and analysis fix

## 1. Fix "Failed to create analysis row" (root cause confirmed)

The `analyses` table has an insert rule that blocks every client-side insert (added during an earlier security hardening pass). The analysis code still creates the row with the signed-in user's connection, so every analysis fails at the very first step before the AI is ever called.

Fix: create the analysis row with the privileged server connection (the same one already used to write the results), after first confirming the upload belongs to the signed-in user. No change to the security rules is needed, so the hardening stays intact.

## 2. Remove credits and pricing from the product

- Delete the Credits/Billing pages (`/billing`, `/billing/success`) and the `/pricing` page.
- Remove the "Credits" nav item, the header credit chip, and the footer "Buy credits" link.
- Remove the credit line under the analyse button ("This analysis costs 1 credit. Balance: 5...") and the low-balance warning.
- Remove pricing and billing entries from the sitemap; drop the credit-cost sentence from any remaining copy.
- Stripe checkout code and the webhook route stay in the repo but are no longer linked from the UI, so payments can be switched back on later without rebuilding.

## 3. Open access: 200 credits per user per month

Keep the credit ledger as an internal usage counter, but make it non-blocking for users:

- Set new and existing accounts to a 200 monthly allowance.
- Add a monthly top-up: when an account's last refill was in a previous month, its balance resets to 200 on the next analysis. No payment path required.
- The analyse flow no longer blocks on balance; usage is still logged for internal reporting.

## 4. Home page: full capability showcase

Replace the four-tile block (Waterlogging / Scouring / Salinity / Canopy health) with a richer, animated capability panel covering everything the tool actually reports:

- Site classification (natural pond, artificial pond, swamp/marsh, mudflat, mangrove fringe, agroforest)
- Waterlogging and ponding extent
- Tidal scouring and erosion
- Salinity stress proxy
- Canopy and seedling health
- Species detection (mangrove and Moringa taxonomy)
- Seedling and early-establishment stage
- Weed and invasive encroachment, including Nypa and water hyacinth
- Bank, bund and pond-wall integrity
- Water body condition
- Overall structural risk and confidence

Design: a layered card grid on a deep canopy-green gradient with soft glass surfaces, staggered fade-and-rise entrance, animated accuracy rings that count up on scroll, and subtle hover elevation. Every displayed accuracy value sits at 79% or above. Reduced-motion users get the static version.

## 5. Home page logo

Replace the Sprout lucide icon plus text lockup in the header with the CanopyStride logo asset already in the project, sized for the header and with proper alt text.

## Technical notes

- Analysis insert moves to `supabaseAdmin` inside `src/lib/analysis.functions.ts` with an ownership check on the upload.
- Monthly allowance handled by a database migration: update the new-user function default to 200, backfill existing profiles, add a `credits_period_start` column and a refill helper called from the analysis path.
- Routes deleted: `src/routes/_authenticated/billing.tsx`, `billing.success.tsx`, `src/routes/pricing.tsx`. Links removed from `AppShell`, `SiteFooter`, landing page and sitemap. `CreditMeter` component removed.
- New home page section built as its own component with Tailwind tokens; no hardcoded colour utilities outside the brand tokens.

## Also fixing

A pre-existing type error in the date picker component (`src/components/ui/calendar.tsx`) breaks the build; it will be corrected as part of this work.
