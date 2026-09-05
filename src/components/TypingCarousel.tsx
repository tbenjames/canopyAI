import { useEffect, useState } from "react";

interface Props {
  phrases: string[];
  className?: string;
  /** ms per character while typing */
  typeSpeed?: number;
  /** ms to hold after a phrase is fully typed */
  holdMs?: number;
  /** ms per character while deleting */
  deleteSpeed?: number;
}

export function TypingCarousel({
  phrases,
  className = "",
  typeSpeed = 55,
  holdMs = 1600,
  deleteSpeed = 30,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[idx % phrases.length];
    if (!deleting && shown === current) {
      const t = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(t);
    }
    if (deleting && shown === "") {
      setDeleting(false);
      setIdx((i) => (i + 1) % phrases.length);
      return;
    }
    const t = setTimeout(
      () => {
        setShown((s) => (deleting ? s.slice(0, -1) : current.slice(0, s.length + 1)));
      },
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => clearTimeout(t);
  }, [shown, deleting, idx, phrases, typeSpeed, holdMs, deleteSpeed]);

  return (
    <span className={className}>
      {shown}
      <span className="inline-block w-[2px] h-[0.9em] align-baseline bg-current ml-0.5 animate-pulse" aria-hidden />
    </span>
  );
}
