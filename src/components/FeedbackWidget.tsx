"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function submit() {
    if (!message.trim()) return;
    setStatus("sending");
    const { error } = await supabaseBrowser.from("feedback").insert({
      page: pathname,
      message: message.trim(),
      rating,
    });
    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    setStatus("sent");
    setMessage("");
    setRating(null);
    setTimeout(() => {
      setOpen(false);
      setStatus("idle");
    }, 1200);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="w-72 bg-white border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Feedback</span>
            <button
              className="text-slate-400 hover:text-black"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <textarea
            className="w-full border rounded px-2 py-1.5 text-sm"
            rows={3}
            placeholder="What's working, what's off, what's missing?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`text-sm w-7 h-7 rounded border ${
                  rating === n
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-300 text-slate-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            className="mt-3 w-full rounded bg-slate-900 text-white text-sm py-2 disabled:opacity-50"
            onClick={submit}
            disabled={status === "sending" || !message.trim()}
          >
            {status === "sending"
              ? "Sending…"
              : status === "sent"
                ? "Thanks!"
                : "Send feedback"}
          </button>
          {status === "error" && (
            <p className="text-xs text-red-600 mt-2">
              Couldn&apos;t send — check the `feedback` table exists in
              Supabase.
            </p>
          )}
        </div>
      ) : (
        <button
          className="rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg"
          onClick={() => setOpen(true)}
        >
          Feedback
        </button>
      )}
    </div>
  );
}
