"use client";

import { motion } from "framer-motion";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { getProviderKey, providerForModel, PROVIDERS } from "@/lib/providers";

interface QuickChatProps {
  providerId: string;
  label: string;
  accent: string;
  glyph: string;
}

export default function QuickChat({ providerId, label, accent, glyph }: QuickChatProps) {
  const provider =
    PROVIDERS.find((p) => p.id === providerId) ??
    providerForModel(providerId);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          model: provider.models[0]?.id,
          provider: provider.id,
          apiKey:
            provider.kind === "api"
              ? getProviderKey(provider.storageKey) || undefined
              : undefined,
          system: `You are ${label}. Be concise and direct.`,
        }),
      });
      const data = await res.json();
      setReply(data.reply || data.error || "(no response)");
    } catch (e) {
      setReply(`⚠ ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!reply) return;
    navigator.clipboard.writeText(reply).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl glass-strong"
    >
      <div
        className="flex items-center gap-2 border-b border-ink/8 px-3 py-2"
        style={{ background: `${accent}10` }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: `${accent}33`, color: accent }}
        >
          {glyph}
        </span>
        <span className="text-sm font-semibold text-ink">{label}</span>
        <button
          onClick={copy}
          disabled={!reply}
          title="Copy reply"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-faint transition hover:bg-ink/5 hover:text-ink disabled:opacity-30"
        >
          {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 text-xs leading-relaxed text-muted">
        {loading ? (
          <span className="flex items-center gap-2 text-faint">
            <Loader2 size={12} className="animate-spin" /> thinking…
          </span>
        ) : reply ? (
          <pre className="whitespace-pre-wrap break-words font-sans">{reply}</pre>
        ) : (
          <span className="text-faint">Ask {label} something below.</span>
        )}
      </div>

      <div className="flex items-end gap-1.5 border-t border-ink/8 p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={`Message ${label}…`}
          className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-ink outline-none placeholder:text-faint"
        />
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition disabled:opacity-40"
          style={{ background: accent }}
        >
          <Send size={12} />
        </motion.button>
      </div>
    </motion.div>
  );
}
