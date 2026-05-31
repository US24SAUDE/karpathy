"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import type { AgentStatus } from "@/lib/types";
import { cx } from "@/lib/utils";

/* --------------------------- Animated number ----------------------------- */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [value, mv]);

  const formatted =
    decimals > 0
      ? display.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(display).toLocaleString("en-US");

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ------------------------------ Status dot -------------------------------- */
const STATUS_COLOR: Record<AgentStatus, string> = {
  active: "#b8a878",
  thinking: "#d4af37",
  idle: "#c0c5ce",
  paused: "#f4c430",
  error: "#b07a5b",
};

export const STATUS_LABEL: Record<AgentStatus, string> = {
  active: "ACTIVE",
  thinking: "THINKING",
  idle: "IDLE",
  paused: "PAUSED",
  error: "ERROR",
};

export function StatusDot({
  status,
  size = 8,
}: {
  status: AgentStatus;
  size?: number;
}) {
  const color = STATUS_COLOR[status];
  const animated = status === "active" || status === "thinking";
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {animated && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className="relative inline-block rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </span>
  );
}

export function statusColor(status: AgentStatus) {
  return STATUS_COLOR[status];
}

/* ----------------------------- Progress ring ----------------------------- */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  gradient = ["#d4af37", "#c0c5ce"],
  label,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  gradient?: [string, string];
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const offset = useTransform(mv, (v) => circ - (v / 100) * circ);
  const id = `ring-${gradient[0]}-${gradient[1]}`.replace(/[^a-z0-9]/gi, "");

  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset, filter: `drop-shadow(0 0 6px ${gradient[0]}88)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold tabular-nums text-ink">
          {label ?? `${Math.round(value)}%`}
        </span>
        {sub && (
          <span className="text-[10px] uppercase tracking-widest text-faint">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Sparkline -------------------------------- */
export function Sparkline({
  data,
  width = 120,
  height = 40,
  gradient = ["#d4af37", "#c0c5ce"],
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  gradient?: [string, string];
  fill?: boolean;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = i * step;
    const y = height - ((d - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `spark-${gradient[0]}${gradient[1]}`.replace(/[^a-z0-9]/gi, "");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.32} />
          <stop offset="100%" stopColor={gradient[1]} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id}f)`} />}
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        style={{ filter: `drop-shadow(0 0 4px ${gradient[0]}77)` }}
      />
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r={2.6}
        fill={gradient[1]}
        style={{ filter: `drop-shadow(0 0 5px ${gradient[1]})` }}
      />
    </svg>
  );
}

/* --------------------------------- Pill ----------------------------------- */
export function Pill({
  children,
  color = "#d4af37",
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        className
      )}
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {children}
    </span>
  );
}
