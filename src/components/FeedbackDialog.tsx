import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Square, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitFeedback } from "@/lib/feedback.functions";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { value: "app_bug", label: "App Crashed / Frozen / Bug" },
  { value: "vision_wrong", label: "Vision Analysis Wrong" },
  { value: "feature_request", label: "Feature Request" },
  { value: "tool_calibration", label: "Scientific Tool Calibration Adjustment" },
] as const;

const MAX_AUDIO_MS = 15_000;
const WORD_LIMIT = 150;

export function FeedbackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const send = useServerFn(submitFeedback);
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
  const tooLong = wordCount > WORD_LIMIT;

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  function reset() {
    setCategory(""); setNote(""); setMessage(""); setLanguage("en");
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      stopTimer.current = setTimeout(() => rec.state === "recording" && rec.stop(), MAX_AUDIO_MS);
    } catch {
      toast.error("Microphone access denied.");
    }
  }

  function stopRec() {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  }

  async function submit() {
    if (!category) { toast.error("Choose a category."); return; }
    if (!message.trim()) { toast.error("Add a short note."); return; }
    if (tooLong) { toast.error(`Keep your note to ${WORD_LIMIT} words.`); return; }
    setBusy(true);
    try {
      let audio_path: string | null = null;
      if (audioBlob) {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid) throw new Error("Not signed in");
        const ext = audioBlob.type.includes("mp4") ? "m4a" : "webm";
        audio_path = `feedback/${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("restoration-media")
          .upload(audio_path, audioBlob, { contentType: audioBlob.type, upsert: false });
        if (error) throw error;
      }
      await send({
        data: {
          category: category as "app_bug" | "vision_wrong" | "feature_request" | "tool_calibration",
          note: note || null,
          message_text: message,
          audio_path,
          language,
        },
      });
      toast.success("Feedback submitted. The Tamaraneh team has been notified.");
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Send field feedback</DialogTitle>
          <DialogDescription>One tap to flag bugs, vision errors, ideas, or calibration drift.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>General note <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Short context (e.g. plot ID, device)" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kri">Krio</SelectItem>
                <SelectItem value="tem">Temne</SelectItem>
                <SelectItem value="men">Mende</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Your feedback <span className={`text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>({wordCount}/{WORD_LIMIT} words)</span></Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Describe what happened…" />
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">15-second voice note</span>
              {!recording && !audioBlob && (
                <Button type="button" variant="outline" size="sm" onClick={startRec}><Mic className="h-4 w-4 mr-1.5" /> Record</Button>
              )}
              {recording && (
                <Button type="button" variant="destructive" size="sm" onClick={stopRec}><Square className="h-4 w-4 mr-1.5" /> Stop</Button>
              )}
              {!recording && audioBlob && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setAudioBlob(null); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(null); }}>Re-record</Button>
              )}
            </div>
            {recording && <p className="text-xs text-destructive animate-pulse">● Recording… (auto-stops at 15s)</p>}
            {audioUrl && <audio controls src={audioUrl} className="w-full" />}
          </div>
          <Button onClick={submit} disabled={busy} className="w-full" size="lg">
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : "Submit feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
