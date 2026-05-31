"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Coins,
  Gauge,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSystem } from "@/lib/system";
import { AnimatedNumber, ProgressRing, Sparkline, Pill } from "@/components/primitives";
import AgentCard from "@/components/AgentCard";
import AgentWindow from "@/components/AgentWindow";
import QuickChat from "@/components/QuickChat";
import { timeAgo } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function MissionControl({
  onOpenConsole,
}: {
  onOpenConsole: () => void;
}) {
  const { vitals, agents, activity } = useSystem();
  const [openId, setOpenId] = useState<string | null>(null);
  const openAgent = agents.find((a) => a.id === openId) ?? null;

  const activeCount = agents.filter(
    (a) => a.status === "active" || a.status === "thinking"
  ).length;

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Burning the midnight oil" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* hero */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            all systems nominal
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, <span className="shimmer-text">Operator</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {activeCount} agents online · orchestrating across the lattice
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenConsole}
          className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:flex"
          style={{
            background: "linear-gradient(135deg,#B9822D,#8E5916)",
            boxShadow: "0 8px 30px rgba(185,130,45,0.4)",
          }}
        >
          <Zap size={16} /> Talk to Claude
        </motion.button>
      </motion.div>

      {/* KPI row */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <Kpi
          icon={<Coins size={18} />}
          label="Tokens Today"
          gradient={["#B9822D", "#54718A"]}
          spark={vitals.throughput.slice(-20)}
        >
          <AnimatedNumber value={vitals.totalTokens} />
        </Kpi>
        <Kpi
          icon={<Activity size={18} />}
          label="Requests / min"
          gradient={["#6B7E4E", "#6B7E4E"]}
          spark={vitals.throughput.slice(-20).map((x) => 100 - x)}
        >
          <AnimatedNumber value={vitals.requestsPerMin} />
        </Kpi>
        <Kpi
          icon={<Coins size={18} />}
          label="Spend Today"
          gradient={["#F6E4B8", "#A83722"]}
          spark={vitals.throughput.slice(-20)}
        >
          <AnimatedNumber value={vitals.costToday} prefix="$" decimals={2} />
        </Kpi>
        <Kpi
          icon={<Timer size={18} />}
          label="Avg Latency"
          gradient={["#8E5916", "#B9822D"]}
          spark={vitals.throughput.slice(-20)}
        >
          <AnimatedNumber value={vitals.latency} suffix="ms" />
        </Kpi>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* left: quick chats + fleet */}
        <motion.div variants={item} className="space-y-3">
          <SectionHeader
            icon={<Zap size={15} />}
            title="Quick Chats"
            right={<Pill color="#B9822D">multi-model</Pill>}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-60">
              <QuickChat
                providerId="anthropic"
                label="Claude"
                accent="#B9822D"
                glyph="✦"
              />
            </div>
            <div className="h-60">
              <QuickChat
                providerId="openai"
                label="ChatGPT"
                accent="#10a37f"
                glyph="◎"
              />
            </div>
            <div className="h-60">
              <QuickChat
                providerId="xai"
                label="Grok"
                accent="#e5e7eb"
                glyph="✕"
              />
            </div>
          </div>
          <div className="h-60">
            <QuickChat
              providerId="hermes"
              label="Hermes Agent"
              accent="#f59e0b"
              glyph="☤"
            />
          </div>

          <SectionHeader
            icon={<Bot size={15} />}
            title="Agent Fleet"
            right={<Pill color="#6B7E4E">{agents.length} nodes</Pill>}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} onOpen={setOpenId} />
            ))}
          </div>
        </motion.div>

        {/* right: vitals + activity */}
        <motion.div variants={item} className="space-y-5">
          {/* system vitals card */}
          <div className="rounded-2xl glass-strong p-4">
            <SectionHeader icon={<Gauge size={15} />} title="System Vitals" />
            <div className="mt-3 flex items-center justify-around">
              <ProgressRing
                value={vitals.gpuLoad}
                gradient={["#B9822D", "#6B7E4E"]}
                sub="GPU"
                size={88}
              />
              <ProgressRing
                value={vitals.successRate}
                gradient={["#6B7E4E", "#6B7E4E"]}
                label={`${vitals.successRate.toFixed(1)}%`}
                sub="success"
                size={88}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <Mini label="NET IN" value={`${vitals.netIn.toFixed(1)} MB/s`} color="#6B7E4E" />
              <Mini label="NET OUT" value={`${vitals.netOut.toFixed(1)} MB/s`} color="#6B7E4E" />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-faint">
                <span>Throughput</span>
                <span className="flex items-center gap-1 text-emerald">
                  <TrendingUp size={11} /> live
                </span>
              </div>
              <Sparkline
                data={vitals.throughput}
                width={320}
                height={48}
                gradient={["#B9822D", "#8E5916"]}
              />
            </div>
          </div>

          {/* activity feed */}
          <div className="rounded-2xl glass-strong p-4">
            <SectionHeader icon={<Activity size={15} />} title="Live Activity" />
            <div className="mt-2 max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
              {activity.slice(0, 18).map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs"
                >
                  <span
                    className="h-7 w-7 flex-shrink-0 rounded-lg text-center text-sm leading-7"
                    style={{
                      background: `linear-gradient(135deg, ${e.gradient[0]}, ${e.gradient[1]})`,
                    }}
                  >
                    {e.agentName[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-ink">
                      <span className="font-semibold">{e.agentName}</span>{" "}
                      <span className="text-muted">{e.action}</span>{" "}
                      <span className="text-faint">{e.detail}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-faint">
                    {timeAgo(e.t)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AgentWindow agent={openAgent} onClose={() => setOpenId(null)} />
    </motion.div>
  );
}

function Kpi({
  icon,
  label,
  gradient,
  spark,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  gradient: [string, string];
  spark: number[];
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl glass-strong p-4"
    >
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: gradient[0], opacity: 0.18 }}
      />
      <div className="relative flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${gradient[0]}22`, color: gradient[0] }}
        >
          {icon}
        </span>
        <Sparkline data={spark} width={70} height={26} gradient={gradient} fill={false} />
      </div>
      <div className="relative mt-3 text-2xl font-bold tabular-nums tracking-tight">
        {children}
      </div>
      <div className="relative text-[11px] uppercase tracking-wider text-faint">
        {label}
      </div>
    </motion.div>
  );
}

function SectionHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-violet">{icon}</span>
        {title}
      </div>
      {right}
    </div>
  );
}

function Mini({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-ink/5 bg-ink/[0.03] py-2">
      <div className="text-[9px] uppercase tracking-wider text-faint">{label}</div>
      <div className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
