# CanopyStride AI: multi-use analysis, credits, and sign-in code fixes

Three fixes from field testing: broaden what the AI actually assesses, stop analyses failing on credits, and make the emailed sign-in code match what the app expects.

## 1. Multi-use ecological analysis

Today the analysis returns four indicators only (waterlogging, scouring, salinity, canopy health) and never names the species or flags invasives. Expand it so one upload covers natural and artificial ponds, swamps, mangrove fringe, and Moringa belts.

New outputs added to the AI result:
- Site type: natural pond, artificial pond, swamp/marsh, intertidal mudflat, mangrove fringe, terrestrial agroforest, other
- Species identification: best-match species from the existing CanopyStride species list, plus a confidence value and up to two alternates; "unidentified" is allowed
- Early species detection: seedling/propagule presence and rough establishment stage
- Weed and invasive encroachment: presence, estimated coverage percent, and named suspects (Nypa fruticans flagged as invasive in West Africa, plus water hyacinth, typha, and similar aquatic weeds)
- Structural health: bank/bund integrity, water body condition (open water, algal bloom, stagnation, sedimentation), and a structural risk rating

The prompt is rewritten to instruct the model to first classify the scene type, then only score the indicators that scene supports, and to say clearly when an indicator is not visible instead of guessing. Confidence stays honest for blurry, dark, or badly framed photos.

Where the new results show up:
- Diagnostics view: new cards for site type, identified species, invasive encroachment, and structural health alongside the existing four indicators
- Alerts: a new invasive-encroachment alert when coverage is high or a flagged invasive is named, and a structural alert for compromised banks/bunds
- Species field: when the user did not pick a species, the detected species is shown as a suggestion rather than silently overwriting their choice

## 2. Credits no longer block a finished analysis

The current flow deducts credits up front and the starting balance is 5, so a short test session runs dry mid-run and the user is left without a completed analysis.

Changes:
- Raise the starting balance for new and existing trial accounts so a full test session completes
- Keep photo and video costs proportionate but affordable relative to the new balance
- Deduct only after the analysis completes successfully; failures cost nothing, which also removes the refund race that field testing hit
- Show the cost and remaining balance in the upload screen before the user submits, and give a clear "not enough credits" message with a top-up link instead of a mid-run failure

## 3. Sign-in verification code length

The email currently carries an eight-digit code while the sign-in screen only accepts six digits, so the code cannot be pasted and only the link works.

Fix:
- Set the authentication one-time-code length to six digits so the emailed code matches the app
- Make the sign-in field tolerant: it accepts a pasted code, trims spaces, and submits automatically when a full-length code is entered
- Keep the magic link working as a fallback, and keep the code and link visually distinct in the email

## Technical notes

- Analysis changes live in `src/lib/analysis.functions.ts` (JSON schema, system prompt, alert generation) with new display fields in the diagnostics UI; new columns on `analyses` are added by migration with the usual grants and policies
- Species matching reuses `src/lib/taxonomy.ts` so detection stays inside the supported mangrove/Moringa vocabulary
- Credit changes touch the default in the profiles schema, a one-off top-up for existing trial accounts, and the deduct ordering in the analysis handler
- Code length is an auth-provider setting change; `src/routes/auth.tsx` handles paste/trim/auto-submit
