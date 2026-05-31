"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Database,
  MessageSquare,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { useSystem } from "@/lib/system";
import type { ActivityEvent } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const KIND_META: Record<
  ActivityEvent["kind"],
  { icon: LucideIcon; color: string }
> = {
  deploy: { icon: Rocket, color: "#6B7E4E" },
  task: { icon: CheckCircle2, color: "#6B7E4E" },
  alert: { icon: AlertTriangle, color: "#F6E4B8" },
  data: { icon: Database, color: "#B9822D" },
  comms: { icon: MessageSquare, color: "#8E5916" },
  model: { icon: Cpu, color: "#54718A" },
};

export default function ActivityView() {
  const { activity } = useSystem();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Activity className="text-emerald" size={24} /> Activity Stream
        </h1>
        <p className="mt-1 text-sm text-muted">
          Unified event timeline across the entire agent lattice · live
        </p>
      </div>

      <div className="relative rounded-2xl glass-strong p-5">
        {/* vertical line */}
        <div className="absolute bottom-5 left-[34px] top-5 w-px bg-gradient-to-b from-violet/40 via-white/10 to-transparent" />
        <div className="space-y-1">
          {activity.map((e, i) => {
            const meta = KIND_META[e.kind];
            const Icon = meta.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.3) }}
                className="relative flex items-center gap-4 rounded-xl px-2 py-2.5 transition hover:bg-ink/[0.03]"
              >
                <span
                  className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `${meta.color}1f`,
                    color: meta.color,
                    border: `1px solid ${meta.color}33`,
                  }}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink">
                    <span
                      className="font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${e.gradient[0]}, ${e.gradient[1]})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {e.agentName}
                    </span>{" "}
                    <span className="text-muted">{e.action}</span>{" "}
                    <span className="text-ink">{e.detail}</span>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-faint">
                    {e.kind}
                  </div>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] text-faint">
                  {timeAgo(e.t)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
