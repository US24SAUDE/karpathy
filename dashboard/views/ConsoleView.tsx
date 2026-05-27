"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, Terminal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  simulated?: boolean;
}

const MODELS = [
  { id: "claude-opus-4-7", label: "Opus 4.7" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5" },
];

const SUGGESTIONS = [
  "Summarize the status of my agent fleet",
  "Which agent should I assign a research task to?",
  "Draft a deploy plan for the auth service",
  "What's eating the most tokens right now?",
];

export default function ConsoleView() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS[1].id);
  const [hasKey, setHasKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasKey(!!localStorage.getItem("claude-os-key"));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          model,
          apiKey: localStorage.getItem("claude-os-key") || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `⚠ ${data.error}${data.detail ? `\n${data.detail}` : ""}`,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply, simulated: data.simulated },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠ Network error reaching the console." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] flex-col">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Terminal className="text-magenta" size={24} /> Claude Console
          </h1>
          <p className="mt-1 text-sm text-muted">
            Direct neural link to Claude ·{" "}
            {hasKey ? (
              <span className="text-emerald">● connected</span>
            ) : (
              <span className="text-amber">● simulation (add key in Settings)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl glass p-1">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                model === m.id
                  ? "bg-magenta/20 text-magenta"
                  : "text-faint hover:text-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl glass-strong p-5"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{
                background: "linear-gradient(135deg,#ec4899,#a855f7,#22d3ee)",
                boxShadow: "0 0 40px rgba(236,72,153,0.4)",
              }}
            >
              ✦
            </motion.div>
            <h2 className="text-lg font-semibold text-ink">
              How can I orchestrate for you?
            </h2>
            <p className="mb-6 max-w-sm text-sm text-muted">
              Ask Claude to manage agents, plan work, or reason about your
              systems.
            </p>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-muted transition hover:border-magenta/40 hover:text-ink"
                >
                  <Sparkles size={12} className="mb-1 text-magenta" />
                  <div>{s}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${
              m.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
              style={
                m.role === "user"
                  ? { background: "rgba(255,255,255,0.08)", color: "#ecebff" }
                  : {
                      background: "linear-gradient(135deg,#ec4899,#a855f7)",
                      color: "white",
                    }
              }
            >
              {m.role === "user" ? "P" : "✦"}
            </div>
            <div
              className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-white/[0.06] text-ink"
                  : "border border-white/8 bg-white/[0.03] text-ink"
              }`}
            >
              {m.content}
              {m.simulated && (
                <span className="mt-1 block text-[10px] uppercase tracking-wider text-amber">
                  simulated
                </span>
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-magenta to-violet text-sm">
                ✦
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-magenta"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: d * 0.18,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* input */}
      <div className="mt-4 flex items-end gap-2 rounded-2xl glass-strong p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Message Claude…  (Enter to send · Shift+Enter for newline)"
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faint"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)" }}
        >
          {loading ? <Zap size={16} /> : <Send size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
