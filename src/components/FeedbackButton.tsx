import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#1A3622] text-white shadow-xl shadow-black/20 px-5 py-3 text-sm font-semibold hover:bg-[#244c30] active:scale-95 transition focus:outline-none focus:ring-4 focus:ring-[#E5A93C]/40 min-h-[48px]"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="hidden sm:inline">Feedback</span>
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
