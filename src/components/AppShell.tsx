import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { LayoutDashboard, MapPin, Upload, Trees, Bell, LogOut, Inbox, Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FeedbackButton } from "./FeedbackButton";
import { AppLogo } from "./AppLogo";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? "");
      if (data.user) {
        const { data: roles } = await db.from("user_roles").select("role").eq("user_id", data.user.id);
        const rs = roles?.map((r) => r.role) ?? [];
        setRole(rs[0] ?? "field_worker");
        setIsStaff(rs.includes("admin") || rs.includes("scientist"));
      }
    })();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/sites", label: "Sites & Plots", icon: Trees },
    { to: "/upload", label: "New Upload", icon: Upload },
    { to: "/alerts", label: "Alerts", icon: Bell },
    ...(isStaff ? [{ to: "/feedback", label: "Feedback Inbox", icon: Inbox }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-display font-bold">
            <AppLogo variant="mark" className="h-9 w-9" />
            <span className="hidden sm:inline">CanopyStride <span className="text-muted-foreground font-medium">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground min-h-[40px]"
                activeProps={{ className: "active" }}
              >
                <span className="inline-flex items-center gap-2"><n.icon className="h-4 w-4" />{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium">{email}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{role.replace("_", " ")}</span>
            </div>
            <button onClick={signOut} className="rounded-md border px-3 py-2 text-xs hover:bg-secondary inline-flex items-center gap-1 min-h-[40px]">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="md:hidden border-t bg-card">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-2 py-1">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to} className="shrink-0 rounded-md px-3 py-2 text-xs text-muted-foreground [&.active]:bg-secondary [&.active]:text-foreground" activeProps={{ className: "active" }}>
                <span className="inline-flex items-center gap-1.5"><n.icon className="h-3.5 w-3.5" />{n.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-10 text-center text-xs text-muted-foreground">
        <div className="font-medium text-foreground">Powered by CanopyStride Intelligence</div>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <li>✓ Built for the field team</li>
          <li>✓ Built for community group restoration initiatives</li>
          <li>✓ Built for Regenerative / Restoration projects</li>
          <li>✓ Built for enterprises &amp; Institutions</li>
        </ul>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link to="/donate" className="inline-flex items-center gap-1 hover:text-foreground"><Heart className="h-3 w-3" /> Donate</Link>
          <Link to="/legal" className="hover:text-foreground">Legal</Link>
        </div>
        <div className="mt-3 inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> The-Venture · Tamaraneh Initiative · Sierra Leone, Freetown</div>
      </footer>
      <FeedbackButton />
    </div>
  );
}
