import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SIM_REPLIES = [
  "I'm running in simulation mode — no API key detected. Add your Anthropic key in Settings to connect me to the real Claude. In the meantime: your fleet looks healthy, 4 agents are active and throughput is trending up.",
  "Simulation mode active. Once you drop an Anthropic API key into Settings, this console becomes a live link to Claude. I'd suggest starting Atlas on the research backlog — it's been idle.",
  "No key yet, so this is a canned response. Connect me via Settings and I'll have full reasoning, tool use, and context. Your GPU lattice is at healthy utilization right now.",
];

export async function POST(req: NextRequest) {
  let body: {
    messages?: ChatMessage[];
    model?: string;
    apiKey?: string;
    system?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages = [], model, apiKey, system } = body;
  const key = apiKey?.trim() || process.env.ANTHROPIC_API_KEY;

  // Simulation fallback — no key configured.
  if (!key) {
    const reply = SIM_REPLIES[Math.floor(Math.random() * SIM_REPLIES.length)];
    return NextResponse.json({ reply, simulated: true });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-6",
        max_tokens: 1024,
        system:
          system ||
          "You are Claude, the core intelligence of CLAUDE OS Mission Control — a command center orchestrating a fleet of AI agents (Atlas: research, Nova: code, Orion: ML, Echo: comms, Sentinel: monitoring, Forge: devops). Be concise, sharp, and a little futuristic in tone. Help the operator manage their agents and answer their questions.",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Anthropic API error (${res.status})`, detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply =
      data?.content?.map((c: { text?: string }) => c.text || "").join("") ||
      "(empty response)";
    return NextResponse.json({ reply, simulated: false });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach Anthropic API", detail: String(err) },
      { status: 502 }
    );
  }
}
