import { NextRequest, NextResponse } from "next/server";

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
  const config = PROVIDERS[provider] ?? PROVIDERS.anthropic;
  const key = apiKey?.trim() || process.env[config.envKey];

  // Simulation fallback — no key configured.
  if (!key) {
    const reply = SIM_REPLIES[Math.floor(Math.random() * SIM_REPLIES.length)];
    return NextResponse.json({ reply, simulated: true });
  }

  const systemPrompt = system || DEFAULT_SYSTEM;
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
