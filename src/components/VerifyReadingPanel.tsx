import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, PencilLine, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDICATORS, type Verdict, type Verdicts } from "@/lib/indicators";
import { getAnalysisReviews, getCanVerify, saveAnalysisReview } from "@/lib/reviews.functions";
import { SPECIES } from "@/lib/taxonomy";

type ModelValues = Record<string, unknown>;

function displayValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  return String(v).replace(/_/g, " ");
}

export function VerifyReadingPanel({ analysisId, modelValues }: { analysisId: string; modelValues: ModelValues }) {
  const qc = useQueryClient();
  const canVerifyFn = useServerFn(getCanVerify);
  const listFn = useServerFn(getAnalysisReviews);
  const saveFn = useServerFn(saveAnalysisReview);

  const { data: perm } = useQuery({ queryKey: ["can-verify"], queryFn: () => canVerifyFn({}) });
  const { data: existing } = useQuery({
    queryKey: ["analysis-reviews", analysisId],
    queryFn: () => listFn({ data: { analysisId } }),
    enabled: Boolean(perm?.canVerify),
  });

  const mine = useMemo(() => {
    const row = existing?.reviews.find((r) => r.reviewer_id === existing.myReviewerId);
    return (row?.verdicts ?? {}) as unknown as Verdicts;
  }, [existing]);

  const [verdicts, setVerdicts] = useState<Verdicts | null>(null);
  const [note, setNote] = useState("");
  const [confidence, setConfidence] = useState<string>("");

  const current: Verdicts = verdicts ?? mine;

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          analysisId,
          verdicts: current,
          note: note.trim() || undefined,
          reviewerConfidencePct: confidence ? Number(confidence) : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Verification saved. It now counts towards measured accuracy.");
      qc.invalidateQueries({ queryKey: ["analysis-reviews", analysisId] });
      qc.invalidateQueries({ queryKey: ["agreement-rates"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  if (!perm?.canVerify) return null;

  function setVerdict(key: string, next: Verdict) {
    setVerdicts({ ...current, [key]: next });
  }

  const reviewedCount = Object.keys(current).length;

  return (
    <div className="mt-6 rounded-2xl border bg-card p-5" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-[#1A3622]" /> Verify this reading
        </h2>
        <span className="text-xs text-muted-foreground">{reviewedCount} of {INDICATORS.length} indicators checked</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirm what the model got right, correct what it got wrong, and mark anything the frame could not support. Every
        check builds the ground-truth record behind our published accuracy.
      </p>

      <div className="mt-4 divide-y" style={{ borderColor: "#E2E8F0" }}>
        {INDICATORS.map((ind) => {
          const v = current[ind.key];
          const modelValue = modelValues[ind.key];
          return (
            <div key={ind.key} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-medium">{ind.label}</p>
                <p className="text-xs text-muted-foreground">
                  Model read: <span className="font-medium text-foreground">{displayValue(modelValue)}</span>
                  {ind.kind === "pct" && modelValue !== null && modelValue !== undefined ? "%" : ""}
                </p>
                {v?.status === "corrected" && (
                  <div className="mt-2 max-w-xs">
                    <CorrectionInput
                      indicatorKey={ind.key}
                      kind={ind.kind}
                      options={ind.options}
                      value={v.value ?? ""}
                      onChange={(value) => setVerdict(ind.key, { status: "corrected", value })}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <VerdictButton
                  active={v?.status === "confirmed"}
                  onClick={() => setVerdict(ind.key, { status: "confirmed" })}
                  icon={<Check className="h-3.5 w-3.5" />}
                  label="Confirm"
                />
                <VerdictButton
                  active={v?.status === "corrected"}
                  onClick={() => setVerdict(ind.key, { status: "corrected", value: v?.value ?? "" })}
                  icon={<PencilLine className="h-3.5 w-3.5" />}
                  label="Correct"
                />
                <VerdictButton
                  active={v?.status === "not_assessable"}
                  onClick={() => setVerdict(ind.key, { status: "not_assessable" })}
                  icon={<EyeOff className="h-3.5 w-3.5" />}
                  label="Not assessable"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <Label htmlFor="review-note">Reviewer note (optional)</Label>
          <Textarea
            id="review-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What the model missed, and what you saw on the ground…"
          />
        </div>
        <div>
          <Label htmlFor="review-confidence">Your confidence (%)</Label>
          <Input
            id="review-confidence"
            type="number"
            min={0}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            placeholder="e.g. 90"
          />
        </div>
      </div>

      <Button
        className="mt-4 w-full sm:w-auto"
        onClick={() => save.mutate()}
        disabled={save.isPending || reviewedCount === 0}
      >
        {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save verification
      </Button>
    </div>
  );
}

function VerdictButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      aria-pressed={active}
      className="gap-1 text-xs"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function CorrectionInput({
  indicatorKey,
  kind,
  options,
  value,
  onChange,
}: {
  indicatorKey: string;
  kind: string;
  options?: { value: string; label: string }[];
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean) => void;
}) {
  if (kind === "pct") {
    return (
      <Input
        type="number"
        min={0}
        max={100}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="Corrected %"
        aria-label="Corrected percentage"
      />
    );
  }
  if (kind === "bool") {
    return (
      <Select value={value === true ? "true" : value === false ? "false" : ""} onValueChange={(v) => onChange(v === "true")}>
        <SelectTrigger aria-label="Corrected value"><SelectValue placeholder="Corrected value" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  const list = options ?? (indicatorKey === "detected_species"
    ? SPECIES.map((s) => ({ value: s.value, label: s.label }))
    : []);
  return (
    <Select value={typeof value === "string" ? value : ""} onValueChange={onChange}>
      <SelectTrigger aria-label="Corrected value"><SelectValue placeholder="Corrected value" /></SelectTrigger>
      <SelectContent>
        {list.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
