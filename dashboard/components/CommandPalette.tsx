"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Activity,
  BarChart3,
  Terminal,
  Target,
  BookOpen,
  Settings,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ViewId } from "./Dock";
import { cx } from "@/lib/utils";

interface Cmd {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
  view: ViewId;
}

const COMMANDS: Cmd[] = [
  { id: "1", label: "Open Mission Control", hint: "overview", icon: LayoutDashboard, color: "#a855f7", view: "mission" },
  { id: "2", label: "View Agent Fleet", hint: "agents", icon: Bot, color: "#22d3ee", view: "agents" },
  { id: "3", label: "Open Activity Stream", hint: "events", icon: Activity, color: "#34d399", view: "activity" },
  { id: "4", label: "Open Analytics", hint: "metrics", icon: BarChart3, color: "#fbbf24", view: "analytics" },
  { id: "5", label: "Launch Claude Console", hint: "chat", icon: Terminal, color: "#ec4899", view: "console" },
  { id: "6", label: "Open Goals", hint: "goals · obsidian", icon: Target, color: "#f59e0b", view: "goals" },
  { id: "7", label: "Open Journal", hint: "journal · obsidian", icon: BookOpen, color: "#06b6d4", view: "journal" },
  { id: "8", label: "Open Settings", hint: "config · API key · vault", icon: Settings, color: "#6366f1", view: "settings" },
];

export default function CommandPalette({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (v: ViewId) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(t) || c.hint.toLowerCase().includes(t)
    );
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[idx]) {
        onSelect(results[idx].view);
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, idx, onClose, onSelect]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-void/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-[560px] max-w-[92vw] overflow-hidden rounded-2xl glass-strong shadow-2xl"
            style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              <span className="text-violet">⌘</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-faint">
                ESC
              </kbd>
            </div>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-faint">
                  No matching commands
                </div>
              )}
              {results.map((c, i) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => {
                      onSelect(c.view);
                      onClose();
                    }}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      i === idx ? "bg-white/8" : "hover:bg-white/5"
                    )}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        background: `${c.color}1f`,
                        color: c.color,
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-ink">{c.label}</div>
                      <div className="text-[11px] text-faint">{c.hint}</div>
                    </div>
                    {i === idx && (
                      <CornerDownLeft size={14} className="text-faint" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
