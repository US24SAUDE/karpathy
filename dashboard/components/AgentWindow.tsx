"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square, X, RotateCw } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Agent, AgentId } from "@/lib/types";
import { useSystem } from "@/lib/system";
import { formatUptime } from "@/lib/utils";
import { ProgressRing, StatusDot, STATUS_LABEL, Pill } from "./primitives";
import AgentAvatar from "./AgentAvatar";

const LEVEL_COLOR = {
  info: "#9fa3b5",
  ok: "#b8a878",
  warn: "#f4c430",
  err: "#b07a5b",
};

export default function AgentWindow({
  agent,
  onClose,
}: {
  agent: Agent | null;
  onClose: () => void;
}) {
  const { setAgentStatus } = useSystem();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [agent?.logs]);

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-void/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.08}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative flex w-[640px] max-w-[94vw] flex-col overflow-hidden rounded-2xl glass-strong shadow-2xl"
            style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }}
          >
            {/* title bar (drag handle) */}
            <div className="flex cursor-grab items-center justify-between border-b border-white/8 px-4 py-3 active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose/80" onClick={onClose} />
                  <span className="h-3 w-3 rounded-full bg-amber/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald/80" />
                </div>
                <span className="ml-2 font-mono text-xs text-faint">
                  agent://{agent.id}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-faint transition hover:bg-white/10 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {/* header */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="relative">
                <AgentAvatar agentId={agent.id as AgentId} size="lg" />
                <div
                  className="absolute inset-0 rounded-lg blur-xl -z-10 opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})`,
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-ink">{agent.name}</h2>
                  <StatusDot status={agent.status} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {STATUS_LABEL[agent.status]}
                  </span>
                </div>
                <div className="text-sm text-muted">{agent.role}</div>
                <div className="mt-1 flex gap-2">
                  <Pill color={agent.gradient[0]}>{agent.model}</Pill>
                  <Pill color="#b8a878">↑ {formatUptime(agent.uptime)}</Pill>
                </div>
              </div>
            </div>

            {/* body */}
            <div className="grid grid-cols-[1fr_auto] gap-5 px-5 pb-4">
              <div>
                <div className="mb-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-faint">
                    Current Task
                  </div>
                  <div className="text-sm text-ink">{agent.currentTask}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Tasks" value={agent.tasksDone.toLocaleString()} />
                  <Metric label="Success" value={`${agent.successRate}%`} />
                  <Metric
                    label="Tokens"
                    value={`${(agent.tokens / 1_000_000).toFixed(2)}M`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <ProgressRing
                  value={agent.cpu}
                  size={84}
                  gradient={agent.gradient}
                  sub="CPU"
                />
                <ProgressRing
                  value={agent.mem}
                  size={84}
                  gradient={["#c0c5ce", "#b8a878"]}
                  sub="MEM"
                />
              </div>
            </div>

            {/* live log */}
            <div className="mx-5 mb-4 flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-faint">
                  Live Stream
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
                  streaming
                </span>
              </div>
              <div
                ref={logRef}
                className="h-36 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-[11px] leading-relaxed"
              >
                {agent.logs.length === 0 && (
                  <div className="text-faint">awaiting telemetry…</div>
                )}
                {agent.logs.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-faint">
                      {new Date(l.t).toLocaleTimeString("en-US", {
                        hour12: false,
                      })}
                    </span>
                    <span style={{ color: LEVEL_COLOR[l.level] }}>
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* controls */}
            <div className="flex items-center gap-2 border-t border-white/8 px-5 py-3">
              {agent.status === "paused" ? (
                <CtrlBtn
                  icon={<Play size={14} />}
                  label="Resume"
                  color="#b8a878"
                  onClick={() => setAgentStatus(agent.id, "active")}
                />
              ) : (
                <CtrlBtn
                  icon={<Pause size={14} />}
                  label="Pause"
                  color="#f4c430"
                  onClick={() => setAgentStatus(agent.id, "paused")}
                />
              )}
              <CtrlBtn
                icon={<RotateCw size={14} />}
                label="Restart"
                color="#c0c5ce"
                onClick={() => setAgentStatus(agent.id, "thinking")}
              />
              <CtrlBtn
                icon={<Square size={14} />}
                label="Halt"
                color="#b07a5b"
                onClick={() => setAgentStatus(agent.id, "idle")}
              />
              <div className="ml-auto text-[10px] text-faint">
                drag window to reposition
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wider text-faint">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}

function CtrlBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition"
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
