"use client";

import type { Goal, JournalEntry } from "./types";

const VAULT_KEY = "claude-os-vault";

export function getVaultPath(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(VAULT_KEY) || "";
}

export function setVaultPath(p: string) {
  if (p.trim()) localStorage.setItem(VAULT_KEY, p.trim());
  else localStorage.removeItem(VAULT_KEY);
}

export function vaultEnabled(): boolean {
  return !!getVaultPath();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Local-date stamp (YYYY-MM-DD) — uses the user's timezone, not the server's.
function dateStamp(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timeStamp(d = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface WriteArgs {
  folder: "Chats" | "Goals" | "Journal";
  filename: string;
  mode: "append" | "overwrite";
  header?: string;
  content: string;
}

async function write(args: WriteArgs): Promise<{ ok: boolean; error?: string }> {
  const vaultPath = getVaultPath();
  if (!vaultPath) return { ok: false, error: "no vault" };
  try {
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vaultPath, action: "write", ...args }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "write failed" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function pingVault(
  vaultPath: string
): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vaultPath, action: "ping" }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "ping failed" };
    return { ok: true, path: data.path };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* ----------------------------- Chats ----------------------------- */

export function saveChatMessage(args: {
  agentId: string;
  agentName: string;
  role: "user" | "assistant";
  content: string;
}) {
  const now = new Date();
  const filename = `${args.agentId}-${dateStamp(now)}`;
  const speaker = args.role === "user" ? "You" : args.agentName;
  const header =
    `---\ntype: chat\nagent: ${args.agentName}\ndate: ${dateStamp(now)}\ntags: [agentic-os, chat]\n---\n\n` +
    `# ${args.agentName} · ${dateStamp(now)}\n\n`;
  const block = `**${timeStamp(now)} · ${speaker}**\n\n${args.content.trim()}\n\n`;
  // fire-and-forget — never block the chat UI
  void write({ folder: "Chats", filename, mode: "append", header, content: block });
}

/* ----------------------------- Goals ----------------------------- */

export function saveGoals(goals: Goal[]) {
  const now = new Date();
  const header =
    `---\ntype: goals\nupdated: ${now.toISOString()}\ntags: [agentic-os, goals]\n---\n\n# Goals\n\n`;
  const open = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);
  const fmt = (g: Goal) => `- [${g.done ? "x" : " "}] ${g.text}`;
  let content = "";
  if (open.length) content += open.map(fmt).join("\n") + "\n";
  if (done.length) content += "\n## Completed\n\n" + done.map(fmt).join("\n") + "\n";
  if (!goals.length) content = "_No goals yet._\n";
  void write({ folder: "Goals", filename: "Goals", mode: "overwrite", header, content });
}

/* ---------------------------- Journal ---------------------------- */

export function saveJournalEntry(entry: JournalEntry) {
  const d = new Date(entry.createdAt);
  const filename = dateStamp(d);
  const header =
    `---\ntype: journal\ndate: ${dateStamp(d)}\ntags: [agentic-os, journal]\n---\n\n# Journal · ${dateStamp(d)}\n\n`;
  const block = `## ${timeStamp(d)}\n\n${entry.content.trim()}\n\n`;
  void write({ folder: "Journal", filename, mode: "append", header, content: block });
}
