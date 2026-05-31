"use client";

import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useSystem } from "@/lib/system";
import { AnimatedNumber, Sparkline } from "@/components/primitives";
import { formatNum } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsView() {
  const { agents, vitals } = useSystem();

  const totalTokens = agents.reduce((s, a) => s + a.tokens, 0);
  // weekly synthetic series derived from current throughput shape
  const weekly = DAYS.map((d, i) => ({
    day: d,
    value: Math.round(
      40 + 55 * Math.abs(Math.sin((i + 1) * 1.3)) + (vitals.requestsPerMin % 20)
    ),
  }));
  const maxWeek = Math.max(...weekly.map((w) => w.value));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <BarChart3 className="text-amber" size={24} /> Analytics
        </h1>
        <p className="mt-1 text-sm text-muted">
          Token economy, throughput trends, and per-agent contribution
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Tokens" value={formatNum(totalTokens)} color="#d4af37" />
        <Stat label="Active Models" value="4" color="#c0c5ce" />
        <Stat label="Success Rate" value={`${vitals.successRate.toFixed(1)}%`} color="#b8a878" />
        <Stat label="Spend (mo)" value="$1,284" color="#f4c430" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* weekly bars */}
        <div className="rounded-2xl glass-strong p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-violet" /> Weekly Throughput
          </div>
          <div className="flex h-56 items-end justify-between gap-3">
            {weekly.map((w, i) => (
              <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(w.value / maxWeek) * 100}%` }}
                    transition={{
                      delay: i * 0.07,
                      type: "spring",
                      stiffness: 120,
                      damping: 16,
                    }}
                    className="w-full rounded-t-lg"
                    style={{
                      background:
                        "linear-gradient(to top, #d4af37, #cd7f32, #c0c5ce)",
                      boxShadow: "0 0 18px rgba(212,175,55,0.35)",
                    }}
                  />
                </div>
                <span className="text-[11px] text-faint">{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* per-agent contribution */}
        <div className="rounded-2xl glass-strong p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <PieChart size={15} className="text-cyan" /> Token Share
          </div>
          <div className="space-y-3">
            {agents
              .slice()
              .sort((a, b) => b.tokens - a.tokens)
              .map((a, i) => {
                const pct = (a.tokens / totalTokens) * 100;
                return (
                  <div key={a.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-ink">
                        <span style={{ color: a.gradient[0] }}>{a.glyph}</span>
                        {a.name}
                      </span>
                      <span className="tabular-nums text-faint">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${a.gradient[0]}, ${a.gradient[1]})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* big throughput */}
      <div className="rounded-2xl glass-strong p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-emerald" /> Real-time Inference Throughput
          </span>
          <span className="text-2xl font-bold tabular-nums">
            <AnimatedNumber value={vitals.requestsPerMin} suffix=" req/min" />
          </span>
        </div>
        <Sparkline
          data={vitals.throughput}
          width={1000}
          height={120}
          gradient={["#c0c5ce", "#d4af37"]}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl glass-strong p-4"
    >
      <div
        className="text-2xl font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-faint">
        {label}
      </div>
    </motion.div>
  );
}
