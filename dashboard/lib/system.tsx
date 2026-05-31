"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Agent,
  ActivityEvent,
  AgentStatus,
  Goal,
  JournalEntry,
  Vitals,
} from "./types";
import { clamp, pick, rand } from "./utils";
import { saveGoals, saveJournalEntry } from "./vault";

const GOALS_KEY = "claude-os-goals";
const JOURNAL_KEY = "claude-os-journal";

/* -------------------------------------------------------------------------- */
/*  Seed data                                                                  */
/* -------------------------------------------------------------------------- */

const SEED_AGENTS: Agent[] = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Deep Research",
    model: "claude-opus-4-7",
    status: "thinking",
    gradient: ["#B9822D", "#54718A"],
    glyph: "◈",
    cpu: 62,
    mem: 48,
    tokens: 1_284_500,
    tasksDone: 312,
    successRate: 98.4,
    uptime: 84210,
    currentTask: "Synthesizing 142 sources on fusion catalysis",
    history: Array.from({ length: 24 }, () => rand(20, 80)),
    logs: [],
  },
  {
    id: "nova",
    name: "Nova",
    role: "Code Synthesis",
    model: "claude-sonnet-4-6",
    status: "active",
    gradient: ["#6B7E4E", "#54718A"],
    glyph: "❖",
    cpu: 78,
    mem: 71,
    tokens: 2_940_120,
    tasksDone: 1187,
    successRate: 96.1,
    uptime: 142880,
    currentTask: "Refactoring auth service · 14 files",
    history: Array.from({ length: 24 }, () => rand(40, 95)),
    logs: [],
  },
  {
    id: "orion",
    name: "Orion",
    role: "ML Engineering",
    model: "claude-opus-4-7",
    status: "active",
    gradient: ["#6B7E4E", "#6B7E4E"],
    glyph: "✦",
    cpu: 91,
    mem: 83,
    tokens: 5_120_870,
    tasksDone: 642,
    successRate: 99.2,
    uptime: 203400,
    currentTask: "Training run · epoch 38/50 · loss 0.0241",
    history: Array.from({ length: 24 }, () => rand(55, 99)),
    logs: [],
  },
  {
    id: "echo",
    name: "Echo",
    role: "Comms & Ops",
    model: "claude-haiku-4-5",
    status: "idle",
    gradient: ["#8E5916", "#B9822D"],
    glyph: "◍",
    cpu: 14,
    mem: 22,
    tokens: 720_300,
    tasksDone: 2451,
    successRate: 97.7,
    uptime: 320100,
    currentTask: "Standing by for inbound triage",
    history: Array.from({ length: 24 }, () => rand(5, 40)),
    logs: [],
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Monitoring",
    model: "claude-haiku-4-5",
    status: "active",
    gradient: ["#F6E4B8", "#A83722"],
    glyph: "⬡",
    cpu: 33,
    mem: 29,
    tokens: 410_900,
    tasksDone: 8932,
    successRate: 99.9,
    uptime: 511230,
    currentTask: "Watching 38 services · 0 incidents",
    history: Array.from({ length: 24 }, () => rand(15, 50)),
    logs: [],
  },
  {
    id: "forge",
    name: "Forge",
    role: "DevOps & Deploy",
    model: "claude-sonnet-4-6",
    status: "paused",
    gradient: ["#54718A", "#8E5916"],
    glyph: "⬢",
    cpu: 4,
    mem: 18,
    tokens: 1_002_440,
    tasksDone: 503,
    successRate: 95.3,
    uptime: 99300,
    currentTask: "Paused · awaiting deploy approval",
    history: Array.from({ length: 24 }, () => rand(2, 30)),
    logs: [],
  },
];

