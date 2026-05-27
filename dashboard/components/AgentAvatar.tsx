import { AgentId } from "@/lib/types";

const AGENT_CONFIG: Record<
  AgentId,
  {
    bgGradient: string;
    icon: React.ReactNode;
    color: string;
    initials: string;
  }
> = {
  atlas: {
    bgGradient: "from-cyan-500 to-blue-500",
    color: "text-cyan-300",
    initials: "AT",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 5v14M6 12h12" />
      </svg>
    ),
  },
  nova: {
    bgGradient: "from-violet-500 to-purple-500",
    color: "text-violet-300",
    initials: "NV",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  orion: {
    bgGradient: "from-rose-500 to-pink-500",
    color: "text-rose-300",
    initials: "OR",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="1" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="16" cy="8" r="1" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="16" cy="16" r="1" />
        <path d="M8 8l4 4M16 8l-4 4M8 16l4-4M16 16l-4-4" />
      </svg>
    ),
  },
  echo: {
    bgGradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-300",
    initials: "EC",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2c-5.33 0-9 3.67-9 8v5c0 1.66 1.34 3 3 3h3v-8H6v-2c0-3.3 2.7-6 6-6s6 2.7 6 6v2h-3v8h3c1.66 0 3-1.34 3-3v-5c0-4.33-3.67-8-9-8z" />
      </svg>
    ),
  },
  sentinel: {
    bgGradient: "from-amber-500 to-orange-500",
    color: "text-amber-300",
    initials: "SN",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        <path d="M12 6v8M15 9h-6" />
      </svg>
    ),
  },
  forge: {
    bgGradient: "from-indigo-500 to-blue-500",
    color: "text-indigo-300",
    initials: "FG",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12c0 1.65.67 3.14 1.76 4.24L3.51 17.49C1.55 15.51 0 12.91 0 10c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-2.91 0-5.51-1.55-6.9-3.87l1.26-1.26C8.86 11.33 10.35 12 12 12" />
        <path d="M13 9h-2v4h2V9z" />
      </svg>
    ),
  },
};

interface AgentAvatarProps {
  agentId: AgentId;
  size?: "sm" | "md" | "lg";
}

export default function AgentAvatar({ agentId, size = "md" }: AgentAvatarProps) {
  const config = AGENT_CONFIG[agentId];
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center flex-shrink-0 ${config.color}`}
    >
      {config.icon}
    </div>
  );
}
