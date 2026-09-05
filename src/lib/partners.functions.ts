import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PartnerInquiryInput = z.object({
  organisationName: z.string().trim().min(1).max(200),
  contactName: z.string().trim().min(1).max(200),
  email: z.string().email().max(250),
  partnershipType: z.enum([
    "ngo_pilot",
    "research_collab",
    "government",
    "carbon_project",
    "donor_funding",
    "enterprise",
    "other",
  ]),
  country: z.string().trim().min(1).max(100),
  message: z.string().trim().min(10).max(2000),
  website: z.string().url().max(300).optional().nullable(),
  estimatedSites: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  honeypot: z.string().max(100).optional().nullable(),
});

export const submitPartnerInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PartnerInquiryInput.parse(d))
  .handler(async ({ data }) => {
    // Honeypot anti-spam guard: if the hidden field is filled, reject silently.
    if (data.honeypot && data.honeypot.length > 0) {
      return { ok: true as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("partner_inquiries").insert({
      organisation_name: data.organisationName,
      contact_name: data.contactName,
      email: data.email,
      partnership_type: data.partnershipType,
      country: data.country,
      message: data.message,
      website: data.website ?? null,
      estimated_sites: data.estimatedSites ?? null,
      honeypot: null,
    });

    if (error) throw new Error(error.message);

    // Fire-and-forget Slack alert to admin channel.
    const webhook = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🤝 *New CanopyStride partner inquiry* — _${data.partnershipType}_\n*${data.organisationName}* · ${data.country}\n${data.contactName} <${data.email}>`,
          }),
        });
      } catch {
        // Never fail the user's submit because Slack is unreachable.
      }
    }

    return { ok: true as const };
  });
