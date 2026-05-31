import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export const runtime = "nodejs";

const CLI_TARGETS = [
  { id: "claude", name: "Claude Code", check: "claude", docsUrl: "https://docs.claude.com/claude-code" },
  { id: "openclaw", name: "OpenClaw", check: "openclaw", docsUrl: "https://github.com/openclaw/openclaw" },
  { id: "codex", name: "OpenAI Codex", check: "codex", docsUrl: "https://github.com/openai/codex" },
  { id: "aider", name: "Aider", check: "aider", docsUrl: "https://aider.chat" },
  { id: "gemini", name: "Gemini CLI", check: "gemini", docsUrl: "https://github.com/google-gemini/gemini-cli" },
];

function which(cmd: string): Promise<string | null> {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const proc = spawn(isWin ? "where" : "which", [cmd], { shell: true });
    let out = "";
    proc.stdout.on("data", (d: Buffer) => { out += d.toString(); });
    proc.on("close", (code: number) => {
      if (code === 0 && out.trim()) {
        resolve(out.trim().split(/\r?\n/)[0]);
      } else {
        resolve(null);
      }
    });
    proc.on("error", () => resolve(null));
  });
}

function detectVaults(): string[] {
  const home = homedir();
  const candidates = [
    join(home, "Documents", "Obsidian Vault"),
    join(home, "Documents", "Obsidian"),
    join(home, "OneDrive", "Documentos", "Obsidian Vault"),
    join(home, "OneDrive", "Documents", "Obsidian Vault"),
    join(home, "Obsidian"),
  ];
  const found = candidates.filter((p) => {
    try {
      return existsSync(p) && existsSync(join(p, ".obsidian"));
    } catch {
      return false;
    }
  });

  // also scan Documents one level deep for any folder containing .obsidian
  const docs = [join(home, "Documents"), join(home, "OneDrive", "Documents")];
  for (const d of docs) {
    if (!existsSync(d)) continue;
    try {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        if (existsSync(join(p, ".obsidian")) && !found.includes(p)) {
          found.push(p);
        }
      }
    } catch {
      // ignore permission errors
    }
  }
  return found;
}

export async function GET() {
  const cliResults = await Promise.all(
    CLI_TARGETS.map(async (t) => ({
      ...t,
      path: await which(t.check),
    }))
  );
  const vaults = detectVaults();
  return NextResponse.json({
    cli: cliResults,
    vaults,
    platform: process.platform,
    home: homedir(),
  });
}
