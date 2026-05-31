"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useSystem } from "@/lib/system";
import { vaultEnabled } from "@/lib/vault";
import MicButton from "@/components/MicButton";

function dayLabel(t: number): string {
  const d = new Date(t);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeLabel(t: number): string {
  return new Date(t).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JournalView() {
  const { journal, addJournalEntry } = useSystem();
  const [draft, setDraft] = useState("");
  const synced = vaultEnabled();

  // group entries by local day, newest day first
  const groups = useMemo(() => {
    const map = new Map<string, typeof journal>();
    for (const e of journal) {
      const key = new Date(e.createdAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries());
  }, [journal]);

  function submit() {
    if (!draft.trim()) return;
    addJournalEntry(draft);
    setDraft("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem-3rem)] max-w-2xl flex-col space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <BookOpen className="text-cyan" size={24} /> Journal
        </h1>
        <p className="mt-1 text-sm text-muted">
          One daily file per day ·{" "}
          {synced ? (
            <span className="text-emerald">● syncing to Obsidian</span>
          ) : (
            <span className="text-amber">● set a vault path in Settings to sync</span>
          )}
        </p>
      </div>

      {/* composer */}
      <div className="flex items-end gap-2 rounded-2xl glass-strong p-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="What's on your mind?  (⌘/Ctrl+Enter to save)"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faint"
        />
        <MicButton value={draft} onChange={setDraft} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          disabled={!draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#c0c5ce,#1d4ed8)" }}
        >
          <Send size={16} />
        </motion.button>
      </div>

      {/* entries */}
      <div className="flex-1 space-y-5 overflow-y-auto rounded-2xl glass-strong p-5">
        {journal.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-faint">
            Your journal is empty. Write your first entry above.
          </div>
        )}
        {groups.map(([day, entries]) => (
          <div key={day}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">
              {dayLabel(entries[0].createdAt)}
            </div>
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-faint">
                    {timeLabel(e.createdAt)}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {e.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
