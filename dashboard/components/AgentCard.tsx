"use client";

import { motion } from "framer-motion";
import { Cpu, MemoryStick, Zap } from "lucide-react";
import type { Agent } from "@/lib/types";
import { formatNum } from "@/lib/utils";
import { Sparkline, StatusDot, STATUS_LABEL } from "./primitives";

export default function AgentCard({
  agent,
  onOpen,
}: {
  agent: Agent;
  onOpen: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      onClick={() => onOpen(agent.id)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      className="group relative overflow-hidden rounded-2xl p-px text-left"
    >
      {/* gradient border glow on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})`,
        }}
      />
      <div className="relative h-full rounded-2xl glass-strong p-4">
        {/* top */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{
                background: `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})`,
                boxShadow: `0 6px 20px ${agent.gradient[0]}55`,
              }}
            >
              {agent.glyph}
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-ink">
                {agent.name}
              </div>
              <div className="text-[11px] text-faint">{agent.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={agent.status} />
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: "var(--color-muted)" }}
            >
              {STATUS_LABEL[agent.status]}
            </span>
          </div>
        </div>

        {/* current task */}
        <div className="mb-3 h-9 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-snug text-muted">
          <span className="text-faint">▸ </span>
          {agent.currentTask}
        </div>

        {/* sparkline */}
        <div className="mb-3 -mx-1">
          <Sparkline
            data={agent.history}
            width={260}
            height={36}
            gradient={agent.gradient}
          />
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat icon={<Cpu size={11} />} label="CPU" value={`${Math.round(agent.cpu)}%`} />
          <Stat icon={<MemoryStick size={11} />} label="MEM" value={`${Math.round(agent.mem)}%`} />
          <Stat icon={<Zap size={11} />} label="TOK" value={formatNum(agent.tokens)} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] text-faint">
          <span>{agent.model}</span>
          <span>{agent.tasksDone.toLocaleString()} tasks · {agent.successRate}%</span>
        </div>
      </div>
    </motion.button>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-1.5">
      <div className="flex items-center justify-center gap-1 text-faint">
        {icon}
        <span className="text-[9px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xs font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}
