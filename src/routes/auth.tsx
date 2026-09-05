import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TelemetryBackdrop } from "@/components/TelemetryBackdrop";
import { toast } from "sonner";
import {
  Sprout,
  Microscope,
  HeartHandshake,
  Loader2,
  Quote,
  Eye,
  EyeOff,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { IDENTITIES, type Identity, identityLabel, isIdentity } from "@/lib/roles";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/policy-versions";
import logoAsset from "@/assets/canopystride-logo.png.asset.json";

const SearchSchema = z.object({
  redirect: z.string().optional(),
  identity: z.enum(["field_worker", "scientist", "donor"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => SearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in, CanopyStride AI" },
      {
        name: "description",
        content:
          "Sign in to CanopyStride AI. Choose your identity, Frontline Monitor, Field Ecologist, or Grant Donor, to access the restoration dashboard.",
      },
      { property: "og:title", content: "Sign in, CanopyStride AI" },
      {
        property: "og:description",
        content:
          "Choose your restoration identity and sign in securely to access CanopyStride AI diagnostics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://canopystride.dev/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/auth" }],
  }),
  component: AuthPage,
});

type Step = "identity" | "credentials" | "otp" | "forgot" | "signup_done";

const ICONS = { sprout: Sprout, microscope: Microscope, heart: HeartHandshake } as const;

function hasEmailLinkToken(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const type = params.get("type");
  return (
    params.has("access_token") ||
    type === "signup" ||
    type === "magiclink" ||
    type === "email" ||
    type === "invite"
  );
}

function buildAuthRedirectUrl(identity: Identity, redirectPath: string): string {
  const url = new URL("/auth", window.location.origin);
  url.searchParams.set("identity", identity);
  if (redirectPath.startsWith("/") && !redirectPath.startsWith("//")) {
    url.searchParams.set("redirect", redirectPath);
  }
  return url.toString();
}