const TASK_POOL: Record<string, string[]> = {
  atlas: [
    "Cross-referencing 88 arXiv papers",
    "Building knowledge graph · 2.1k nodes",
    "Summarizing earnings calls Q1–Q4",
    "Fact-checking draft against primary sources",
  ],
  nova: [
    "Writing integration tests · 92% cov",
    "Patching race condition in scheduler",
    "Generating TypeScript types from schema",
    "Reviewing PR #1428 · 3 suggestions",
  ],
  orion: [
    "Hyperparameter sweep · 24 trials",
    "Evaluating model on holdout set",
    "Quantizing weights to int8",
    "Distilling teacher → student",
  ],
  echo: [
    "Drafting release notes v2.4",
    "Routing 12 support threads",
    "Summarizing standup notes",
    "Scheduling deploy window",
  ],
  sentinel: [
    "Anomaly scan · latency p99",
    "Rotating credentials · 4 vaults",
    "Auditing access logs",
    "Health-checking 38 services",
  ],
  forge: [
    "Building container image",
    "Canary rollout · 5% traffic",
    "Rolling back to v2.3.1",
    "Provisioning GPU node pool",
  ],
};

const LOG_LINES = [
  "tool_use: search → 142 hits",
  "context window 71% utilized",
  "thinking: decomposing into subtasks",
  "tool_use: write_file ok",
  "stream chunk · 248 tok",
  "cache hit · 31% saved",
  "guardrail check passed",
  "spawned subagent · worker-3",
  "checkpoint saved",
  "tool_use: run_tests → 0 failed",
];

const ACTIONS: ActivityEvent["kind"][] = [
  "deploy",
  "task",
  "alert",
  "data",
  "comms",
  "model",
];

const ACTION_VERB: Record<ActivityEvent["kind"], string[]> = {
  deploy: ["deployed", "rolled back", "scaled", "provisioned"],
  task: ["completed", "started", "queued", "retried"],
  alert: ["flagged", "resolved", "escalated", "muted"],
  data: ["ingested", "indexed", "embedded", "exported"],
  comms: ["replied to", "summarized", "routed", "drafted"],
  model: ["fine-tuned", "evaluated", "quantized", "benchmarked"],
};

const ACTION_OBJ: Record<ActivityEvent["kind"], string[]> = {
  deploy: ["api-gateway v2.4", "inference cluster", "edge workers", "GPU pool"],
  task: ["batch #8821", "research brief", "12 subtasks", "nightly job"],
  alert: ["latency spike", "auth anomaly", "quota threshold", "disk pressure"],
  data: ["4.2GB corpus", "vector store", "user feedback", "telemetry stream"],
  comms: ["3 threads", "the changelog", "incident #44", "weekly digest"],
  model: ["checkpoint-38", "eval suite", "reward model", "distilled-7b"],
};

