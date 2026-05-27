"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, Terminal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSystem } from "@/lib/system";
import AgentAvatar from "@/components/AgentAvatar";
import MicButton from "@/components/MicButton";
import type { AgentId } from "@/lib/types";

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
  const { agents } = useSystem();
  const [agentMessages, setAgentMessages] = useState<Record<AgentId, Msg[]>>({
    atlas: [],
    nova: [],
    orion: [],
    echo: [],
    sentinel: [],
    forge: [],
  });
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("atlas");
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
  }, [agentMessages[selectedAgent], loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const agent = agents.find((a) => a.id === selectedAgent);
    const systemPrompt = agent
      ? `You are Claude, communicating on behalf of the ${agent.name} agent (${agent.role}). Keep responses concise and focused on the agent's domain.`
      : "You are Claude, the core intelligence of CLAUDE OS Mission Control.";

    const next: Msg[] = [...agentMessages[selectedAgent], { role: "user", content: trimmed }];
    setAgentMessages((prev) => ({ ...prev, [selectedAgent]: next }));
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
          system: systemPrompt,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAgentMessages((prev) => ({
          ...prev,
          [selectedAgent]: [
            ...prev[selectedAgent],
            {
              role: "assistant",
              content: `⚠ ${data.error}${data.detail ? `\n${data.detail}` : ""}`,
            },
          ],
        }));
      } else {
        setAgentMessages((prev) => ({
          ...prev,
          [selectedAgent]: [
            ...prev[selectedAgent],
            { role: "assistant", content: data.reply, simulated: data.simulated },
          ],
        }));
      }
    } catch {
      setAgentMessages((prev) => ({
        ...prev,
        [selectedAgent]: [
          ...prev[selectedAgent],
          { role: "assistant", content: "⚠ Network error reaching the console." },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  const messages = agentMessages[selectedAgent];
  const agent = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-4">
      {/* agent list sidebar */}
      <div className="w-64 flex-shrink-0 rounded-2xl glass-strong p-3 flex flex-col">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">
          Agents
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {agents.map((a) => (
            <motion.button
              key={a.id}
              onClick={() => setSelectedAgent(a.id as AgentId)} // agent.id is typed as AgentId in seed data
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                selectedAgent === a.id
                  ? "bg-white/[0.08] ring-1 ring-white/20"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <AgentAvatar agentId={a.id as AgentId} size="sm" /> {/* agent seed data uses AgentId literals */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-ink truncate">{a.name}</div>
                <div className="text-[10px] text-faint truncate">{a.role}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* main console button */}
        <div className="mt-auto pt-3 border-t border-white/8">
          <motion.button
            onClick={() => {
              setSelectedAgent("atlas");
              setAgentMessages((prev) => ({
                ...prev,
                atlas: [],
              }));
            }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/[0.04] transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-magenta to-violet text-sm flex-shrink-0">
              ✦
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-ink">Main Console</div>
              <div className="text-[10px] text-faint">Command Center</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* main chat area */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            {agent && (
              <div className="flex items-center gap-3 mb-2">
                <AgentAvatar agentId={selectedAgent} size="md" />
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    {agent.name}
                  </h1>
                  <p className="text-sm text-muted">{agent.role} · {agent.model}</p>
                </div>
              </div>
            )}
            {!agent && (
              <>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Terminal className="text-magenta" size={24} /> Main Console
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Direct neural link to Claude ·{" "}
                  {hasKey ? (
                    <span className="text-emerald">● connected</span>
                  ) : (
                    <span className="text-amber">● simulation (add key in Settings)</span>
                  )}
                </p>
              </>
            )}
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
                {agent ? `Chat with ${agent.name}` : "How can I orchestrate for you?"}
              </h2>
              <p className="mb-6 max-w-sm text-sm text-muted">
                {agent
                  ? `Ask ${agent.name} about ${agent.role.toLowerCase()} tasks and status`
                  : "Ask Claude to manage agents, plan work, or reason about your systems."}
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
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
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
                {m.role === "user" ? "P" : agent ? agent.glyph : "✦"}
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
            placeholder={`Message ${agent?.name || "Claude"}…  (Enter to send · Shift+Enter for newline)`}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faint"
          />
          <MicButton value={input} onChange={setInput} />
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
    </div>
  );
}
