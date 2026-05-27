"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Activity,
  BarChart3,
  Terminal,
  Target,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/lib/utils";

export type ViewId =
  | "mission"
  | "agents"
  | "activity"
  | "analytics"
  | "console"
  | "goals"
  | "journal"
  | "settings";

const ITEMS: { id: ViewId; label: string; icon: LucideIcon; color: string }[] =
  [
    { id: "mission", label: "Mission Control", icon: LayoutDashboard, color: "#a855f7" },
    { id: "agents", label: "Agent Fleet", icon: Bot, color: "#22d3ee" },
    { id: "activity", label: "Activity Stream", icon: Activity, color: "#34d399" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "#fbbf24" },
    { id: "console", label: "Claude Console", icon: Terminal, color: "#ec4899" },
    { id: "goals", label: "Goals", icon: Target, color: "#f59e0b" },
    { id: "journal", label: "Journal", icon: BookOpen, color: "#06b6d4" },
    { id: "settings", label: "Settings", icon: Settings, color: "#6366f1" },
  ];

export default function Dock({
  active,
  onSelect,
}: {
  active: ViewId;
  onSelect: (v: ViewId) => void;
}) {
  return (
    <nav className="relative z-30 flex flex-col items-center gap-2 border-r border-white/5 px-2.5 py-4 glass">
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="group relative flex items-center"
          >
            {isActive && (
              <motion.span
                layoutId="dock-active"
                className="absolute -left-2.5 h-7 w-1 rounded-r-full"
                style={{
                  background: item.color,
                  boxShadow: `0 0 12px ${item.color}`,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <motion.span
              whileHover={{ scale: 1.12, y: -1 }}
              whileTap={{ scale: 0.94 }}
              className={cx(
                "dock-glow flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors",
                isActive
                  ? "border-white/15"
                  : "border-transparent hover:border-white/10"
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`,
                      color: item.color,
                    }
                  : { color: "rgba(139,136,176,0.9)" }
              }
            >
              <Icon size={19} strokeWidth={2} />
            </motion.span>

            {/* tooltip */}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-abyss/90 px-2.5 py-1 text-xs text-ink opacity-0 shadow-xl backdrop-blur transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="h-px w-6 bg-white/10" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-xs font-bold text-white">
          P
        </div>
      </div>
    </nav>
  );
}
