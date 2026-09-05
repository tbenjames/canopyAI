import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, ScrollText, Mail, MapPin, ArrowLeft, Receipt } from "lucide-react";

const SearchSchema = z.object({
  tab: z.enum(["privacy", "terms", "refunds"]).optional(),
});

export const Route = createFileRoute("/legal")({
  validateSearch: (s) => SearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Legal, Data Privacy & Terms · CanopyStride AI" },
      {
        name: "description",
        content:
          "CanopyStride AI Data Privacy Policy and Terms of Service for monitors, scientists, and donors under Sierra Leone, ECOWAS, AU Malabo, and GDPR law.",
      },
      { property: "og:title", content: "Legal, CanopyStride AI" },
      {
        property: "og:description",
        content: "Data Privacy Policy and Terms of Service for CanopyStride AI.",
      },
      { property: "og:url", content: "https://canopystride.dev/legal" },
    ],
    links: [{ rel: "canonical", href: "https://canopystride.dev/legal" }],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { tab } = useSearch({ from: "/legal" });
  const defaultTab = tab === "terms" ? "terms" : tab === "refunds" ? "refunds" : "privacy";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-sm font-medium text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            CanopyStride AI
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Legal & Regulatory Framework
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1
            className="font-display font-bold tracking-tight text-slate-900"
            style={{ fontSize: "var(--text-h1)" }}
          >
            Legal & Compliance
          </h1>
          <p
            className="mt-2 max-w-2xl text-slate-700"
            style={{ fontSize: "clamp(1rem, 0.95rem + 0.2vw, 1.125rem)", lineHeight: 1.6 }}
          >
            Our binding Data Privacy Policy and Terms of Service, written for frontline monitors,
            field scientists, grant donors, and partner institutions of{" "}
            <strong>The Venture (Tamaraneh Initiative)</strong>.
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="privacy" className="min-h-[48px] gap-2 text-base font-medium" style={{ fontSize: "16px" }}>
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="min-h-[48px] gap-2 text-base font-medium" style={{ fontSize: "16px" }}>
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Terms</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="refunds" className="min-h-[48px] gap-2 text-base font-medium" style={{ fontSize: "16px" }}>
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Refunds</span>
              <span className="sm:hidden">Refunds</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="mt-6">
            <PrivacyPolicy />
          </TabsContent>
          <TabsContent value="terms" className="mt-6">
            <TermsOfService />
          </TabsContent>
          <TabsContent value="refunds" className="mt-6">
            <RefundPolicy />
          </TabsContent>
        </Tabs>

        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a
                href="mailto:supprttmrnhinitiative@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                supprttmrnhinitiative@gmail.com
              </a>
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Bio-Barrytown, Sierra Leone
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* --------------------------- Reusable primitives --------------------------- */

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-6 last:border-b-0">
      <h2
        className="font-display font-semibold text-slate-900"
        style={{ fontSize: "var(--text-h2)" }}
      >
        <span className="mr-2 text-primary">{n}.</span>
        {title}
      </h2>
      <div
        className="mt-3 space-y-3 text-slate-800"
        style={{ fontSize: "clamp(1rem, 0.95rem + 0.15vw, 1.0625rem)", lineHeight: 1.65 }}
      >
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: Array<{ term?: string; text: React.ReactNode }> }) {
  return (
    <ul className="space-y-3 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <div>
            {it.term && <strong className="text-slate-900">{it.term}: </strong>}
            <span className="text-slate-800">{it.text}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      {children}
    </article>
  );
}

/* -------------------------------- Content -------------------------------- */

