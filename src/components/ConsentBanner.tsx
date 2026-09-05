import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cs_consent_v1";

type ConsentRecord = {
  accepted: boolean;
  version: string;
  timestamp: string;
};

const CURRENT_VERSION = "2026-07-21";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(raw) as ConsentRecord;
      if (!parsed.accepted || parsed.version !== CURRENT_VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    const record: ConsentRecord = {
      accepted: true,
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // no-op, private mode / blocked storage still lets user proceed
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies and privacy consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-start gap-3 sm:flex-1">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            We use essential cookies to keep you signed in and remember your preferences. By
            continuing, you agree to our{" "}
            <a
              href="/legal?tab=terms"
              className="font-medium text-primary underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/legal?tab=privacy"
              className="font-medium text-primary underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={accept} className="h-10 px-5">
            Accept &amp; continue
          </Button>
        </div>
      </div>
    </div>
  );
}
