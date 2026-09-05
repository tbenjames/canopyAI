import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { db, getSignedUrl } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Inbox, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({ meta: [{ title: "Feedback Inbox, CanopyStride AI" }] }),
  component: FeedbackInbox,
});

type FeedbackRow = {
  id: string;
  user_id: string;
  category: "app_bug" | "vision_wrong" | "feature_request" | "tool_calibration";
  note: string | null;
  message_text: string;
  audio_path: string | null;
  language: string | null;
  status: string;
  admin_seen_at: string | null;
  created_at: string;
};

const CATEGORY_LABEL: Record<FeedbackRow["category"], string> = {
  app_bug: "App Bug",
  vision_wrong: "Vision Wrong",
  feature_request: "Feature Request",
  tool_calibration: "Calibration",
};

function FeedbackInbox() {
  const qc = useQueryClient();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setIsStaff(false); return; }
      const { data: roles } = await db.from("user_roles").select("role").eq("user_id", u.user.id);
      const r = roles?.map((x) => x.role) ?? [];
      setIsStaff(r.includes("admin") || r.includes("scientist"));
    })();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["feedback-inbox"],
    enabled: isStaff === true,
    queryFn: async () => {
      const { data: rows, error } = await db
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return rows as FeedbackRow[];
    },
  });

  async function mark(id: string) {
    const { error } = await db.from("feedback").update({ admin_seen_at: new Date().toISOString(), status: "seen" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Marked as reviewed"); qc.invalidateQueries({ queryKey: ["feedback-inbox"] }); }
  }

  if (isStaff === null) {
    return <AppShell><div className="p-12 text-center text-muted-foreground">Loading…</div></AppShell>;
  }

  if (!isStaff) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-semibold">Staff only</h1>
          <p className="mt-1 text-sm text-muted-foreground">The feedback inbox is visible to admins and scientists.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Field Feedback Inbox</h1>
          <p className="text-sm text-muted-foreground">All submissions from field workers, sorted newest first.</p>
        </div>
        <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" /> Email digest to supprttmrnhinitiative@gmail.com, pending email domain setup</Badge>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <Inbox className="mx-auto h-8 w-8 mb-2" /> No feedback yet.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((row) => <FeedbackItem key={row.id} row={row} onMark={mark} />)}
        </ul>
      )}
    </AppShell>
  );
}

function FeedbackItem({ row, onMark }: { row: FeedbackRow; onMark: (id: string) => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!row.audio_path) return;
    getSignedUrl(row.audio_path).then(setAudioUrl);
  }, [row.audio_path]);
  return (
    <li className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{CATEGORY_LABEL[row.category]}</Badge>
        <Badge variant="outline">{row.language ?? "en"}</Badge>
        {row.admin_seen_at && <Badge variant="secondary">Reviewed</Badge>}
        <span className="ml-auto text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
      </div>
      {row.note && <p className="mt-2 text-xs text-muted-foreground">Note: {row.note}</p>}
      <p className="mt-2 whitespace-pre-wrap text-sm">{row.message_text}</p>
      {audioUrl && <audio controls src={audioUrl} className="mt-3 w-full" />}
      {!row.admin_seen_at && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onMark(row.id)}>Mark reviewed</Button>
        </div>
      )}
    </li>
  );
}
