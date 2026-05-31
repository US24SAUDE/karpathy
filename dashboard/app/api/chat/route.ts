import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SIM_REPLIES = [
  "I'm running in simulation mode — no API key detected. Add a provider key in Settings to connect me to a real model. In the meantime: your fleet looks healthy, 4 agents are active and throughput is trending up.",
  "Simulation mode active. Once you drop an API key into Settings, this console becomes a live link to your chosen model. I'd suggest starting Atlas on the research backlog — it's been idle.",
  "No key yet, so this is a canned response. Connect me via Settings and I'll have full reasoning and context. Your GPU lattice is at healthy utilization right now.",
];

type ProviderFormat = "anthropic" | "openai";

interface ProviderConfig {
  url: string;
  format: ProviderFormat;
  envKey: string;
  authHeaders: (key: string) => Record<string, string>;
  defaultModel: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    format: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    authHeaders: (k) => ({ "x-api-key": k, "anthropic-version": "2023-06-01" }),
    defaultModel: "claude-sonnet-4-6",
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    format: "openai",
    envKey: "OPENAI_API_KEY",
    authHeaders: (k) => ({ authorization: `Bearer ${k}` }),
    defaultModel: "gpt-4o",
  },
  xai: {
    url: "https://api.x.ai/v1/chat/completions",
    format: "openai",
    envKey: "XAI_API_KEY",
    authHeaders: (k) => ({ authorization: `Bearer ${k}` }),
    defaultModel: "grok-2-latest",
  },
  glm: {
    url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    format: "openai",
    envKey: "GLM_API_KEY",
    authHeaders: (k) => ({ authorization: `Bearer ${k}` }),
    defaultModel: "glm-4-plus",
  },
};

const DEFAULT_SYSTEM =
  "You are the core intelligence of CLAUDE OS Mission Control — a command center orchestrating a fleet of AI agents (Atlas: research, Nova: code, Orion: ML, Echo: comms, Sentinel: monitoring, Forge: devops). Be concise, sharp, and a little futuristic in tone. Help the operator manage their agents and answer their questions.";

export async function POST(req: NextRequest) {
  let body: {
    messages?: ChatMessage[];
    model?: string;
    apiKey?: string;
    system?: string;
    provider?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages = [], model, apiKey, system, provider = "anthropic" } = body;
  const systemPrompt = system || DEFAULT_SYSTEM;

  // CLI providers (claude-cli, hermes, etc.) — spawn local executable
  const CLI_CONFIGS: Record<string, { cmd: string; args: string[] }> = {
    hermes: { cmd: "hermes", args: ["-z"] },
    "claude-cli": { cmd: "claude", args: ["--print"] },
    openclaw: { cmd: "openclaw", args: ["agent", "--message"] },
  };
  if (CLI_CONFIGS[provider]) {
    const { cmd, args } = CLI_CONFIGS[provider];
    const cliReply = await runCli(cmd, args, messages, systemPrompt);
    if (cliReply.ok) {
      return NextResponse.json({ reply: cliReply.text, simulated: false, via: "cli" });
    }
    return NextResponse.json(
      { error: `${provider} CLI failed`, detail: cliReply.error },
      { status: 502 }
    );
  }

  const config = PROVIDERS[provider] ?? PROVIDERS.anthropic;
  const key = apiKey?.trim() || process.env[config.envKey];

  // No API key — fall back to Claude Code CLI (uses Claude Max subscription)
  if (!key) {
    const cliReply = await runCli("claude", ["--print"], messages, systemPrompt);
    if (cliReply.ok) return NextResponse.json({ reply: cliReply.text, simulated: false, via: "cli" });
    const reply = SIM_REPLIES[Math.floor(Math.random() * SIM_REPLIES.length)];
    return NextResponse.json({ reply, simulated: true });
  }

  const useModel = model || config.defaultModel;

  const requestBody =
    config.format === "anthropic"
      ? {
          model: useModel,
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }
      : {
          model: useModel,
          max_tokens: 1024,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        };

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...config.authHeaders(key),
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `${provider} API error (${res.status})`, detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply =
      config.format === "anthropic"
        ? data?.content?.map((c: { text?: string }) => c.text || "").join("") ||
          "(empty response)"
        : data?.choices?.[0]?.message?.content || "(empty response)";

    return NextResponse.json({ reply, simulated: false });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach ${provider} API`, detail: String(err) },
      { status: 502 }
    );
  }
}

// Spawn a local CLI binary (claude, hermes, etc.) with the prompt on argv.
// The CLI is expected to print its reply to stdout and exit 0.
function runCli(
  cmd: string,
  flagArgs: string[],
  messages: ChatMessage[],
  system: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const history = messages
      .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`)
      .join("\n");
    const prompt = `${system}\n\n${history}\nAssistant:`;

    const proc = spawn(cmd, [...flagArgs, prompt], {
      timeout: 60000,
      shell: true,
    });

    let out = "";
    let err = "";
    proc.stdout.on("data", (d: Buffer) => { out += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { err += d.toString(); });
    proc.on("close", (code: number) => {
      if (code === 0 && out.trim()) {
        resolve({ ok: true, text: out.trim() });
      } else {
        resolve({ ok: false, error: err.trim() || `${cmd} exited with code ${code}` });
      }
    });
    proc.on("error", (e: Error) => resolve({ ok: false, error: e.message }));
  });
}