let evtSeq = 0;
function makeEvent(agents: Agent[]): ActivityEvent {
  const a = pick(agents);
  const kind = pick(ACTIONS);
  return {
    id: `e${Date.now()}-${evtSeq++}`,
    agentId: a.id,
    agentName: a.name,
    gradient: a.gradient,
    action: pick(ACTION_VERB[kind]),
    detail: pick(ACTION_OBJ[kind]),
    t: Date.now(),
    kind,
  };
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

interface SystemState {
  agents: Agent[];
  activity: ActivityEvent[];
  vitals: Vitals;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  bootMs: number;
  goals: Goal[];
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  journal: JournalEntry[];
  addJournalEntry: (content: string) => void;
}

const SystemContext = createContext<SystemState | null>(null);

export function useSystem(): SystemState {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used within SystemProvider");
  return ctx;
}

export function SystemProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(SEED_AGENTS);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [vitals, setVitals] = useState<Vitals>({
    totalTokens: 11_478_130,
    requestsPerMin: 342,
    costToday: 47.82,
    latency: 612,
    successRate: 98.1,
    throughput: Array.from({ length: 40 }, () => rand(30, 80)),
    gpuLoad: 73,
    netIn: 18.4,
    netOut: 9.2,
  });
  const bootMs = useRef(Date.now()).current;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  // hydrate goals + journal from localStorage on mount
  useEffect(() => {
    try {
      const g = localStorage.getItem(GOALS_KEY);
      if (g) setGoals(JSON.parse(g));
      const j = localStorage.getItem(JOURNAL_KEY);
      if (j) setJournal(JSON.parse(j));
    } catch {
      /* corrupt storage — start fresh */
    }
  }, []);

  function commitGoals(next: Goal[]) {
    setGoals(next);
    localStorage.setItem(GOALS_KEY, JSON.stringify(next));
    saveGoals(next);
  }

  function addGoal(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    commitGoals([
      ...goals,
      { id: `g${Date.now()}`, text: trimmed, done: false, createdAt: Date.now() },
    ]);
  }

  function toggleGoal(id: string) {
    commitGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function removeGoal(id: string) {
    commitGoals(goals.filter((g) => g.id !== id));
  }

  function addJournalEntry(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;
    const entry: JournalEntry = {
      id: `j${Date.now()}`,
      content: trimmed,
      createdAt: Date.now(),
    };
    const next = [entry, ...journal];
    setJournal(next);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
    saveJournalEntry(entry);
  }

  // seed a few activity events on mount
  useEffect(() => {
    setActivity(
      Array.from({ length: 8 }, () => makeEvent(SEED_AGENTS)).map((e, i) => ({
        ...e,
        t: Date.now() - i * 9000,
      }))
    );
  }, []);

  // live telemetry tick
  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.status === "paused" || a.status === "error") {
            return { ...a, cpu: clamp(a.cpu + rand(-2, 2), 0, 100) };
          }
          const cpu = clamp(a.cpu + rand(-9, 9), 6, 99);
          const mem = clamp(a.mem + rand(-5, 5), 8, 96);
          const tokens = a.tokens + Math.round(rand(120, 2400));
          const history = [...a.history.slice(1), cpu];
          // occasionally flip task / status for liveliness
          let currentTask = a.currentTask;
          let status: AgentStatus = a.status;
          if (Math.random() < 0.08) {
            currentTask = pick(TASK_POOL[a.id] ?? [a.currentTask]);
          }
          if (Math.random() < 0.05) {
            status = pick<AgentStatus>(["active", "thinking", "active", "idle"]);
          }
          return { ...a, cpu, mem, tokens, history, currentTask, status };
        })
      );

      setVitals((v) => ({
        ...v,
        totalTokens: v.totalTokens + Math.round(rand(800, 6000)),
        requestsPerMin: clamp(v.requestsPerMin + rand(-18, 18), 120, 720),
        costToday: v.costToday + rand(0.02, 0.14),
        latency: clamp(v.latency + rand(-40, 40), 180, 1400),
        successRate: clamp(v.successRate + rand(-0.15, 0.15), 94, 99.99),
        throughput: [...v.throughput.slice(1), rand(25, 95)],
        gpuLoad: clamp(v.gpuLoad + rand(-6, 6), 20, 99),
        netIn: clamp(v.netIn + rand(-2, 2), 1, 40),
        netOut: clamp(v.netOut + rand(-1.5, 1.5), 1, 28),
      }));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  // activity stream tick
  useEffect(() => {
    const id = setInterval(() => {
      setActivity((prev) => [makeEvent(agents), ...prev].slice(0, 60));
    }, 3400);
    return () => clearInterval(id);
  }, [agents]);

  // per-agent log tick
  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.status === "paused") return a;
          const log = {
            t: Date.now(),
            level: pick(["info", "ok", "info", "ok", "warn"]) as
              | "info"
              | "ok"
              | "warn"
              | "err",
            text: pick(LOG_LINES),
          };
          return { ...a, logs: [...a.logs, log].slice(-40) };
        })
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  function setAgentStatus(id: string, status: AgentStatus) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              currentTask:
                status === "paused"
                  ? "Paused · awaiting operator"
                  : pick(TASK_POOL[a.id] ?? [a.currentTask]),
            }
          : a
      )
    );
  }

  return (
    <SystemContext.Provider
      value={{
        agents,
        activity,
        vitals,
        setAgentStatus,
        bootMs,
        goals,
        addGoal,
        toggleGoal,
        removeGoal,
        journal,
        addJournalEntry,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}
