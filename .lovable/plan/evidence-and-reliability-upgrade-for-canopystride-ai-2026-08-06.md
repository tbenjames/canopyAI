# Evidence and reliability upgrade for CanopyStride AI

Four workstreams that move the tool from "produces confident numbers" to "produces numbers we can defend, from photos worth analysing, showing change over time" — plus a shareable evaluation document for partners and funders.

## 1. Ground-truth correction loop

The core asset. Every analysis becomes a candidate training and validation sample.

**What the user sees**
- On any completed analysis, a "Verify this reading" panel for scientists and admins.
- Each indicator (site type, waterlogging, scouring, salinity, canopy health, species, invasives, bank integrity, water body, structural risk) shows the model value with three actions: confirm, correct, or mark not assessable.
- Corrections take the same value ranges as the model output, so nothing free-text drifts.
- A short note field for the reviewer, plus optional reviewer confidence.
- A new "Validation" section on the dashboard: samples reviewed, per-indicator agreement rate, and where the model most often disagrees with experts.

**Data**
- New `analysis_reviews` table: analysis id, reviewer, per-indicator corrected values as JSON, reviewer note, reviewer confidence, created and updated timestamps.
- Read access to reviewers of that analysis plus staff; write access limited to scientist and admin roles via the existing `is_staff` / `has_role` pattern.
- Agreement rates computed from a database view so the dashboard reads one query, not client-side maths.

**Rule that matters:** the homepage accuracy figures should switch from model self-reported bands to measured agreement rate once a threshold sample size is reached. Until then they are labelled as provisional benchmark bands with the sample size shown.

## 2. Image quality pre-flight gate

Stop bad frames before they cost a credit and before they pollute the ground-truth set.

- Client-side checks on the selected photo before upload: resolution floor, blur estimate (Laplacian variance on a downscaled canvas), brightness and exposure range, and a warning when the frame is mostly sky or mostly a single flat colour.
- Result shown as a traffic light with a plain reason ("Too blurry to score canopy — retake steadier") and a "Retake" button. A soft gate: amber lets the user proceed with an acknowledgement, red blocks.
- The quality score is stored on the upload so poor frames can be excluded from accuracy statistics later.
- Analysis prompt receives the quality flags so the model lowers confidence consistently rather than guessing.

## 3. Change detection over time

Turns isolated readings into the progress evidence donors actually verify.

- Plot detail page gains a timeline: each analysis for that plot in date order with indicator sparklines (canopy health, waterlogging, salinity, invasive cover).
- A "Compare" view: pick two analyses on the same plot, see side-by-side images and a delta table with direction and magnitude per indicator.
- A plot-level trend summary written in plain language from the deltas (deterministic, from thresholds, not model prose): improving, stable, or declining, with the strongest driver named.
- Alerts extended with a trend rule: sustained canopy decline across three consecutive readings raises an alert even when no single reading crosses the absolute threshold.

## 4. Downloadable evaluation document

A branded PDF for partners, research collaborators and funders, generated from this evaluation:

- Architecture and data flow, AI processing layers, core functionality, models in use.
- Technical efficiency assessment, risk register and failure modes.
- The intelligence roadmap, with the validation loop as the headline commitment.
- Live figures pulled at generation time (analyses completed, sites, indicators covered) so the document reflects real state rather than claims.
- Delivered as a downloadable file, matching the CanopyStride dark ecological brand.

## Technical notes

- New table via migration with grants, RLS and an updated-at trigger, following existing project conventions.
- Review writes go through a new `src/lib/reviews.functions.ts` server function with `requireSupabaseAuth`, role-checked before writing; scientific fields stay unforgeable from the client.
- Quality gate is pure client-side presentation logic in `src/lib/image-quality.ts` plus UI in `upload.tsx`; the quality score column is added to `uploads`.
- Change detection is read-only over existing `analyses` rows — no schema change beyond an index on `(plot_id, created_at)`.
- Trend alerts reuse the existing `alerts` table and `alert_kind` enum where possible; a new kind is added only if needed.
- Homepage `CapabilityShowcase` gains a sample-size and provisional label; percentages become data-driven once measured agreement exists.

## Build order

1. Migration for `analysis_reviews`, upload quality column, index.
2. Review server function and verification UI.
3. Validation dashboard and homepage accuracy labelling.
4. Image quality gate.
5. Plot timeline, compare view and trend alerts.
6. Evaluation PDF.
