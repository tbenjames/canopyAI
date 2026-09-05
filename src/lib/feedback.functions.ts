import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FeedbackInput = z.object({
  category: z.enum(["app_bug", "vision_wrong", "feature_request", "tool_calibration"]),
  note: z.string().max(500).optional().nullable(),
  message_text: z.string().trim().min(1).max(1500),
  audio_path: z.string().max(500).optional().nullable(),
  language: z.string().max(8).default("en"),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("feedback")
      .insert({
        user_id: userId,
        category: data.category,
        note: data.note ?? null,
        message_text: data.message_text,
        audio_path: data.audio_path ?? null,
        language: data.language ?? "en",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Fire-and-forget Slack alert to admin channel.
    const webhook = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
    if (webhook) {
      try {
        const preview = data.message_text.length > 280
          ? `${data.message_text.slice(0, 280)}…`
          : data.message_text;
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🌱 *New CanopyStride feedback* — _${data.category}_ (${data.language})\n> ${preview}${data.audio_path ? `\n🎙️ audio attached` : ""}`,
          }),
        });
      } catch {
        // Never fail the user's submit because Slack is unreachable.
      }
    }

    return { ok: true as const, id: row.id };
  });