function PrivacyPolicy() {
  return (
    <Card>
      <div className="mb-4">
        <h2
          className="font-display font-bold text-slate-900"
          style={{ fontSize: "var(--text-h1)" }}
        >
          Data Privacy Policy
        </h2>
        <p className="mt-1 text-sm text-slate-600">Last Updated: July 14, 2026</p>
      </div>
      <p className="text-slate-800" style={{ fontSize: "1rem", lineHeight: 1.65 }}>
        CanopyStride AI, a technology initiative managed by{" "}
        <strong>The Venture (Tamaraneh Initiatives)</strong> (“we,” “our,” or “us”), is deeply
        committed to protecting the data privacy of our frontline monitors, community groups,
        ecologists, and partners.
      </p>
      <p className="mt-3 text-slate-800" style={{ fontSize: "1rem", lineHeight: 1.65 }}>
        <strong>Data controller.</strong> The Venture (Tamaraneh Initiatives), based in
        Bio-Barrytown, Sierra Leone, is the data controller responsible for the personal information
        described in this policy. You can reach us at{" "}
        <a href="mailto:supprttmrnhinitiative@gmail.com" className="text-primary hover:underline">
          supprttmrnhinitiative@gmail.com
        </a>
        .
      </p>
      <p className="mt-3 text-slate-800" style={{ fontSize: "1rem", lineHeight: 1.65 }}>
        This policy is constructed in strict compliance with the{" "}
        <em>Sierra Leone Data Protection and Right to Access Information Act</em>, the{" "}
        <em>ECOWAS Supplementary Act on Personal Data Protection</em>, the{" "}
        <em>African Union Malabo Convention</em>, and the{" "}
        <em>EU General Data Protection Regulation (GDPR)</em>.
      </p>

      <Section n="1" title="Information We Collect">
        <p>
          To provide accurate, decentralized environmental auditing and silviculture verification
          while operating smoothly in low-bandwidth, high-glare environments, we collect:
        </p>
        <List
          items={[
            {
              term: "Account Registration Data",
              text: "Name, email address, assigned profile role (e.g., Monitor, Scientist, Administrator), and secure validation credentials such as unique 6-digit alphanumeric Field Access Tokens used during closed testing phases.",
            },
            {
              term: "Field Observation Media",
              text: "Photographs, video clips, and textual descriptive matrices submitted directly via your smartphone dashboard to track coastal or dryland ecosystems.",
            },
            {
              term: "Embedded Telemetry and EXIF Metadata",
              text: "GPS geographic coordinates (latitude, longitude, altitude), device brand and sensor model, and precise timestamp of image capture parsed from uploaded media.",
            },
            {
              term: "User Feedback Data",
              text: "Open-ended qualitative feedback via field forms, capped at 250 characters, with 3-tier categorized dropdowns to conserve local device storage and bandwidth.",
            },
            {
              term: "Billing and Payment Data",
              text: "When you purchase a credit pack, our payment processor Stripe collects your billing name, billing country, and payment instrument details (such as card number, expiry, and security code) directly on their secure hosted checkout. We never see or store your full card details. We receive from Stripe only the transaction identifier, purchase amount, currency, product purchased, billing email, billing country, and payment status, which we use to grant credits, issue receipts, and reconcile refunds.",
            },
          ]}
        />
      </Section>

      <Section n="2" title="How Your Data Is Processed">
        <List
          items={[
            {
              term: "AI Inference and Health Tracking",
              text: "Local, quantized edge-inference model runs or serverless cloud requests that evaluate canopy density, spot early wildfire indicators, identify plant species (such as Rhizophora racemosa or Moringa oleifera), and identify environmental stress factors like salinity or subsurface waterlogging.",
            },
            {
              term: "Impact Verification Audits",
              text: "Translating raw EXIF telemetry markers into verifiable tree survival rates, carbon mitigation curves, and ecological progress logs that map directly against UN SDG 13 (Climate Action), SDG 15 (Life on Land), and SDG 8 (Decent Work and Economic Growth), including our 2030 target of 25,000 restored trees.",
            },
            {
              term: "Workforce Tracking",
              text: "Validating and certifying field hours in support of our mission to scale grassroots vocational training programs into 125 permanent green jobs within climate-vulnerable communities.",
            },
            {
              term: "System Optimization",
              text: "Minimizing database weight, managing multi-device queues, and preventing network timeouts across low-bandwidth areas via automated context capture such as browser variables and current URLs.",
            },
          ]}
        />
      </Section>

      <Section n="3" title="Data Sharing, Provenance, and Non-Monetization">
        <List
          items={[
            {
              term: "No Commercial Data Sale",
              text: "We do not sell, lease, rent, or trade your personal information or field telemetry to commercial third-party aggregators, advertising firms, or tracking corporations.",
            },
            {
              term: "Donor & Institutional Reporting",
              text: "Aggregated, completely anonymized ecological telemetry is shared via secure pipelines with verified funding institutions, international climate grant juries (such as EU and Big Six Global Youth Mobilisation frameworks), and carbon credit registries to prove real-world restoration track records and prevent greenwashing.",
            },
            {
              term: "Legal Disclosures",
              text: "We may disclose individual identifiers only if strictly required by an independent judicial authority operating under the laws of Sierra Leone, or to mitigate an imminent, documented environmental or human crisis (such as a wildfire or landslide hazard in Bio-Barrytown).",
            },
          ]}
        />
      </Section>

      <Section n="4" title="Data Protection, Security, and Storage">
        <p>
          Your personal account data and telemetry are securely retained using cloud-based
          infrastructure managed via Supabase and integrated through Lovable.
        </p>
        <List
          items={[
            {
              text: "Row-Level Security (RLS) is enforced on our backend databases so that data rows cannot be accessed, modified, or deleted by unauthorized user tiers.",
            },
            {
              text: "In low-bandwidth field deployment frameworks, temporary data is handled locally within the client's browser cache using quantized ONNX WebAssembly/WebGPU modules, ensuring offline efficiency without introducing external security leaks.",
            },
          ]}
        />
      </Section>

      <Section n="5" title="Your Legal Rights (Data Subject Rights)">
        <List
          items={[
            {
              term: "Right to Access and Correction",
              text: "Request a copy of the personal information associated with your account profile and correct any operational inaccuracies.",
            },
            {
              term: "Right to Erasure (Right to be Forgotten)",
              text: "Request the deletion of your account profile.",
            },
            {
              term: "Critical Operational Exception",
              text: "To maintain institutional accountability and prevent carbon credit fraud or grant non-compliance, individual ecological site records and EXIF location metrics that have already been integrated into aggregated, multi-year funding audits or certified environmental baseline indexes cannot be retroactively destroyed or modified, as they constitute vital scientific records.",
            },
          ]}
        />
      </Section>

      <Section n="6" title="Payment Processing (Stripe)">
        <p>
          Paid credit-pack purchases on CanopyStride AI are processed by{" "}
          <strong>Stripe Payments</strong>. Stripe hosts the checkout, collects and processes your
          payment details, and returns to us only the limited transaction metadata described in
          Section 1 (Billing and Payment Data).
        </p>
        <p>
          For these purposes Stripe acts as an independent data controller of your payment data.
          Their handling of your information is governed by the{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Stripe Privacy Policy
          </a>
          . We use the returned metadata to fulfil your order, deliver credits, provide customer
          support, and meet our tax and accounting obligations.
        </p>
      </Section>

      <Section n="7" title="Legal Bases for Processing (GDPR)">
        <List
          items={[
            {
              term: "Performance of a contract",
              text: "Creating and maintaining your account, granting purchased credits, running requested AI analyses, and delivering purchase receipts and refund notices.",
            },
            {
              term: "Legitimate interests",
              text: "Securing the platform against fraud and abuse, improving analysis accuracy, monitoring service health, and producing aggregated ecological reporting for donors. We balance these interests against your rights and freedoms.",
            },
            {
              term: "Consent",
              text: "Optional communications, cookies that are not strictly necessary, and any processing you separately opt in to. You can withdraw consent at any time.",
            },
            {
              term: "Legal obligation",
              text: "Retaining transaction records for tax, accounting, and anti-fraud purposes, and responding to lawful requests from competent authorities.",
            },
          ]}
        />
      </Section>

      <Section n="8" title="Contact and Regulatory Communications">
        <p>
          For any data privacy inquiries, or to exercise your statutory rights under regional data
          regulations, please contact the administrative team of{" "}
          <strong>The Venture (Tamaraneh Initiative)</strong>:
        </p>
        <p>
          📧 <strong>Legal & Compliance Desk:</strong>{" "}
          <a
            href="mailto:supprttmrnhinitiative@gmail.com"
            className="text-primary hover:underline"
          >
            supprttmrnhinitiative@gmail.com
          </a>
          <br />
          📍 <strong>Operational Focus Area:</strong> Bio-Barrytown, Sierra Leone.
        </p>
      </Section>
    </Card>
  );
}

function TermsOfService() {
  return (
    <Card>
      <div className="mb-4">
        <h2
          className="font-display font-bold text-slate-900"
          style={{ fontSize: "var(--text-h1)" }}
        >
          Terms and Conditions of Use
        </h2>
        <p className="mt-1 text-sm text-slate-600">Last Updated: July 20, 2026</p>
      </div>
      <p className="text-slate-800" style={{ fontSize: "1rem", lineHeight: 1.65 }}>
        Welcome to <strong>CanopyStride AI</strong>, a technology ecosystem engineered by{" "}
        <strong>The Venture (Tamaraneh Initiative)</strong>. By accessing our web application
        hosted at{" "}
        <a href="https://canopystride.dev" className="text-primary hover:underline">
          https://canopystride.dev
        </a>{" "}
        or any associated subdomains, you explicitly agree to be bound by these Terms.
      </p>

      <Section n="1" title="Terms of Access and the Closed Alpha Voucher System">
        <List
          items={[
            {
              term: "Credentials and Authorized Access",
              text: "Access is tightly managed. You must register through our approved onboarding forms and may be required to utilize a unique, 6-digit alphanumeric Field Access Token (“Voucher Method”) generated specifically for your cohort.",
            },
            {
              term: "Account Confidentiality",
              text: "You are entirely responsible for protecting the confidentiality of your platform credentials, including token keys or login states, and must immediately notify our technical support desk of any unauthorized use or credential leak.",
            },
          ]}
        />
      </Section>

      <Section n="2" title="User Profiles, Role Permissions, and Database Safeguards">
        <List
          items={[
            {
              term: "Role Adherence",
              text: "Platform capabilities are dynamically dictated by your assigned role profile (admin, scientist, monitor). Users are strictly prohibited from bypassing role barriers, exploiting database endpoints, or altering field logs without authorization.",
            },
            {
              term: "Bypass Provisions",
              text: "Any automated adjustments or temporary lowering of role verification steps during MVP testing cycles must be authorized exclusively by internal administrators using our Lovable development console or manual profile updates within our Supabase dashboard.",
            },
          ]}
        />
      </Section>

      <Section n="3" title="Acceptable Use Policies and Environmental Integrity">
        <p>Users must use the tool responsibly. You explicitly pledge that you will not:</p>
        <List
          items={[
            {
              term: "Falsify Metadata (Spoofing)",
              text: "Upload photographs or media that utilize falsified, altered, or artificially generated EXIF geolocation metadata or timestamps. All telemetry must be captured physically on-site within active restoration landscapes.",
            },
            {
              term: "Submit Fraudulent Reporting",
              text: "Input misleading site matrix evaluations or false plant status data (e.g., misrepresenting survival rate or health of native mangrove species like Rhizophora racemosa or Moringa crops).",
            },
            {
              term: "Interfere with Infrastructure",
              text: "Upload files containing malware, viruses, or malicious script blocks, or engage in denial-of-service attempts against our Lovable or Supabase cloud architecture.",
            },
          ]}
        />
      </Section>

      <Section n="4" title="Monetization Framework: Free Trials & Pay-As-You-Go System">
        <List
          items={[
            {
              term: "Free Trial Allocations",
              text: "Upon successful onboarding and validation, user accounts are allocated a finite batch of complimentary credit parameters designed to support local ecological testing.",
            },
            {
              term: "Pay-As-You-Go Architecture",
              text: "Extended analytic queries, high-density environmental evaluations, sub-surface indicator charts, or localized wildfire risk matrix analysis beyond the free allocation operate on a Pay-As-You-Go credit system.",
            },
            {
              term: "Credits and Execution Fees",
              text: "Credits are depleted systematically based on computation blocks (such as model execution weights and serverless edge functions). Fees, payment terms, and automated credit balance adjustments are governed by our active monetization rollout documentation. Refund eligibility is set out in our separate Refund Policy, which offers a 30 day money-back guarantee on unused credit-pack purchases. Credits that have already been consumed on completed analyses are not refundable.",
            },
          ]}
        />
      </Section>

      <Section n="5" title="Payment Processor">
        <p>
          Paid credit-pack purchases on CanopyStride AI are processed by{" "}
          <strong>Stripe Payments</strong>. Stripe hosts the checkout and handles card data
          securely on our behalf. Refunds and chargebacks are administered by CanopyStride AI in
          accordance with our Refund Policy. Your use of Stripe's hosted checkout is subject to
          the{" "}
          <a href="https://stripe.com/legal/consumer" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Stripe Services Consumer Terms
          </a>
          .
        </p>
      </Section>

      <Section n="6" title="Intellectual Property Ownership">
        <p>
          The CanopyStride AI platform, including all source code, machine-learning models, model
          weights, prompt libraries, taxonomies, dashboards, UI designs, documentation, logos, and
          brand assets, are and remain the exclusive intellectual property of{" "}
          <strong>The Venture (Tamaraneh Initiatives)</strong> or its licensors, and are protected
          by copyright, trademark, and related laws. We grant you a limited, non-exclusive,
          non-transferable, revocable right to access and use the platform for your permitted role
          and purchased credit allocation. You may not copy, modify, reverse engineer, resell,
          redistribute, or create derivative works from the platform without our prior written
          consent. You retain ownership of the field media and observations you upload, and grant
          us a limited licence to host, process, and analyse that content solely to provide the
          service to you and to generate aggregated, anonymised reporting as described in the
          Privacy Policy.
        </p>
      </Section>

      <Section n="7" title="Nature-Based Disclaimers and Limitation of Liability">
        <List
          items={[
            {
              term: "Low-Bandwidth Optimization",
              text: "CanopyStride AI is optimized to function within low-bandwidth, extreme climate-vulnerable zones (such as coastal West Africa). We are not responsible for field submission errors resulting from local cellular drops, physical device overheating, or automated upload queue timeouts.",
            },
            {
              term: "AI Interpretation Margins",
              text: "Our platform utilizes computer vision and model quantization routines to estimate visual indicators (such as salinity stress and canopy decline). While these models offer high confidence, they represent visual proxies. The Venture provides no absolute guarantee that the software will detect every subsurface root anomaly or micro-level ecological variance.",
            },
            {
              term: "Exclusion of Consequential Damages",
              text: "To the maximum extent permitted by the laws of Sierra Leone and international courts, The Venture (Tamaraneh Initiative) shall not be liable for any direct, indirect, incidental, or consequential losses, including missed carbon mitigation payouts, grant rejections, or loss of crop values resulting from system downtimes or tracking errors.",
            },
          ]}
        />
      </Section>

      <Section n="8" title="Modifications to Terms and Platform Termination">
        <p>
          We reserve the absolute right to modify, adapt, or update these terms at any time to
          maintain alignment with evolving digital legislation or technical feature additions.
          Continued use of CanopyStride AI following the posting of updated terms indicates your
          binding agreement to those changes.
        </p>
      </Section>

      <Section n="9" title="Governing Law and Dispute Resolution">
        <p>
          These Terms shall be governed by the substantive{" "}
          <strong>Laws of the Republic of Sierra Leone</strong>. Any dispute, claim, or
          controversy arising out of or relating to these terms shall be settled through binding,
          friendly arbitration conducted in <strong>Freetown, Sierra Leone</strong>, before a
          single arbitrator appointed under national arbitration provisions.
        </p>
      </Section>
    </Card>
  );
}

/* --------------------------- Refund Policy --------------------------- */

function RefundPolicy() {
  return (
    <Card>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Effective July 20, 2026</div>
        <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">Refund Policy</h2>
        <p className="mt-2 text-slate-700">
          We stand behind CanopyStride AI. If a purchase does not meet your expectations, you may
          request a refund within 30 days of the transaction.
        </p>
      </div>

      <Section n="1" title="30 day money back guarantee">
        <p>
          You may request a full refund on any credit pack purchase within 30 days of the payment
          date. Refunds are issued by CanopyStride AI and returned to your original payment method
          through our payment processor, Stripe.
        </p>
      </Section>

      <Section n="2" title="How to request a refund">
        <p>
          Email us at{" "}
          <a href="mailto:supprttmrnhinitiative@gmail.com" className="text-primary underline">
            supprttmrnhinitiative@gmail.com
          </a>{" "}
          with your order reference or the email you used at checkout, and we will process the
          refund within a few business days.
        </p>
      </Section>

      <Section n="3" title="Donations">
        <p>
          Donations made through the Vult wallet to the Tamaraneh Initiative fund restoration work
          in the field and are non-refundable once received. If you believe a donation was made in
          error, contact us within 14 days and we will do our best to resolve it.
        </p>
      </Section>

      <Section n="4" title="Consumed credits">
        <p>
          Credits already spent on completed analyses cannot be refunded, since the underlying AI
          compute has been consumed. Unused credits from a refunded purchase are removed from your
          balance at the time of refund.
        </p>
      </Section>
    </Card>
  );
}
