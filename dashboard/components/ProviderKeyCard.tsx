"use client";

import { motion } from "framer-motion";
import { Check, Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProviderMeta } from "@/lib/providers";

export default function ProviderKeyCard({
  provider,
  delay = 0,
}: {
  provider: ProviderMeta;
  delay?: number;
}) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [stored, setStored] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem(provider.storageKey);
    if (k) {
      setKey(k);
      setStored(true);
    }
  }, [provider.storageKey]);

  function save() {
    if (key.trim()) {
      localStorage.setItem(provider.storageKey, key.trim());
      setStored(true);
    } else {
      localStorage.removeItem(provider.storageKey);
      setStored(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function clear() {
    localStorage.removeItem(provider.storageKey);
    setKey("");
    setStored(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl glass-strong p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${provider.accent}22`, color: provider.accent }}
        >
          <KeyRound size={18} />
        </span>
        <div>
          <div className="text-sm font-semibold text-ink">{provider.name}</div>
          <div className="text-[11px] text-faint">
            {provider.blurb} ·{" "}
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-muted"
            >
              get a key
            </a>
          </div>
        </div>
        {stored && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-1 text-[10px] font-semibold text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> connected
          </span>
        )}
      </div>

      {provider.kind === "cli" ? (
        <div className="rounded-xl border border-ink/8 bg-ink/[0.02] p-3 text-[11px] text-faint">
          No API key needed — this provider runs the local{" "}
          <code>{provider.cli?.cmd}</code> binary. Install it from the docs link
          above, then pick it from the model selector in the Console.
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={reveal ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={provider.placeholder}
              className="w-full rounded-xl border border-ink/10 bg-ink/30 px-3 py-2.5 pr-10 font-mono text-sm text-ink outline-none transition focus:border-violet/50"
            />
            <button
              onClick={() => setReveal((r) => !r)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
            >
              {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={save}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#B9822D,#54718A)" }}
          >
            {saved ? <Check size={16} /> : null}
            {saved ? "Saved" : "Save"}
          </motion.button>
          {stored && (
            <button
              onClick={clear}
              className="flex items-center justify-center rounded-xl border border-rose/30 bg-rose/10 px-3 text-rose transition hover:bg-rose/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
