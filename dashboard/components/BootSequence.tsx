"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = [
  "initializing kernel · claude-os v1.0",
  "mounting neural substrate ........ ok",
  "loading agent registry · 6 nodes .. ok",
  "establishing secure uplink ....... ok",
  "calibrating telemetry bus ........ ok",
  "warming inference lattice ........ ok",
  "synchronizing mission clock ...... ok",
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (shown < LINES.length) {
      const t = setTimeout(() => setShown((s) => s + 1), 230);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone(true), 520);
    const t2 = setTimeout(onDone, 1320);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [shown, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-10"
      >
        <div
          className="absolute inset-0 rounded-3xl blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, #d4af37, #c0c5ce, #cd7f32, #d4af37)",
          }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl glass-strong">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-5xl"
            style={{
              background:
                "linear-gradient(135deg,#d4af37,#c0c5ce,#cd7f32)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ✦
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-1 text-2xl font-bold tracking-[0.3em] shimmer-text"
      >
        CLAUDE OS
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-10 text-[11px] uppercase tracking-[0.4em] text-faint"
      >
        Mission Control
      </motion.p>

      <div className="h-[150px] w-[340px] font-mono text-xs text-muted">
        {LINES.slice(0, shown).map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 leading-6"
          >
            <span className="text-emerald">›</span>
            <span>{l}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 h-[3px] w-[340px] overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,#d4af37,#c0c5ce,#cd7f32)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${(shown / LINES.length) * 100}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-[11px] uppercase tracking-[0.4em] text-emerald"
          >
            ◉ systems nominal · entering
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
