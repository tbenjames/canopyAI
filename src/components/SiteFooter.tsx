import { Link } from "@tanstack/react-router";
import { Mail, Github, Heart } from "lucide-react";
import { AppLogo } from "./AppLogo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="inline-block rounded-lg bg-black p-3">
              <AppLogo variant="full" className="h-8 w-auto" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Restoration intelligence for mangroves and Moringa. Built with frontline monitors and
              restoration scientists in Sierra Leone.
            </p>
          </div>

          <FooterCol title="Product">
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
            <FooterLink to="/guide">Field guides</FooterLink>
            <FooterLink to="/guide/mangrove-restoration-best-practices">
              Mangrove restoration
            </FooterLink>
            <FooterLink to="/donate">Donate</FooterLink>
            <FooterLink to="/partners">Partners</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink to="/legal" search={{ tab: "privacy" }}>
              Privacy notice
            </FooterLink>
            <FooterLink to="/legal" search={{ tab: "terms" }}>
              Terms of service
            </FooterLink>
            <FooterLink to="/legal" search={{ tab: "refunds" }}>
              Refund policy
            </FooterLink>
          </FooterCol>

          <FooterCol title="Contact">
            <a
              href="mailto:supprttmrnhinitiative@gmail.com"
              className="footer-link inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" /> Email us
            </a>
            <a
              href="https://canopystride.dev"
              className="footer-link inline-flex items-center gap-1.5"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-3.5 w-3.5" /> canopystride.dev
            </a>
            <Link to="/donate" className="footer-link inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Support the mission
            </Link>
          </FooterCol>
        </div>

        <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 md:flex-row">
          <div>© {new Date().getFullYear()} Tamaraneh Initiative. All rights reserved.</div>
          <div>Powered by CanopyStride Intelligence.</div>
        </div>
      </div>

      <style>{`
        .footer-link {
          position: relative;
          color: rgb(71 85 105);
          font-size: 0.875rem;
          transition: color 200ms ease;
        }
        .footer-link:hover { color: rgb(15 23 42); }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 0;
          background: rgb(26 54 34);
          transition: width 250ms ease;
        }
        .footer-link:hover::after { width: 100%; }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-900">{title}</div>
      <ul className="mt-3 flex flex-col gap-2">
        {Array.isArray(children) ? (
          children.map((c, i) => <li key={i}>{c}</li>)
        ) : (
          <li>{children}</li>
        )}
      </ul>
    </div>
  );
}

function FooterLink({
  to,
  search,
  children,
}: {
  to: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search?: any;
  children: React.ReactNode;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to as any} search={search} className="footer-link">
      {children}
    </Link>
  );
}
