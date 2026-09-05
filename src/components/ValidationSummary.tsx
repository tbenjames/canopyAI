import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical } from "lucide-react";
import { getAgreementRates } from "@/lib/reviews.functions";
import { indicatorLabel } from "@/lib/indicators";

const MIN_SAMPLE = 30;

export function ValidationSummary() {
  const fn = useServerFn(getAgreementRates);
  const { data, isLoading } = useQuery({ queryKey: ["agreement-rates"], queryFn: () => fn({}) });

  const rates = [...(data?.rates ?? [])].sort((a, b) => (b.reviewed_count ?? 0) - (a.reviewed_count ?? 0));
  const totalChecks = rates.reduce((s, r) => s + (r.reviewed_count ?? 0), 0);

  return (
    <div className="rounded-2xl border bg-card p-5" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
            <FlaskConical className="h-5 w-5 text-[#1A3622]" /> Validation, measured against experts
          </h2>
          <p className="text-xs text-muted-foreground">
            Agreement between the model and a reviewing ecologist. This is the accuracy we can defend, not model self-scoring.
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold tabular-nums">{data?.reviewedAnalyses ?? 0}</p>
          <p className="text-xs text-muted-foreground">analyses reviewed · {totalChecks} indicator checks</p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading validation data…</p>
      ) : rates.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No expert verifications recorded yet. Open any completed analysis and use "Verify this reading" to start the
          ground-truth record.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rates.map((r) => {
            const pct = r.agreement_pct ?? 0;
            const provisional = (r.reviewed_count ?? 0) < MIN_SAMPLE;
            return (
              <div key={r.indicator}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{indicatorLabel(r.indicator ?? "")}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {pct}% agreement · n={r.reviewed_count}
                    {provisional && <span className="ml-1 text-[#7a4f0a]">provisional</span>}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: pct >= 80 ? "#2f6d4f" : pct >= 60 ? "#c08838" : "#c0443b" }}
                  />
                </div>
                {(r.corrected_count ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.corrected_count} corrected · {r.not_assessable_count} marked not assessable
                  </p>
                )}
              </div>
            );
          })}
          <p className="pt-2 text-xs text-muted-foreground">
            Indicators below {MIN_SAMPLE} checks are labelled provisional. Published accuracy figures switch from benchmark
            bands to these measured rates once that threshold is passed.
          </p>
        </div>
      )}
    </div>
  );
}
