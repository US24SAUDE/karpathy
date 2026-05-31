"use client";

import { motion } from "framer-motion";
import { Bot, Filter } from "lucide-react";
import { useState } from "react";
import { useSystem } from "@/lib/system";
import AgentCard from "@/components/AgentCard";
import AgentWindow from "@/components/AgentWindow";
import type { AgentStatus } from "@/lib/types";
import { cx } from "@/lib/utils";
import { statusColor } from "@/components/primitives";

const FILTERS: ("all" | AgentStatus)[] = [
  "all",
  "active",
  "thinking",
  "idle",
  "paused",
];

export default function AgentsView() {
  const { agents } = useSystem();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AgentStatus>("all");
  const openAgent = agents.find((a) => a.id === openId) ?? null;

  const filtered =
    filter === "all" ? agents : agents.filter((a) => a.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Bot className="text-cyan" size={24} /> Agent Fleet
          </h1>
          <p className="mt-1 text-sm text-muted">
            {agents.length} autonomous systems · click any node to open its
            control surface
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl glass p-1">
          <Filter size={14} className="ml-1.5 text-faint" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition",
                filter === f
                  ? "bg-ink/10 text-ink"
                  : "text-faint hover:text-muted"
              )}
              style={
                filter === f && f !== "all"
                  ? { color: statusColor(f as AgentStatus) }
                  : undefined
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((a) => (
          <AgentCard key={a.id} agent={a} onOpen={setOpenId} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="rounded-2xl glass p-12 text-center text-faint">
          No agents in this state.
        </div>
      )}

      <AgentWindow agent={openAgent} onClose={() => setOpenId(null)} />
    </div>
  );
}
