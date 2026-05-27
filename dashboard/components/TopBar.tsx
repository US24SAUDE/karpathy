"use client";

import { motion } from "framer-motion";
import { Activity, Command, Cpu, Search, Signal, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useSystem } from "@/lib/system";
import { AnimatedNumber, Sparkline } from "./primitives";
import { formatNum } from "@/lib/utils";

export default function TopBar({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
  const { vitals, agents } = useSystem();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeCount = agents.filter(
    (a) => a.status === "active" || a.status === "thinking"
  ).length;

  return (
    <header className="relative z-30 flex h-14 items-center justify-between gap-4 border-b border-white/5 px-5 glass">
      {/* left: brand */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-lg"
          style={{
            background: "linear-gradient(135deg,#a855f7,#22d3ee)",
            boxShadow: "0 0 20px rgba(168,85,247,0.5)",
          }}
        >
          ✦
        </motion.div>
        <div className="leading-none">
          <div className="text-[13px] font-bold tracking-[0.2em]">
            CLAUDE OS
          </div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-faint">
            mission control
          </div>
        </div>
      </div>

      {/* center: command */}
      <button
        onClick={onOpenPalette}
        className="group hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted transition hover:border-violet/40 hover:bg-white/10 md:flex"
      >
        <Search size={13} />
        <span className="w-40 text-left">Search & command…</span>
        <kbd className="flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-faint">
          <Command size={9} />K
        </kbd>
      </button>

      {/* right: vitals */}
      <div className="flex items-center gap-4">
        <Vital icon={<Activity size={13} />} color="#34d399">
          <AnimatedNumber value={vitals.requestsPerMin} suffix="/min" />
        </Vital>
        <Vital icon={<Cpu size={13} />} color="#22d3ee">
          {formatNum(vitals.totalTokens)} tok
        </Vital>
        <div className="hidden lg:block">
          <Sparkline
            data={vitals.throughput.slice(-24)}
            width={88}
            height={26}
            gradient={["#a855f7", "#22d3ee"]}
            fill={false}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald/10 px-2.5 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
          </span>
          <span className="text-[11px] font-semibold text-emerald">
            {activeCount} LIVE
          </span>
        </div>
        <div className="hidden items-center gap-2 text-faint sm:flex">
          <Wifi size={13} />
          <Signal size={13} />
        </div>
        <div className="hidden text-right font-mono text-xs leading-none text-muted sm:block">
          <div className="tabular-nums text-ink">
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="text-[9px] text-faint">
            {now.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

function Vital({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hidden items-center gap-1.5 text-xs font-medium tabular-nums md:flex">
      <span style={{ color }}>{icon}</span>
      <span className="text-muted">{children}</span>
    </div>
  );
}
