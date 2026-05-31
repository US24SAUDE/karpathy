"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSystem } from "@/lib/system";
import { vaultEnabled } from "@/lib/vault";

export default function GoalsView() {
  const { goals, addGoal, toggleGoal, removeGoal } = useSystem();
  const [draft, setDraft] = useState("");

  const open = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);
  const synced = vaultEnabled();

  function submit() {
    addGoal(draft);
    setDraft("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Target className="text-amber" size={24} /> Goals
        </h1>
        <p className="mt-1 text-sm text-muted">
          Track what matters ·{" "}
          {synced ? (
            <span className="text-emerald">● syncing to Obsidian</span>
          ) : (
            <span className="text-amber">● set a vault path in Settings to sync</span>
          )}
        </p>
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 rounded-2xl glass-strong p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a goal and press Enter…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faint"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          disabled={!draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#f4c430,#b07a5b)" }}
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {/* list */}
      <div className="space-y-2">
        {goals.length === 0 && (
          <div className="rounded-2xl glass-strong p-10 text-center text-sm text-faint">
            No goals yet. Add your first above.
          </div>
        )}

        <AnimatePresence initial={false}>
          {open.map((g) => (
            <GoalRow
              key={g.id}
              text={g.text}
              done={g.done}
              onToggle={() => toggleGoal(g.id)}
              onRemove={() => removeGoal(g.id)}
            />
          ))}
        </AnimatePresence>

        {done.length > 0 && (
          <div className="pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">
              Completed · {done.length}
            </div>
            <AnimatePresence initial={false}>
              {done.map((g) => (
                <GoalRow
                  key={g.id}
                  text={g.text}
                  done={g.done}
                  onToggle={() => toggleGoal(g.id)}
                  onRemove={() => removeGoal(g.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function GoalRow({
  text,
  done,
  onToggle,
  onRemove,
}: {
  text: string;
  done: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="group flex items-center gap-3 rounded-2xl glass-strong px-4 py-3"
    >
      <button
        onClick={onToggle}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition"
        style={
          done
            ? { background: "#b8a878", borderColor: "#b8a878" }
            : { borderColor: "rgba(255,255,255,0.2)" }
        }
      >
        {done && <Check size={13} className="text-void" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm ${
          done ? "text-faint line-through" : "text-ink"
        }`}
      >
        {text}
      </span>
      <button
        onClick={onRemove}
        className="text-faint opacity-0 transition hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}
