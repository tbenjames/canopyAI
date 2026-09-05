import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export type TerminalStage = { label: string; ms?: number };

export function IngestionTerminal({
  active,
  stages,
  done,
}: {
  active: boolean;
  stages: TerminalStage[];
  done?: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) { setIdx(0); return; }
    if (done) { setIdx(stages.length); return; }
    let cancelled = false;
    let i = 0;
    setIdx(0);
    const tick = () => {
      if (cancelled) return;
      if (i >= stages.length - 1) { setIdx(stages.length - 1); return; }
      i += 1;
      setIdx(i);
      setTimeout(tick, stages[i]?.ms ?? 900);
    };
    setTimeout(tick, stages[0]?.ms ?? 800);
    return () => { cancelled = true; };
  }, [active, done, stages]);

  if (!active && !done) return null;

  return (
    <div className="rounded-lg border bg-[#0b1410] p-4 font-mono text-xs text-emerald-200" style={{ borderColor: "#1A3622" }}>
      <div className="mb-2 flex items-center gap-2 text-emerald-300/80">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        terrapulse · ingestion pipeline
      </div>
      {stages.map((s, i) => {
        const status = i < idx || done ? "done" : i === idx ? "active" : "pending";
        return (
          <div key={i} className="flex items-start gap-2 py-0.5">
            {status === "done" && <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-400" />}
            {status === "active" && <Loader2 className="h-3.5 w-3.5 mt-0.5 animate-spin text-amber-300" />}
            {status === "pending" && <span className="mt-1 h-2 w-2 rounded-full bg-emerald-900" />}
            <span className={status === "pending" ? "opacity-40" : ""}>
              <span className="text-emerald-500">$</span> {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
