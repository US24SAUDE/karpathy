export type AgentStatus = "active" | "thinking" | "idle" | "paused" | "error";
export type AgentId = "atlas" | "nova" | "orion" | "echo" | "sentinel" | "forge";

export interface AgentLog {
  t: number;
  level: "info" | "ok" | "warn" | "err";
  text: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  gradient: [string, string];
  glyph: string;
  cpu: number;
  mem: number;
  tokens: number;
  tasksDone: number;
  successRate: number;
  uptime: number; // seconds
  currentTask: string;
  logs: AgentLog[];
  history: number[];
}

export interface ActivityEvent {
  id: string;
  agentId: string;
  agentName: string;
  gradient: [string, string];
  action: string;
  detail: string;
  t: number;
  kind: "deploy" | "task" | "alert" | "data" | "comms" | "model";
}

export interface Goal {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: number;
}

export interface Vitals {
  totalTokens: number;
  requestsPerMin: number;
  costToday: number;
  latency: number; // ms
  successRate: number; // %
  throughput: number[]; // sparkline
  gpuLoad: number;
  netIn: number;
  netOut: number;
}
