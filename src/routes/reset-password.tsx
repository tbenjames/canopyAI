import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, Sprout } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password, CanopyStride AI" },
      {
        name: "description",
        content: "Set a new password for your CanopyStride AI account.",
      },
      { property: "og:title", content: "Reset password, CanopyStride AI" },
      {
        property: "og:description",
        content: "Set a new password for your CanopyStride AI account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase places the recovery token in the URL hash on redirect.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = params.get("type");
    if (type === "recovery") {
      setHasRecovery(true);
    }
    // Wait for Supabase to hydrate the recovery session, then confirm.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasRecovery(true);
      }
    });
    setReady(true);
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Sign out so the user re-enters through the identity-locked flow + OTP.
      await supabase.auth.signOut();
      toast.success("Password updated. Please sign in with your new password.");
      router.navigate({ to: "/auth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2 font-display font-bold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          CanopyStride <span className="font-medium text-muted-foreground">AI</span>
        </div>

        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <h1 className="font-display font-bold" style={{ fontSize: "var(--text-h2)" }}>
            Set a new password
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account. You'll be signed out and asked to sign in again
          for security.
        </p>

        {ready && !hasRecovery && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            This link is missing or expired. Please request a new password reset from the sign-in
            page.
            <div className="mt-3">
              <Button variant="outline" onClick={() => router.navigate({ to: "/auth" })}>
                Back to sign in
              </Button>
            </div>
          </div>
        )}

        {hasRecovery && (
          <div className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button
              onClick={submit}
              disabled={loading || !password || !confirm}
              className="w-full h-12 text-base"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