function AuthPage() {
  const router = useRouter();
  const search = useSearch({ from: "/auth" });
  const safeRedirect =
    typeof search.redirect === "string" &&
    search.redirect.startsWith("/") &&
    !search.redirect.startsWith("//")
      ? search.redirect
      : "/dashboard";

  const [identity, setIdentity] = useState<Identity | null>(search.identity ?? null);
  const [step, setStep] = useState<Step>(search.identity ? "credentials" : "identity");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [identityLockError, setIdentityLockError] = useState<string | null>(null);


  function pickIdentity(id: Identity) {
    setIdentity(id);
    setStep("credentials");
    router.navigate({ to: "/auth", search: { identity: id, redirect: search.redirect } });
  }

  const enforceIdentityLock = useCallback(async (): Promise<boolean> => {
    // After sign-in, confirm the DB role matches the picked identity.
    const { data, error } = await db.rpc("get_my_role");
    if (error) {
      // If we can't read the role, fail closed.
      await supabase.auth.signOut();
      toast.error("Could not verify your identity. Please try again.");
      return false;
    }
    const dbRole = data as string | null;
    if (!dbRole || !isIdentity(dbRole)) {
      // No role row yet (e.g. brand-new signup awaiting email confirm), allow.
      return true;
    }
    if (dbRole !== identity) {
      await supabase.auth.signOut();
      const msg = `This account is registered as “${identityLabel(dbRole)}”. Please sign in with that identity, or create a new account with a different email to join as ${identityLabel(identity)}.`;
      setIdentityLockError(msg);
      toast.error(msg);
      return false;
    }
    setIdentityLockError(null);
    return true;
  }, [identity]);

  useEffect(() => {
    if (!identity || !hasEmailLinkToken()) return;
    let cancelled = false;

    async function finishEmailLinkSignIn() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled || error || !data.user) return;
        const ok = await enforceIdentityLock();
        if (cancelled || !ok) return;
        toast.success("Email verified. Opening your dashboard.");
        router.navigate({ to: safeRedirect });
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void finishEmailLinkSignIn();
      }
    });
    finishEmailLinkSignIn();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [enforceIdentityLock, identity, router, safeRedirect]);

  // Resend cooldown timer for the OTP step.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function forgotPassword() {
    if (!email) {
      toast.error("Enter your email above first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox.");
      setStep("credentials");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }


  async function sendLoginOtp(target: string) {
    if (!identity) return;
    // Fire-and-forget: token email for defense-in-depth verification.
    const { error } = await supabase.auth.signInWithOtp({
      email: target,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: buildAuthRedirectUrl(identity, safeRedirect),
      },
    });
    if (error) throw error;
  }

  async function submitCredentials() {
    if (!identity) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!acceptedTerms) {
          toast.error("Please accept the Terms of Service and Privacy Policy to continue.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildAuthRedirectUrl(identity, safeRedirect),
            data: {
              full_name: name,
              requested_role: identity,
              terms_version: TERMS_VERSION,
              privacy_version: PRIVACY_VERSION,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm your address.");
        setPassword("");
        setStep("signup_done");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const ok = await enforceIdentityLock();
        if (!ok) return;
        // Password verified & identity matches. Sign the temporary session out
        // so the 6-digit code is a required second factor, not optional.
        await supabase.auth.signOut();
        await sendLoginOtp(email);
        setResendCooldown(30);
        toast.success("We emailed you a verification code.");
        setStep("otp");
      }

    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const code = otp.replace(/\D/g, "");
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      toast.success("Signed in.");
      router.navigate({ to: safeRedirect });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    if (!identity) return;
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth?identity=${identity}`,
      });
      if (res.error) throw res.error;
      if (!res.redirected) {
        const ok = await enforceIdentityLock();
        if (!ok) return;
        router.navigate({ to: safeRedirect });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero / brand panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F172A 0%, #1A3622 60%, #0F172A 100%)" }}
      >
        <TelemetryBackdrop className="text-[#22C55E]" intensity={0.55} />
        <div className="relative z-10 inline-block rounded-lg bg-black p-3 self-start">
          <img
            src={logoAsset.url}
            alt="CanopyStride AI"
            className="h-8 w-auto"
            width={160}
            height={40}
          />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-bold leading-tight" style={{ fontSize: "var(--text-h1)" }}>
            Monitor restoration plots with the camera you already carry.
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            AI-powered ecological telemetry.{" "}
            <span className="font-medium text-white">The-Venture (Tamaraneh Initiative)</span>
          </p>

          <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur p-4">
            <div className="flex items-start gap-2 text-sm text-white/90">
              <Quote className="h-4 w-4 mt-0.5 shrink-0 text-[#E5A93C]" />
              <p className="leading-relaxed">
                <strong>Tamaraneh</strong> is the indigenous Temne vow of collective, crisis-driven
                solidarity. Every photo / video uploaded here helps fulfill that promise by building
                verifiable climate resilience.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/65 space-y-1">
          <div className="font-medium text-white/85">Powered by CanopyStride Intelligence</div>
          <ul className="space-y-0.5">
            <li>✓ Built for frontline field teams</li>
            <li>✓ Built for restoration scientists</li>
            <li>✓ Built for grant donors & institutions</li>
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {step === "identity" && (
            <>
              <h2
                className="font-display font-bold"
                style={{ fontSize: "var(--text-h2)" }}
              >
                Choose your identity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your identity is permanent once you sign up. Pick the one that describes how you
                will use CanopyStride AI.
              </p>

              <div className="mt-6 space-y-3">
                {IDENTITIES.map((opt) => {
                  const Icon = ICONS[opt.icon];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => pickIdentity(opt.id)}
                      className="w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-display font-semibold text-foreground leading-tight">
                            {opt.label}
                          </div>
                          <div className="mt-0.5 text-xs uppercase tracking-wide text-primary/80">
                            {opt.tagline}
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "credentials" && identity && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("identity");
                  setIdentity(null);
                  router.navigate({ to: "/auth", search: { redirect: search.redirect } });
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Change identity
              </button>

              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                <span className="font-medium text-primary">Signing in as:</span>{" "}
                <span className="text-foreground">{identityLabel(identity)}</span>
              </div>

              {identityLockError && (
                <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {identityLockError}
                </div>
              )}


              <h2
                className="mt-5 font-display font-bold"
                style={{ fontSize: "var(--text-h2)" }}
              >
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Enter your credentials. We'll email a verification code to verify it's you."
                  : "We'll email you a confirmation link to activate your account."}
              </p>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={google}
                  disabled={loading}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
                    <path fill="#fbbc05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z" />
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
                  </svg>
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ada Lovelace"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
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
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground">
                      Use at least 8 characters. You can toggle the eye icon to view what you type.
                    </p>
                  )}
                  {mode === "signin" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setStep("forgot")}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {mode === "signup" && (
                  <label
                    htmlFor="accept-terms"
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                    style={{ minHeight: "48px" }}
                  >
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                      style={{ minWidth: "20px", minHeight: "20px" }}
                    />
                    <span className="text-slate-800" style={{ fontSize: "16px", lineHeight: 1.4 }}>
                      I accept the{" "}
                      <a
                        href="/legal?tab=terms"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/legal?tab=privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        Privacy Policy
                      </a>
                      .
                      <span className="mt-1 block text-xs text-slate-500">
                        Terms v{TERMS_VERSION} · Privacy v{PRIVACY_VERSION}, recorded to your account.
                      </span>
                    </span>
                  </label>
                )}
                <Button
                  onClick={submitCredentials}
                  disabled={
                    loading ||
                    !email ||
                    !password ||
                    (mode === "signup" && (!name || !acceptedTerms))
                  }
                  className="w-full h-12 text-base"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {mode === "signin" ? "No account?" : "Have an account?"}{" "}
                  <button
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="font-medium text-primary hover:underline"
                  >
                    {mode === "signin" ? "Create one" : "Sign in"}
                  </button>
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="mt-4 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-display font-bold" style={{ fontSize: "var(--text-h2)" }}>
                  Verify it's you
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                We emailed a verification code to <strong>{email}</strong>. Type or paste it below
                to finish signing in, or open the secure login link in that same email.
              </p>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                Both options work: enter the code here, or tap the email button to open
                your dashboard automatically.
              </div>
              <div className="mt-6 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
                      if (pasted) {
                        e.preventDefault();
                        setOtp(pasted);
                      }
                    }}
                    placeholder="123456"
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy the code straight from the email, spaces are removed automatically.
                  </p>
                </div>
                <Button
                  onClick={verifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full h-12 text-base"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify code & continue
                </Button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    try {
                      await sendLoginOtp(email);
                      setResendCooldown(30);
                      toast.success("New code sent.");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : String(e));
                    }
                  }}
                  className="w-full text-center text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          {step === "forgot" && (
            <>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
              <h2 className="mt-4 font-display font-bold" style={{ fontSize: "var(--text-h2)" }}>
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the email tied to your account. We'll send you a secure link to set a new
                password.
              </p>
              <div className="mt-6 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  onClick={forgotPassword}
                  disabled={loading || !email}
                  className="w-full h-12 text-base"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </div>
            </>
          )}

          {step === "signup_done" && (
            <>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-display font-bold" style={{ fontSize: "var(--text-h2)" }}>
                  Check your inbox
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a confirmation link to <strong>{email}</strong>. Open it to activate your
                account, then come back here to sign in.
              </p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                Don't see it in a minute or two? Check your spam / promotions folder. The email is
                sent from our secure sender.
              </div>
              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMode("signin");
                    setStep("credentials");
                  }}
                >
                  Back to sign in
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  disabled={resendCooldown > 0 || loading}
                  onClick={async () => {
                    if (!identity) {
                      toast.error("Choose your identity before resending the confirmation email.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resend({
                        type: "signup",
                        email,
                        options: {
                          emailRedirectTo: buildAuthRedirectUrl(identity, safeRedirect),
                        },
                      });
                      if (error) throw error;
                      setResendCooldown(30);
                      toast.success("Confirmation email resent.");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : String(e));
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

